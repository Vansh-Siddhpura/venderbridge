import { z } from 'zod';

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(['PAID', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
});

export const ListInvoicesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['SENT', 'OVERDUE', 'PAID', 'CANCELLED']).optional(),
  vendorId: z.string().uuid().optional(),
  poId: z.string().uuid().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>;
export type ListInvoicesQuery = z.infer<typeof ListInvoicesQuerySchema>;
