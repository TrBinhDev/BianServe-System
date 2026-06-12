import { z } from "zod";

export const createAccountSchema = z.object({
  code: z.string().length(10, "Code must be exactly 10 characters"),
  password: z.string().length(8, "Password must be exactly 8 characters"),
  role: z.enum(["admin", "staff"]),
});

export const changePasswordSchema = z.object({
  password: z.string().length(8, "Password must be exactly 8 characters"),
});

export const changeStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listAccountsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  role: z.enum(["admin", "staff"]).optional(),
  is_active: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ListAccountsQuery = z.infer<typeof listAccountsSchema>;