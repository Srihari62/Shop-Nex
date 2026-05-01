"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";
import {
  ArrowLeft,
  Store,
  User as UserIcon,
  Mail,
  Package,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Globe,
  Star,
  Users,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Clock,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const fetchSellerDetail = async (id: string) => {
  const response: any = await axiosInstance.get(`/admin/api/sellers/${id}`);
  return response.data.seller;
};

const SellerDetailPage = () => {
  const router = useRouter();
  const { sellerId } = useParams();

  const {
    data: shop,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-seller", sellerId],
    queryFn: () => fetchSellerDetail(sellerId as string),
    enabled: !!sellerId,
  });

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" />
      </div>
    );
  if (isError || !shop)
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-slate-500">
        <AlertCircle size={48} />
        <p>Shop not found</p>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
      {/* Premium Header Section */}
      <div className="relative mb-20">
        <div className="h-64 md:h-80 w-full rounded-[40px] bg-gradient-to-br from-[#4A876E] to-[#2D5A47] shadow-xl overflow-hidden relative">
          {shop.coverBanner ? (
            <img
              src={shop.coverBanner}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Store size={120} className="text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-[#4A876E] transition-all group z-10"
        >
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg group-hover:-translate-x-1 transition-transform">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest drop-shadow-md">
            Back
          </span>
        </button>

        <div className="absolute -bottom-16 left-10 flex items-end gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] p-1.5 shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] z-20">
            <div className="w-full h-full rounded-[35px] bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
              {shop.avatarUrl ? (
                <img
                  src={shop.avatarUrl}
                  className="w-full h-full object-cover"
                />
              ) : shop.avatar?.url ? (
                <img
                  src={shop.avatar.url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store size={48} className="text-slate-200" />
              )}
            </div>
          </div>
          <div className="pb-4 hidden md:block">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm border border-white/20 mb-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                Verified Marketplace Partner
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              {shop.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Mobile Title View */}
        <div className="md:hidden space-y-2 px-4 mb-4">
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
            {shop.name}
          </h1>
          <div className="flex items-center gap-2 text-[#4A876E] text-xs font-bold">
            <ShieldCheck size={14} /> Verified Shop
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Ownership
              </span>
              <div className="flex items-center gap-3 p-4 rounded-[25px] bg-[#d1d9e6]/20 dark:bg-[#26292f]/20 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center shadow-sm">
                  {shop.sellers?.avatarUrl ? (
                    <img
                      src={shop.sellers.avatarUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={16} className="text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 truncate">
                    {shop.sellers?.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold truncate">
                    {shop.sellers?.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                  <Star
                    size={14}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Shop Rating
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {shop.ratings.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                  <Calendar size={14} className="text-[#4A876E]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Partner Since
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                Shop Registry ID
              </span>
              <div className="p-3 rounded-xl bg-[#d1d9e6]/20 dark:bg-[#26292f]/20 font-mono text-[10px] font-black text-slate-500 break-all">
                {shop.id.toUpperCase()}
              </div>
            </div>
          </div>

          {shop.address && (
            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MapPin size={16} /> Physical Presence
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {shop.address}
              </p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className=" p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col items-center gap-1 border border-white/5">
              <Users className="text-blue-500" size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Total Followers
              </span>
              <span className="text-lg font-black text-white">
                {shop.followers?.length || 0}
              </span>
            </div>
            <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col items-center gap-1 border border-white/5">
              <Package className="text-[#4A876E]" size={24} />
              <span className=" text-[9px] font-black uppercase tracking-widest text-slate-400">
                Active Listing
              </span>
              <span className="text-white text-lg font-black">
                {shop.products?.length || 0}
              </span>
            </div>
            <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col items-center gap-1 border border-white/5 md:col-span-1 col-span-2">
              <Award className="text-purple-500" size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Verified Reviews
              </span>
              <span className="text-white text-lg font-black">
                {shop.reviews?.length || 0}
              </span>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Globe size={16} /> Brand Narrative
              </h3>
            </div>
            <div className="p-8 rounded-[35px] bg-[#d1d9e6]/10 shadow-inner border border-white/5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {shop.bio ||
                  shop.description ||
                  "No public brand description available for this shop."}
              </p>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp size={16} /> Featured Inventory
              </h3>
              <div className="px-3 py-1 rounded-lg bg-[#4A876E]/10 text-[9px] font-black text-[#4A876E] uppercase tracking-widest">
                Live on Marketplace
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shop.products?.map((product: any) => (
                <div
                  key={product.id}
                  onClick={() =>
                    router.push(`/dashboard/products/${product.id}`)
                  }
                  className="p-5 rounded-[35px] bg-[#d1d9e6]/20 dark:bg-[#26292f]/20 flex items-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex items-center justify-center p-1">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package size={24} className="text-slate-200" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 truncate">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">
                      {product.title}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#4A876E] tracking-tight">
                        $
                        {(product.sale_price || product.regular_price).toFixed(
                          2,
                        )}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              ))}
              {!shop.products?.length && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 text-slate-400 opacity-50">
                  <Package size={64} strokeWidth={1} />
                  <p className="text-base font-black italic text-center uppercase tracking-widest">
                    No Inventory Found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailPage;
