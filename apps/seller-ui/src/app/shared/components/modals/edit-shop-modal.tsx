"use client";

import React, { useState } from "react";
import { X, Loader2, Save, Store, Mail, MapPin, Globe, Clock, Info } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface EditShopModalProps {
  shop: any;
  onClose: () => void;
}

const EditShopModal = ({ shop, onClose }: EditShopModalProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: shop.name || "",
    bio: shop.bio || "",
    description: shop.description || "",
    address: shop.address || "",
    opening_hours: shop.opening_hours || "",
    website: shop.website || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put("/product/api/update-shop", formData);
      if (response.data.success) {
        toast.success("Shop details updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["seller-shop"] });
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111111] border border-white/10 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#47718F]/20 flex items-center justify-center text-[#47718F]">
              <Store size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Edit Shop Profile</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Update your business information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Store size={12} /> Shop Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter shop name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#47718F]/30 focus:border-[#47718F]/50 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} /> Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#47718F]/30 focus:border-[#47718F]/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Info size={12} /> Short Bio
            </label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="A short tagline for your shop"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#47718F]/30 focus:border-[#47718F]/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Info size={12} /> Full Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your products and brand story..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#47718F]/30 focus:border-[#47718F]/50 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Shop location"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#47718F]/30 focus:border-[#47718F]/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Operating Hours
              </label>
              <input
                type="text"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleChange}
                placeholder="e.g. Mon - Fri 9 am to 10 pm"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-[#47718F]/30 focus:border-[#47718F]/50 outline-none transition-all"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-4 bg-gradient-to-r from-[#47718F] to-[#365870] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#47718F]/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Update Shop Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditShopModal;
