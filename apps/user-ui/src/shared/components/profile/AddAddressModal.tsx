"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addressToEdit?: any; // Pass this to enable "Edit" mode
}

const AddAddressModal = ({ isOpen, onClose, onSuccess, addressToEdit }: AddAddressModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: "Home",
    name: "",
    street: "",
    city: "",
    zip: "",
    country: "Bangladesh",
    isDefault: true,
  });

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        label: addressToEdit.label,
        name: addressToEdit.name,
        street: addressToEdit.street,
        city: addressToEdit.city,
        zip: addressToEdit.zip,
        country: addressToEdit.country,
        isDefault: addressToEdit.isDefault,
      });
    } else {
      setFormData({
        label: "Home",
        name: "",
        street: "",
        city: "",
        zip: "",
        country: "Bangladesh",
        isDefault: true,
      });
    }
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (addressToEdit) {
        // Update API
        await axiosInstance.put("/api/update-address", {
          ...formData,
          addressId: addressToEdit.id,
        });
        toast.success("Address updated successfully!");
      } else {
        // Add API
        await axiosInstance.post("/api/add-address", formData);
        toast.success("Address added successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">
            {addressToEdit ? "Update Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Label Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</label>
            <select
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F] outline-none transition-all font-bold text-sm"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Shahriar Sajeeb"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F] outline-none transition-all font-bold text-sm placeholder:text-slate-300"
            />
          </div>

          {/* Street */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
            <input
              type="text"
              required
              placeholder="e.g. 123 Main St, Apartment 4B"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F] outline-none transition-all font-bold text-sm placeholder:text-slate-300"
            />
          </div>

          {/* City & Zip */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
              <input
                type="text"
                required
                placeholder="Dhaka"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F] outline-none transition-all font-bold text-sm placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ZIP Code</label>
              <input
                type="text"
                required
                placeholder="1212"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F] outline-none transition-all font-bold text-sm placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Country Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#47718F]/10 focus:border-[#47718F] outline-none transition-all font-bold text-sm"
            >
              <option value="Bangladesh">Bangladesh</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
          </div>

          {/* Default Toggle */}
          <div className="flex items-center gap-3 px-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 rounded-md border-slate-200 text-[#47718F] focus:ring-[#47718F]/20 transition-all cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
              Set as default shipping address
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#47718F] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#47718F]/20 hover:bg-[#365870] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (addressToEdit ? "Update Address" : "Save Address")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
