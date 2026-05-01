"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { 
  CreditCard, 
  User, 
  Calendar, 
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";

const fetchPayments = async () => {
  const response: any = await axiosInstance.get("/admin/api/payments");
  return response.data.payments;
};

const PaymentsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateOrder, setDateOrder] = useState("desc"); // 'desc' for Newest, 'asc' for Oldest

  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: fetchPayments,
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return <CheckCircle2 size={14} className="text-green-500" />;
      case "failed": return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-orange-500" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "failed": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    let result = payments.filter((payment: any) => {
      const trxId = `TRX-${payment.id.slice(-8).toUpperCase()}`;
      const matchesSearch = 
        trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Pending" 
          ? (payment.paymentStatus.toLowerCase() === "pending" || payment.paymentStatus.toLowerCase() === "unpaid")
          : payment.paymentStatus.toLowerCase() === statusFilter.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });

    // Sort by Date
    return [...result].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [payments, searchQuery, statusFilter, dateOrder]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] p-8 rounded-[30px] shadow-xl flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold">Failed to load payments</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Financial Transactions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Monitor all platform revenue and payment statuses.
          </p>
        </div>
        <div className="p-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]">
          <span className="text-lg font-black text-[#4A876E] dark:text-[#78B59C]">
            {filteredPayments.length} TRX
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4A876E] transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Search by Transaction ID or Payer Info..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none focus:ring-2 focus:ring-[#4A876E]/20 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="relative group min-w-[180px]">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4A876E] transition-colors">
                    <Filter size={18} />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none focus:ring-2 focus:ring-[#4A876E]/20 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none appearance-none cursor-pointer"
                >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>
            <div className="relative group min-w-[180px]">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4A876E] transition-colors">
                    <Calendar size={18} />
                </div>
                <select 
                    value={dateOrder}
                    onChange={(e) => setDateOrder(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none focus:ring-2 focus:ring-[#4A876E]/20 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none appearance-none cursor-pointer"
                >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                </select>
            </div>
        </div>
      </div>

      <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Payer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment: any) => (
                <tr 
                  key={payment.id}
                  onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
                  className="group hover:bg-[#d1d9e6]/30 dark:hover:bg-[#26292f]/30 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">TRX-{payment.id.slice(-8).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col min-w-[150px]">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{payment.users?.name}</span>
                      <span className="text-[10px] text-slate-500">{payment.users?.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-[#4A876E] dark:text-[#78B59C]">
                      ${payment.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CreditCard size={14} />
                      <span className="text-xs font-bold capitalize">{payment.paymentMethod || "Card"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyles(payment.paymentStatus)}`}>
                      {getStatusIcon(payment.paymentStatus)}
                      {payment.paymentStatus}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] text-slate-400 group-hover:text-[#4A876E] transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <CreditCard size={48} strokeWidth={1} />
                      <p className="text-lg font-bold">No transactions found</p>
                      <button 
                        onClick={() => {setSearchQuery(""); setStatusFilter("All");}}
                        className="text-[#4A876E] font-black uppercase text-[10px] tracking-widest hover:underline"
                      >
                        Reset search filters
                      </button>
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
