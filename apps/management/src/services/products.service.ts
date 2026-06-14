import api from "@/lib/axios";
import { ApiResponse, Product, PaginationMeta } from "@/types";

interface ListProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  isAvailable?: boolean;
  search?: string;
}

export const productsService = {
  list: async (params?: ListProductsParams) => {
    const { data } = await api.get<ApiResponse<{ products: Product[]; meta: PaginationMeta }>>("/admin/products", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return data.data;
  },

  create: async (payload: { name: string; description?: string; price: number; imageUrl?: string; categoryId: string }) => {
    const { data } = await api.post<ApiResponse<Product>>("/admin/products", payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<{ name: string; description: string; price: number; imageUrl: string; categoryId: string }>) => {
    const { data } = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, payload);
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/products/${id}`);
  },

  updateAvailability: async (id: string, isAvailable: boolean) => {
    const { data } = await api.patch<ApiResponse<Product>>(`/admin/products/${id}/availability`, { isAvailable });
    return data.data;
  },
};