"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../utils/axiosInstance";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Calendar,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  ChevronRight,
  Heart,
  MessageSquare
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const fetchUserDetail = async (id: string) => {
  const response: any = await axiosInstance.get(`/admin/api/users/${id}`);
  return response.data.user;
};

const UserDetailPage = () => {
  const router = useRouter();
  const { userId } = useParams();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => fetchUserDetail(userId as string),
    enabled: !!userId,
  });

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" /></div>;
  if (isError || !user) return <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-slate-500"><AlertCircle size={48} /><p>User not found</p></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-[#4A876E] transition-colors group">
        <div className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] group-hover:-translate-x-1 transition-transform">
          <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest">Back to Directory</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] flex flex-col items-center text-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-1 border border-white/20">
                        {user.avatar?.url ? <img src={user.avatar.url} className="w-full h-full object-cover rounded-[35px]" /> : <UserIcon size={48} className="text-slate-300" />}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-gradient-to-tr from-[#4A876E] to-[#78B59C] text-white shadow-lg border border-white/20">
                        <Shield size={20} />
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{user.name}</h2>
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {user.role} Profile
                    </div>
                </div>

                <div className="w-full mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4 text-left">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Mail size={16} className="text-[#4A876E]" />
                        <span className="text-xs font-bold truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                        <Calendar size={16} className="text-[#4A876E]" />
                        <span className="text-xs font-bold">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <div className="p-4 rounded-3xl bg-[#d1d9e6]/30 dark:bg-[#26292f]/30 flex flex-col items-center gap-1 shadow-inner">
                        <Heart size={16} className="text-red-500" />
                        <span className="text-xs font-black">{user.followings?.length || 0}</span>
                        <span className="text-[8px] uppercase font-black text-slate-400">Following</span>
                    </div>
                    <div className="p-4 rounded-3xl bg-[#d1d9e6]/30 dark:bg-[#26292f]/30 flex flex-col items-center gap-1 shadow-inner">
                        <MessageSquare size={16} className="text-blue-500" />
                        <span className="text-xs font-black">{user.shopReviews?.length || 0}</span>
                        <span className="text-[8px] uppercase font-black text-slate-400">Reviews</span>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MapPin size={16} /> Verified Address
                </h3>
                <div className="p-6 rounded-[30px] border-2 border-dashed border-slate-300 dark:border-slate-800 bg-[#d1d9e6]/10">
                    {user.address ? (
                        <div className="space-y-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <p>{user.address.street}</p>
                            <p>{user.address.city}, {user.address.state || user.address.zip}</p>
                            <p className="text-[#4A876E] uppercase tracking-wider">{user.address.country}</p>
                        </div>
                    ) : (
                        <p className="text-xs font-bold text-slate-400 italic text-center">No primary address registered.</p>
                    )}
                </div>
            </div>
        </div>

        {/* User Activity */}
        <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] dark:shadow-[15px_15px_30px_#0e0f11,-15px_-15px_30px_#26292f] space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Clock size={16} /> Recent Transactions
                    </h3>
                    <span className="text-[10px] font-black text-[#4A876E] uppercase tracking-widest">{user.orders?.length || 0} Total Orders</span>
                </div>
                <div className="space-y-4">
                    {user.orders?.map((order: any) => (
                        <div key={order.id} onClick={() => router.push(`/dashboard/orders/${order.id}`)} className="p-5 rounded-[30px] bg-[#d1d9e6]/20 dark:bg-[#26292f]/20 flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                                    <ShoppingBag size={20} className="text-[#4A876E]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">Order #{order.id.slice(-8).toUpperCase()}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString()} • {order.paymentStatus}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black text-[#4A876E]">${order.total.toFixed(2)}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${order.deliveryStatus === 'Delivered' ? 'text-green-500' : 'text-blue-500'}`}>{order.deliveryStatus}</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                    {!user.orders?.length && (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 opacity-50">
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p className="text-sm font-bold italic">No purchase history found for this user.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
