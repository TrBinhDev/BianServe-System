import api from "@/lib/axios";
import { ApiResponse, Feedback, PaginationMeta } from "@/types";

interface ListFeedbacksParams {
  page?: number;
  limit?: number;
  rating?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const feedbacksService = {
  list: async (params?: ListFeedbacksParams) => {
    const { data } = await api.get<ApiResponse<{ feedbacks: Feedback[]; meta: PaginationMeta }>>("/admin/feedbacks", { params });
    return data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/feedbacks/${id}`);
  },
};