import React from "react";
import { Clock, Truck, CheckCircle2 } from "lucide-react";
import useUser from "apps/user-ui/src/hooks/useUser";

interface ProfileHeaderProps {
  stats: {
    total: number;
    processing: number;
    completed: number;
  };
}

const ProfileHeader = ({ stats }: ProfileHeaderProps) => {
  const { user } = useUser();
  
  const statCards = [
    { label: "Total Orders", value: stats.total, icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50" },
    { label: "Processing Orders", value: stats.processing, icon: Truck, color: "text-[#47718F]", bgColor: "bg-[#47718F]/10" },
    { label: "Completed Orders", value: stats.completed, icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-[#47718F] to-[#365870] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[#47718F]/20 uppercase">
           {user?.avatar ? (
             <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[24px]" />
           ) : (
             user?.name?.[0] || "U"
           )}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-[#47718F]">{user?.name || "User"}</span> 👋
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            {user?.email || "Member since 2026"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
