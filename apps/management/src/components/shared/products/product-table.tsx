'use client';

import { Product } from '@/types';
import { Pencil, Trash2, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
}

export default function ProductTable({ products, loading, onEdit, onDelete, onToggleAvailability }: Props) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Món ăn', 'Danh mục', 'Giá', 'Trạng thái', ''].map((h) => (
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
          ) : products.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-sm text-zinc-500 py-12">Chưa có món ăn nào</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-9 h-9 rounded-lg object-cover bg-white/[0.05]" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center">
                        <ImageOff className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-white">{product.name}</p>
                      {product.description && <p className="text-xs text-zinc-500 truncate max-w-48">{product.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">{product.category?.name}</td>
                <td className="px-5 py-4 text-sm text-orange-400 font-medium">
                  {Number(product.price).toLocaleString('vi-VN')}đ
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => onToggleAvailability(product)}
                    className={cn(
                      'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all',
                      product.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20'
                    )}
                  >
                    {product.isAvailable ? 'Đang bán' : 'Tạm hết'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}