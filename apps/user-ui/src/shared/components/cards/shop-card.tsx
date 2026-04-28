import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, ArrowUpRight } from "lucide-react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    bio?: string;
    avatarUrl?: string;
    coverBanner?: string;
    address?: string;
    followers?: string[];
    ratings: number;
    category?: string;
  };
}

const ShopCard = ({ shop }: ShopCardProps) => {
  const followerCount = shop.followers?.length || 0;
  const avatar = shop.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`;
  const banner = shop.coverBanner || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
      {/* Cover Banner */}
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={banner}
          alt={shop.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
      </div>

      {/* Profile & Content Wrapper */}
      <div className="px-5 pb-6 flex-1 flex flex-col pt-0 relative">
        {/* Avatar - Overlapping the banner */}
        <div className="relative -mt-10 mb-4 inline-block">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white relative z-10 transition-transform duration-500 group-hover:-translate-y-1">
            <Image
              src={avatar}
              alt={shop.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Shop Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-[#47718F] transition-colors">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
              <Star size={12} fill="#eab308" className="text-yellow-500" />
              <span className="text-[11px] font-bold text-yellow-700">{shop.ratings || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users size={14} />
              <span className="text-[11px] font-bold tracking-tight">
                {followerCount} <span className="text-slate-400 font-medium">Followers</span>
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-slate-500 group/loc">
              <MapPin size={14} className="mt-0.5 shrink-0 group-hover/loc:text-[#47718F] transition-colors" />
              <span className="text-xs font-medium line-clamp-1 leading-relaxed">
                {shop.address || "Location not available"}
              </span>
            </div>
            {shop.category && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 text-[#47718F] text-[10px] font-black uppercase tracking-widest border border-slate-100">
                {shop.category}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <Link 
            href={`/shop/${shop.id}`}
            className="text-xs font-bold text-slate-400 hover:text-[#47718F] transition-colors flex items-center gap-1.5 group/link"
          >
            Visit Store
            <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
          <button className="px-4 py-2 bg-[#47718F] text-white text-[11px] font-black rounded-xl hover:bg-[#365870] transition-all shadow-sm active:scale-95 uppercase tracking-wider">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
