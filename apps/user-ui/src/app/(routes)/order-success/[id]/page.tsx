"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Home, 
  ShoppingBag, 
  Truck, 
  Mail,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const OrderSuccessPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axiosInstance.get(`/order/api/verify-payment-session?sessionId=${id}`);
        setSession(res.data.session);
      } catch (error) {
        console.error("Failed to verify session:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-[#47718F] mb-4" size={48} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Verifying Order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 px-4">
      <div className="max-w-4xl m-auto">
        {/* Success Banner */}
        <div className="bg-white rounded-[3rem] p-12 text-center border border-slate-100 shadow-sm relative overflow-hidden mb-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
          
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-scale-up">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">
            Thank you for your purchase. We've received your order and our sellers are getting it ready for shipment.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
             <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Package size={18} className="text-[#47718F]" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Session: {id?.toString().substring(0, 8)}...</span>
             </div>
             <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Mail size={18} className="text-[#47718F]" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Confirmation Sent</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                 <ShoppingBag className="text-[#47718F]" size={20} />
                 Items Ordered
               </h3>
               
               <div className="space-y-6">
                  {session?.cart?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-6 group">
                       <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative shrink-0">
                          <Image 
                            src={item.image || item.images?.[0]?.url || "https://via.placeholder.com/150"} 
                            alt={item.title}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-black text-slate-800 leading-tight group-hover:text-[#47718F] transition-colors">{item.title}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                       </div>
                       <div className="text-right">
                          <span className="font-black text-slate-900">${((item.sale_price || item.price) * (item.quantity || 1)).toFixed(2)}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-[#47718F] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
               <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
               <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                 <Truck size={24} />
                 Shipping Progress
               </h3>
               
               <div className="relative flex flex-col gap-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/20" />
                  
                  <div className="flex items-center gap-6 relative">
                     <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 bg-[#47718F] rounded-full" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Order Confirmed</h4>
                        <p className="text-xs text-white/60 font-medium">Your order has been successfully placed</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 relative opacity-40">
                     <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0" />
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Processing</h4>
                        <p className="text-xs text-white/60 font-medium">Sellers are preparing your items</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">Payment Summary</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-slate-500 text-sm font-medium">
                      <span>Subtotal</span>
                      <span className="text-slate-900 font-bold">${Number(session?.totalAmount || 0).toFixed(2)}</span>
                   </div>
                   
                   {session?.coupon && (
                     <div className="flex justify-between text-emerald-600 text-sm font-bold bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                        <span>Discount ({session.coupon.discountPercent || 0}%)</span>
                        <span>-${Number(session.coupon.discountAmount || 0).toFixed(2)}</span>
                     </div>
                   )}

                   <div className="flex justify-between text-slate-500 text-sm font-medium">
                      <span>Shipping</span>
                      <span className="text-slate-900 font-bold">$15.00</span>
                   </div>
                   <div className="h-[1px] bg-slate-50" />
                   <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Paid</span>
                      <span className="text-3xl font-black text-[#47718F]">
                        ${(
                          Number(session?.totalAmount || 0) + 
                          15 - 
                          Number(session?.coupon?.discountAmount || 0)
                        ).toFixed(2)}
                      </span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <Link 
                  href="/"
                  className="w-full bg-white border border-slate-100 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <Home size={18} />
                  Back to Home
                </Link>
                <Link 
                  href="/profile?tab=orders"
                  className="w-full bg-[#47718F] py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:bg-[#365870] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
                >
                  Track My Order
                  <ArrowRight size={18} />
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
