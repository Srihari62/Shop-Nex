"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Users,
  Clock,
  Globe,
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Package,
  BadgePercent,
  MessageSquare,
  ChevronRight,
  Share2,
  Heart,
  Calendar,
  ExternalLink,
  Search,
  Edit,
  Plus,
  ArrowUpRight,
  MoreVertical,
  Loader2,
  Camera,
  Mail,
  LayoutDashboard,
} from "lucide-react";
import useSellerShop from "@/hooks/useSellerShop";
import { format } from "date-fns";
import EditShopModal from "../../components/modals/edit-shop-modal";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const SellerHome = () => {
  const { shop, isLoading, isError } = useSellerShop();
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Filtering Logic
  const filteredData = useMemo(() => {
    if (!shop) return { products: [], offers: [], reviews: [], followers: [] };

    const query = searchQuery.toLowerCase();

    const products = (shop.products || []).filter(
      (p: any) =>
        p.title.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query),
    );

    const offers = (shop.products || []).filter(
      (p: any) =>
        p.sale_price < p.regular_price &&
        (p.title.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)),
    );

    const reviews = (shop.reviews || []).filter(
      (r: any) =>
        r.reviews?.toLowerCase().includes(query) ||
        r.user?.name?.toLowerCase().includes(query),
    );

    const followers = (shop.followers || []).filter(
      (f: any) =>
        f.user?.name?.toLowerCase().includes(query) ||
        f.user?.email?.toLowerCase().includes(query),
    );

    return { products, offers, reviews, followers };
  }, [shop, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-10 h-10 text-[#47718F] animate-spin" />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <h2 className="text-2xl font-black mb-4">
          Failed to load shop details
        </h2>
        <p className="text-slate-400 mb-8">
          Please make sure you have created a shop or check your connection.
        </p>
        <Link
          href="/dashboard/settings"
          className="px-6 py-3 bg-[#47718F] rounded-xl font-bold"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  const avatar =
    shop.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`;
  const banner =
    shop.coverBanner ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop";
  const followerCount = shop.followers?.length || 0;

  const convertFiletoBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatarUrl" | "coverBanner",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await convertFiletoBase64(file);
      const res = await axiosInstance.put("/product/api/update-shop", {
        [type]: base64,
      });
      if (res.data.success) {
        toast.success(
          `${type === "avatarUrl" ? "Avatar" : "Banner"} updated successfully!`,
        );
        queryClient.invalidateQueries({ queryKey: ["seller-shop"] });
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, "avatarUrl")}
      />
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, "coverBanner")}
      />

      {/* Banner Section */}
      <div
        className="relative h-[250px] md:h-[350px] w-full rounded-[40px] overflow-hidden mb-8 shadow-2xl group/banner cursor-pointer"
        onClick={() => bannerInputRef.current?.click()}
      >
        <Image
          src={banner}
          alt={shop.name}
          fill
          className={`object-cover transition-all duration-700 ${isUploading ? "opacity-50 blur-sm" : "group-hover/banner:scale-105"}`}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover/banner:via-black/40 transition-all" />

        {/* Banner Edit Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity z-20">
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-2xl">
            <Camera size={18} />
            Change Cover Photo
          </div>
        </div>

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-8 right-8 flex gap-4 hidden md:flex z-10">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2">
            <Package size={16} className="text-[#47718F]" />
            <span className="text-sm font-bold">
              {shop.products?.length || 0} Products
            </span>
          </div>
          <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm font-bold">{shop.ratings} Rating</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        {/* Main Shop Info Card */}
        <div className="lg:col-span-8">
          <div className="bg-[#111111] rounded-[40px] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#47718F]/5 blur-[100px] -z-10 group-hover:bg-[#47718F]/10 transition-all" />

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              {/* Avatar */}
              <div
                className="relative shrink-0 group/avatar cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl bg-zinc-900 transition-transform duration-500 group-hover/avatar:scale-105">
                  <Image
                    src={avatar}
                    alt={shop.name}
                    fill
                    className={`object-cover ${isUploading ? "opacity-50 blur-sm" : ""}`}
                    unoptimized
                  />
                  {/* Avatar Edit Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera size={32} className="text-white" />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                      <Loader2
                        size={32}
                        className="text-[#47718F] animate-spin"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                      {shop.name}
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-green-500/20">
                        Active
                      </span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mb-4 max-w-xl">
                      {shop.bio || "Manage your brand and products from here."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm bg-yellow-500/5 px-3 py-1 rounded-full border border-yellow-500/10">
                        <Star size={14} fill="currentColor" />
                        {shop.ratings || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold text-sm bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <Users size={16} className="text-[#47718F]" />
                        {followerCount} Followers
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-6 py-3 bg-[#47718F] hover:bg-[#365870] border border-[#47718F]/20 rounded-2xl text-white font-bold text-sm transition-all shadow-xl shadow-[#47718F]/10"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm transition-all shadow-xl"
                    >
                      <Edit size={18} />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 mt-8 border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#47718F] shrink-0 border border-white/5">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                        Operating Hours
                      </span>
                      <span className="font-bold text-slate-200">
                        {shop.opening_hours || "Mon - Fri 9 am to 10 pm"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#47718F] shrink-0 border border-white/5">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                        Location
                      </span>
                      <span className="font-bold text-slate-200 truncate max-w-[200px]">
                        {shop.address || "Dhaka, Bangladesh"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#111111] rounded-[40px] p-8 border border-white/5 shadow-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#47718F]/5 blur-[80px] -z-10" />

            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
              Shop Details
              <div className="h-0.5 flex-1 bg-white/5 rounded-full" />
            </h3>

            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-[#47718F] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                  <Calendar size={22} />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Joined At
                  </span>
                  <span className="font-bold text-slate-200">
                    {shop.createdAt
                      ? format(new Date(shop.createdAt), "dd/MM/yyyy")
                      : "24/03/2025"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-[#47718F] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                  <Globe size={22} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Website
                  </span>
                  <a
                    href={shop.website || "#"}
                    target="_blank"
                    className="font-bold text-[#47718F] hover:underline flex items-center gap-1 truncate"
                  >
                    {shop.website || "https://www.becodemy.com"}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  Follow Us
                </span>
                <div className="flex gap-3">
                  <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center hover:bg-[#47718F] hover:text-white transition-all border border-white/5 shadow-sm">
                    <Youtube size={22} />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center hover:bg-[#47718F] hover:text-white transition-all border border-white/5 shadow-sm">
                    <Twitter size={22} />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center hover:bg-[#47718F] hover:text-white transition-all border border-white/5 shadow-sm">
                    <Instagram size={22} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <Link
                href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${shop.id}`}
                target="_blank"
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all border border-white/10 shadow-xl flex items-center justify-center gap-2"
              >
                View Public Shop
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-2 p-1.5 bg-[#111111] rounded-3xl border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setActiveTab("products");
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shrink-0 min-w-[140px] ${activeTab === "products" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Package size={16} />
              Products
              <span
                className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "products" ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"}`}
              >
                {shop.products?.length || 0}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("offers");
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shrink-0 min-w-[140px] ${activeTab === "offers" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              <BadgePercent size={16} />
              Offers
              <span
                className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "offers" ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"}`}
              >
                {shop.products?.filter(
                  (p: any) => p.sale_price < p.regular_price,
                ).length || 0}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("reviews");
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shrink-0 min-w-[140px] ${activeTab === "reviews" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Star size={16} />
              Reviews
              <span
                className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "reviews" ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"}`}
              >
                {shop.reviews?.length || 0}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("followers");
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shrink-0 min-w-[140px] ${activeTab === "followers" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Users size={16} />
              Followers
              <span
                className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "followers" ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"}`}
              >
                {followerCount}
              </span>
            </button>
          </div>

          <div className="flex gap-4">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#47718F] transition-colors"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="pl-12 pr-4 py-3.5 bg-[#111111] border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#47718F]/20 focus:border-[#47718F]/40 outline-none transition-all font-bold text-sm text-slate-200 placeholder:text-slate-600 w-[200px] md:w-[300px]"
              />
            </div>
            <Link
              href="/dashboard/create-product"
              className="p-3.5 bg-[#47718F] text-white rounded-2xl shadow-xl shadow-[#47718F]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            >
              <Plus size={22} />
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
          {activeTab === "products" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredData.products.map((product: any) => (
                <div
                  key={product.id}
                  className="group bg-[#111111] rounded-[32px] overflow-hidden border border-white/5 hover:border-[#47718F]/30 transition-all shadow-xl hover:shadow-[#47718F]/5"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                      }
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    {product.sale_price < product.regular_price && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                        {Math.round(
                          ((product.regular_price - product.sale_price) /
                            product.regular_price) *
                            100,
                        )}
                        % OFF
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-100 mb-2 truncate group-hover:text-[#47718F] transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Star
                        size={14}
                        fill="#eab308"
                        className="text-yellow-500"
                      />
                      <span className="text-sm font-bold text-slate-300">
                        {product.ratings || "5.0"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">
                          ${product.sale_price}
                        </span>
                        {product.sale_price < product.regular_price && (
                          <span className="text-xs font-bold text-slate-500 line-through">
                            ${product.regular_price}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/edit-product/${product.id}`}
                      className="w-full py-3.5 bg-white/5 hover:bg-[#47718F] text-slate-300 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2"
                    >
                      View Details
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}

              {filteredData.products.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#111111] rounded-[40px] border border-dashed border-white/10">
                  <Package size={48} className="mx-auto text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">
                    No products found
                  </h3>
                  <p className="text-slate-500 mb-8">
                    Try searching with a different term or add new products.
                  </p>
                  <Link
                    href="/dashboard/create-product"
                    className="px-8 py-3 bg-[#47718F] text-white font-bold rounded-xl"
                  >
                    Add Product
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {filteredData.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="bg-[#111111] rounded-[32px] p-8 border border-white/5 flex flex-col md:flex-row gap-8 hover:border-[#47718F]/20 transition-all"
                >
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 relative border-2 border-white/5">
                      <Image
                        src={
                          review.user?.avatar?.url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name || review.userId}`
                        }
                        alt="User"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-black text-white text-lg mb-1">
                          {review.user?.name || "Verified Customer"}
                        </h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < review.rating ? "#facc15" : "none"}
                              className={
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-zinc-700"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {format(new Date(review.createdAt), "MMMM dd, yyyy")}
                      </span>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed italic">
                      "
                      {review.reviews ||
                        "Great product and excellent service from this shop."}
                      "
                    </p>
                    <div className="mt-6 flex gap-4">
                      <button className="text-[10px] font-black text-[#47718F] uppercase tracking-widest hover:underline">
                        Reply
                      </button>
                      <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:underline">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredData.reviews.length === 0 && (
                <div className="py-20 text-center bg-[#111111] rounded-[40px] border border-dashed border-white/10">
                  <MessageSquare
                    size={48}
                    className="mx-auto text-slate-700 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">
                    No reviews found
                  </h3>
                  <p className="text-slate-500">
                    Try searching for a different reviewer or content.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "followers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredData.followers.map((follow: any) => (
                <div
                  key={follow.id}
                  className="bg-[#111111] rounded-[32px] p-6 border border-white/5 flex items-center gap-4 hover:border-[#47718F]/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 relative border-2 border-white/5 shrink-0 group-hover:scale-105 transition-transform">
                    <Image
                      src={
                        follow.user?.avatar?.url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${follow.user?.name || follow.userId}`
                      }
                      alt="User"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-sm mb-0.5 truncate">
                      {follow.user?.name || "Customer"}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Mail size={12} />
                      <span className="text-[10px] font-medium truncate">
                        {follow.user?.email || "No email"}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Since{" "}
                      {format(
                        new Date(follow.createdAt || new Date()),
                        "MMM yyyy",
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {filteredData.followers.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#111111] rounded-[40px] border border-dashed border-white/10">
                  <Users size={48} className="mx-auto text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">
                    No followers found
                  </h3>
                  <p className="text-slate-500">
                    Try searching with a different name or email.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "offers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredData.offers.map((product: any) => (
                <div
                  key={product.id}
                  className="group bg-[#111111] rounded-[32px] overflow-hidden border border-white/5 hover:border-[#47718F]/30 transition-all shadow-xl hover:shadow-[#47718F]/5"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                      }
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                      {Math.round(
                        ((product.regular_price - product.sale_price) /
                          product.regular_price) *
                          100,
                      )}
                      % OFF
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-100 mb-4 truncate">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">
                          ${product.sale_price}
                        </span>
                        <span className="text-xs font-bold text-slate-500 line-through">
                          ${product.regular_price}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                        <Package size={12} className="text-[#47718F]" />
                        <span className="text-[10px] font-black text-slate-400">
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                    <button className="w-full py-3.5 bg-[#47718F] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#47718F]/10">
                      Manage Offer
                    </button>
                  </div>
                </div>
              ))}

              {filteredData.offers.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#111111] rounded-[40px] border border-dashed border-white/10">
                  <BadgePercent
                    size={48}
                    className="mx-auto text-slate-700 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">
                    No offers found
                  </h3>
                  <p className="text-slate-500">
                    Try searching with a different product name.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditShopModal shop={shop} onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};

export default SellerHome;
