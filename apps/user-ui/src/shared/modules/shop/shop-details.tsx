"use client";

import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Loader2,
  LayoutDashboard
} from "lucide-react";
import ProductCard from "@/shared/components/cards/product-cards";
import { format } from "date-fns";
import axiosInstance from "@/utils/axiosInstance";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ShopDetailsProps {
  shop: any;
}

const ShopDetails = ({ shop: initialShop }: ShopDetailsProps) => {
  const [shop, setShop] = useState(initialShop);
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (user && shop.followers) {
      const following = shop.followers.some((f: any) => f.userId === user.id);
      setIsFollowing(following);
    }
  }, [user, shop.followers]);

  const followerCount = shop.followers?.length || 0;
  const avatar = shop.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`;
  const banner = shop.coverBanner || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop";

  // Search Logic for different tabs
  const filteredProducts = (shop.products || []).filter((p: any) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const offers = (shop.products || []).filter((p: any) => 
    ((p.discount_codes && p.discount_codes.length > 0) || (p.regular_price > p.sale_price)) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const reviews = (shop.reviews || []).filter((r: any) => 
    r.reviews?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow shops");
      router.push("/login");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axiosInstance.post("/product/api/unfollow-shop", { shopId: shop.id });
        setIsFollowing(false);
        setShop((prev: any) => ({
          ...prev,
          followers: prev.followers.filter((f: any) => f.userId !== user.id)
        }));
        toast.success("Unfollowed shop");
      } else {
        await axiosInstance.post("/product/api/follow-shop", { shopId: shop.id });
        setIsFollowing(true);
        setShop((prev: any) => ({
          ...prev,
          followers: [...(prev.followers || []), { userId: user.id, shopId: shop.id }]
        }));
        toast.success("Following shop");
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      toast.error("Please login to message the seller");
      router.push("/login");
      return;
    }

    setMessageLoading(true);
    try {
      const res = await axiosInstance.post("/chatting/api/create-user-conversationGroup", {
        sellerId: shop.sellerId
      });
      const conversationId = res.data.conversation.id || res.data.conversation._id;
      router.push(`/inbox?conversationId=${conversationId}`);
    } catch (error) {
      toast.error("Failed to start conversation");
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Banner Section */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <Image
          src={banner}
          alt={shop.name}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 md:left-12 z-20">
          <Link 
            href="/shops"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold text-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={18} />
            Back to Shops
          </Link>
        </div>

        {/* Banner Actions */}
        <div className="absolute top-6 right-6 md:right-12 z-20 flex gap-3">
          <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all shadow-xl">
            <Share2 size={20} />
          </button>
          <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all shadow-xl">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Profile Header Section */}
      <div className="w-[95%] lg:w-[85%] mx-auto relative -mt-24 md:-mt-32 z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden border-8 border-white shadow-2xl bg-white">
                    <Image
                      src={avatar}
                      alt={shop.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                        {shop.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-100 font-black text-xs uppercase tracking-wider">
                          <Star size={14} fill="#eab308" className="text-yellow-500" />
                          {shop.ratings} Rating
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          <Users size={16} className="text-[#47718F]" />
                          {followerCount} Followers
                        </div>
                        {shop.category && (
                          <div className="flex items-center gap-1.5 font-bold text-sm uppercase tracking-widest text-[#47718F]">
                            <Package size={16} />
                            {shop.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {user?.id === shop.sellerId && (
                        <Link 
                          href="http://localhost:3001/dashboard"
                          className="flex items-center gap-2 px-8 py-4 bg-[#47718F] hover:bg-[#365870] border border-[#47718F]/20 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#47718F]/20"
                        >
                          <LayoutDashboard size={18} />
                          Go to Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={handleFollow}
                        disabled={followLoading || user?.id === shop.sellerId}
                        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isFollowing 
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                          : "bg-[#47718F] text-white shadow-[#47718F]/20 hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        {followLoading ? <Loader2 size={18} className="animate-spin" /> : (isFollowing ? "Following" : "Follow Shop")}
                      </button>
                      <button 
                        onClick={handleMessage}
                        disabled={messageLoading || user?.id === shop.sellerId}
                        className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center min-w-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {messageLoading ? <Loader2 size={20} className="animate-spin" /> : <MessageSquare size={20} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-2xl mb-8">
                    {shop.bio || shop.description || "No description available for this shop."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#47718F] shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Operating Hours</span>
                        <span className="font-bold text-slate-700">{shop.opening_hours || "Mon - Fri 9 am to 10 pm"}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#47718F] shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</span>
                        <span className="font-bold text-slate-700">{shop.address || "Location not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 h-full flex flex-col">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2 uppercase tracking-tighter">
                Shop Details
                <div className="h-1 flex-1 bg-slate-100 rounded-full" />
              </h3>

              <div className="space-y-8 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#47718F]/5 text-[#47718F] flex items-center justify-center">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined At</span>
                    <span className="font-bold text-slate-800">{shop.createdAt ? format(new Date(shop.createdAt), "dd/MM/yyyy") : "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#47718F]/5 text-[#47718F] flex items-center justify-center">
                    <Globe size={22} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</span>
                    <a href={shop.website?.startsWith("http") ? shop.website : `https://${shop.website}`} target="_blank" className="font-bold text-[#47718F] hover:underline flex items-center gap-1">
                      {shop.website ? (shop.website.replace(/(^\w+:|^)\/\//, '').split('/')[0]) : "Not available"}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Follow Us</span>
                  <div className="flex gap-3">
                    <button className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm">
                      <Youtube size={22} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-400 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm">
                      <Twitter size={22} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm">
                      <Facebook size={22} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors shadow-sm">
                      <Instagram size={22} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100">
                <button className="w-full py-4 bg-slate-50 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200">
                  Report this shop
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Content Tabs Section */}
        <div className="mt-16">
          {/* Tabs Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === "products" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/30" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Package size={18} />
                Products
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "products" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {shop.products?.length || 0}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab("offers")}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === "offers" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/30" : "text-slate-400 hover:text-slate-600"}`}
              >
                <BadgePercent size={18} />
                Offers
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "offers" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {offers.length}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === "reviews" ? "bg-[#47718F] text-white shadow-lg shadow-[#47718F]/30" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Star size={18} />
                Reviews
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "reviews" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {reviews.length}
                </span>
              </button>
            </div>

            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search in ${activeTab}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F]/40 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "products" && (
              filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">No products found</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">This shop doesn't have any products matching your criteria yet.</p>
                </div>
              )
            )}

            {activeTab === "offers" && (
              offers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {offers.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BadgePercent size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">No active offers</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">This shop currently has no promotional offers matching your search.</p>
                </div>
              )
            )}

            {activeTab === "reviews" && (
              reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
                      <div className="shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 relative">
                          <Image
                            src={review.user?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name || review.userId}`}
                            alt="User"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-slate-900 text-lg">{review.user?.name || "Verified Customer"}</h4>
                          <span className="text-xs font-bold text-slate-400">{format(new Date(review.createdAt), "MMMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < review.rating ? "#facc15" : "none"} 
                              className={i < review.rating ? "text-yellow-400" : "text-slate-200"} 
                            />
                          ))}
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed">
                          {review.reviews || "Great shop! Highly recommended."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">No reviews found</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your search query or check back later.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetails;
