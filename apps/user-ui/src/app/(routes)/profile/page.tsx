"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import ProfileSidebar from "../../../shared/components/profile/ProfileSidebar";
import ProfileHeader from "../../../shared/components/profile/ProfileHeader";
import UserProfile from "../../../shared/components/profile/UserProfile";
import ShippingAddress from "../../../shared/components/profile/ShippingAddress";
import MyOrders from "../../../shared/components/profile/MyOrders";
import useUser from "apps/user-ui/src/hooks/useUser";
import { Loader2, Gift, Award, Settings, CreditCard, HeadphonesIcon } from "lucide-react";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("active") || "profile";
  const { user, isLoading: userLoading } = useUser();
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-user-orders");
      return res.data;
    },
  });

  const handleTabChange = (tab: string) => {
    router.push(`/profile?active=${tab}`);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#47718F]" size={40} />
      </div>
    );
  }

  const orders = ordersData?.orders || [];
  const stats = {
    total: orders.length,
    processing: orders.filter((o: any) => o.status === "Processing" || o.deliveryStatus === "Ordered").length,
    completed: orders.filter((o: any) => o.deliveryStatus === "Delivered").length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile />;
      case "shipping-address":
        return <ShippingAddress />;
      case "orders":
        return <MyOrders />;
      default:
        return (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Coming Soon</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">This section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* ─── Breadcrumbs / Top Spacing ─── */}
      <div className="h-10 md:h-16" />

      <div className="w-[90%] md:w-[80%] mx-auto space-y-10">
        
        {/* ─── Header ─── */}
        <ProfileHeader stats={stats} />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ─── Sidebar ─── */}
          <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          {/* ─── Main Content ─── */}
          <div className="flex-1 space-y-10">
            <div className="bg-white/50 backdrop-blur-sm rounded-[40px] p-2 md:p-4 border border-white shadow-xl shadow-slate-200/20 min-h-[600px]">
              <div className="p-6 md:p-10">
                {renderContent()}
              </div>
            </div>
          </div>

          {/* ─── Right Widgets (Extra) ─── */}
          <div className="hidden xl:flex flex-col gap-4 w-[320px]">
            {[
              { icon: Gift, title: "Referral Program", desc: "Invite friends and earn rewards.", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Award, title: "Your Badges", desc: "View your earned achievements.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Settings, title: "Account Settings", desc: "Manage preferences and security.", color: "text-slate-600", bg: "bg-slate-100" },
              { icon: CreditCard, title: "Billing History", desc: "Check your recent payments.", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: HeadphonesIcon, title: "Support Center", desc: "Need help? Contact support.", color: "text-orange-500", bg: "bg-orange-50" },
            ].map((widget, i) => (
              <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${widget.bg} ${widget.color} group-hover:scale-110 transition-transform`}>
                  <widget.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{widget.title}</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{widget.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
