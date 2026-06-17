import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  tableId: string | null;
  setTableId: (id: string) => void;
  addItem: (item: Omit<CartItem, 'quantity' | 'note'>) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableId: null,

  setTableId: (id) => set({ tableId: id }),

  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      set((state) => ({ items: [...state.items, { ...item, quantity: 1, note: '' }] }));
    }
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => i.productId === productId ? { ...i, quantity } : i),
    }));
  },

  updateNote: (productId, note) => {
    set((state) => ({
      items: state.items.map((i) => i.productId === productId ? { ...i, note } : i),
    }));
  },

  removeItem: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
  },

  clearCart: () => set({ items: [] }),

  totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));