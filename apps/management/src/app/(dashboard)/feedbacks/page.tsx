'use client';

import { useEffect, useState } from 'react';
import { feedbacksService } from '@/services/feedbacks.service';
import { Feedback, PaginationMeta } from '@/types';
import FeedbackTable from '@/components/shared/feedbacks/feedback-table';
import { Search, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await feedbacksService.list({
          page,
          limit: 10,
          search: search || undefined,
          rating: ratingFilter || undefined,
        });
        if (!cancelled) {
          setFeedbacks(data.feedbacks);
          setMeta(data.meta);
        }
      } catch {
        if (!cancelled) toast.error('Không thể tải đánh giá');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, search, ratingFilter]);

  const refetch = async () => {
    try {
      const data = await feedbacksService.list({ page, limit: 10, search: search || undefined, rating: ratingFilter || undefined });
      setFeedbacks(data.feedbacks);
      setMeta(data.meta);
    } catch {
      toast.error('Không thể tải đánh giá');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await feedbacksService.delete(deleteTarget.id);
      toast.success('Đã xóa đánh giá');
      setDeleteTarget(null);
      refetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Tính điểm trung bình
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4">
          <p className="text-xs text-zinc-500 mb-1">Tổng đánh giá</p>
          <p className="text-2xl font-semibold text-white">{meta?.total ?? 0}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4">
          <p className="text-xs text-zinc-500 mb-1">Điểm trung bình</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-yellow-400">{avgRating}</p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4">
          <p className="text-xs text-zinc-500 mb-1">5 sao</p>
          <p className="text-2xl font-semibold text-emerald-400">
            {feedbacks.filter((f) => f.rating === 5).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm nội dung nhận xét..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50" />
        </div>

        {/* Rating filter */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          <button onClick={() => { setRatingFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${ratingFilter === '' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-white'}`}>
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => { setRatingFilter(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${ratingFilter === r ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-white'}`}>
              {r} <Star className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      <FeedbackTable feedbacks={feedbacks} loading={loading} onDelete={setDeleteTarget} />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{meta.total} đánh giá</p>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#161616] border-white/[0.08] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đánh giá này?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Đánh giá của đơn hàng {deleteTarget?.order.orderCode} sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400">
              {deleteLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}