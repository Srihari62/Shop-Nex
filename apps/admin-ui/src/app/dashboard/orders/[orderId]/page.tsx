"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";
import {
  ArrowLeft,
  Package,
  User,
  Store,
  MapPin,
  CreditCard,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Truck,
  Box,
  ShoppingBag,
  Info,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const fetchOrderDetails = async (id: string) => {
  const response: any = await axiosInstance.get(`/admin/api/orders/${id}`);
  return response.data.order;
};

const OrderDetailsPage = () => {
  const router = useRouter();
  const { orderId } = useParams();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchOrderDetails(orderId as string),
    enabled: !!orderId,
  });

  const steps = [
    { label: "Ordered", icon: ShoppingBag },
    { label: "Packed", icon: Box },
    { label: "Shipped", icon: Truck },
    { label: "Out for Delivery", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 },
  ];

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(
      (step) => step.label.toLowerCase() === status?.toLowerCase(),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "processing":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "cancelled":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold">Order not found</h2>
          <button
            onClick={() => router.back()}
            className="text-[#4A876E] font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex(order.deliveryStatus || "Ordered");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
      {/* Top Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] group-hover:translate-x-[-2px] transition-transform">
          <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-bold">Back to Orders</span>
      </button>

      {/* Order Tracking Stepper */}
      <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div
                    className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${
                      isCompleted
                        ? "bg-gradient-to-tr from-[#4A876E] to-[#78B59C] text-white shadow-[0_10px_20px_rgba(74,135,110,0.3)]"
                        : "bg-[#e0e5ec] dark:bg-[#1a1c20] text-slate-400 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]"
                    }
                    ${isCurrent ? "scale-110 ring-4 ring-[#4A876E]/20" : ""}
                  `}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${isCompleted ? "text-[#4A876E] dark:text-[#78B59C]" : "text-slate-400"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 relative mx-[-20px] mb-6">
                    <div
                      className="absolute inset-0 bg-[#4A876E] transition-all duration-1000 ease-in-out"
                      style={{ width: index < currentStep ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items & Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items Table */}
          <div className="rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] overflow-hidden">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-widest">
                <Package size={20} className="text-[#4A876E]" />
                Order Items
              </h2>
              <span className="text-xs font-bold text-slate-400">
                #{order.id.toUpperCase()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#d1d9e6]/20 dark:bg-[#26292f]/20">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Product
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Price
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Qty
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {order.items?.map((item: any) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                            {item.product?.images?.[0]?.url ? (
                              <img
                                src={item.product.images[0].url}
                                alt="product"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={24} className="text-slate-300" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-[#4A876E] transition-colors">
                              {item.product?.title || "Unknown Product"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              ID: {item.productId}
                            </span>
                            {item.selectedOptions && (
                              <div className="flex gap-2 mt-1">
                                {Object.entries(item.selectedOptions).map(
                                  ([k, v]) => (
                                    <span
                                      key={k}
                                      className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700"
                                    >
                                      {k}: {String(v)}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-700 dark:text-slate-300">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          x{item.quantity}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-[#d1d9e6]/10 dark:bg-[#26292f]/10 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-red-400 uppercase tracking-widest text-[10px]">
                      Discount
                    </span>
                    <span className="font-bold text-red-500">
                      -${order.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-xs">
                    Total Amount
                  </span>
                  <span className="text-xl font-black text-[#4A876E] dark:text-[#78B59C]">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Info */}
        <div className="space-y-8">
          {/* Customer Card */}
          <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-2">
              <User size={16} /> Customer Details
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f] flex items-center justify-center overflow-hidden">
                {order.users?.avatar?.url ? (
                  <img
                    src={order.users.avatar.url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-[#4A876E]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-800 dark:text-slate-200">
                  {order.users?.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {order.users?.email}
                </span>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-1" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Shipping Address
                  </span>
                  {order.shippingAddress ? (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                      {order.shippingAddressId || "Default Address"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shop Card */}
          <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-2">
              <Store size={16} /> Seller Information
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f] flex items-center justify-center overflow-hidden">
                {order.shops?.avatar?.url ? (
                  <img
                    src={order.shops.avatar.url}
                    className="w-full h-full object-cover"
                  />
                ) : order.shops?.avatarUrl ? (
                  <img
                    src={order.shops.avatarUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store size={24} className="text-[#4A876E]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-800 dark:text-slate-200">
                  {order.shops?.name}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  ID: {order.shopId}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#d1d9e6]/20 dark:bg-[#26292f]/20 border border-white/20 dark:border-white/5 space-y-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Seller Name
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {order.shops?.sellers?.name || "Independent Seller"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Seller Email
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {order.shops?.sellers?.email || "No contact info"}
                </span>
              </div>
            </div>

            {order.shops?.description && (
              <p className="text-xs text-slate-500 font-medium italic line-clamp-2">
                {order.shops.description}
              </p>
            )}
          </div>

          {/* Payment Card */}
          <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Payment Status
                </span>
                <span
                  className={`px-3 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest 
                      ${
                        order.paymentStatus?.toLowerCase() === "paid"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <button 
                onClick={() => router.push(`/dashboard/payments/${order.id}`)}
                className="w-full py-2.5 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#4A876E] transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={14} />
                View Associated Payment
              </button>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#d1d9e6]/30 dark:bg-[#26292f]/30">
                <CreditCard size={18} className="text-[#4A876E]" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">
                    Method
                  </span>
                  <span className="text-sm font-bold text-slate-500 capitalize">
                    {order.paymentMethod || "Stripe"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
