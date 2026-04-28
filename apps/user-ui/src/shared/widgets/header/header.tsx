"use client";

import Link from "next/link";
import React from "react";
import { HeartPlus, Search, ShoppingCart } from "lucide-react";
import { ProfileIcon } from "apps/user-ui/src/assets/svgs/profile-icon";
import HeaderBottom from "./header-bottom";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";

const Header = () => {
  const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);

  return (
    <div className="w-full bg-white shadow-sm relative z-[1000]">
      <div className="w-[90%] md:w-[80%] py-6 m-auto flex justify-between items-center">
        {/* Logo */}
        <div className="shrink-0">
          <Link href={"/"} className="group">
            <span className="text-3xl font-black tracking-tighter text-[#365870] group-hover:text-[#47718F] transition-colors">
              SHOP<span className="text-[#47718F]">NEX</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex w-[45%] relative group">
          <input
            type="text"
            placeholder="Search for premium products..."
            className="w-full font-medium border-2 border-slate-100 focus:border-[#47718F] outline-none rounded-2xl px-6 h-[55px] bg-slate-50 transition-all placeholder:text-slate-400 text-slate-600"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[45px] bg-gradient-to-br from-[#47718F] to-[#365870] absolute top-[5px] right-[5px] rounded-xl shadow-lg shadow-indigo-100 hover:opacity-90 active:scale-95 transition-all">
            <Search size={20} color="#fff" />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6 pb-1">
          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              <>
                <Link
                  href={"/profile"}
                  className="w-[45px] h-[45px] flex items-center justify-center rounded-full border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all overflow-hidden"
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/profile"} className="hidden sm:block">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Hello,
                  </span>
                  <span className="block font-black text-[#365870] text-sm">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={"/login"}
                  className="w-[45px] h-[45px] rounded-full flex items-center justify-center border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all"
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/login"} className="hidden sm:block text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Sign In
                  </span>
                  <span className="block font-black text-[#365870] text-sm">
                    {isLoading ? "..." : "Account"}
                  </span>
                </Link>
              </>
            )}
          </div>

          <div className="w-[1px] h-8 bg-slate-100" />

          {/* Cart & Wishlist */}
          <div className="flex items-center gap-5">
            <Link
              href={"/wishlist"}
              className="relative group p-2 hover:bg-slate-50 rounded-xl transition-all"
            >
              <HeartPlus
                size={22}
                className="text-slate-600 group-hover:text-red-500 transition-colors"
              />
              <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[0px] right-[0px] shadow-lg">
                <span className="text-white font-bold text-[9px]">
                  {wishlist?.length || 0}
                </span>
              </div>
            </Link>
            <Link
              href={"/cart"}
              className="relative group p-2 hover:bg-slate-50 rounded-xl transition-all"
            >
              <ShoppingCart
                size={22}
                className="text-slate-600 group-hover:text-[#47718F] transition-colors"
              />
              <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[0px] right-[0px] shadow-lg">
                <span className="text-white font-bold text-[9px]">
                  {cart.length || 0}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-slate-50"></div>
      <HeaderBottom />
    </div>
  );
};

export default Header;
