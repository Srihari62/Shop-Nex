"use client";

import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import axiosInstance, { handleLogout } from "../../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ChangePassword = () => {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put("/api/update-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully! Please login again.");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Logout and redirect
        await handleLogout();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Security Settings
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Update your account password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Lock size={18} />
                </div>
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter current password"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-[#47718F] focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-600 placeholder:text-slate-300 placeholder:font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-[#47718F] focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-600 placeholder:text-slate-300 placeholder:font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat new password"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-[#47718F] focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-600 placeholder:text-slate-300 placeholder:font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl text-[#47718F]">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                Password should be complex for better security. Use a mix of
                letters, numbers, and symbols.
              </p>
            </div> */}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#47718F] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#47718F]/20 hover:bg-[#365870] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
        {/* <div className="p-8 bg-slate-50/50 text-center">
          <p className="text-sm text-slate-400 font-medium italic">
            Forgot your current password? Please contact support or use the
            reset flow.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default ChangePassword;
