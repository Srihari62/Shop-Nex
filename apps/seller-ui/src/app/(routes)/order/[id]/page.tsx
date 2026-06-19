"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Loader2,
  DollarSign,
  ChevronRight,
  Truck
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusSteps = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"];

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

  const currentStatusIndex = statusSteps.indexOf(order?.deliveryStatus || "Ordered");

  return (
    <div className="min-h-screen bg-black text-slate-300 p-8">
      {/* Unified Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
          <button onClick={() => router.push("/dashboard/orders")} className="hover:text-white transition-colors">Dashboard</button>
          <ChevronRight size={14} className="text-slate-700" />
          <button onClick={() => router.push("/dashboard/orders")} className="hover:text-white transition-colors">Orders</button>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-blue-500">#{order?.id?.slice(-6).toUpperCase()}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Order Details
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-[#0a0a0a] p-2 px-4 rounded-xl border border-slate-900 shadow-xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status:</span>
            <select 
              value={order?.deliveryStatus}
              onChange={(e) => updateStatusMutation.mutate(e.target.value)}
              disabled={updateStatusMutation.isPending}
              className="bg-transparent text-blue-500 border-none focus:ring-0 cursor-pointer font-bold outline-none text-sm uppercase tracking-wider"
            >
              {statusSteps.map((status) => (
                <option key={status} value={status} className="bg-[#111] text-white">
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Unified Progress Tracker */}
        <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center relative z-10">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={step} className="flex flex-col items-center gap-4 relative z-10 flex-1">
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${
                      isActive 
                        ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                        : "bg-[#111] border-slate-800 text-slate-600"
                    }`}
                  >
                    {isActive ? (
                      index < currentStatusIndex ? <CheckCircle2 size={20} /> : <Truck size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    isActive ? "text-blue-400" : "text-slate-600"
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
            
            {/* Background Line */}
            <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-900 -z-10" />
            {/* Active Progress Line */}
            <div 
              className="absolute top-6 left-[10%] h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000 ease-in-out -z-10"
              style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 80}%` }}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Unified Payment Summary */}
          <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <DollarSign size={18} />
              </div>
              Payment Summary
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  order?.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}>
                  {order?.paymentStatus || "Paid"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Method:</span>
                <span className="text-white font-bold uppercase tracking-tighter">{order?.paymentMethod || "Online"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Subtotal:</span>
                <span className="text-slate-300 font-bold">${(order?.total + (order?.discountAmount || 0)).toFixed(2)}</span>
              </div>
              {order?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 italic font-medium">
                  <span>Discount ({order?.couponCode}):</span>
                  <span>-${order?.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 mt-2 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-black uppercase text-xs tracking-widest">Total Paid:</span>
                  <span className="text-blue-500 font-black text-2xl tracking-tighter">${order?.total?.toFixed(2)}</span>
                </div>
                
                {/* Earning Breakdown Block */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Earning (90%)</span>
                    <span className="text-emerald-400 font-black text-sm">${(order?.total * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Fee (10%)</span>
                    <span className="text-amber-500/80 font-black text-sm">${(order?.total * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Shipping Address */}
          <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <MapPin size={18} />
              </div>
              Shipping Details
            </h3>
            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-white font-bold text-base mb-1">{order?.shippingAddress?.name}</p>
                <div className="text-sm text-slate-400 leading-relaxed font-medium">
                  <p>{order?.shippingAddress?.street}</p>
                  <p>{order?.shippingAddress?.city}, {order?.shippingAddress?.zip}</p>
                  <p className="text-blue-500/80 uppercase tracking-widest text-[10px] font-black mt-2">{order?.shippingAddress?.country}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-black/40 border border-slate-900 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ordered On</p>
                  <p className="text-white font-bold text-sm">{format(new Date(order?.createdAt), "dd MMM yyyy, hh:mm aa")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Items List */}
        <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] p-8 shadow-2xl">
          <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Package size={18} />
            </div>
            Order Items
          </h3>
          <div className="grid gap-6">
            {order?.items?.map((item: any) => (
              <div key={item.id} className="group flex items-center gap-6 bg-black/40 border border-slate-900 p-6 rounded-2xl hover:border-blue-500/30 transition-all duration-500">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-slate-800 relative shadow-xl">
                  <img 
                    src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"} 
                    alt={item.product?.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-white/10">
                    x{item.quantity}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg mb-2 group-hover:text-blue-500 transition-colors">
                    {item.product?.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                    {item.selectedOptions?.size && (
                      <span className="bg-white/5 p-1 px-2 rounded-md">Size: <b className="text-blue-400">{item.selectedOptions.size}</b></span>
                    )}
                    {item.selectedOptions?.color && (
                      <span className="bg-white/5 p-1 px-2 rounded-md">Color: <b className="text-blue-400">{item.selectedOptions.color}</b></span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-black text-2xl tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
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
