"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useSocketStore } from "@/stores/socket.store";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/": "Tổng quan",
  "/orders": "Đơn hàng",
  "/tables": "Bàn ăn",
  "/categories": "Danh mục",
  "/products": "Món ăn",
  "/promotions": "Khuyến mãi",
  "/statistics": "Thống kê",
  "/feedbacks": "Đánh giá",
  "/accounts": "Tài khoản",
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isConnected } = useSocketStore();
  const title = pageTitles[pathname] || "BianServe";

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#0F0F0F]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-sm font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Socket status */}
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-400" : "bg-zinc-600")} />
          <span className="text-[10px] text-zinc-500">{isConnected ? "Online" : "Offline"}</span>
        </div>

        {/* Role badge */}
        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 capitalize">
          {user?.role}
        </span>
      </div>
    </header>
  );
}