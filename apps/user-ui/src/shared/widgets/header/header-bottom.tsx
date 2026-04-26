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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";


function HeaderBottom() {
  const [show, setshow] = useState(false);
  const [isSticky, setisSticky] = useState(false);
  const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);

  const pathname = usePathname();

  //Track Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setisSticky(true);
      } else {
        setisSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
        {/* Dropdowns */}
        <div className="relative">
          <div
            className={`w-[260px] cursor-pointer flex items-center justify-between px-6 h-[50px] bg-gradient-to-r from-[#47718F] to-[#365870] transition-all hover:opacity-90 shadow-sm group`}
            onClick={() => setshow(!show)}
          >
            <div className="flex items-center gap-3">
              <AlignLeft size={20} color="white" className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-white font-bold text-sm uppercase tracking-widest">All Departments</span>
            </div>
            <ChevronDownIcon size={18} color="white" className={`transition-transform duration-300 ${show ? "rotate-180" : ""}`} />
          </div>

          {/* Dropdown Menu */}
          {show && (
            <div
              className={`absolute left-0 top-[50px] w-[260px] bg-white shadow-2xl overflow-hidden z-[200] border-x border-b border-slate-100 animate-fade-in`}
            >

              {[
                "Electronics", "Fashion", "Home & Garden", 
                "Health & Beauty", "Sports & Outdoors", "Toys & Games",
                "Automotive", "Books & Media"
              ].map((category, idx) => (
                <div 
                  key={category}
                  className="px-6 py-3.5 text-sm font-medium text-slate-600 hover:text-[#47718F] hover:bg-slate-50 cursor-pointer flex items-center justify-between group/item transition-all"
                >
                  {category}
                  <div className="w-1 h-1 rounded-full bg-[#47718F] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </div>
              ))}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                <Link href="/all-categories" className="text-[10px] font-black text-[#47718F] uppercase tracking-widest hover:underline">
                  View All Categories
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((i: any, index: number) => {
            const isActive = pathname === i.href;
            return (
              <Link
                className={`px-6 font-bold text-sm uppercase tracking-widest transition-colors relative group ${isActive ? "text-[#47718F]" : "text-slate-600 hover:text-[#47718F]"}`}
                href={i.href}
                key={index}
              >
                {i.title}
                <span className={`absolute bottom-[-4px] left-6 right-6 h-[2px] bg-[#47718F] transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            );
          })}
        </div>


        <div className="">
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <Link
                      href={"/profile"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <ProfileIcon />
                    </Link>
                    <Link href={"/profile"}>
                      <span className="block font medium"> Hello,</span>
                      <span className="block font-semibold">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={"/login"}
                      className="border-2 w-[50px] h-[50px] rounded-full flex items-center justify-center border-[#010f1c1a]"
                    >
                      <ProfileIcon />
                    </Link>
                    <Link href={"/login"}>
                      <span className="block font medium"> Hello,</span>
                      <span className="block font-semibold">
                        {" "}
                        {isLoading ? "..." : "Sign In"}
                      </span>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-5">
                <Link href={"/wishlist"} className="relative">
                  <HeartPlus />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">
                      {wishlist.length || 0}
                    </span>
                  </div>
                </Link>
                <Link href={"/cart"} className="relative">
                  <ShoppingCart />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">
                      {cart.length || 0}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}




export default HeaderBottom;
