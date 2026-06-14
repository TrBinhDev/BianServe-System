import api from "@/lib/axios";
import { ApiResponse, Category } from "@/types";

export const categoriesService = {
  list: async () => {
    const { data } = await api.get<ApiResponse<Category[]>>("/admin/categories");
    return data.data;
  },

  create: async (payload: { name: string; sortOrder?: number }) => {
    const { data } = await api.post<ApiResponse<Category>>("/admin/categories", payload);
    return data.data;
  },

  update: async (id: string, payload: { name?: string; sortOrder?: number; isActive?: boolean }) => {
    const { data } = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/categories/${id}`);
  },
};