/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';
import { ApiResponse } from '@/types';

interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export const statisticsService = {
  getDashboard: async () => {
    const { data } = await api.get<ApiResponse<any>>('/admin/statistics/dashboard');
    return data.data;
  },

  getRevenue: async (params?: DateRangeParams & { type?: 'day' | 'week' | 'month' | 'year' }) => {
    const { data } = await api.get<ApiResponse<any>>('/admin/statistics/revenue', { params });
    return data.data;
  },

  getOrders: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>('/admin/statistics/orders', { params });
    return data.data;
  },

  getProducts: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>('/admin/statistics/products', { params });
    return data.data;
  },

  getTables: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>('/admin/statistics/tables', { params });
    return data.data;
  },

  getPromotions: async (params?: DateRangeParams) => {
    const { data } = await api.get<ApiResponse<any>>('/admin/statistics/promotions', { params });
    return data.data;
  },

  exportRevenue: async (params?: DateRangeParams & { format?: 'excel' | 'pdf' }) => {
    const response = await api.get('/admin/statistics/export/revenue', {
      params,
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenue.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  },

  exportOrders: async (params?: DateRangeParams) => {
    const response = await api.get('/admin/statistics/export/orders', {
      params,
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  },

  exportProducts: async (params?: DateRangeParams) => {
    const response = await api.get('/admin/statistics/export/products', {
      params,
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'top-products.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  },
};
