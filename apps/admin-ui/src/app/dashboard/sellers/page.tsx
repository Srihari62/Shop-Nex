"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { 
  Store, 
  User, 
  Package, 
  Calendar, 
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  X,
  ShieldCheck,
  Star,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";

const fetchSellers = async () => {
  const response: any = await axiosInstance.get("/admin/api/sellers");
  return response.data.sellers;
};

const SellersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateOrder, setDateOrder] = useState("desc");

  const { data: sellers, isLoading, isError } = useQuery({
    queryKey: ["admin-sellers"],
    queryFn: fetchSellers,
  });

  const filteredSellers = useMemo(() => {
    if (!sellers) return [];
    let result = sellers.filter((shop: any) => 
      shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.sellers?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...result].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [sellers, searchQuery, dateOrder]);

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" /></div>;
  if (isError) return <div className="h-full w-full flex items-center justify-center text-red-500"><AlertCircle size={48} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Marketplace Sellers</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Audit shop performance and manage seller verifications.</p>
        </div>
        <div className="p-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]">
          <span className="text-lg font-black text-[#4A876E] dark:text-[#78B59C]">{filteredSellers.length} Shops</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by shop or owner name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none outline-none text-sm font-bold"
          />
        </div>
        <select 
            value={dateOrder}
            onChange={(e) => setDateOrder(e.target.value)}
            className="px-8 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none outline-none text-sm font-black uppercase tracking-widest text-slate-500 cursor-pointer"
        >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Shop Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Catalog</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Rating</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSellers.map((shop: any) => (
                <tr key={shop.id} onClick={() => router.push(`/dashboard/sellers/${shop.id}`)} className="group hover:bg-[#d1d9e6]/30 dark:hover:bg-[#26292f]/30 cursor-pointer transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-inner overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        {shop.avatar?.url ? (
                          <img src={shop.avatar.url} className="w-full h-full object-cover" />
                        ) : shop.avatarUrl ? (
                          <img src={shop.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <Store size={24} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{shop.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 uppercase tracking-widest">
                            <ShieldCheck size={10} className="text-green-500" /> Verified Shop
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center overflow-hidden">
                            <User size={14} className="text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{shop.sellers?.name}</span>
                            <span className="text-[10px] text-slate-500">{shop.sellers?.email}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black">
                        <Package size={14} /> {shop._count?.products || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500 font-black">
                        <Star size={14} fill="currentColor" /> {shop.ratings.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] group-hover:text-[#4A876E] transition-all"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellersPage;
