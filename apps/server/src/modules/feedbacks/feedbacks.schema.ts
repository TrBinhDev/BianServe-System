import { z } from "zod";

export const createFeedbackSchema = z.object({
  orderId: z.string().uuid("Order ID không hợp lệ"),
  tableId: z.string().uuid("Table ID không hợp lệ"),
  rating: z.number().int().min(1).max(5, "Đánh giá từ 1 đến 5 sao"),
  comment: z.string().optional(),
});

export const listFeedbacksSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type ListFeedbacksQuery = z.infer<typeof listFeedbacksSchema>;