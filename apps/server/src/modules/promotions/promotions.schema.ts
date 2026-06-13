import { z } from "zod";

export const createPromotionSchema = z.object({
  name: z.string().min(1, "Tên khuyến mãi không được để trống"),
  code: z.string().min(1, "Mã khuyến mãi không được để trống"),
  type: z.enum(["PERCENT", "FIXED_AMOUNT"]),
  value: z.number().positive("Giá trị phải lớn hơn 0"),
  minOrderValue: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  dayOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  productIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export const applyPromotionSchema = z.object({
  code: z.string().min(1, "Mã khuyến mãi không được để trống"),
  orderId: z.string().uuid("Order ID không hợp lệ"),
  userSessionId: z.string().min(1, "Session ID không được để trống"),
});

export const listPromotionsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type ApplyPromotionInput = z.infer<typeof applyPromotionSchema>;
export type ListPromotionsQuery = z.infer<typeof listPromotionsSchema>;