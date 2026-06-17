'use client';

import { UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-zinc-800/50 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <UtensilsCrossed className="w-9 h-9 text-zinc-600" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Bàn không tồn tại</h1>
        <p className="text-sm text-zinc-500 mb-1">QR code không hợp lệ hoặc bàn đã bị xóa.</p>
        <p className="text-sm text-zinc-600">Vui lòng quét lại mã QR trên bàn.</p>
      </div>
    </div>
  );
}