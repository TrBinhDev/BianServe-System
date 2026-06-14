/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { promotionsService } from '@/services/promotions.service';
import { Promotion, PaginationMeta } from '@/types';
import { useSocketStore } from '@/stores/socket.store';
import PromotionTable from '@/components/shared/promotions/promotion-table';
import PromotionForm from '@/components/shared/promotions/promotion-form';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { socket } = useSocketStore();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await promotionsService.list({ page, limit: 10 });
        if (!cancelled) {
          setPromotions(data.promotions);
          setMeta(data.meta);
        }
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách khuyến mãi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page]);

  const refetch = async () => {
    try {
      const data = await promotionsService.list({ page, limit: 10 });
      setPromotions(data.promotions);
      setMeta(data.meta);
    } catch {
      toast.error('Không thể tải danh sách khuyến mãi');
    }
  };

  // Realtime socket
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => setTimeout(() => refetch(), 0);
    socket.on('promotions_updated', handleUpdate);
    return () => { socket.off('promotions_updated', handleUpdate); };
  }, [socket]);

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await promotionsService.update(promotion.id, { isActive: !promotion.isActive } as any);
      toast.success(promotion.isActive ? 'Đã tắt khuyến mãi' : 'Đã bật khuyến mãi');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await promotionsService.delete(deleteTarget.id);
      toast.success('Đã xóa khuyến mãi');
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{meta?.total ?? 0} khuyến mãi</p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all">
          <Plus className="w-4 h-4" /> Thêm khuyến mãi
        </button>
      </div>

      <PromotionTable
        promotions={promotions}
        loading={loading}
        onEdit={(p) => { setEditPromotion(p); setShowForm(true); }}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{meta.total} khuyến mãi</p>
          <div className="flex gap-1">
            {[...Array(meta.totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs transition-all ${page === i + 1 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/[0.05]'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <PromotionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditPromotion(null); }}
        onSuccess={refetch}
        promotion={editPromotion}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#161616] border-white/[0.08] text-white [&>div:last-child]:bg-[#161616]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khuyến mãi &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400">
              {deleteLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}