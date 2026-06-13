import { z } from "zod";

export const dateRangeSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const revenueSchema = dateRangeSchema.extend({
  type: z.enum(["day", "week", "month", "year"]).default("month"),
});

export const exportSchema = dateRangeSchema.extend({
  format: z.enum(["excel", "pdf"]).default("excel"),
});

export type DateRangeQuery = z.infer<typeof dateRangeSchema>;
export type RevenueQuery = z.infer<typeof revenueSchema>;
export type ExportQuery = z.infer<typeof exportSchema>;