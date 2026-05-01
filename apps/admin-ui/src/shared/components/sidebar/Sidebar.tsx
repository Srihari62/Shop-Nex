"use client";

import React from "react";
import { SIDEBAR_ITEMS } from "../../../configs/sidebar";
import SidebarItem from "./SidebarItem";
import useSidebar from "../../../hooks/useSidebar";
import useAdmin from "../../../hooks/useAdmin";

const Sidebar = ({ closeSidebar }: { closeSidebar?: () => void }) => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { admin, isLoading } = useAdmin();

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Admin Profile Header - Claymorphism Style */}
      <div
        className="flex items-center gap-4 px-4 py-5 rounded-[30px] bg-[#e0e5ec] dark:bg-[#1a1c20]
        shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff]
        dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f]"
      >
        <div
          className="w-12 h-12 rounded-[15px] bg-gradient-to-tr from-[#4A876E] to-[#78B59C] flex items-center justify-center text-white font-bold text-xl
          shadow-[inset_4px_4px_8px_rgba(255,255,255,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          {isLoading ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : admin?.avatar?.url ? (
            <img
              src={admin.avatar.url}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            admin?.name?.charAt(0).toUpperCase() || "A"
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
            {isLoading ? "Loading..." : admin?.name || "Admin"}
          </h2>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 break-all">
            {isLoading ? "Fetching data..." : admin?.email || "No email found"}
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
        {SIDEBAR_ITEMS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="px-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.name}
                  item={item}
                  isActive={activeSidebar === item.path}
                  onClick={() => {
                    setActiveSidebar(item.path);
                    closeSidebar?.();
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Minimal Branding */}
      <div className="px-5 py-4 text-center">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-700 tracking-widest uppercase">
          ShopNex Admin v1.0
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
