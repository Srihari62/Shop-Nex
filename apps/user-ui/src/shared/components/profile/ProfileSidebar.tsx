import React from "react";
import { 
  User, 
  ShoppingBag, 
  Mail, 
  Bell, 
  MapPin, 
  Lock, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileSidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "orders", icon: ShoppingBag, label: "My Orders" },
    { id: "inbox", icon: Mail, label: "Inbox" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "shipping-address", icon: MapPin, label: "Shipping Address" },
    { id: "password", icon: Lock, label: "Change Password" },
  ];

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden shrink-0 w-full lg:w-[280px]">
      <div className="p-6">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? "bg-[#47718F]/10 text-[#47718F]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? "text-[#47718F]" : "text-slate-400"} />
              {item.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-50">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
