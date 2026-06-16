/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types';
import CategoryForm from '@/components/shared/categories/category-form';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await categoriesService.list();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) toast.error('Không thể tải danh mục');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = async () => {
    try {
      const data = await categoriesService.list();
      setCategories(data);
    } catch {
      toast.error('Không thể tải danh mục');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await categoriesService.delete(deleteTarget.id);
      toast.success('Đã xóa danh mục');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesService.update(category.id, { isActive: !category.isActive });
      toast.success(category.isActive ? 'Đã ẩn danh mục' : 'Đã hiện danh mục');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{categories.length} danh mục</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]"
              >
                <div className="h-4 bg-white/[0.04] rounded flex-1 animate-pulse" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-500">Chưa có danh mục nào</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                <GripVertical className="w-4 h-4 text-zinc-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      cat.isActive ? 'text-white' : 'text-zinc-500 line-through'
                    )}
                  >
                    {cat.name}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">Thứ tự: {cat.sortOrder}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={cn(
                    'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all',
                    cat.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20'
                  )}
                >
                  {cat.isActive ? 'Hiện' : 'Ẩn'}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditCategory(cat);
                      setShowForm(true);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditCategory(null);
        }}
        onSuccess={refetch}
        category={editCategory}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#161616] border-white/[0.08] text-white [&>div:last-child]:bg-[#161616]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Chỉ xóa được nếu danh mục không còn món ăn nào.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400"
            >
              {deleteLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
