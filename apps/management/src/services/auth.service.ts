import api from "@/lib/axios";
import { ApiResponse, AuthResponse, User } from "@/types";

export const authService = {
  login: async (code: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", { code, password });
    return data.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", { refreshToken });
    return data.data;
  },
};