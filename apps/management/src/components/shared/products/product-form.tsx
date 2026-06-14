/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { Product, Category } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export default function ProductForm({ open, onClose, onSuccess, product }: Props) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      categoriesService.list().then(setCategories).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    setLoading(true);
    try {
      if (isEdit) {
        await productsService.update(product.id, {
          name,
          description: description || undefined,
          price: Number(price),
          categoryId,
          imageUrl: imageUrl || undefined,
        });
        toast.success('Cập nhật món ăn thành công');
      } else {
        await productsService.create({
          name,
          description: description || undefined,
          price: Number(price),
          categoryId,
          imageUrl: imageUrl || undefined,
        });
        toast.success('Thêm món ăn thành công');
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
      <DialogContent className="bg-[#161616] border-white/[0.08] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Sửa món ăn' : 'Thêm món ăn'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tên món</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Phở bò, Cà phê sữa..." disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Giá (đ)</label>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="VD: 50000" disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Danh mục</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loading}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50">
                <option value="" className="bg-[#1a1a1a]">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a1a]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về món..." disabled={loading} rows={2}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50 resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">URL hình ảnh</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-sm font-medium rounded-xl py-2.5 transition-all">Hủy</button>
            <button type="submit" disabled={loading || !name || !price || !categoryId}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-all">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Thêm món'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}