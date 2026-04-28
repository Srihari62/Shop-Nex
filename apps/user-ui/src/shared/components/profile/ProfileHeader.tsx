import React from "react";
import { Clock, Truck, CheckCircle2 } from "lucide-react";

interface ProfileHeaderProps {
  userName: string;
}

const ProfileHeader = ({ userName }: ProfileHeaderProps) => {
  const stats = [
    { label: "Total Orders", value: "10", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50" },
    { label: "Processing Orders", value: "4", icon: Truck, color: "text-[#47718F]", bgColor: "bg-[#47718F]/10" },
    { label: "Completed Orders", value: "5", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Welcome back, <span className="text-[#47718F]">{userName}</span> 👋
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
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
