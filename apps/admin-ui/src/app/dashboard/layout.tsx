"use client";

import React, { useState } from "react";
import Sidebar from "../../shared/components/sidebar/Sidebar";
import { Menu, X } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#e0e5ec] dark:bg-[#1a1c20] overflow-hidden select-none relative">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-[100] p-3 rounded-[15px] bg-[#e0e5ec] dark:bg-[#1a1c20]
          shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]
          dark:shadow-[5px_5px_10px_#0e0f11,-5px_-5px_10px_#26292f]
          text-[#4A876E] dark:text-[#78B59C]"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Section - Responsive Drawer */}
      <aside
        className={`
          fixed lg:relative z-[90] lg:z-auto
          w-[320px] lg:w-[340px] h-full p-6
          transition-all duration-500 ease-in-out
          ${isSidebarOpen ? "left-0" : "-left-full lg:left-0"}
        `}
      >
        <div className="h-full bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] p-6
          shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff]
          dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f]">
          <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[80]"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full p-4 lg:p-6 lg:pl-0">
        <div className="h-full bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[30px] lg:rounded-[40px] p-4 lg:p-8 overflow-y-auto
          shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff]
          dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f]
          custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
