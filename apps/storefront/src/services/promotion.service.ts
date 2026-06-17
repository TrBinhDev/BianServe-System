import api from '@/lib/axios';
import { ApiResponse, Promotion } from '@/types';

export const promotionService = {
  getActivePromotions: async () => {
    const { data } = await api.get<ApiResponse<Promotion[]>>('/promotions');
    return data.data;
  },

  previewPromotion: async (
    code: string,
    items: { productId: string; quantity: number }[],
    userSessionId: string
  ) => {
    const { data } = await api.post<
      ApiResponse<{
        promotionId: string;
        code: string;
        discountAmount: number;
        finalAmount: number;
      }>
    >('/promotions/preview', { code, items, userSessionId });
    return data.data;
  },

  applyPromotion: async (code: string, orderId: string, userSessionId: string) => {
    const { data } = await api.post<
      ApiResponse<{
        promotionId: string;
        code: string;
        discountAmount: number;
        finalAmount: number;
      }>
    >('/promotions/apply', { code, orderId, userSessionId });
    return data.data;
  },
};
