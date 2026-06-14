/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { ChefHat, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !password) return;

    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authService.login(code, password);
      setAuth(user, accessToken, refreshToken);
      toast.success("Đăng nhập thành công");
      router.push("/");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
            <ChefHat className="w-7 h-7 text-orange-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">BianServe</h1>
          <p className="text-sm text-zinc-500 mt-1">Hệ thống quản lý nhà hàng</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Code field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Mã nhân viên
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: ADMIN00001"
                disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.07] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.07] transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !code || !password}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-3 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          © 2024 BianServe. All rights reserved.
        </p>
      </div>
    </div>
  );
}