'use client';

import { Product } from '@/types';
import { useCartStore } from '@/stores/cart.store';
import { Plus, Minus, ImageOff } from 'lucide-react';

interface Props {
  product: Product;
}

export default function MenuItem({ product }: Props) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      {/* Ảnh */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/[0.05]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-5 h-5 text-zinc-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{product.name}</p>
        {product.description && (
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{product.description}</p>
        )}
        <p className="text-sm font-semibold text-orange-400 mt-1">
          {Number(product.price).toLocaleString('vi-VN')}đ
        </p>
      </div>

      {/* Quantity control */}
      {quantity === 0 ? (
        <button
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              price: Number(product.price), 
            })
          }
          className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-95 transition-transform"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <span className="text-sm font-semibold text-white w-4 text-center">{quantity}</span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
