import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { NextFunction, Response, Request } from "express";
import Stripe from 'stripe';
import crypto from 'crypto'
import { sendEmail } from "../utils/send-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover'
})

// Shared order processing logic - Hardened for Production
const processOrderCreation = async (userId: string, sessionId: string, paymentMethod: string) => {
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
        throw new Error(`Critical: Payment session ${sessionId} not found or expired.`);
    }

    const { cart, totalAmount, shippingAddressId, coupon } = JSON.parse(sessionData);
    
    // 1. Fetch core data
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User ${userId} not found during order processing.`);

    const shopGrouped = cart.reduce((acc: any, item: any) => {
        const shopId = item.shopId;
        if (!acc[shopId]) acc[shopId] = [];
        acc[shopId].push(item);
        return acc;
    }, {});

    // 2. Execute DB Operations in a Transaction for consistency
    await prisma.$transaction(async (tx) => {
        for (const shopId in shopGrouped) {
            const orderItems = shopGrouped[shopId];
            let orderTotal = orderItems.reduce((sum: number, p: any) => {
                const price = Number(p.sale_price || p.price || 0);
                const quantity = Number(p.quantity || 1);
                return sum + (price * quantity);
            }, 0);
            
            // Calculate discounts if applicable
            if (coupon && coupon.discountedProductId && orderItems.some((item: any) => item.id === coupon.discountedProductId)) {
                const discountedItem = orderItems.find((item: any) => item.id === coupon.discountedProductId);
                if (discountedItem) {
                    const basePrice = Number(discountedItem.sale_price || discountedItem.price || 0);
                    const qty = Number(discountedItem.quantity || 1);
                    const discount = coupon.discountPercent > 0 ?
                        (basePrice * qty * Number(coupon.discountPercent)) / 100 : Number(coupon.discountAmount || 0);
                    orderTotal -= discount;
                }
            }

            // Create Order
            await tx.orders.create({
                data: {
                    userId,
                    usersId: userId,
                    shopId,
                    shopsId: shopId,
                    total: orderTotal,
                    status: "Processing",
                    paymentMethod,
                    paymentStatus: paymentMethod === "Stripe" ? "Paid" : "Unpaid",
                    shippingAddressId: shippingAddressId || null,
                    couponCode: coupon?.code || null,
                    discountAmount: Number(coupon?.discountPercent || 0),
                    items: {
                        create: orderItems.map((item: any) => ({
                            productId: item.id || item._id,
                            quantity: Number(item.quantity || 1),
                            price: Number(item.sale_price || item.price || 0),
                            selectedOptions: item.selectedOptions || item.selectedOption || {}
                        }))
                    }
                }
            });

            // Update Inventory and Analytics per item
            for (const item of orderItems) {
                const productId = item.id || item._id;
                const quantity = Number(item.quantity || 1);

                await tx.products.update({
                    where: { id: productId },
                    data: {
                        totalSales: { increment: quantity },
                        stock: { decrement: quantity }
                    }
                });

                await tx.productAnalytics.upsert({
                    where: { productId },
                    update: { purchases: { increment: quantity } },
                    create: {
                        productId,
                        shopId,
                        purchases: quantity,
                        lastViewedAt: new Date()
                    }
                });
            }
        }

        // Update User Analytics Action History
        const existingAnalytics = await tx.userAnalytics.findUnique({ where: { userId } });
        const purchaseActions = cart.map((item: any) => ({
            productId: item.id || item._id,
            shopId: item.shopId,
            action: "purchase",
            timestamp: new Date().toISOString()
        }));

        const currentActions = Array.isArray(existingAnalytics?.actions) ? (existingAnalytics.actions as any[]) : [];
        const updatedActions = [...currentActions, ...purchaseActions].slice(-50); 

        if (existingAnalytics) {
            await tx.userAnalytics.update({
                where: { userId },
                data: { actions: updatedActions, lastVisited: new Date() }
            });
        } else {
            await tx.userAnalytics.create({
                data: { userId, actions: updatedActions, lastVisited: new Date() }
            });
        }
    });

    // 3. Post-Transaction Side Effects (Emails & Notifications)
    // We do NOT await these to prevent the API from hanging if SMTP/Notification services are slow
    const triggerSideEffects = async () => {
        // Send Confirmation Email
        try {
            await sendEmail(
                user.email!,
                "Order Confirmed - Shop-Nex",
                "order-confirmation",
                {
                    name: user.name,
                    cart,
                    totalAmount: Number(totalAmount),
                    trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success/${sessionId}`
                }
            );
        } catch (e) {
            console.error("Email sending background error:", e);
        }

        // Create notifications
        try {
            const createdShopIds = Object.keys(shopGrouped);
            const sellerShops = await prisma.shops.findMany({
                where: { id: { in: createdShopIds } },
                select: { id: true, sellerId: true, name: true }
            });

            for (const shop of sellerShops) {
                const firstProduct = shopGrouped[shop.id][0];
                await prisma.notifications.create({
                    data: {
                        title: `New Order: ${firstProduct?.title || "Marketplace Order"}`,
                        message: `You have a new order for ${shopGrouped[shop.id].length} items from ${user.name}`,
                        recieverId: shop.sellerId,
                        creatorId: userId,
                        redirect_link: `/dashboard/orders`
                    }
                });
            }

            await prisma.notifications.create({
                data: {
                    title: "Platform Order Alert",
                    message: `New purchase of $${totalAmount} by ${user.name}`,
                    recieverId: "admin",
                    creatorId: userId,
                    redirect_link: `/admin/orders`
                }
            });
        } catch (e) {
            console.error("Notification background error:", e);
        }
    };

    // Trigger side effects in background
    triggerSideEffects();

    // 4. Final Cleanup - Do not delete immediately so success page can read it
    // await redis.del(sessionKey);
};

