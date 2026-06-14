/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { tablesService } from '@/services/tables.service';
import { Table } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  table?: Table | null;
}

export default function TableForm({ open, onClose, onSuccess, table }: Props) {
  const isEdit = !!table;
  const [tableNumber, setTableNumber] = useState(table?.tableNumber || '');
  const [capacity, setCapacity] = useState(table?.capacity?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber || !capacity) return;

    setLoading(true);
    try {
      if (isEdit) {
        await tablesService.update(table.id, {
          tableNumber,
          capacity: Number(capacity),
        });
        toast.success('Cập nhật bàn thành công');
      } else {
        await tablesService.create({ tableNumber, capacity: Number(capacity) });
        toast.success('Tạo bàn thành công');
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
            {isEdit ? 'Sửa bàn' : 'Thêm bàn mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Số bàn
            </label>
            <input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="VD: 01, A1, ..."
              disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Số ghế
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="VD: 4"
              disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-sm font-medium rounded-xl py-2.5 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !tableNumber || !capacity}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? 'Cập nhật' : 'Tạo bàn'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}