import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Tên món không được để trống"),
  description: z.string().optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid("Category ID không hợp lệ"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
});

export const availabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const listProductsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  categoryId: z.string().uuid().optional(),
  isAvailable: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type ListProductsQuery = z.infer<typeof listProductsSchema>;