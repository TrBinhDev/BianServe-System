/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { Product, PaginationMeta, Category } from '@/types';
import ProductTable from '@/components/shared/products/product-table';
import ProductForm from '@/components/shared/products/product-form';
import { Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    categoriesService
      .list()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await productsService.list({
          page,
          limit: 10,
          search: search || undefined,
          categoryId: categoryFilter || undefined,
        });
        if (!cancelled) {
          setProducts(data.products);
          setMeta(data.meta);
        }
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách món ăn');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, categoryFilter]);

  const refetch = async () => {
    try {
      const data = await productsService.list({
        page,
        limit: 10,
        search: search || undefined,
        categoryId: categoryFilter || undefined,
      });
      setProducts(data.products);
      setMeta(data.meta);
    } catch {
      toast.error('Không thể tải danh sách món ăn');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await productsService.updateAvailability(product.id, !product.isAvailable);
      toast.success(product.isAvailable ? 'Đã tạm ẩn món' : 'Đã mở bán món');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await productsService.delete(deleteTarget.id);
      toast.success('Đã xóa món ăn');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên món..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
        >
          <option value="" className="bg-[#1a1a1a]">
            Tất cả danh mục
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#1a1a1a]">
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm món
        </button>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onEdit={(p) => {
          setEditProduct(p);
          setShowForm(true);
        }}
        onDelete={setDeleteTarget}
        onToggleAvailability={handleToggleAvailability}
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{meta.total} món ăn</p>
          <div className="flex gap-1">
            {[...Array(meta.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs transition-all ${
                  page === i + 1
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <ProductForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditProduct(null);
        }}
        onSuccess={refetch}
        product={editProduct}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#161616] border-white/[0.08] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa món &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Hành động này không thể hoàn tác.
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
