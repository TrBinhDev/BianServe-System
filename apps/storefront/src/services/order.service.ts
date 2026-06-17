import api from '@/lib/axios';
import { ApiResponse, Order } from '@/types';
import { CartItem } from '@/types';

export const orderService = {
  createOrder: async (tableId: string, items: CartItem[]) => {
    const { data } = await api.post<ApiResponse<Order>>('/orders', {
      tableId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        note: i.note || undefined,
      })),
    });
    return data.data;
  },

  getOrder: async (orderId: string) => {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return data.data;
  },

  addItem: async (orderId: string, item: { productId: string; quantity: number; note?: string }) => {
    const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/items`, item);
    return data.data;
  },

  updateItem: async (orderId: string, itemId: string, payload: { quantity: number; note?: string }) => {
    const { data } = await api.put<ApiResponse<Order>>(`/orders/${orderId}/items/${itemId}`, payload);
    return data.data;
  },

  deleteItem: async (orderId: string, itemId: string) => {
    await api.delete(`/orders/${orderId}/items/${itemId}`);
  },
};