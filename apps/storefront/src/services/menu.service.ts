import api from '@/lib/axios';
import { ApiResponse, Category } from '@/types';

export const menuService = {
  getMenu: async () => {
    const { data } = await api.get<ApiResponse<Category[]>>('/menu');
    return data.data;
  },
};