"use client";

import React, { useState } from "react";
import { 
  Search, 
  Eye, 
  HandCoins,
  ChevronRight,
  Package,
  DollarSign,
  Loader2,
  TrendingUp,
  CreditCard,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { format } from "date-fns";

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["seller-payments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-seller-orders");
      return res.data.orders;
    },
  });

  const filteredPayments = data?.filter((order: any) => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.users?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
      case "ordered":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Stats calculation
  const totalRevenue = data?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;
  const adminCommission = totalRevenue * 0.1; // 10% Fee
  const netEarnings = totalRevenue - adminCommission;

  return (
    <div className="p-8 bg-black min-h-screen text-slate-300">
      {/* Unified Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
          <span>Dashboard</span>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-blue-500">Payments</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Payments</h1>
            <p className="text-slate-500">Manage your earnings and transaction history</p>
          </div>
          <div className="bg-[#0a0a0a] border border-slate-900 p-4 px-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Earnings</p>
              <h3 className="text-xl font-bold text-white">${netEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Table Container */}
      <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-900 bg-[#0d0d0d]/50 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-[450px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-600 group-focus-within:text-blue-500 transition-colors duration-300" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by Order ID or Buyer name..."
              className="w-full bg-black/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all duration-300 placeholder:text-slate-700 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] bg-black/40 p-2 px-4 rounded-xl border border-slate-900">
              <CreditCard size={14} className="text-blue-500" />
              Platform Fee: 10%
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-blue-600 transition-all shadow-sm">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d0d0d]/30">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900">Order ID</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900">Buyer</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900">Seller Earning</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900">Admin Fee</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {filteredPayments?.map((order: any) => {
                const adminFee = order.total * 0.1;
                const sellerEarning = order.total - adminFee;

                return (
                  <tr key={order.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                          <Package size={18} />
                        </div>
                        <span className="font-bold text-white tracking-tight">#{order.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                          {order.users?.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-medium text-slate-300">{order.users?.name || "Guest"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7 font-mono text-emerald-400 font-black text-lg">
                      ${sellerEarning.toFixed(2)}
                    </td>
                    <td className="px-8 py-7 font-mono text-amber-500/80 font-bold">
                      ${adminFee.toFixed(2)}
                    </td>
                    <td className="px-8 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.paymentStatus || order.status)}`}>
                        {order.paymentStatus || order.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <Link 
                        href={`/order/${order.id}`}
                        className="inline-flex p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {(!filteredPayments || filteredPayments.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <HandCoins size={64} className="text-slate-500" />
                      <p className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">No payments found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
