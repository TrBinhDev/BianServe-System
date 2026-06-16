'use client';

import { Feedback } from '@/types';
import { Trash2, Star } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface Props {
  feedbacks: Feedback[];
  loading: boolean;
  onDelete: (feedback: Feedback) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={cn('w-3 h-3', i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700')} />
      ))}
    </div>
  );
}

export default function FeedbackTable({ feedbacks, loading, onDelete }: Props) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Đơn hàng', 'Bàn', 'Đánh giá', 'Nhận xét', 'Thời gian', ''].map((h) => (
              <th key={h} className="text-left text-xs font-medium text-zinc-500 px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-white/[0.04]">
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                ))}
              </tr>
            ))
          ) : feedbacks.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-sm text-zinc-500 py-12">Chưa có đánh giá nào</td></tr>
          ) : (
            feedbacks.map((fb) => (
              <tr key={fb.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-4 text-xs font-mono text-zinc-400">{fb.order.orderCode}</td>
                <td className="px-5 py-4 text-sm text-white">Bàn {fb.table.tableNumber}</td>
                <td className="px-5 py-4"><StarRating rating={fb.rating} /></td>
                <td className="px-5 py-4 text-sm text-zinc-400 max-w-xs">
                  {fb.comment ? (
                    <span className="truncate block">{fb.comment}</span>
                  ) : (
                    <span className="text-zinc-600 italic">Không có nhận xét</span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-zinc-500">
                  {dayjs(fb.createdAt).format('HH:mm DD/MM/YYYY')}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDelete(fb)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}