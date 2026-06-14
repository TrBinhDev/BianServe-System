import api from "@/lib/axios";
import { ApiResponse, Account, PaginationMeta } from "@/types";

interface ListAccountsParams {
  page?: number;
  limit?: number;
  role?: "admin" | "staff";
  is_active?: boolean;
  search?: string;
}

export const accountsService = {
  list: async (params?: ListAccountsParams) => {
    const { data } = await api.get<ApiResponse<{ accounts: Account[]; meta: PaginationMeta }>>("/admin/accounts", { params });
    return data.data;
  },

  create: async (payload: { code: string; password: string; role: "admin" | "staff" }) => {
    const { data } = await api.post<ApiResponse<Account>>("/admin/accounts", payload);
    return data.data;
  },

  changePassword: async (id: string, password: string) => {
    await api.patch(`/admin/accounts/${id}/password`, { password });
  },

  changeStatus: async (id: string, isActive: boolean) => {
    await api.patch(`/admin/accounts/${id}/status`, { isActive });
  },
};