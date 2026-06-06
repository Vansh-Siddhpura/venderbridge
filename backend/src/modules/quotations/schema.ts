import { z } from 'zod';

const QuotationItemSchema = z.object({
  rfqItemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  unitPrice: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export const CreateQuotationSchema = z.object({
  rfqId: z.string().uuid(),
  validUntil: z.string().datetime().optional(),
  terms: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(QuotationItemSchema).min(1),
});

export const UpdateQuotationSchema = z.object({
  validUntil: z.string().datetime().optional(),
  terms: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(QuotationItemSchema).min(1).optional(),
});

export const ListQuotationsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  rfqId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'SHORTLISTED', 'REJECTED', 'SELECTED']).optional(),
  vendorId: z.string().uuid().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof UpdateQuotationSchema>;
export type ListQuotationsQuery = z.infer<typeof ListQuotationsQuerySchema>;
