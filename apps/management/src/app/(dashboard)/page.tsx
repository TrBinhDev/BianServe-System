"use client";

import { useEffect, useState } from "react";
import { statisticsService } from "@/services/statistics.service";
import { TrendingUp, ShoppingBag, Clock, Table } from "lucide-react";

interface DashboardData {
  revenueToday: number;
  ordersToday: number;
  pendingOrders: number;
  tableOccupancyRate: number;
  topProducts: { productId: string; name: string; quantity: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statisticsService.getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Doanh thu hôm nay",
      value: data ? `${data.revenueToday.toLocaleString("vi-VN")}đ` : "—",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Đơn hàng hôm nay",
      value: data?.ordersToday ?? "—",
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Đơn chờ xử lý",
      value: data?.pendingOrders ?? "—",
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Tỷ lệ lấp đầy bàn",
      value: data ? `${data.tableOccupancyRate.toFixed(0)}%` : "—",
      icon: Table,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                <p className={`text-xl font-semibold ${loading ? "text-zinc-600" : "text-white"}`}>
                  {loading ? "..." : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top products */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Top món bán chạy hôm nay</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.topProducts.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">Chưa có dữ liệu hôm nay</p>
        ) : (
          <div className="space-y-2">
            {data?.topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3 py-2">
                <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{p.name}</span>
                    <span className="text-xs text-zinc-400">{p.quantity} phần</span>
                  </div>
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500/60 rounded-full"
                      style={{ width: `${(p.quantity / (data.topProducts[0]?.quantity || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}