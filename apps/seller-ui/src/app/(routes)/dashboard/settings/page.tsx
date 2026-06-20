"use client";

import React, { useState } from "react";
import { 
  ChevronRight, 
  Bell, 
  ShieldAlert, 
  Trash2, 
  Globe, 
  CreditCard, 
  ExternalLink,
  ChevronRight as ArrowRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Settings
} from "lucide-react";
import useSeller from "@/hooks/useSeller";
import toast from "react-hot-toast";
import axios from "axios";

type Tab = "General" | "Custom Domains" | "Withdraw Method";

const SettingsPage = () => {
  const { seller, isLoading: isSellerLoading } = useSeller();
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const connectStripe = async () => {
    try {
      setIsConnectingStripe(true);
      if (!seller?.id) {
        toast.error("Seller ID is missing.");
        return;
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,
        { sellerId: seller.id }
      );
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Stripe link generation failed: URL not received");
      }
    } catch (error: any) {
      console.error("Error connecting to Stripe:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to connect to Stripe"
      );
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleDeleteShop = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    toast.success("Shop deletion scheduled (Simulated)");
  };

  if (isSellerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-black min-h-screen text-slate-300">
      {/* Unified Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
          <span>Dashboard</span>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-blue-500">Settings</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Settings</h1>
            <p className="text-slate-500">Configure your store preferences and account details</p>
          </div>
          <div className="bg-[#0a0a0a] border border-slate-900 p-4 px-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Settings size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Account State</p>
              <h3 className="text-xl font-bold text-white">Active</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Tabs Container */}
      <div className="flex gap-8 border-b border-slate-900 mb-10">
        {(["General", "Custom Domains", "Withdraw Method"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab ? "text-blue-500" : "text-slate-600 hover:text-slate-400"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-12">
        {activeTab === "General" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Unified Cards */}
            <div className="group flex items-center justify-between p-7 bg-[#0a0a0a] border border-slate-900 rounded-[2rem] hover:border-blue-500/30 transition-all cursor-pointer shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Low Stock Alert Threshold</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Get notified when stock falls below the set limit.</p>
                </div>
              </div>
              <ArrowRight size={24} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
            </div>

            <div className="group flex items-center justify-between p-7 bg-[#0a0a0a] border border-slate-900 rounded-[2rem] hover:border-blue-500/30 transition-all cursor-pointer shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Order Notification Preferences</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Choose how you receive order notifications.</p>
                </div>
              </div>
              <ArrowRight size={24} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
            </div>

            {/* Danger Zone */}
            <div className="pt-10 border-t border-slate-900">
              <div className="flex items-center gap-2 text-rose-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8">
                <AlertTriangle size={14} />
                Danger Zone
              </div>
              <div 
                onClick={() => setIsDeleteModalOpen(true)}
                className="group flex items-center justify-between p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer shadow-2xl"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-tight">Delete Shop</h3>
                    <p className="text-xs text-rose-500/60 mt-1 font-medium italic">Deleting your shop is irreversible. Proceed with caution.</p>
                  </div>
                </div>
                <ArrowRight size={24} className="text-rose-500/40 group-hover:text-rose-500 transition-colors" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Custom Domains" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] p-10 shadow-2xl">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Globe size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Add Custom Domain</h3>
                  <p className="text-sm text-slate-500 font-medium">Connect your own domain to this store.</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Domain Name</label>
                  <input 
                    type="text" 
                    placeholder="yourdomain.com"
                    className="w-full bg-black/40 border border-slate-800 rounded-2xl py-5 px-8 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-800 font-medium text-lg"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20">
                  Save Domain
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Withdraw Method" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0a] border border-slate-900 rounded-[2rem] p-10 shadow-2xl">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Withdraw Method</h3>
                  <p className="text-sm text-slate-500 font-medium">Manage your Stripe payout settings.</p>
                </div>
              </div>

              {seller?.stripeId ? (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                    <span className="text-white font-black uppercase tracking-widest text-sm">Connected to Stripe</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Business Name</p>
                      <p className="text-white font-bold text-lg">{seller?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Country</p>
                      <p className="text-white font-bold text-lg">{seller?.country}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payouts Enabled</p>
                      <p className="text-emerald-500 font-black">ACTIVE</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
                    className="mt-10 flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:text-blue-400 transition-colors group"
                  >
                    Open Stripe Dashboard
                    <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
                    <AlertTriangle size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Stripe Not Connected</h4>
                  <p className="text-slate-500 max-w-xs mb-10 font-medium">
                    Connect your Stripe account to start receiving payouts for your sales.
                  </p>
                  <button 
                    onClick={connectStripe}
                    disabled={isConnectingStripe}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] px-12 py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isConnectingStripe ? "Connecting..." : "Connect Stripe Account"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unified Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="bg-[#0d0d0d] border border-slate-800 rounded-[3rem] w-full max-w-lg relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 mx-auto">
                <Trash2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-tight">Delete Shop</h2>
              <div className="space-y-6 text-slate-400 leading-relaxed text-center">
                <p className="text-lg">Deleting your shop is a <b className="text-white">permanent action</b>.</p>
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4 text-left">
                  <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                  <p className="text-sm font-medium text-amber-200/80 leading-relaxed">
                    Once the shop is permanently deleted, you <b className="text-white">cannot</b> create a new account with the same email.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 bg-black/60 border-t border-slate-900 flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDeleteShop}
                className="flex-1 px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
