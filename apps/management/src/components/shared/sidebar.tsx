"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  ChefHat,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  TableProperties,
  Users,
  Tag,
  BarChart3,
  MessageSquare,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/tables", label: "Bàn ăn", icon: TableProperties },
  { href: "/categories", label: "Danh mục", icon: UtensilsCrossed },
  { href: "/products", label: "Món ăn", icon: ChefHat },
  { href: "/promotions", label: "Khuyến mãi", icon: Tag },
  { href: "/statistics", label: "Thống kê", icon: BarChart3 },
  { href: "/feedbacks", label: "Đánh giá", icon: MessageSquare },
  { href: "/accounts", label: "Tài khoản", icon: Users, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      toast.success("Đã đăng xuất");
      router.push("/login");
    }
  };

  const filteredNav = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  return (
    <aside className="w-60 min-h-screen bg-[#111111] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">BianServe</p>
            <p className="text-[10px] text-zinc-500">Quản lý nhà hàng</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                isActive
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-orange-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-zinc-300">
              {user?.code?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.code}</p>
            <p className="text-[10px] text-zinc-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}