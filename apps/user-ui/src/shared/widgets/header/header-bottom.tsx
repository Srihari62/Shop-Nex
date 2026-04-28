"use client";

import { ProfileIcon } from "apps/user-ui/src/assets/svgs/profile-icon";
import { navItems } from "apps/user-ui/src/configs/constants";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import {
  AlignLeft,
  ChevronDownIcon,
  HeartPlus,
  ShoppingCart,
  Menu,
  X,
  ArrowRight,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function HeaderBottom() {
  const [showDepartments, setShowDepartments] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setisSticky] = useState(false);
  const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);

  const pathname = usePathname();

  // Track Scroll
  useEffect(() => {
    const handleScroll = () => {
      setisSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-[50px] relative">
      <div
        className={`w-full transition-all border-b border-slate-100 ${
          isSticky
            ? "fixed top-0 left-0 z-[100] bg-white shadow-lg animate-fade-in"
            : "relative bg-slate-50/50"
        }`}
      >
        <div className="w-[90%] md:w-[80%] relative m-auto flex items-center justify-between h-[50px]">
          {/* ─── Departments Dropdown (Desktop Only) ─── */}
          <div className="relative hidden lg:block">
            <div
              className={`w-[260px] cursor-pointer flex items-center justify-between px-6 h-[50px] bg-gradient-to-r from-[#47718F] to-[#365870] transition-all hover:opacity-90 shadow-sm group`}
              onClick={() => setShowDepartments(!showDepartments)}
            >
              <div className="flex items-center gap-3">
                <AlignLeft
                  size={20}
                  color="white"
                  className="group-hover:rotate-180 transition-transform duration-500"
                />
                <span className="text-white font-bold text-sm uppercase tracking-widest">
                  All Departments
                </span>
              </div>
              <ChevronDownIcon
                size={18}
                color="white"
                className={`transition-transform duration-300 ${showDepartments ? "rotate-180" : ""}`}
              />
            </div>

            {showDepartments && (
              <div className="absolute left-0 top-[50px] w-[260px] bg-white shadow-2xl overflow-hidden z-[200] border-x border-b border-slate-100 animate-fade-in">
                {[
                  "Electronics",
                  "Fashion",
                  "Home & Garden",
                  "Health & Beauty",
                  "Sports & Outdoors",
                  "Toys & Games",
                  "Automotive",
                  "Books & Media",
                ].map((category) => (
                  <div
                    key={category}
                    className="px-6 py-3.5 text-sm font-medium text-slate-600 hover:text-[#47718F] hover:bg-slate-50 cursor-pointer flex items-center justify-between group/item transition-all"
                  >
                    {category}
                    <div className="w-1 h-1 rounded-full bg-[#47718F] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                ))}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                  <Link
                    href="/all-categories"
                    className="text-[10px] font-black text-[#47718F] uppercase tracking-widest hover:underline"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ─── Mobile Menu Toggle ─── */}
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-[#47718F] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* ─── Navigation Links (Desktop) ─── */}
          <nav className="hidden lg:flex items-center">
            {navItems.map((item: any, index: number) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`px-6 font-bold text-sm uppercase tracking-widest transition-colors relative group ${isActive ? "text-[#47718F]" : "text-slate-600 hover:text-[#47718F]"}`}
                >
                  {item.title}
                  <span
                    className={`absolute bottom-[-4px] left-6 right-6 h-[2px] bg-[#47718F] transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ─── Sticky Icons (Visible when isSticky or Mobile) ─── */}
          <div className="flex items-center gap-4 md:gap-8">
            {isSticky && (
              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  {!isLoading && user ? (
                    <Link
                      href={"/profile"}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-9 h-9 border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:border-[#47718F] transition-colors">
                        <ProfileIcon />
                      </div>
                      <div className="hidden sm:block">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          Account
                        </span>
                        <span className="block text-xs font-black text-slate-800">
                          {user?.name?.split(" ")[0]}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      href={"/login"}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-9 h-9 border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:border-[#47718F] transition-colors">
                        <ProfileIcon />
                      </div>
                      <div className="hidden sm:block">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          Sign In
                        </span>
                        <span className="block text-xs font-black text-slate-800">
                          Account
                        </span>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4 md:gap-5">
                  <Link
                    href={"/wishlist"}
                    className="relative text-slate-700 hover:text-[#47718F] transition-colors"
                  >
                    <HeartPlus size={22} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={"/cart"}
                    className="relative text-slate-700 hover:text-[#47718F] transition-colors"
                  >
                    <ShoppingCart size={22} />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#47718F] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu Drawer ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col animate-slide-in-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#47718F] to-[#365870]">
              <span className="text-white font-black tracking-tighter text-xl">
                SHOPNEX
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Navigation Links */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Navigation
                </h4>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item: any, index: number) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        pathname === item.href
                          ? "bg-[#47718F]/10 text-[#47718F]"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Categories
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    "Electronics",
                    "Fashion",
                    "Home & Garden",
                    "Health & Beauty",
                  ].map((cat) => (
                    <div
                      key={cat}
                      className="px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      {cat}
                      <ArrowRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <Link
                href="/seller-registration"
                className="w-full py-4 bg-[#47718F] text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-[#47718F]/20"
              >
                <Store size={16} />
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderBottom;
