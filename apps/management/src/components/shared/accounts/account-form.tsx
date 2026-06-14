/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { accountsService } from '@/services/accounts.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AccountForm({ open, onClose, onSuccess }: Props) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !password) return;
    setLoading(true);
    try {
      await accountsService.create({ code, password, role });
      toast.success('Tạo tài khoản thành công');
      setCode('');
      setPassword('');
      setRole('staff');
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
          <DialogTitle className="text-base font-semibold">Thêm tài khoản</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mã nhân viên (10 ký tự)</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: STAFF00001" maxLength={10} disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mật khẩu (8 ký tự)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" maxLength={8} disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Vai trò</label>
            <div className="grid grid-cols-2 gap-2">
              {(['staff', 'admin'] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${role === r ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:border-white/[0.15]'}`}>
                  {r === 'staff' ? 'Nhân viên' : 'Quản lý'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-sm font-medium rounded-xl py-2.5 transition-all">Hủy</button>
            <button type="submit" disabled={loading || !code || !password}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-all">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Tạo tài khoản
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}