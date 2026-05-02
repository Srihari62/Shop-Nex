"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { 
  User, 
  Mail, 
  Shield, 
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Plus,
  X,
  UserPlus
} from "lucide-react";
import { toast } from "react-hot-toast";

const fetchTeam = async () => {
  const response: any = await axiosInstance.get("/admin/api/team");
  return response.data.admins;
};

const ManagementPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: team, isLoading, isError } = useQuery({
    queryKey: ["admin-team"],
    queryFn: fetchTeam,
  });

  const mutation = useMutation({
    mutationFn: async (newMember: { email: string, role: string }) => {
      const response = await axiosInstance.put("/admin/api/update-role", newMember);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Team member role updated successfully");
      setIsModalOpen(false);
      setEmail("");
      setRole("admin");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  });

  const filteredTeam = useMemo(() => {
    if (!team) return [];
    return team.filter((member: any) => 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [team, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, role });
  };

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#4A876E]" /></div>;
  if (isError) return <div className="h-full w-full flex items-center justify-center text-red-500"><AlertCircle className="w-12 h-12" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Team Management</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#4A876E]">Team Management</span>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-[#4A876E] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search team members by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none outline-none text-sm font-bold placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#0e0f11,-20px_-20px_40px_#26292f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Team Member</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest">No team members found</td>
                </tr>
              ) : (
                filteredTeam.map((member: any) => (
                  <tr key={member.id} className="group hover:bg-[#d1d9e6]/30 dark:hover:bg-[#26292f]/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-inner overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          {member.avatar?.url ? (
                            <img src={member.avatar.url} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-slate-400" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                        <Mail size={14} className="text-slate-400" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 
                        'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button className="p-2 rounded-xl bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e0f11,-4px_-4px_8px_#26292f] hover:text-[#4A876E] transition-all active:shadow-inner">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Add New Admin</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4A876E] transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="Enter user email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#4A876E]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Assigned Role</label>
                <div className="relative group">
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4A876E] transition-colors" size={18} />
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f] border-none outline-none text-sm font-black text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:ring-2 focus:ring-[#4A876E]/20 transition-all"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e0f11,-6px_-6px_12px_#26292f] text-sm font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all active:shadow-inner"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-4 rounded-[24px] bg-[#4A876E] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-none text-sm font-black uppercase tracking-widest text-white hover:bg-[#3D6F5A] disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg active:shadow-sm"
                >
                  {mutation.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Add Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPage;
