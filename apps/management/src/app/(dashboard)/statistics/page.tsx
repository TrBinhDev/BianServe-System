/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { statisticsService } from '@/services/statistics.service';
import StatsCard from '@/components/shared/statistics/stats-card';
import RevenueChart from '@/components/shared/statistics/revenue-chart';
import { TrendingUp, ShoppingBag, UtensilsCrossed, Tag, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';

type Period = 'day' | 'week' | 'month' | 'year';

export default function StatisticsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [period, setPeriod] = useState<Period>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [revenueData, setRevenueData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [promotionData, setPromotionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const params = { start_date: startDate || undefined, end_date: endDate || undefined };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [revenue, orders, products, promotions] = await Promise.all([
          statisticsService.getRevenue({ ...params, type: period }),
          statisticsService.getOrders(params),
          statisticsService.getProducts(params),
          statisticsService.getPromotions(params),
        ]);
        if (!cancelled) {
          setRevenueData(revenue);
          setOrderData(orders);
          setProductData(products);
          setPromotionData(promotions);
        }
      } catch {
        if (!cancelled) toast.error('Không thể tải thống kê');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [period, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-white'}`}
            >
              {p === 'day' ? 'Ngày' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
          />
          <span className="text-zinc-600 text-xs">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {isAdmin && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={async () => {
                try {
                  await statisticsService.exportRevenue(params);
                } catch {
                  toast.error('Xuất thất bại');
                }
              }}
              className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white text-xs rounded-xl px-3 py-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Xuất doanh thu
            </button>
            <button
              onClick={async () => {
                try {
                  await statisticsService.exportOrders(params);
                } catch {
                  toast.error('Xuất thất bại');
                }
              }}
              className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white text-xs rounded-xl px-3 py-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Xuất đơn hàng
            </button>
            <button
              onClick={async () => {
                try {
                  await statisticsService.exportProducts(params);
                } catch {
                  toast.error('Xuất thất bại');
                }
              }}
              className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white text-xs rounded-xl px-3 py-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Xuất top món
            </button>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Tổng doanh thu"
          loading={loading}
          value={revenueData ? `${Number(revenueData.total).toLocaleString('vi-VN')}đ` : '—'}
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
          sub={
            revenueData?.growthRate != null
              ? `${revenueData.growthRate > 0 ? '+' : ''}${revenueData.growthRate.toFixed(1)}% so kỳ trước`
              : undefined
          }
        />
        <StatsCard
          label="Tổng đơn hàng"
          loading={loading}
          value={orderData?.total ?? '—'}
          icon={ShoppingBag}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
          sub={orderData ? `Hủy: ${orderData.cancelRate.toFixed(1)}%` : undefined}
        />
        <StatsCard
          label="Top món bán chạy"
          loading={loading}
          value={productData?.topByQuantity?.[0]?.name ?? '—'}
          icon={UtensilsCrossed}
          color="text-purple-400"
          bg="bg-purple-500/10"
          border="border-purple-500/20"
          sub={
            productData?.topByQuantity?.[0]
              ? `${productData.topByQuantity[0].quantity} phần`
              : undefined
          }
        />
        <StatsCard
          label="Mã KM dùng nhiều nhất"
          loading={loading}
          value={promotionData?.[0]?.code ?? '—'}
          icon={Tag}
          color="text-orange-400"
          bg="bg-orange-500/10"
          border="border-orange-500/20"
          sub={promotionData?.[0] ? `${promotionData[0].usageCount} lượt` : undefined}
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5">
          Doanh thu theo{' '}
          {period === 'day'
            ? 'ngày'
            : period === 'week'
              ? 'tuần'
              : period === 'month'
                ? 'tháng'
                : 'năm'}
        </h2>
        <RevenueChart data={revenueData?.data ?? {}} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Top 10 món bán chạy</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-white/[0.03] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {productData?.topByQuantity?.slice(0, 10).map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white truncate">{p.name}</span>
                      <span className="text-xs text-zinc-500 ml-2 shrink-0">{p.quantity} phần</span>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500/50 rounded-full"
                        style={{
                          width: `${(p.quantity / (productData.topByQuantity[0]?.quantity || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order by status */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Đơn hàng theo trạng thái</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-white/[0.03] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {orderData &&
                Object.entries(orderData.byStatus).map(([status, count]: any) => {
                  const config: Record<string, { label: string; color: string; bg: string }> = {
                    pending: {
                      label: 'Chờ xác nhận',
                      color: 'bg-yellow-400',
                      bg: 'bg-yellow-500/10',
                    },
                    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-400', bg: 'bg-blue-500/10' },
                    completed: {
                      label: 'Hoàn thành',
                      color: 'bg-emerald-400',
                      bg: 'bg-emerald-500/10',
                    },
                    cancelled: { label: 'Đã hủy', color: 'bg-red-400', bg: 'bg-red-500/10' },
                  };
                  const c = config[status];
                  const total = orderData.total || 1;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${c.color}`} />
                      <span className="text-xs text-zinc-400 w-28">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.color} opacity-70 rounded-full`}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
