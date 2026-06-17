/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Order, OrderStatus as OrderStatusType } from '@/types';
import { Check, Clock, CheckCheck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  OrderStatusType,
  { label: string; icon: any; color: string; bg: string }
> = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  confirmed: { label: 'Đã xác nhận', icon: Check, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  completed: {
    label: 'Hoàn thành',
    icon: CheckCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

interface Props {
  order: Order;
}

export default function OrderStatus({ order }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[order.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'border rounded-2xl overflow-hidden transition-all',
        order.status === 'pending'
          ? 'border-yellow-500/20'
          : order.status === 'confirmed'
            ? 'border-blue-500/20'
            : order.status === 'completed'
              ? 'border-emerald-500/20'
              : 'border-red-500/20'
      )}
    >
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-4">
        <div
          className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs text-zinc-500">#{order.orderCode}</p>
          <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
        </div>
        <div className="text-right shrink-0">
          {order.discountAmount && order.finalAmount != null ? (
            <>
              <p className="text-xs text-zinc-500 line-through">
                {Number(order.totalAmount).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm font-semibold text-white">
                {Number(order.finalAmount).toLocaleString('vi-VN')}đ
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-white">
              {Number(order.totalAmount).toLocaleString('vi-VN')}đ
            </p>
          )}
          <p className="text-xs text-zinc-500">{dayjs(order.createdAt).format('HH:mm')}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
        )}
      </button>

      {/* Items */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4">
          <div className="space-y-2 mt-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{item.product.name}</p>
                  {item.note && <p className="text-xs text-zinc-500">Ghi chú: {item.note}</p>}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs text-zinc-400">x{item.quantity}</p>
                  <p className="text-xs text-zinc-500">
                    {Number(item.unitPrice).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
          {order.discountAmount && order.promotionCode && (
            <div className="mt-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2 flex items-center justify-between">
              <p className="text-xs text-emerald-400">Mã {order.promotionCode}</p>
              <p className="text-xs text-emerald-400 font-medium">
                -{Number(order.discountAmount).toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}
          {order.status === 'cancelled' && order.cancelReason && (
            <div className="mt-3 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
              <p className="text-xs text-red-400/70">Lý do hủy</p>
              <p className="text-xs text-red-400 mt-0.5">{order.cancelReason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
