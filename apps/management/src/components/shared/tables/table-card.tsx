/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Table } from '@/types';
import { tablesService } from '@/services/tables.service';
import { toast } from 'sonner';
import { useState } from 'react';
import { Users, QrCode, Pencil, Trash2, RefreshCw, Download, Loader2, Printer } from 'lucide-react';
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

interface Props {
  table: Table;
  onEdit: (table: Table) => void;
  onDeleted: () => void;
}

export default function TableCard({ table, onEdit, onDeleted }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOccupied = table.status === 'occupied';

  const handleDelete = async () => {
    setLoading('delete');
    try {
      await tablesService.delete(table.id);
      toast.success('Đã xóa bàn');
      onDeleted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(null);
    }
  };

  const handleRegenerateQR = async () => {
    setLoading('qr');
    try {
      await tablesService.regenerateQR(table.id);
      toast.success('Đã tạo lại QR code');
      onDeleted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadQR = () => {
    if (!table.qrCode) return;
    const link = document.createElement('a');
    link.href = table.qrCode;
    link.download = `qr-ban-${table.tableNumber}.png`;
    link.click();
  };

  const handlePrintQR = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/tables/${table.id}/qr/print`, '_blank');
  };

  return (
    <>
      <div
        className={cn(
          'bg-white/[0.03] border rounded-2xl p-5 flex flex-col gap-4 transition-all',
          isOccupied ? 'border-orange-500/30' : 'border-white/[0.06]'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-white">Bàn {table.tableNumber}</h3>
              <span
                className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                  isOccupied
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                )}
              >
                {isOccupied ? 'Đang dùng' : 'Trống'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500">
              <Users className="w-3 h-3" />
              <span className="text-xs">{table.capacity} ghế</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(table)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={!!loading || isOccupied}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading === 'delete' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* QR */}
        <div className="bg-white/[0.03] rounded-xl p-3">
          {showQR && table.qrCode ? (
            <img src={table.qrCode} alt="QR" className="w-full aspect-square rounded-lg" />
          ) : (
            <div
              onClick={() => setShowQR(true)}
              className="w-full aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.03] rounded-lg transition-all"
            >
              <QrCode className="w-8 h-8 text-zinc-600" />
              <p className="text-xs text-zinc-600">Xem QR</p>
            </div>
          )}
        </div>

        {/* QR Actions */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleRegenerateQR}
            disabled={!!loading}
            className="flex items-center justify-center gap-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white text-[11px] rounded-xl py-2 transition-all"
          >
            {loading === 'qr' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Gen lại
          </button>
          <button
            onClick={handleDownloadQR}
            disabled={!table.qrCode}
            className="flex items-center justify-center gap-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white text-[11px] rounded-xl py-2 transition-all disabled:opacity-30"
          >
            <Download className="w-3 h-3" />
            Tải PNG
          </button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#161616] border-white/[0.08] text-white [&>div:last-child]:bg-[#161616]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bàn {table.tableNumber}?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.05] border-white/[0.12] text-zinc-300 hover:text-white hover:bg-white/[0.08]">
              Hủy
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
