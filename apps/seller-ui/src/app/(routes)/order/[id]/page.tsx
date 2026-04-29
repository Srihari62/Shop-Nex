"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusSteps = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const OrderDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/get-order-details/${id}`);
      return res.data.order;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await axiosInstance.put(`/order/api/update-status/${id}`, {
        deliveryStatus: newStatus,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-details", id] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentStatusIndex = statusSteps.indexOf(
    order?.deliveryStatus || "Ordered",
  );

  return (
    <div className="min-h-screen bg-black text-slate-300 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Go Back to Dashboard</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Order <span className="text-blue-500">#{order?.id?.slice(-6)}</span>
          </h1>
          <div className="flex items-center gap-4 bg-[#111] p-2 px-4 rounded-xl border border-slate-800">
            <span className="text-sm font-medium text-slate-400">
              Update Delivery Status:
            </span>
            <select
              value={order?.deliveryStatus}
              onChange={(e) => updateStatusMutation.mutate(e.target.value)}
              disabled={updateStatusMutation.isPending}
              className="bg-transparent text-white border-none focus:ring-0 cursor-pointer font-semibold outline-none"
            >
              {statusSteps.map((status) => (
                <option
                  key={status}
                  value={status}
                  className="bg-[#111] text-white"
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Tracker */}
        <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-8 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div
                  key={step}
                  className="flex flex-col items-center gap-3 relative z-10 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                      isActive
                        ? "bg-blue-600 border-blue-500/30 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        : "bg-[#111] border-slate-800 text-slate-600"
                    }`}
                  >
                    {isActive ? (
                      index < currentStatusIndex ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Package size={18} />
                      )
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                  <span
                    className={`text-[11px] md:text-xs font-semibold uppercase tracking-wider ${
                      isActive ? "text-blue-400" : "text-slate-600"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}

            {/* Background Line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-slate-800 -z-10" />
            {/* Active Progress Line */}
            <div
              className="absolute top-5 left-[10%] h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-700 ease-in-out -z-10"
              style={{
                width: `${(currentStatusIndex / (statusSteps.length - 1)) * 80}%`,
              }}
            />
          </div>
        </div>

        {/* Order Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Summary */}
          <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              Payment Summary
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-slate-500">Payment Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    order?.paymentStatus === "Paid"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {order?.paymentStatus || "Paid"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-white font-medium">
                  {order?.paymentMethod || "Online Payment"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="text-slate-300">
                  ${(order?.total + (order?.discountAmount || 0)).toFixed(2)}
                </span>
              </div>
              {order?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 italic">
                  <span>Discount ({order?.couponCode}):</span>
                  <span>-${order?.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-white font-bold text-base">Total Paid:</span>
                <span className="text-blue-500 font-black text-xl">${order?.total?.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase font-black">Your Earning (90%):</span>
                  <span className="text-emerald-400 font-bold">${(order?.total * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase font-black">Platform Fee (10%):</span>
                  <span className="text-amber-500/80 font-bold">${(order?.total * 0.1).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Order Date:</span>
                <span className="text-slate-300">
                  {order?.createdAt
                    ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blue-500" />
              Shipping Address
            </h3>
            <div className="text-sm text-slate-400 leading-relaxed">
              {order?.shippingAddress ? (
                <>
                  <p className="text-slate-200 font-medium mb-1">
                    {order.shippingAddress.name}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </>
              ) : (
                <p>No shipping address provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Package size={18} className="text-blue-500" />
            Order Items
          </h3>
          <div className="space-y-4">
            {order?.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-[#111] p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors group"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-slate-800">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.product?.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {item.product?.title}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Quantity:{" "}
                      <b className="text-slate-300">{item.quantity}</b>
                    </span>
                    {item.selectedOptions?.size && (
                      <span>
                        Size:{" "}
                        <b className="text-slate-300">
                          {item.selectedOptions.size}
                        </b>
                      </span>
                    )}
                    {item.selectedOptions?.color && (
                      <span>
                        Color:{" "}
                        <b className="text-slate-300">
                          {item.selectedOptions.color}
                        </b>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">
                    ${item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
