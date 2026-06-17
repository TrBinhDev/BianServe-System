'use client';

import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/stores/cart.store';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const { updateQuantity, updateNote, removeItem } = useCartStore();
  const [showNote, setShowNote] = useState(!!item.note);

  return (
    <div className="py-3 border-b border-white/[0.04] last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{item.name}</p>
          <p className="text-xs text-orange-400 mt-0.5">
            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-95 transition-transform"
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
          <span className="text-sm font-semibold text-white w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={() => removeItem(item.productId)}
            className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center active:scale-95 transition-transform ml-1"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {/* Ghi chú */}
      {showNote ? (
        <input
          value={item.note}
          onChange={(e) => updateNote(item.productId, e.target.value)}
          placeholder="Ghi chú cho món này..."
          className="mt-2 w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
        />
      ) : (
        <button
          onClick={() => setShowNote(true)}
          className="mt-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          + Thêm ghi chú
        </button>
      )}
    </div>
  );
}

