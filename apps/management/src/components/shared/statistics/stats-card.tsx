'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  loading?: boolean;
  sub?: string;
}

export default function StatsCard({ label, value, icon: Icon, color, bg, border, loading, sub }: Props) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-1">{label}</p>
        <p className={cn('text-xl font-semibold', loading ? 'text-zinc-600' : 'text-white')}>
          {loading ? '...' : value}
        </p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}