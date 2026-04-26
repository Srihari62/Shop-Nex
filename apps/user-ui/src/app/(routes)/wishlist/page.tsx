"use client";

import React from "react";
import { useStore } from "apps/user-ui/src/store";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ShoppingBag, 
  ChevronRight,
  Star
} from "lucide-react";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";

const WishlistPage = () => {
  const wishlist = useStore((state: any) => state.wishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Section - Consistency with Cart */}
      <div className="w-full bg-gradient-to-br from-[#47718F] via-[#47718F] to-[#365870] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <div className="relative w-[90%] md:w-[80%] m-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 mb-4">
             <Heart size={14} className="text-red-400 fill-red-400" />
             <span className="text-white text-[10px] font-black uppercase tracking-widest">My Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
            Favorites <span className="text-indigo-200">List</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-lg">
            Manage your saved items and add them to your cart whenever you are ready.
          </p>
        </div>
      </div>

      <div className="w-[90%] md:w-[80%] m-auto py-12">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
               <Heart size={40} className="text-slate-200" />
            </div>
            <h2 className="text-3xl font-black text-[#365870] mb-4">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8 max-w-sm">
              Don't miss out on items you love! Start exploring our shop and save your favorites here.
            </p>
            <Link 
              href="/" 
              className="bg-gradient-to-r from-[#47718F] to-[#365870] text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-4">
               <h3 className="text-xl font-black text-[#365870] uppercase tracking-tight">
                 Saved Items <span className="text-indigo-500 ml-2">({wishlist.length})</span>
               </h3>
               <Link href="/" className="text-[10px] font-black text-[#47718F] hover:underline uppercase tracking-widest flex items-center gap-1">
                 Continue Shopping <ChevronRight size={14} />
               </Link>
            </div>

            {wishlist.map((item: any) => {
              const isInCart = cart.some((p: any) => p.id === item.id);
              return (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-[2rem] p-5 md:p-6 flex flex-col md:flex-row items-center gap-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative w-full md:w-48 aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                    <Image 
                      src={item.images?.[0]?.url || item.image || "https://via.placeholder.com/300"} 
                      alt={item.title} 
                      fill 
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    {item.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                        -{item.discount}%
                      </div>
                    )}
                  </div>
                  
                  {/* Info Section */}
                  <div className="flex-1 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                           {item.category || "General"}
                         </span>
                         <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < (item.rating || 5) ? "#facc15" : "none"} className={i < (item.rating || 5) ? "text-yellow-400" : "text-slate-200"} />
                            ))}
                         </div>
                       </div>
                       <h3 className="text-xl md:text-2xl font-black text-[#365870] leading-tight group-hover:text-[#47718F] transition-colors">
                         {item.title}
                       </h3>
                       <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-[#365870] tracking-tighter">
                            ${item.sale_price || item.price}
                          </span>
                          {item.regular_price > (item.sale_price || item.price) && (
                            <span className="text-sm text-slate-300 line-through font-bold">
                              ${item.regular_price}
                            </span>
                          )}
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">In Stock</span>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                       <button 
                         onClick={() => removeFromWishlist(item.id, user, location, deviceInfo)}
                         className="flex-1 md:flex-none p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl border border-slate-100 hover:border-red-100 group/trash"
                         title="Remove from Wishlist"
                       >
                         <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />
                       </button>
                       
                       <button 
                         onClick={() => handleAddToCart(item)}
                         disabled={isInCart}
                         className={`flex-[2] md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                           isInCart 
                           ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                           : "bg-gradient-to-r from-[#47718F] to-[#365870] text-white shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5"
                         }`}
                       >
                         <ShoppingCart size={18} />
                         {isInCart ? "In Cart" : "Add to Cart"}
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Background Decorations */}
      <div className="fixed top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/30 to-transparent pointer-events-none -z-10" />
    </div>
  );
};

export default WishlistPage;
