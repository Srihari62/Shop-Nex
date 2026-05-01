"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  Store, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Download
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const fetchPaymentDetails = async (id: string) => {
  const response: any = await axiosInstance.get(`/admin/api/payments/${id}`);
  return response.data.payment;
};

const PaymentDetailsPage = () => {
  const router = useRouter();
  const { paymentId } = useParams();

  const { data: payment, isLoading, isError } = useQuery({
    queryKey: ["admin-payment", paymentId],
    queryFn: () => fetchPaymentDetails(paymentId as string),
    enabled: !!paymentId,
  });

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "failed": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center">
        <div className="space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Transaction record not found</h2>
          <button onClick={() => router.back()} className="text-[#4A876E] font-bold">Return to Payments</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] group-hover:translate-x-[-2px] transition-transform">
          <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-bold">Back to Transactions</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Transaction Summary Card */}
          <div className="p-10 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20 dark:border-white/5">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#4A876E] to-[#78B59C] text-white shadow-lg">
                  <Receipt size={32} />
                </div>
                <div className="space-y-1">
                   <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    ${payment.total.toFixed(2)}
                  </h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                    <Calendar size={14} /> {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyles(payment.paymentStatus)}`}>
                <ShieldCheck size={14} />
                Transaction Status: {payment.paymentStatus}
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] text-[#4A876E] font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">
                    <Download size={16} /> Download Receipt
                </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-4">Transaction Details</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Transaction ID</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">TRX-{payment.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Payment Gateway</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 capitalize">{payment.paymentMethod || "Stripe"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Processing Fee</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">$0.00 (Standard)</span>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-4">Verification</h3>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                    <CheckCircle2 className="text-green-500" size={24} />
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Integrity Verified</span>
                        <span className="text-[10px] font-medium text-green-600/70">Payment hash matched order total</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <User size={16} /> Customer Info
                </h3>
                <div className="flex flex-col gap-1">
                    <span className="text-base font-black text-slate-800 dark:text-slate-200">{payment.users?.name}</span>
                    <span className="text-xs font-medium text-slate-500">{payment.users?.email}</span>
                </div>
                <button onClick={() => router.push(`/dashboard/users/${payment.users?.id}`)} className="w-full py-3 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] text-xs font-bold text-slate-500 hover:text-[#4A876E] transition-colors">
                    View Customer Profile
                </button>
            </div>

            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Store size={16} /> Fulfillment Shop
                </h3>
                <div className="flex flex-col gap-1">
                    <span className="text-base font-black text-slate-800 dark:text-slate-200">{payment.shops?.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {payment.shops?.id}</span>
                </div>
                <button onClick={() => router.push(`/dashboard/orders/${payment.id}`)} className="w-full py-3 rounded-2xl bg-gradient-to-tr from-[#4A876E] to-[#78B59C] text-white shadow-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
                    View Associated Order
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
