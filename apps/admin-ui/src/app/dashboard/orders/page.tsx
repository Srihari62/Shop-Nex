"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import {
  ShoppingBag,
  User,
  Store,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  Eye,
  Search,
  Filter,
  X,
  Truck,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

const fetchOrders = async () => {
  const response: any = await axiosInstance.get("/admin/api/orders");
  return response.data.orders;
};

const OrdersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateOrder, setDateOrder] = useState("desc");

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "delivered") return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    if (s === "out for delivery") return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    if (s === "shipped") return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    if (s === "ordered" || s === "processing") return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "cancelled" || s === "failed") return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = orders.filter((order: any) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shops?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDelivery =
        deliveryFilter === "All" ||
        order.deliveryStatus.toLowerCase() === deliveryFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === "All" ||
        (paymentFilter === "Pending"
          ? order.paymentStatus.toLowerCase() === "pending" ||
            order.paymentStatus.toLowerCase() === "unpaid"
          : order.paymentStatus.toLowerCase() === paymentFilter.toLowerCase());

      return matchesSearch && matchesDelivery && matchesPayment;
    });

    // Sort by Date
    return [...result].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [orders, searchQuery, deliveryFilter, paymentFilter, dateOrder]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] p-8 rounded-[30px] shadow-xl flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Failed to load orders
          </h2>
          <p className="text-sm text-slate-500">
            Please check your connection or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Order Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Monitor and manage all customer transactions across the platform.
          </p>
        </div>
        <div className="p-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]">
          <span className="text-lg font-black text-[#4A876E] dark:text-[#78B59C]">
            {filteredOrders.length} Total
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
            placeholder="Search by Order ID, Customer, or Shop..."
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
          <div className="relative group min-w-[160px]">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4A876E] transition-colors">
              <Truck size={18} />
            </div>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none focus:ring-2 focus:ring-[#4A876E]/20 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Steps</option>
              <option value="Ordered">Ordered</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div className="relative group min-w-[160px]">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4A876E] transition-colors">
              <CreditCard size={18} />
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none focus:ring-2 focus:ring-[#4A876E]/20 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="relative group min-w-[160px]">
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
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Order Details
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Customer
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Shop
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Total
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="group hover:bg-[#d1d9e6]/30 dark:hover:bg-[#26292f]/30 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold shadow-inner">
                          {order.users?.avatar?.url ? (
                            <img
                              src={order.users.avatar.url}
                              className="w-full h-full rounded-full object-cover"
                              alt="avatar"
                            />
                          ) : (
                            <User size={14} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {order.users?.name || "Guest"}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {order.users?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                          {order.shops?.avatar?.url ? (
                            <img
                              src={order.shops.avatar.url}
                              className="w-full h-full object-cover"
                              alt="shop"
                            />
                          ) : order.shops?.avatarUrl ? (
                            <img
                              src={order.shops.avatarUrl}
                              className="w-full h-full object-cover"
                              alt="shop"
                            />
                          ) : (
                            <Store size={14} className="text-slate-400" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {order.shops?.name || "ShopNex"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.deliveryStatus)}`}
                      >
                        {order.deliveryStatus}
                      </span>
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
                      <Search size={48} strokeWidth={1} />
                      <p className="text-lg font-bold">
                        No orders found matching your criteria
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setDeliveryFilter("All");
                          setPaymentFilter("All");
                        }}
                        className="text-[#4A876E] font-black uppercase text-[10px] tracking-widest hover:underline"
                      >
                        Clear all filters
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

export default OrdersPage;
