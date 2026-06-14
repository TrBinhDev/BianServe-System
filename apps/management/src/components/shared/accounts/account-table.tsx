'use client';

import { Account } from '@/types';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { KeyRound, Lock, Unlock } from 'lucide-react';

interface Props {
  accounts: Account[];
  loading: boolean;
  currentUserId?: string;
  onChangePassword: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
}

export default function AccountTable({ accounts, loading, currentUserId, onChangePassword, onToggleStatus }: Props) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Mã nhân viên', 'Vai trò', 'Trạng thái', 'Ngày tạo', ''].map((h) => (
              <th key={h} className="text-left text-xs font-medium text-zinc-500 px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-white/[0.04]">
                {[...Array(5)].map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                ))}
              </tr>
            ))
          ) : accounts.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-sm text-zinc-500 py-12">Chưa có tài khoản nào</td></tr>
          ) : (
            accounts.map((account) => {
              const isSelf = account.id === currentUserId;
              return (
                <tr key={account.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-white">{account.code}</p>
                      {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Bạn</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-[11px] font-medium px-2.5 py-1 rounded-lg border',
                      account.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    )}>
                      {account.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-[11px] font-medium px-2.5 py-1 rounded-lg border',
                      account.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    )}>
                      {account.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-500">
                    {dayjs(account.createdAt).format('DD/MM/YYYY')}
                  </td>
                  <td className="px-5 py-4">
                    {!isSelf && (
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onChangePassword(account)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                          <KeyRound className="w-3.5 h-3.5" /> Đổi mật khẩu
                        </button>
                        <button onClick={() => onToggleStatus(account)}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                            account.isActive
                              ? 'text-red-400 hover:bg-red-500/[0.06]'
                              : 'text-emerald-400 hover:bg-emerald-500/[0.06]'
                          )}>
                          {account.isActive ? <><Lock className="w-3.5 h-3.5" /> Khóa</> : <><Unlock className="w-3.5 h-3.5" /> Mở khóa</>}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}