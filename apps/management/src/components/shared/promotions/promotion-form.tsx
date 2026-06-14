/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { promotionsService } from '@/services/promotions.service';
import { categoriesService } from '@/services/categories.service';
import { productsService } from '@/services/products.service';
import { Promotion, Category, Product } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion?: Promotion | null;
}

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function PromotionForm({ open, onClose, onSuccess, promotion }: Props) {
  const isEdit = !!promotion;
  const [name, setName] = useState(promotion?.name || '');
  const [code, setCode] = useState(promotion?.code || '');
  const [type, setType] = useState<'PERCENT' | 'FIXED_AMOUNT'>(promotion?.type || 'PERCENT');
  const [value, setValue] = useState(promotion?.value?.toString() || '');
  const [minOrderValue, setMinOrderValue] = useState(promotion?.minOrderValue?.toString() || '');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(promotion?.maxDiscountAmount?.toString() || '');
  const [timeStart, setTimeStart] = useState(promotion?.timeStart || '');
  const [timeEnd, setTimeEnd] = useState(promotion?.timeEnd || '');
  const [dayOfWeek, setDayOfWeek] = useState<number[]>(promotion?.dayOfWeek || []);
  const [usageLimit, setUsageLimit] = useState(promotion?.usageLimit?.toString() || '');
  const [perUserLimit, setPerUserLimit] = useState(promotion?.perUserLimit?.toString() || '');
  const [startDate, setStartDate] = useState(promotion?.startDate ? promotion.startDate.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(promotion?.endDate ? promotion.endDate.slice(0, 10) : '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      categoriesService.list().then(setCategories).catch(() => {});
      productsService.list({ limit: 100 }).then((d) => setProducts(d.products)).catch(() => {});
    }
  }, [open]);

  const toggleDay = (day: number) => {
    setDayOfWeek((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !value || !startDate || !endDate) return;
    setLoading(true);
    try {
      const payload = {
        name, code, type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        timeStart: timeStart || undefined,
        timeEnd: timeEnd || undefined,
        dayOfWeek,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        perUserLimit: perUserLimit ? Number(perUserLimit) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        productIds: selectedProductIds.length ? selectedProductIds : undefined,
        categoryIds: selectedCategoryIds.length ? selectedCategoryIds : undefined,
      };

      if (isEdit) {
        await promotionsService.update(promotion.id, payload);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await promotionsService.create(payload);
        toast.success('Tạo khuyến mãi thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161616] border-white/[0.08] text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{isEdit ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Tên + Mã */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Giảm 20% cuối tuần" disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mã KM</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: WEEKEND20" disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
          </div>

          {/* Loại + Giá trị */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Loại giảm</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['PERCENT', 'FIXED_AMOUNT'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${type === t ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-white/[0.03] text-zinc-400 border-white/[0.08]'}`}>
                    {t === 'PERCENT' ? 'Phần trăm' : 'Số tiền'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Giá trị {type === 'PERCENT' ? '(%)' : '(đ)'}
              </label>
              <input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'PERCENT' ? '20' : '50000'} disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
          </div>

          {/* Điều kiện đơn */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Đơn tối thiểu (đ)</label>
              <input type="number" min={0} value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} placeholder="Không giới hạn" disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
            {type === 'PERCENT' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Giảm tối đa (đ)</label>
                <input type="number" min={0} value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} placeholder="Không giới hạn" disabled={loading}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
              </div>
            )}
          </div>

          {/* Thời hạn */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Từ ngày</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Đến ngày</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
          </div>

          {/* Giờ áp dụng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Từ giờ</label>
              <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Đến giờ</label>
              <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
          </div>

          {/* Ngày trong tuần */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Ngày áp dụng (bỏ trống = tất cả)</label>
            <div className="flex gap-1.5">
              {DAYS.map((day, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${dayOfWeek.includes(i) ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-white/[0.03] text-zinc-500 border-white/[0.08]'}`}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Giới hạn lượt */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tổng lượt dùng</label>
              <input type="number" min={1} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Không giới hạn" disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Lượt/người dùng</label>
              <input type="number" min={1} value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} placeholder="Không giới hạn" disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-sm font-medium rounded-xl py-2.5 transition-all">Hủy</button>
            <button type="submit" disabled={loading || !name || !code || !value || !startDate || !endDate}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-all">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}