// --- API Endpoints ---

export const createPaymentIntent = async (req: any, res: Response, next: NextFunction) => {
    const { amount, sellerStripeAccountId, sessionId } = req.body;
    console.log(`[Stripe] Creating intent for session: ${sessionId}, amount: ${amount}`);
    
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100),
            currency: 'usd',
            payment_method_types: ["card"],
            metadata: { sessionId, userId: req.user.id }
        });
        
        console.log(`[Stripe] Intent created successfully: ${paymentIntent.id}`);
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error("Stripe Payment Intent Error:", error.message);
        res.status(400).json({ message: error.message });
    }
}

export const createPaymentSession = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { cart, selectedAddressId, coupon } = req.body;
        const userId = req.user?.id;

        if (!cart?.length) return next(new ValidationError("Cart is empty"));

        const sessionId = crypto.randomUUID();
        
        const uniqueShopIds: string[] = Array.from(new Set(cart.map((item: any) => item.shopId as string)));
        const shops = await prisma.shops.findMany({
            where: { id: { in: uniqueShopIds } },
            select: {
                id: true,
                sellerId: true,
                sellers: { select: { stripeId: true } }
            }
        });

        const sellerData = shops.map((s: any) => ({
            shopId: s.id,
            sellerId: s.sellerId,
            stripeAccountId: s.sellers?.stripeId
        }));

        const totalAmount = cart.reduce((t: number, i: any) => {
            const price = Number(i.sale_price || i.price || 0);
            const quantity = Number(i.quantity || 1);
            return t + (price * quantity);
        }, 0);

        const sessionData = {
            userId,
            cart,
            sellers: sellerData,
            totalAmount: Number(totalAmount),
            shippingAddressId: selectedAddressId || null,
            coupon: coupon || null,
        };

        await redis.setex(`payment-session:${sessionId}`, 600, JSON.stringify(sessionData));
        return res.status(200).json({ sessionId, session: sessionData });
    } catch (error) {
        return next(error)
    }
}

export const verifyPaymentSession = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sessionId = req.query.sessionId as string;
        const sessionData = await redis.get(`payment-session:${sessionId}`);
        if (!sessionData) return res.status(404).json({ message: "Session expired" });
        return res.status(200).json({ success: true, session: JSON.parse(sessionData) });
    } catch (error) {
        return next(error)
    }
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stripeSignature = req.headers['stripe-signature'];
        const rawBody = (req as any).rawBody;
        const event = stripe.webhooks.constructEvent(rawBody, stripeSignature!, process.env.STRIPE_WEBOOK_SECRET!);

        if (event.type === "payment_intent.succeeded") {
            const pi = event.data.object as Stripe.PaymentIntent;
            const { sessionId, userId } = pi.metadata;
            if (sessionId && userId) await processOrderCreation(userId, sessionId, "Stripe");
        }
        res.status(200).json({ received: true });
    } catch (error) {
        next(error);
    }
}

export const createCODOrder = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.body;
        await processOrderCreation(req.user.id, sessionId, "COD");
        res.status(200).json({ success: true, message: "COD Order Placed" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};