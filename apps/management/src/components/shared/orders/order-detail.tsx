/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Order } from '@/types';
import { ordersService } from '@/services/orders.service';
import OrderStatusBadge from './order-status-badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { X, Loader2, Check, XCircle, CheckCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function OrderDetail({ order, open, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  if (!order) return null;

  const handleConfirm = async () => {
    setLoading('confirm');
    try {
      await ordersService.updateStatus(order.id, 'confirmed');
      toast.success('Đã xác nhận đơn hàng');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(null);
    }
  };

  const handleComplete = async () => {
    setLoading('complete');
    try {
      await ordersService.updateStatus(order.id, 'completed');
      toast.success('Đã hoàn thành đơn hàng');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    setLoading('cancel');
    try {
      await ordersService.cancel(order.id, cancelReason);
      toast.success('Đã hủy đơn hàng');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(null);
      setCancelReason('');
      setShowCancelInput(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161616] border-white/[0.08] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center justify-between">
            <span>Đơn hàng #{order.orderCode}</span>
            <OrderStatusBadge status={order.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">Bàn</p>
              <p className="font-medium">Bàn {order.table.tableNumber}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">Tổng tiền</p>
              <p className="font-medium text-orange-400">
                {Number(order.totalAmount).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Danh sách món</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-white">{item.product.name}</p>
                    {item.note && (
                      <p className="text-xs text-zinc-500 mt-0.5">Ghi chú: {item.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">x{item.quantity}</p>
                    <p className="text-xs text-zinc-500">
                      {Number(item.unitPrice).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel reason input */}
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

          {/* Actions */}
          {order.status === 'pending' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirm}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-xl py-2.5 transition-all"
              >
                {loading === 'confirm' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Xác nhận
              </button>
              {showCancelInput ? (
                <button
                  onClick={handleCancel}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-2.5 transition-all"
                >
                  {loading === 'cancel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Xác nhận hủy
                </button>
              ) : (
                <button
                  onClick={() => setShowCancelInput(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-2.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy đơn
                </button>
              )}
            </div>
          )}

          {order.status === 'confirmed' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleComplete}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl py-2.5 transition-all"
              >
                {loading === 'complete' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Hoàn thành
              </button>
              {showCancelInput ? (
                <button
                  onClick={handleCancel}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-2.5 transition-all"
                >
                  {loading === 'cancel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Xác nhận hủy
                </button>
              ) : (
                <button
                  onClick={() => setShowCancelInput(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-2.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy đơn
                </button>
              )}
            </div>
          )}

          {order.status === 'cancelled' && order.cancelReason && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
              <p className="text-xs text-red-400/70">Lý do hủy</p>
              <p className="text-sm text-red-400 mt-0.5">{order.cancelReason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
