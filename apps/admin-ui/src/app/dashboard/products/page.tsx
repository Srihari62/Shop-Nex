"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { 
  Package, 
  Store, 
  Calendar, 
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  X,
  Tag,
  ArrowUpDown
} from "lucide-react";
import { useRouter } from "next/navigation";

const fetchProducts = async () => {
  const response: any = await axiosInstance.get("/admin/api/products");
  return response.data.products;
};

const ProductsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateOrder, setDateOrder] = useState("desc");

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchProducts,
  });

  const getStatusColor = (product: any) => {
    if (product.stock <= 0) return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    if (product.stock < 10) return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
  };

  const getStatusLabel = (product: any) => {
    if (product.stock <= 0) return "Out of Stock";
    if (product.stock < 10) return "Low Stock";
    return "Active";
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = products.filter((product: any) => {
      const matchesSearch = 
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shop?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [products, searchQuery, categoryFilter, dateOrder]);

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" /></div>;
  if (isError) return <div className="h-full w-full flex items-center justify-center text-red-500"><AlertCircle size={48} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Product Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Platform-wide catalog tracking and stock management.</p>
        </div>
        <div className="p-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]">
          <span className="text-lg font-black text-[#4A876E] dark:text-[#78B59C]">{filteredProducts.length} Total</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products or shops..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none outline-none text-sm font-bold"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-8 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none outline-none text-sm font-black uppercase tracking-widest text-slate-500 cursor-pointer"
            >
                <option value="All">All Categories</option>
                {Array.from(new Set(products?.map((p: any) => p.category))).map((cat: any) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <select 
                value={dateOrder}
                onChange={(e) => setDateOrder(e.target.value)}
                className="px-8 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none outline-none text-sm font-black uppercase tracking-widest text-slate-500 cursor-pointer"
            >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
            </select>
        </div>
      </div>

      <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Shop</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((product: any) => (
                <tr key={product.id} onClick={() => router.push(`/dashboard/products/${product.id}`)} className="group hover:bg-[#d1d9e6]/30 dark:hover:bg-[#26292f]/30 cursor-pointer transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        {product.images?.[0]?.url ? <img src={product.images[0].url} className="w-full h-full object-cover" /> : <Package size={20} className="text-slate-300" />}
                      </div>
                      <div className="flex flex-col truncate max-w-[200px]">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{product.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 uppercase tracking-widest"><Tag size={10} /> {product.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{product.shop?.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium tracking-tight">ID: {product.shop?.id?.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{product.stock} Units</span>
                        <span className="text-[10px] text-slate-500 font-medium">{product.totalSales} Items Sold</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(product)}`}>
                        {getStatusLabel(product)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-[#4A876E]">${(product.sale_price || product.regular_price).toFixed(2)}</span>
                        {product.sale_price < product.regular_price && <span className="text-[10px] text-slate-400 line-through font-medium">${product.regular_price.toFixed(2)}</span>}
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

export default ProductsPage;
