import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required').max(100),
  date: z
    .string()
    .datetime({ message: 'date must be a valid ISO 8601 datetime' })
    .refine((val) => new Date(val) <= new Date(), { message: 'date cannot be in the future' }),
  notes: z.string().max(500).optional(),
});

export const updateRecordSchema = z
  .object({
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1).max(100).optional(),
    date: z
      .string()
      .datetime({ message: 'date must be a valid ISO 8601 datetime' })
      .refine((val) => new Date(val) <= new Date(), { message: 'date cannot be in the future' })
      .optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined).length > 0,
    { message: 'At least one field must be provided' },
  );

export const recordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  min_amount: z.coerce.number().positive().optional(),
  max_amount: z.coerce.number().positive().optional(),
  sort: z.enum(['date_asc', 'date_desc', 'amount_asc', 'amount_desc']).default('date_desc'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordQuery = z.infer<typeof recordQuerySchema>;
