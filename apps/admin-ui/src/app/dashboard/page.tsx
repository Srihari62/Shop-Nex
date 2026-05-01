import React from "react";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Package,
  Activity
} from "lucide-react";

const DashboardPage = () => {
  const stats = [
    { label: "Total Revenue", value: "$45,231.89", icon: DollarSign, color: "text-green-500", trend: "+20.1% from last month" },
    { label: "Active Users", value: "+2350", icon: Users, color: "text-blue-500", trend: "+180.1% from last month" },
    { label: "Total Orders", value: "+12,234", icon: ShoppingBag, color: "text-purple-500", trend: "+19% from last month" },
    { label: "Active Products", value: "573", icon: Package, color: "text-orange-500", trend: "+201 since last week" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Welcome back, Admin. Here&apos;s what&apos;s happening with ShopNex today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="p-6 rounded-[30px] bg-[#e0e5ec] dark:bg-[#1a1c20]
              shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff]
              dark:shadow-[10px_10px_20px_#0e0f11,-10px_-10px_20px_#26292f]
              hover:scale-[1.02] transition-transform duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-[15px] bg-[#e0e5ec] dark:bg-[#1a1c20]
                shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]
                ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <Activity size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {stat.value}
              </h2>
              <p className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                <TrendingUp size={12} />
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20]
          shadow-[inset_15px_15px_30px_#bebebe,inset_-15px_-15px_30px_#ffffff]
          dark:shadow-[inset_15px_15px_30px_#0e0f11,inset_-15px_-15px_30px_#26292f]
          flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em]">Revenue Analytics Chart</p>
        </div>
        <div className="h-[400px] rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20]
          shadow-[inset_15px_15px_30px_#bebebe,inset_-15px_-15px_30px_#ffffff]
          dark:shadow-[inset_15px_15px_30px_#0e0f11,inset_-15px_-15px_30px_#26292f]
          flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em]">Recent Activity</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
