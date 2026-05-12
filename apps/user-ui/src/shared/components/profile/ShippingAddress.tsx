"use client";

import React, { useState } from "react";
import { Plus, MapPin, Trash2, Home, Briefcase, Loader2, Edit3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import AddAddressModal from "./AddAddressModal";

const ShippingAddress = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch Addresses
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/delete-address/${id}`);
    },
    onSuccess: () => {
      toast.success("Address deleted");
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
    onError: () => toast.error("Failed to delete address"),
  });

  const handleEdit = (address: any) => {
    setAddressToEdit(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };

  const getIcon = (label: string) => {
    switch (label) {
      case "Home": return <Home size={18} />;
      case "Office": return <Briefcase size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  return (
    <div className="animate-fade-in space-y-10">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shipping Address</h2>
        <div className="flex items-center justify-between mt-6 border-b border-slate-50 pb-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Saved Address</h3>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 text-[#47718F] font-black text-xs uppercase tracking-widest hover:text-[#365870] transition-colors"
          >
            <Plus size={16} />
            Add New Address
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-[180px] bg-slate-50 rounded-[32px] animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {addresses?.map((addr: any) => (
            <div
              key={addr.id}
              className={`relative p-8 rounded-[32px] border-2 transition-all ${
                addr.isDefault 
                  ? "bg-white border-[#47718F]/20 shadow-xl shadow-slate-200/50" 
                  : "bg-white border-slate-50 hover:border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    addr.isDefault ? "bg-[#47718F] text-white" : "bg-slate-50 text-slate-400"
                  }`}>
                    {getIcon(addr.label)}
                  </div>
                  <h4 className="font-black text-slate-800 tracking-tight">
                    {addr.label} - {addr.name}
                  </h4>
                </div>
                {addr.isDefault && (
                  <span className="px-3 py-1 bg-[#47718F]/10 text-[#47718F] text-[10px] font-black uppercase tracking-widest rounded-full">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-1 pl-12">
                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                  {addr.street}, {addr.city},<br />
                  {addr.zip}, {addr.country}
                </p>
              </div>

              <div className="mt-6 ml-12 flex items-center gap-6">
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#47718F] transition-colors"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(addr.id)}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 text-xs font-black text-red-300 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {addresses?.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <MapPin size={24} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No addresses yet</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Add your first shipping location</p>
            </div>
          )}
        </div>
      )}

      <AddAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] })}
        addressToEdit={addressToEdit}
      />
    </div>
  );
};

export default ShippingAddress;
