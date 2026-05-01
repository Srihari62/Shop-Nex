"use client";

import React from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Zap,
  Info,
  Construction
} from "lucide-react";

const EventsPage = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-1000 py-12">
      <div className="relative">
        <div className="p-10 rounded-[50px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] flex items-center justify-center">
            <Construction size={100} strokeWidth={1} className="text-[#4A876E] animate-pulse" />
        </div>
        <div className="absolute -bottom-4 -right-4 p-4 rounded-3xl bg-gradient-to-tr from-[#4A876E] to-[#78B59C] text-white shadow-xl animate-bounce">
            <Zap size={32} />
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">Events Management</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          The event planning and platform promotion module is currently under heavy development. Stay tuned for flash sales, community events, and seasonal promotions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-6">
        <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#4A876E]">
                <Calendar size={24} />
                <h3 className="text-sm font-black uppercase tracking-widest">Scheduled Sales</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 italic">Coming Q3 2026</p>
        </div>
        <div className="p-6 rounded-[35px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f] flex flex-col gap-4">
            <div className="flex items-center gap-3 text-purple-500">
                <Users size={24} />
                <h3 className="text-sm font-black uppercase tracking-widest">Community Expo</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 italic">In Planning Stage</p>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-white/10">
        <Info size={14} /> Feature Alpha Build 0.1.2
      </div>
    </div>
  );
};

export default EventsPage;
