import api from "@/lib/axios";
import { ApiResponse, Table, PaginationMeta } from "@/types";

interface ListTablesParams {
  page?: number;
  limit?: number;
  status?: "available" | "occupied";
  search?: string;
}

export const tablesService = {
  list: async (params?: ListTablesParams) => {
    const { data } = await api.get<ApiResponse<{ tables: Table[]; meta: PaginationMeta }>>("/admin/tables", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Table>>(`/admin/tables/${id}`);
    return data.data;
  },

  create: async (payload: { tableNumber: string; capacity: number }) => {
    const { data } = await api.post<ApiResponse<Table>>("/admin/tables", payload);
    return data.data;
  },

  update: async (id: string, payload: { tableNumber?: string; capacity?: number }) => {
    const { data } = await api.put<ApiResponse<Table>>(`/admin/tables/${id}`, payload);
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/tables/${id}`);
  },

  getQR: async (id: string) => {
    const { data } = await api.get<ApiResponse<{ qrCode: string }>>(`/admin/tables/${id}/qr`);
    return data.data;
  },

  regenerateQR: async (id: string) => {
    const { data } = await api.post<ApiResponse<{ qrCode: string }>>(`/admin/tables/${id}/qr/regenerate`);
    return data.data;
  },
};