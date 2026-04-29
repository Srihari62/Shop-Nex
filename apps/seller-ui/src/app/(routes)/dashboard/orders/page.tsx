"use client";

import React, { useState } from "react";
import {
  Search,
  Eye,
  Filter,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  Package,
  Calendar,
  User,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { format } from "date-fns";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-seller-orders");
      return res.data.orders;
    },
  });

  const filteredOrders = data?.filter(
    (order: any) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
      case "ordered":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Dashboard <ChevronRight size={12} />{" "}
            <span className="text-indigo-500">Orders</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Order <span className="text-indigo-500">Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Track and manage your customer purchases across all shops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
              Total Orders
            </span>
            <span className="text-xl font-black text-white">
              {data?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-900 bg-[#0d0d0d]/50 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-[450px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className="text-slate-600 group-focus-within:text-blue-500 transition-colors duration-300"
                size={20}
              />
            </div>
            <input
              type="text"
              placeholder="Search by Order ID or Buyer name..."
              className="w-full bg-black/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all duration-300 placeholder:text-slate-700 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-tighter">
                Press Enter
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all shadow-sm">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#0b0e14] border border-slate-800/50 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 bg-[#0f1219]/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Order Details
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Buyer
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Amount
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Date
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredOrders?.map((order: any) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-white/[0.02] transition-all"
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                          <Package size={20} />
                        </div>
                        <div>
                          <span className="text-sm font-black text-white block mb-0.5">
                            #{order.id.toString().substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            via {order.paymentMethod || "Direct"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {order.users?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-black text-slate-300">
                          {order.users?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className="text-sm font-black text-white">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.paymentStatus || order.status)}`}
                      >
                        {order.paymentStatus || order.status}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-400">
                          {format(new Date(order.createdAt), "dd MMM yyyy")}
                        </span>
                        <span className="text-[10px] font-medium text-slate-600">
                          {format(new Date(order.createdAt), "hh:mm aa")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/order/${order.id}`}
                          className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-400 transition-all shadow-sm"
                        >
                          <Eye size={18} />
                        </Link>
                        <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-sm">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!filteredOrders || filteredOrders.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Package size={64} className="text-slate-500" />
                        <p className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">
                          No orders found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
