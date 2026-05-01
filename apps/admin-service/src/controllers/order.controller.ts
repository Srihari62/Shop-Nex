import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { NotFoundError } from "@packages/error-handler";

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        shops: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            orders: false, // avoid circular ref
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        shops: {
          include: {
            avatar: true,
            sellers: {
              select: {
                name: true,
                email: true,
                phone_number: true,
              }
            }
          }
        },
        items: true,
      },
    });

    if (!order) {
      return next(new NotFoundError("Order not found"));
    }

    // Fetch product details for each item
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        const product = await prisma.products.findUnique({
          where: { id: item.productId },
          select: {
            title: true,
            images: {
              take: 1,
            },
          },
        });
        return { ...item, product };
      })
    );

    // Fetch full address if shippingAddressId exists
    let shippingAddress = null;
    if (order.shippingAddressId) {
      shippingAddress = await prisma.address.findUnique({
        where: { id: order.shippingAddressId },
      });
    }

    res.status(200).json({
      success: true,
      order: { ...order, items: itemsWithProducts, shippingAddress },
    });
  } catch (error) {
    next(error);
  }
};
