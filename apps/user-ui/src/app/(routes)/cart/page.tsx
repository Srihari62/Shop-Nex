"use client";

import React, { useState } from "react";
import { useStore } from "apps/user-ui/src/store";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Truck,
  Loader2,
} from "lucide-react";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import CheckoutDetailsModal from "../../../shared/components/cart/CheckoutDetailsModal";
import PaymentModal from "../../../shared/components/cart/PaymentModal";
import toast from "react-hot-toast";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const cart = useStore((state: any) => state.cart);
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const decrementQuantity = useStore((state: any) => state.decrementQuantity);
  const clearCart = useStore((state: any) => state.clearCart);

  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const router = useRouter();

  // Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Coupon Logic from Store (Persistent)
  const appliedCoupons = useStore((state: any) => state.appliedCoupons);
  const applyCoupon = useStore((state: any) => state.applyCoupon);
  const removeCoupon = useStore((state: any) => state.removeCoupon);

  // Extract all unique AVAILABLE coupons from cart items that aren't applied yet
  const availableCoupons = React.useMemo(() => {
    const coupons: any[] = [];
    const seenCodes = new Set();
    const appliedCodes = new Set(appliedCoupons.map((c: any) => c.discountCode));

    cart.forEach((item: any) => {
      if (item.discount_details) {
        item.discount_details.forEach((d: any) => {
          if (!seenCodes.has(d.discountCode) && !appliedCodes.has(d.discountCode)) {
            seenCodes.add(d.discountCode);
            coupons.push(d);
          }
        });
      }
    });
    return coupons;
  }, [cart, appliedCoupons]);

  const subtotal = cart.reduce(
    (acc: number, item: any) =>
      acc + (item.sale_price || item.price) * (item.quantity || 1),
    0,
  );
  
  // Calculate discount by iterating over each item and checking all applied coupons
  const discountAmount = React.useMemo(() => {
    if (!appliedCoupons || appliedCoupons.length === 0) return 0;
    
    return cart.reduce((acc: number, item: any) => {
      // Find if ANY applied coupon matches this item
      const applicableCoupon = appliedCoupons.find((coupon: any) => 
        item.discount_details?.some((d: any) => d.discountCode === coupon.discountCode)
      );
      
      if (applicableCoupon) {
        const itemTotal = (item.sale_price || item.price) * (item.quantity || 1);
        return acc + (itemTotal * applicableCoupon.discountValue) / 100;
      }
      return acc;
    }, 0);
  }, [appliedCoupons, cart]);

  const shipping = cart.length > 0 ? 15 : 0;
  const total = subtotal + shipping - discountAmount;

  // Reset session if cart changes to ensure payment accuracy
  React.useEffect(() => {
    if (sessionId) {
      setSessionId(null);
      setSessionData(null);
    }
  }, [cart]);

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error("Please login to proceed to checkout");
      return;
    }
    setIsDetailsOpen(true);
  };

  const handleProceedToPayment = async (addressId: string) => {
    setSelectedAddressId(addressId);
    setIsCreatingSession(true);
    try {
      // Create Payment Session in Order Service
      const res = await axiosInstance.post(
        "/order/api/create-payment-session",
        {
          cart,
          selectedAddressId: addressId,
          coupon: appliedCoupons.length > 0 ? appliedCoupons[0].discountCode : null, // Backend might need update for multi-coupon
          discountAmount: discountAmount,
          appliedCoupons: appliedCoupons, // Send all coupons
        },
      );

      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);
        setSessionData(res.data.session);
        setIsDetailsOpen(false);
        setIsPaymentOpen(true);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to initiate payment session",
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handlePaymentComplete = (method: string) => {
    setIsPaymentOpen(false);
    toast.success(`Order placed successfully with ${method}!`);
    // NOTE: clearCart is now handled in the OrderSuccessPage to prevent UI flash
    
    // Redirect to success page
    if (sessionId) {
      router.push(`/order-success/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-br from-[#47718F] via-[#47718F] to-[#365870] py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <div className="relative w-[90%] md:w-[80%] m-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">
              Shopping <span className="text-indigo-200">Cart</span>
            </h1>
            <p className="text-white/60 text-sm font-medium">
              Review your items and proceed to checkout
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white text-[#365870] flex items-center justify-center font-bold shadow-lg">
                1
              </div>
              <span className="text-[10px] text-white mt-1 uppercase font-bold tracking-widest">
                Cart
              </span>
            </div>
            <div className="w-12 h-[2px] bg-white/20" />
            <div
              className={`flex flex-col items-center ${isDetailsOpen || isPaymentOpen ? "" : "opacity-40"}`}
            >
              <div
                className={`w-10 h-10 rounded-full ${isDetailsOpen ? "bg-white text-[#365870]" : "bg-white/20 text-white"} flex items-center justify-center font-bold`}
              >
                2
              </div>
              <span className="text-[10px] text-white mt-1 uppercase font-bold tracking-widest">
                Details
              </span>
            </div>
            <div className="w-12 h-[2px] bg-white/20" />
            <div
              className={`flex flex-col items-center ${isPaymentOpen ? "" : "opacity-40"}`}
            >
              <div
                className={`w-10 h-10 rounded-full ${isPaymentOpen ? "bg-white text-[#365870]" : "bg-white/20 text-white"} flex items-center justify-center font-bold`}
              >
                3
              </div>
              <span className="text-[10px] text-white mt-1 uppercase font-bold tracking-widest">
                Payment
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] md:w-[80%] m-auto py-12">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <ShoppingBag size={40} className="text-slate-200" />
            </div>
            <h2 className="text-3xl font-black text-[#365870] mb-4">
              Your cart is empty
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm">
              Looks like you haven't added anything to your cart yet. Let's find
              something amazing for you!
            </p>
            <Link
              href="/"
              className="bg-gradient-to-r from-[#47718F] to-[#365870] text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Items List */}
            <div className="flex-1 space-y-6">
              {cart.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                    <Image
                      src={
                        item.images?.[0]?.url ||
                        item.image ||
                        "https://via.placeholder.com/300"
                      }
                      alt={item.title}
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md mb-2 inline-block">
                          {item.category || "General"}
                        </span>
                        <h3 className="text-xl md:text-2xl font-black text-[#365870] leading-tight mb-1">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                          Seller:{" "}
                          <span className="text-[#47718F]">{item.shop?.name || item.sellerName || "Marketplace Seller"}</span>
                        </p>
                        {/* Applied Coupon Badge */}
                        {appliedCoupons.some((c: any) => 
                          item.discount_details?.some((d: any) => d.discountCode === c.discountCode)
                        ) && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="text-[9px] font-bold bg-green-500/20 text-green-600 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                              DISCOUNT APPLIED: {appliedCoupons.find((c: any) => 
                                item.discount_details?.some((d: any) => d.discountCode === c.discountCode)
                              )?.discountCode}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.id, user, location, deviceInfo)
                        }
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                      {/* Quantity */}
                      <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1">
                        <button
                          onClick={() =>
                            decrementQuantity(
                              item.id,
                              user,
                              location,
                              deviceInfo,
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-black text-[#365870]">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            addToCart(item, user, location, deviceInfo)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                          Unit Price
                        </p>
                        <div className="flex flex-col items-end">
                          {item.regular_price > (item.sale_price || item.price) && (
                            <span className="text-xs text-slate-300 line-through font-bold">
                              ${item.regular_price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-2xl font-black text-[#365870]">
                            ${(item.sale_price || item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Trust Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#365870] uppercase">
                      Secure Payment
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      100% encrypted & safe
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Truck className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#365870] uppercase">
                      Fast Shipping
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Free delivery over $100
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <ArrowRight className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#365870] uppercase">
                      Easy Returns
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      30 days return policy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm sticky top-24">
                <h3 className="text-2xl font-black text-[#365870] mb-8">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8">
                  {/* Coupon Selection */}
                  {availableCoupons.length > 0 && (
                    <div className="pb-4 border-b border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Apply Coupons
                      </label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#365870] outline-none focus:border-[#47718F] transition-all"
                        value=""
                        onChange={(e) => {
                          const code = e.target.value;
                          const coupon = availableCoupons.find(c => c.discountCode === code);
                          if (coupon) {
                            applyCoupon(coupon);
                            toast.success(`Applied ${coupon.discountCode}!`);
                          }
                        }}
                      >
                        <option value="" disabled>Select a coupon to apply</option>
                        {availableCoupons.map((coupon: any) => (
                          <option key={coupon.discountCode} value={coupon.discountCode}>
                            {coupon.discountCode} - {coupon.discountValue}% OFF
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Applied Coupons List */}
                  {appliedCoupons.length > 0 && (
                    <div className="space-y-2 py-4 border-b border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        Applied Coupons
                      </label>
                      {appliedCoupons.map((coupon: any) => (
                        <div key={coupon.id} className="flex items-center justify-between bg-green-50 p-2 rounded-xl border border-green-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-green-700">{coupon.discountCode}</span>
                            <span className="text-[10px] font-bold text-green-600 bg-white px-1.5 py-0.5 rounded-md">-{coupon.discountValue}%</span>
                          </div>
                          <button 
                            onClick={() => {
                              removeCoupon(coupon.discountCode);
                              toast.success(`Removed ${coupon.discountCode}`);
                            }}
                            className="text-green-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="font-bold text-slate-700">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-sm font-medium">Shipping</span>
                    <span className="font-bold text-slate-700">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-500">
                      <span className="text-sm font-medium">Total Discount</span>
                      <span className="font-bold">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-sm font-medium">Tax</span>
                    <span className="font-bold text-slate-700">$0.00</span>
                  </div>
                  <div className="h-[1px] bg-slate-100 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#365870]">
                      Total
                    </span>
                    <span className="text-3xl font-black text-[#47718F]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  onClick={handleCheckoutClick}
                  className="w-full bg-gradient-to-r from-[#47718F] to-[#365870] text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mb-4 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <ShoppingBag size={20} />
                  )}
                  {isLoading ? "Synchronizing..." : "Continue to Checkout"}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                  By proceeding, you agree to our{" "}
                  <span className="underline cursor-pointer">
                    Terms of Service
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modals */}
      <CheckoutDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onProceed={handleProceedToPayment}
        isProcessing={isCreatingSession}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onBack={() => {
          setIsPaymentOpen(false);
          setIsDetailsOpen(true);
        }}
        onComplete={handlePaymentComplete}
        sessionId={sessionId}
        sessionData={sessionData}
        totalAmount={total}
      />
    </div>
  );
};

export default CartPage;
