import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  confirmed: { label: 'Đã xác nhận', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  cancelled: { label: 'Đã hủy', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('text-[11px] font-medium px-2.5 py-1 rounded-lg border', config.className)}>
      {config.label}
    </span>
  );
}
