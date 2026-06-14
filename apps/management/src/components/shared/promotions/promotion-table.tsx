'use client';

import { Promotion } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface Props {
  promotions: Promotion[];
  loading: boolean;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
  onToggleActive: (promotion: Promotion) => void;
}

export default function PromotionTable({ promotions, loading, onEdit, onDelete, onToggleActive }: Props) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Tên / Mã', 'Loại', 'Giá trị', 'Thời hạn', 'Lượt dùng', 'Trạng thái', ''].map((h) => (
              <th key={h} className="text-left text-xs font-medium text-zinc-500 px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-white/[0.04]">
                {[...Array(7)].map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                ))}
              </tr>
            ))
          ) : promotions.length === 0 ? (
            <tr><td colSpan={7} className="text-center text-sm text-zinc-500 py-12">Chưa có khuyến mãi nào</td></tr>
          ) : (
            promotions.map((promo) => {
              const isExpired = dayjs().isAfter(dayjs(promo.endDate));
              return (
                <tr key={promo.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm text-white">{promo.name}</p>
                    <p className="text-xs font-mono text-orange-400 mt-0.5">{promo.code}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-400">{promo.type === 'PERCENT' ? 'Phần trăm' : 'Số tiền'}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white font-medium">
                    {promo.type === 'PERCENT' ? `${promo.value}%` : `${Number(promo.value).toLocaleString('vi-VN')}đ`}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-zinc-400">{dayjs(promo.startDate).format('DD/MM/YY')}</p>
                    <p className="text-xs text-zinc-500">→ {dayjs(promo.endDate).format('DD/MM/YY')}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {promo.usedCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => onToggleActive(promo)}
                      className={cn('text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all',
                        !promo.isActive || isExpired
                          ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      )}>
                      {isExpired ? 'Hết hạn' : promo.isActive ? 'Đang hoạt động' : 'Tắt'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(promo)} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(promo)} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}