'use client';

import { Category } from '@/types';
import MenuItem from './menu-item';

interface Props {
  category: Category;
}

export default function MenuCategory({ category }: Props) {
  if (!category.products.length) return null;

  return (
    <div id={`cat-${category.id}`} className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-orange-500 rounded-full" />
        <h2 className="text-sm font-semibold text-white">{category.name}</h2>
        <span className="text-xs text-zinc-600">{category.products.length} món</span>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4">
        {category.products.map((product) => (
          <MenuItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
