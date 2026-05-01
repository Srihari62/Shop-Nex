"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/admin-login`,
        data,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Login successful! Redirecting...");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || error.message || "Something went wrong.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#e0e5ec] dark:bg-[#1a1c20] font-Poppins p-4 overflow-hidden select-none">
      {/* Subtle Background Decorative Blobs */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-[#78B59C]/10 blur-[100px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#4A876E]/10 blur-[100px] rounded-full z-0 pointer-events-none" />

      {/* Main Claymorphism Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="bg-[#e0e5ec] dark:bg-[#1a1c20] rounded-[40px] p-8 md:p-12
          shadow-[15px_15px_35px_#bebebe,-15px_-15px_35px_#ffffff]
          dark:shadow-[15px_15px_35px_#0e0f11,-15px_-15px_35px_#26292f]
          transition-all duration-500"
        >
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center px-6 py-3 rounded-[24px] bg-[#e0e5ec] dark:bg-[#1a1c20] mb-6
              shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]
              dark:shadow-[inset_6px_6px_12px_#0e0f11,inset_-6px_-6px_12px_#26292f]"
            >
              <span className="text-xl md:text-2xl font-bold tracking-tight text-[#4A876E] dark:text-[#78B59C]">
                ShopNex
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Admin Login
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs font-medium uppercase tracking-widest">
              Workspace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
                EMAIL
              </label>
              <div className="relative">
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email",
                    },
                  })}
                  type="email"
                  placeholder="admin@shopnex.com"
                  className={`w-full bg-[#e0e5ec] dark:bg-[#1a1c20] text-slate-800 dark:text-white px-6 py-3.5 rounded-[20px] outline-none transition-all duration-300 text-sm
                    shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                    dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]
                    focus:shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff,0_0_0_1px_#78B59C44]
                    dark:focus:shadow-[inset_3px_3px_6px_#0e0f11,inset_-3px_-3px_6px_#26292f,0_0_0_1px_#78B59C44]
                    placeholder:text-slate-400/50`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 ml-3 font-semibold">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  PASSWORD
                </label>
              </div>
              <div className="relative group">
                <input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-[#e0e5ec] dark:bg-[#1a1c20] text-slate-800 dark:text-white px-6 py-3.5 rounded-[20px] outline-none transition-all duration-300 text-sm
                    shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                    dark:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f]
                    focus:shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff,0_0_0_1px_#78B59C44]
                    dark:focus:shadow-[inset_3px_3px_6px_#0e0f11,inset_-3px_-3px_6px_#26292f,0_0_0_1px_#78B59C44]
                    placeholder:text-slate-400/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 ml-3 font-semibold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              disabled={loginMutation.isPending}
              type="submit"
              className="w-full relative pt-4"
            >
              <div
                className={`flex items-center justify-center gap-2 py-3.5 rounded-[20px] font-bold text-sm transition-all duration-300
                ${
                  loginMutation.isPending
                    ? "bg-[#d1d9e6] dark:bg-[#1a1c20] text-slate-400 shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]"
                    : "bg-[#e0e5ec] dark:bg-[#1a1c20] text-[#4A876E] dark:text-[#78B59C] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0e0f11,-8px_-8px_16px_#26292f] active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#0e0f11,inset_-4px_-4px_8px_#26292f] hover:translate-y-[-1px]"
                }`}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Minimal Footer */}
          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">
              ShopNex Admin • 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
