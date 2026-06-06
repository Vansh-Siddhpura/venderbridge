import { z } from 'zod';

export const UpdatePOStatusSchema = z.object({
  status: z.enum(['ACKNOWLEDGED', 'FULFILLED', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
});

export const ListPOsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'ACKNOWLEDGED', 'FULFILLED', 'CANCELLED']).optional(),
  vendorId: z.string().uuid().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type UpdatePOStatusInput = z.infer<typeof UpdatePOStatusSchema>;
export type ListPOsQuery = z.infer<typeof ListPOsQuerySchema>;
