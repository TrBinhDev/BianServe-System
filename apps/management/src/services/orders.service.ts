import api from "@/lib/axios";
import { ApiResponse, Order, PaginationMeta } from "@/types";

interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  tableId?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const ordersService = {
  list: async (params?: ListOrdersParams) => {
    const { data } = await api.get<ApiResponse<{ orders: Order[]; meta: PaginationMeta }>>("/admin/orders", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return data.data;
  },

  updateStatus: async (id: string, status: "confirmed" | "completed") => {
    const { data } = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
    return data.data;
  },

  cancel: async (id: string, cancelReason: string) => {
    const { data } = await api.post<ApiResponse<Order>>(`/admin/orders/${id}/cancel`, { cancelReason });
    return data.data;
  },
};