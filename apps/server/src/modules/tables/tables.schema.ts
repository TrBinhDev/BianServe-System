import { z } from "zod";

export const createTableSchema = z.object({
  tableNumber: z.string().min(1, "Số bàn không được để trống"),
  capacity: z.number().int().min(1, "Số ghế phải lớn hơn 0"),
});

export const updateTableSchema = z.object({
  tableNumber: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
});

export const listTablesSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.enum(["available", "occupied"]).optional(),
  search: z.string().optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type ListTablesQuery = z.infer<typeof listTablesSchema>;