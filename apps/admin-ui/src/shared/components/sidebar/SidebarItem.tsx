"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";

type Props = {
  item: {
    name: string;
    icon: LucideIcon;
    path: string;
  };
  isActive: boolean;
  onClick: () => void;
};

const SidebarItem = ({ item, isActive, onClick }: Props) => {
  const Icon = item.icon;

  const handleItemClick = async (e: React.MouseEvent) => {
    if (item.path === "/logout") {
      e.preventDefault();
      try {
        await axiosInstance.get("/api/logout");
        toast.success("Logged out successfully");
        window.location.href = "/";
      } catch (error) {
        toast.error("Logout failed");
      }
      return;
    }
    onClick();
  };

  return (
    <Link
      href={item.path === "/logout" ? "#" : item.path}
      onClick={handleItemClick}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-[20px] transition-all duration-300 select-none
        ${
          isActive
            ? "bg-[#e0e5ec] dark:bg-[#1a1c20] text-[#4A876E] dark:text-[#78B59C] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0e0f11,-8px_-8px_16px_#26292f]"
            : "text-slate-500 dark:text-slate-400 hover:text-[#4A876E] dark:hover:text-[#78B59C]"
        }
      `}
    >
      {/* Icon with subtle clay effect when active */}
      <div
        className={`p-2 rounded-[12px] transition-all duration-300
        ${
          isActive
            ? "shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#0e0f11,inset_-3px_-3px_6px_#26292f]"
            : "group-hover:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] dark:group-hover:shadow-[inset_2px_2px_4px_#0e0f11,inset_-2px_-2px_4px_#26292f]"
        }
      `}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      <span className={`text-sm font-bold tracking-wide ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
        {item.name}
      </span>

      {/* Active Indicator Blob */}
      {isActive && (
        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#4A876E] dark:bg-[#78B59C] shadow-[0_0_8px_#78B59C]" />
      )}
    </Link>
  );
};

export default SidebarItem;
