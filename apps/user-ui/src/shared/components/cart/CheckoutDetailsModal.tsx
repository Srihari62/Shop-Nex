"use client";

import React, { useState } from "react";
import { X, MapPin, User, Mail, Phone, ArrowRight, Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import useUser from "apps/user-ui/src/hooks/useUser";
import AddAddressModal from "../profile/AddAddressModal";

interface CheckoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (addressId: string) => void;
  isProcessing?: boolean;
}

const CheckoutDetailsModal = ({ isOpen, onClose, onProceed, isProcessing }: CheckoutDetailsModalProps) => {
  const { user } = useUser();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const { data: addresses, isLoading, refetch } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
    enabled: isOpen,
  });

  // Set default address on load
  React.useEffect(() => {
    if (addresses?.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout Details</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review your information</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* User Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-[#47718F] uppercase tracking-[0.2em] ml-1">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Full Name</p>
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="text-sm font-bold text-slate-800">{user?.email}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Address Selection */}
          <section className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <h3 className="text-sm font-black text-[#47718F] uppercase tracking-[0.2em]">Shipping Address</h3>
              <button 
                onClick={() => setIsAddressModalOpen(true)}
                className="text-[10px] font-black text-[#47718F] uppercase tracking-widest flex items-center gap-1.5 hover:underline"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-slate-200" size={32} />
              </div>
            ) : addresses?.length === 0 ? (
              <div className="bg-slate-50 rounded-[32px] p-10 border-2 border-dashed border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto">
                   <MapPin size={24} className="text-slate-200" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">No addresses found</h4>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Please add a shipping address to continue</p>
                </div>
                <button 
                   onClick={() => setIsAddressModalOpen(true)}
                   className="px-8 py-3 bg-[#47718F] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#47718F]/20 hover:bg-[#365870] transition-all"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {addresses?.map((addr: any) => (
                  <label 
                    key={addr.id}
                    className={`relative p-6 rounded-[28px] border-2 transition-all cursor-pointer flex items-start gap-4 ${
                      selectedAddressId === addr.id 
                        ? "bg-[#47718F]/5 border-[#47718F]" 
                        : "bg-white border-slate-50 hover:border-slate-100"
                    }`}
                  >
                    <input 
                      type="radio"
                      name="address"
                      className="hidden"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAddressId === addr.id ? "border-[#47718F] bg-[#47718F]" : "border-slate-200"
                    }`}>
                      {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {addr.label}
                        </span>
                        <h4 className="text-sm font-black text-slate-800">{addr.name}</h4>
                      </div>
                      <p className="text-xs font-bold text-slate-500 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.zip}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Step 2 of 3</p>
           <button 
             disabled={!selectedAddressId || isProcessing}
             onClick={() => selectedAddressId && onProceed(selectedAddressId)}
             className="flex items-center gap-3 px-10 py-5 bg-[#47718F] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#47718F]/20 hover:bg-[#365870] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
           >
             {isProcessing ? (
               <>
                 <Loader2 className="animate-spin" size={18} />
                 Creating Session...
               </>
             ) : (
               <>
                 Proceed to Payment
                 <ArrowRight size={18} />
               </>
             )}
           </button>
        </div>
      </div>

      <AddAddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSuccess={() => refetch()} 
      />
    </div>
  );
};

export default CheckoutDetailsModal;
