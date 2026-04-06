import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

export const trendsQuerySchema = z.object({
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  group_by: z.enum(['day', 'month']).default('month'),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
