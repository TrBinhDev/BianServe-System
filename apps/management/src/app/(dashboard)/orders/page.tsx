/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ordersService } from '@/services/orders.service';
import { Order, PaginationMeta } from '@/types';
import { useSocketStore } from '@/stores/socket.store';
import OrderTable from '@/components/shared/orders/order-table';
import OrderDetail from '@/components/shared/orders/order-detail';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { socket } = useSocketStore();

  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersService.list({
        page,
        limit: 10,
        search: search || undefined,
        status: (status as any) || undefined,
      });
      setOrders(data.orders);
      setMeta(data.meta);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await ordersService.list({
          page,
          limit: 10,
          search: search || undefined,
          status: (status as any) || undefined,
        });
        if (!cancelled) {
          setOrders(data.orders);
          setMeta(data.meta);
        }
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách đơn hàng');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, status]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      toast.info('🔔 Có đơn hàng mới!', { duration: 6000 });
      setTimeout(() => fetchOrders(), 0);
    };

    const handleUpdate = () => setTimeout(() => fetchOrders(), 0);

    socket.on('order_created', handleNewOrder);
    socket.on('order_status_changed', handleUpdate);
    socket.on('order_cancelled', handleUpdate);

    return () => {
      socket.off('order_created', handleNewOrder);
      socket.off('order_status_changed', handleUpdate);
      socket.off('order_cancelled', handleUpdate);
    };
  }, [socket, fetchOrders]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm mã đơn..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#1a1a1a]">
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <OrderTable orders={orders} loading={loading} onRowClick={setSelectedOrder} />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{meta.total} đơn hàng</p>
          <div className="flex gap-1">
            {[...Array(meta.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs transition-all ${
                  page === i + 1
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <OrderDetail
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={fetchOrders}
      />
    </div>
  );
}
