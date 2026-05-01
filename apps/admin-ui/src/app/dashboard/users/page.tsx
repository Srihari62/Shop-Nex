"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  X,
  ShoppingBag
} from "lucide-react";
import { useRouter } from "next/navigation";

const fetchUsers = async () => {
  const response: any = await axiosInstance.get("/admin/api/users");
  return response.data.users;
};

const UsersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter((user: any) => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" /></div>;
  if (isError) return <div className="h-full w-full flex items-center justify-center text-red-500"><AlertCircle className="w-12 h-12" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Platform Users</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and audit all registered customer and admin profiles.</p>
        </div>
        <div className="p-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]">
          <span className="text-lg font-black text-[#4A876E] dark:text-[#78B59C]">{filteredUsers.length} Users</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none outline-none text-sm font-bold"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-8 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] border-none outline-none text-sm font-black uppercase tracking-widest text-slate-500 cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
          <option value="seller">Sellers</option>
        </select>
      </div>

      <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Orders</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} onClick={() => router.push(`/dashboard/users/${user.id}`)} className="group hover:bg-[#d1d9e6]/30 dark:hover:bg-[#26292f]/30 cursor-pointer transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-inner overflow-hidden flex items-center justify-center">
                        {user.avatar?.url ? <img src={user.avatar.url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : user.role === 'seller' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[#4A876E] font-black">
                      <ShoppingBag size={14} />
                      {user._count?.orders || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] group-hover:text-[#4A876E] transition-all"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
