/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { accountsService } from '@/services/accounts.service';
import { Account, PaginationMeta } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import AccountTable from '@/components/shared/accounts/account-table';
import AccountForm from '@/components/shared/accounts/account-form';
import { Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AccountsPage() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Change password dialog
  const [passwordTarget, setPasswordTarget] = useState<Account | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toggle status dialog
  const [statusTarget, setStatusTarget] = useState<Account | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await accountsService.list({ page, limit: 10, search: search || undefined });
        if (!cancelled) {
          setAccounts(data.accounts);
          setMeta(data.meta);
        }
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách tài khoản');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, search]);

  const refetch = async () => {
    try {
      const data = await accountsService.list({ page, limit: 10, search: search || undefined });
      setAccounts(data.accounts);
      setMeta(data.meta);
    } catch {
      toast.error('Không thể tải danh sách tài khoản');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordTarget || !newPassword) return;
    setPasswordLoading(true);
    try {
      await accountsService.changePassword(passwordTarget.id, newPassword);
      toast.success('Đổi mật khẩu thành công');
      setPasswordTarget(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    setStatusLoading(true);
    try {
      await accountsService.changeStatus(statusTarget.id, !statusTarget.isActive);
      toast.success(statusTarget.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      setStatusTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm mã nhân viên..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50" />
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all">
          <Plus className="w-4 h-4" /> Thêm tài khoản
        </button>
      </div>

      <AccountTable
        accounts={accounts}
        loading={loading}
        currentUserId={user?.id}
        onChangePassword={setPasswordTarget}
        onToggleStatus={setStatusTarget}
      />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{meta.total} tài khoản</p>
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

      <AccountForm open={showForm} onClose={() => setShowForm(false)} onSuccess={refetch} />

      {/* Change password dialog */}
      <Dialog open={!!passwordTarget} onOpenChange={() => { setPasswordTarget(null); setNewPassword(''); }}>
        <DialogContent className="bg-[#161616] border-white/[0.08] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Đổi mật khẩu — {passwordTarget?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mật khẩu mới (8 ký tự)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" maxLength={8}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setPasswordTarget(null); setNewPassword(''); }}
                className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-sm font-medium rounded-xl py-2.5 transition-all">Hủy</button>
              <button onClick={handleChangePassword} disabled={passwordLoading || !newPassword}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 text-white text-sm font-medium rounded-xl py-2.5 transition-all">
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />} Xác nhận
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle status dialog */}
      <AlertDialog open={!!statusTarget} onOpenChange={() => setStatusTarget(null)}>
        <AlertDialogContent className="bg-[#161616] border-white/[0.08] text-white [&>div:last-child]:bg-[#161616]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.isActive ? 'Khóa' : 'Mở khóa'} tài khoản {statusTarget?.code}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              {statusTarget?.isActive ? 'Tài khoản sẽ bị đăng xuất ngay lập tức.' : 'Tài khoản sẽ có thể đăng nhập lại.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} disabled={statusLoading}
              className={statusTarget?.isActive ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'}>
              {statusLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {statusTarget?.isActive ? 'Khóa' : 'Mở khóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}