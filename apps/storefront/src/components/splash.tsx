'use client';

import { useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';

interface Props {
  onDone: () => void;
}

export default function Splash({ onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 1800);
    const t3 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#0F0F0F] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-64 h-64 bg-orange-500/10 rounded-full blur-3xl transition-all duration-700 ${phase === 'hold' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
      </div>

      {/* Logo */}
      <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${phase === 'in' ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className="w-20 h-20 rounded-3xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
          <ChefHat className="w-10 h-10 text-orange-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">BianServe</h1>
          <p className="text-sm text-zinc-500 mt-1">Đặt món tại bàn</p>
        </div>
      </div>

      {/* Loading dots */}
      <div className={`absolute bottom-16 flex gap-1.5 transition-all duration-500 ${phase === 'hold' ? 'opacity-100' : 'opacity-0'}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}