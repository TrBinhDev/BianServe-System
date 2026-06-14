/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";
import { ApiResponse } from "@/types";

interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export const statisticsService = {
  getDashboard: async () => {
    const { data } = await api.get<ApiResponse<any>>("/admin/statistics/dashboard");
    return data.data;
  },

  getRevenue: async (params?: DateRangeParams & { type?: "day" | "week" | "month" | "year" }) => {
    const { data } = await api.get<ApiResponse<any>>("/admin/statistics/revenue", { params });
    return data.data;
  },

  getOrders: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>("/admin/statistics/orders", { params });
    return data.data;
  },

  getProducts: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>("/admin/statistics/products", { params });
    return data.data;
  },

  getTables: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>("/admin/statistics/tables", { params });
    return data.data;
  },

  getPromotions: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>("/admin/statistics/promotions", { params });
    return data.data;
  },

  exportRevenue: (params?: DateRangeParams & { format?: "excel" | "pdf" }) => {
    const query = new URLSearchParams(params as any).toString();
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/statistics/export/revenue?${query}`);
  },

  exportOrders: (params?: DateRangeParams) => {
    const query = new URLSearchParams(params as any).toString();
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/statistics/export/orders?${query}`);
  },

  exportProducts: (params?: DateRangeParams) => {
    const query = new URLSearchParams(params as any).toString();
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/statistics/export/products?${query}`);
  },
};