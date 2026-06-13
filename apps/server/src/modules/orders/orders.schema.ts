import { z } from "zod";

export const createOrderSchema = z.object({
  tableId: z.string().uuid("Table ID không hợp lệ"),
  items: z.array(z.object({
    productId: z.string().uuid("Product ID không hợp lệ"),
    quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
    note: z.string().optional(),
  })).min(1, "Đơn hàng phải có ít nhất 1 món"),
});

export const addItemSchema = z.object({
  productId: z.string().uuid("Product ID không hợp lệ"),
  quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
  note: z.string().optional(),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
  note: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  cancelReason: z.string().min(1, "Lý do hủy không được để trống"),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  tableId: z.string().uuid().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>;