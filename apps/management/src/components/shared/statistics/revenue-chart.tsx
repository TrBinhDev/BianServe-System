/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: Record<string, number>;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-orange-400">
        {Number(payload[0].value).toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
};

export default function RevenueChart({ data, loading }: Props) {
  const chartData = Object.entries(data || {}).map(([key, value]) => ({ date: key, revenue: value }));

  if (loading) {
    return <div className="h-64 bg-white/[0.02] rounded-xl animate-pulse" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-zinc-500">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2}
          fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#f97316' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}