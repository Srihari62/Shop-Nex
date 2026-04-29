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
  X,
  Loader2,
  CheckCircle2
} from "lucide-react";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import toast from "react-hot-toast";

type Tab = "General" | "Custom Domains" | "Withdraw Method";

const SettingsPage = () => {
  const { seller, isLoading: isSellerLoading } = useSeller();
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span className="text-blue-500 font-medium">Settings</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-900 mb-10">
        {(["General", "Custom Domains", "Withdraw Method"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
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
            {/* Stock Alerts */}
            <div className="group flex items-center justify-between p-6 bg-[#0a0a0a] border border-slate-900 rounded-2xl hover:border-slate-800 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">Low Stock Alert Threshold</h3>
                  <p className="text-xs text-slate-500 mt-1">Get notified when stock falls below the set limit.</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
            </div>

            {/* Notification Preferences */}
            <div className="group flex items-center justify-between p-6 bg-[#0a0a0a] border border-slate-900 rounded-2xl hover:border-slate-800 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">Order Notification Preferences</h3>
                  <p className="text-xs text-slate-500 mt-1">Choose how you receive order notifications (Email, Web, App).</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
            </div>

            {/* Danger Zone */}
            <div className="pt-10 border-t border-slate-900">
              <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-xs mb-6">
                <AlertTriangle size={14} />
                Danger Zone
              </div>
              <div 
                onClick={() => setIsDeleteModalOpen(true)}
                className="group flex items-center justify-between p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">Delete Shop</h3>
                    <p className="text-xs text-rose-500/60 mt-1 font-medium">Deleting your shop is irreversible. Proceed with caution.</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-rose-500/40 group-hover:text-rose-500 transition-colors" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Custom Domains" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Add Custom Domain</h3>
                  <p className="text-sm text-slate-500">Connect your own domain to this store.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Domain Name</label>
                  <input 
                    type="text" 
                    placeholder="yourdomain.com"
                    className="w-full bg-black border border-slate-800 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-800 font-medium"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                  Save Domain
                </button>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-8 opacity-50 grayscale pointer-events-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-white font-bold tracking-tight">Connected Domain</span>
                </div>
                <span className="text-xs font-black text-slate-600 uppercase">Loading...</span>
              </div>
              <div className="p-4 bg-black border border-slate-900 rounded-xl font-mono text-sm text-slate-500">
                seller.shondhane.com
              </div>
            </div>
          </div>
        )}

        {activeTab === "Withdraw Method" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Withdraw Method</h3>
                  <p className="text-sm text-slate-500">Manage your Stripe payout settings.</p>
                </div>
              </div>

              {seller?.stripeId ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span className="text-white font-bold">Connected to Stripe</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 text-sm">
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Business Name</p>
                      <p className="text-white font-medium">{seller?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Country</p>
                      <p className="text-white font-medium">{seller?.country}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Payouts Enabled</p>
                      <p className="text-emerald-500 font-bold">Yes</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Charges Enabled</p>
                      <p className="text-emerald-500 font-bold">Yes</p>
                    </div>
                  </div>
                  <button className="mt-8 flex items-center gap-2 text-blue-500 font-bold text-sm hover:text-blue-400 transition-colors group">
                    Open Stripe Dashboard
                    <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                    <AlertTriangle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Stripe Not Connected</h4>
                  <p className="text-sm text-slate-500 max-w-xs mb-8">
                    Connect your Stripe account to start receiving payouts for your sales.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                    Connect Stripe Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="bg-[#0d0d0d] border border-slate-800 rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-tight">Delete Shop</h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>Deleting your shop is a <b className="text-white">permanent action</b>. However, you have <b className="text-white">28 days</b> to restore your shop before it is permanently removed.</p>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs font-medium text-amber-200/80">
                    <b className="text-amber-500">Important:</b> Once the shop is permanently deleted, you <b className="text-white">cannot</b> create a new account with the same email in the future.
                  </p>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs font-medium text-blue-300 italic">
                  You can restore your shop within 28 days from the date of deletion. After that, it will be permanently removed.
                </div>
              </div>
            </div>
            <div className="p-6 bg-black/40 border-t border-slate-900 flex gap-3">
              <button 
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDeleteShop}
                className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
