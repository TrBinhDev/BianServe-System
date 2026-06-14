import api from "@/lib/axios";
import { ApiResponse, Promotion, PaginationMeta } from "@/types";

interface ListPromotionsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export const promotionsService = {
  list: async (params?: ListPromotionsParams) => {
    const { data } = await api.get<ApiResponse<{ promotions: Promotion[]; meta: PaginationMeta }>>("/admin/promotions", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Promotion>>(`/admin/promotions/${id}`);
    return data.data;
  },

  create: async (payload: Partial<Promotion> & { productIds?: string[]; categoryIds?: string[] }) => {
    const { data } = await api.post<ApiResponse<Promotion>>("/admin/promotions", payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<Promotion> & { productIds?: string[]; categoryIds?: string[] }) => {
    const { data } = await api.put<ApiResponse<Promotion>>(`/admin/promotions/${id}`, payload);
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/promotions/${id}`);
  },
};