/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export default function CategoryForm({ open, onClose, onSuccess, category }: Props) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [sortOrder, setSortOrder] = useState(category?.sortOrder?.toString() || '0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      if (isEdit) {
        await categoriesService.update(category.id, { name, sortOrder: Number(sortOrder) });
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoriesService.create({ name, sortOrder: Number(sortOrder) });
        toast.success('Tạo danh mục thành công');
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
      <DialogContent className="bg-[#161616] border-white/[0.08] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tên danh mục</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đồ uống, Khai vị..."
              disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Thứ tự sắp xếp</label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-sm font-medium rounded-xl py-2.5 transition-all">
              Hủy
            </button>
            <button type="submit" disabled={loading || !name} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-all">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}