"use client";

import React from "react";
import { User, Mail, ShieldCheck, Calendar, Camera } from "lucide-react";
import useUser from "apps/user-ui/src/hooks/useUser";
import Image from "next/image";

const UserProfile = () => {
  const { user } = useUser();

  const details = [
    { icon: User, label: "Full Name", value: user?.name || "N/A" },
    { icon: Mail, label: "Email Address", value: user?.email || "N/A" },
    { icon: ShieldCheck, label: "Account Status", value: "Verified", color: "text-green-500" },
    { icon: Calendar, label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header with Avatar */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#47718F]/5 transition-colors" />
        
        <div className="relative group/avatar cursor-pointer">
          <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-slate-50 shadow-inner relative z-10">
            {user?.avatar?.url ? (
              <Image 
                src={user.avatar.url} 
                alt={user.name} 
                fill 
                className="object-cover group-hover/avatar:scale-110 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#47718F] to-[#365870] flex items-center justify-center">
                <span className="text-4xl font-black text-white">{user?.name?.[0]}</span>
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-2xl flex items-center justify-center text-[#47718F] z-20 border border-slate-100 group-hover/avatar:bg-[#47718F] group-hover/avatar:text-white transition-all">
            <Camera size={18} />
          </div>
        </div>

        <div className="text-center md:text-left relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
              Active Member
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {details.map((detail, i) => (
            <div key={i} className={`p-8 border-slate-50 ${i < 2 ? "md:border-b" : ""} ${i % 2 === 0 ? "md:border-r" : ""}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <detail.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{detail.label}</p>
                  <p className={`text-base font-bold ${detail.color || "text-slate-800"}`}>{detail.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">Your profile information is private and secure.</p>
          <button className="px-8 py-3.5 bg-[#47718F] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#47718F]/20 hover:bg-[#365870] transition-all active:scale-95">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
