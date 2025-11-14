"use client";

import { ProfileIcon } from "apps/user-ui/src/assets/svgs/profile-icon";
import { navItems } from "apps/user-ui/src/configs/constants";
import {
  AlignLeft,
  ChevronDownIcon,
  HeartPlus,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function HeaderBottom() {
  const [show, setshow] = useState(false);
  const [isSticky, setisSticky] = useState(false);

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
    <div
      className={`w-full transition-all ${
        isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* Dropdowns */}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setshow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDownIcon color="white" />
        </div>
        {/* Dropdown Menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px] "
            } w-[260px] h-[400px] bg-[#f5f5f5]`}
          >
            {/* <span className="px-5 py-3 border-b hover:bg-[#f5f5f5] cursor-pointer">
              Electronics
            </span>
            <span className="px-5 py-3 border-b hover:bg-[#f5f5f5] cursor-pointer">
              Fashion
            </span>
            <span className="px-5 py-3 border-b hover:bg-[#f5f5f5] cursor-pointer">
              Home & Garden
            </span>
            <span className="px-5 py-3 border-b hover:bg-[#f5f5f5] cursor-pointer">
              Sports
            </span>
            <span className="px-5 py-3 border-b hover:bg-[#f5f5f5] cursor-pointer">
              Toys
            </span>
            <span className="px-5 py-3 border-b hover:bg-[#f5f5f5] cursor-pointer">
              Automotive
            </span> */}
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((i: NavItemTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>
        <div className="">
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
              <div className="flex items-center gap-2">
                <Link
                  href={"/login"}
                  className="border-2 w-[50px] h-[50px] rounded-full flex items-center justify-center border-[#010f1c1a]"
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/login"}>
                  <span className="block font medium"> Hello,</span>
                  <span className="block font-semibold"> Sign In</span>
                </Link>
              </div>
              <div className="flex items-center gap-5">
                <Link href={"/wishlist"} className="relative">
                  <HeartPlus />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">5</span>
                  </div>
                </Link>
                <Link href={"/cart"} className="relative">
                  <ShoppingCart />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">6</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderBottom;
