/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersService } from '@/services/orders.service';
import { Order } from '@/types';
import OrderStatusBadge from '@/components/shared/orders/order-status-badge';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Check, XCircle, CheckCheck } from 'lucide-react';
import dayjs from 'dayjs';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await ordersService.getById(id);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) {
          toast.error('Không tìm thấy đơn hàng');
          router.push('/orders');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading('confirm');
    try {
      await ordersService.updateStatus(id, 'confirmed');
      toast.success('Đã xác nhận đơn hàng');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    try {
      await ordersService.updateStatus(id, 'completed');
      toast.success('Đã hoàn thành đơn hàng');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    setActionLoading('cancel');
    try {
      await ordersService.cancel(id, cancelReason);
      toast.success('Đã hủy đơn hàng');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
      setCancelReason('');
      setShowCancelInput(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl space-y-5">
      <button
        onClick={() => router.push('/orders')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Mã đơn hàng</p>
          <p className="text-lg font-mono font-semibold text-white">{order.orderCode}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {dayjs(order.createdAt).format('HH:mm — DD/MM/YYYY')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs text-zinc-500 mb-1">Bàn</p>
          <p className="text-xl font-semibold text-white">Bàn {order.table.tableNumber}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs text-zinc-500 mb-1">Tổng tiền</p>
          <p className="text-xl font-semibold text-orange-400">
            {Number(order.totalAmount).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-medium text-white">Danh sách món ({order.items.length})</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-white">{item.product.name}</p>
                {item.note && <p className="text-xs text-zinc-500 mt-0.5">Ghi chú: {item.note}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-white">x{item.quantity}</p>
                <p className="text-xs text-zinc-500">
                  {Number(item.unitPrice).toLocaleString('vi-VN')}đ/món
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] flex justify-between">
          <p className="text-sm text-zinc-500">Tổng cộng</p>
          <p className="text-sm font-semibold text-orange-400">
            {Number(order.totalAmount).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {order.status === 'cancelled' && order.cancelReason && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl px-5 py-4">
          <p className="text-xs text-red-400/70 mb-1">Lý do hủy</p>
          <p className="text-sm text-red-400">{order.cancelReason}</p>
        </div>
      )}

      {showCancelInput && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Lý do hủy</p>
          <input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn..."
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      )}

      {order.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={!!actionLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-xl py-3 transition-all"
          >
            {actionLoading === 'confirm' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}{' '}
            Xác nhận đơn
          </button>
          <button
            onClick={() => (showCancelInput ? handleCancel() : setShowCancelInput(true))}
            disabled={!!actionLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-3 transition-all"
          >
            {actionLoading === 'cancel' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}{' '}
            {showCancelInput ? 'Xác nhận hủy' : 'Hủy đơn'}
          </button>
        </div>
      )}

      {order.status === 'confirmed' && (
        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            disabled={!!actionLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl py-3 transition-all"
          >
            {actionLoading === 'complete' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}{' '}
            Hoàn thành đơn
          </button>
          <button
            onClick={() => (showCancelInput ? handleCancel() : setShowCancelInput(true))}
            disabled={!!actionLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-3 transition-all"
          >
            {actionLoading === 'cancel' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}{' '}
            {showCancelInput ? 'Xác nhận hủy' : 'Hủy đơn'}
          </button>
        </div>
      )}
    </div>
  );
}
