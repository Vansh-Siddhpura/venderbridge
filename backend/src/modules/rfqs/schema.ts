import { z } from 'zod';

export const CreateRFQSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(2000).optional(),
  deadline: z.string().datetime().optional(),
});

export const UpdateRFQSchema = CreateRFQSchema.partial();

export const AssignVendorsSchema = z.object({
  vendorIds: z.array(z.string().uuid()).min(1, 'At least one vendor required'),
});

export const ListRFQsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// RFQ Items
export const CreateRFQItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  specifications: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateRFQItemSchema = CreateRFQItemSchema.partial();

export const BulkCreateRFQItemsSchema = z.object({
  items: z.array(CreateRFQItemSchema).min(1),
});

export type CreateRFQInput = z.infer<typeof CreateRFQSchema>;
export type UpdateRFQInput = z.infer<typeof UpdateRFQSchema>;
export type AssignVendorsInput = z.infer<typeof AssignVendorsSchema>;
export type ListRFQsQuery = z.infer<typeof ListRFQsQuerySchema>;
export type CreateRFQItemInput = z.infer<typeof CreateRFQItemSchema>;
export type UpdateRFQItemInput = z.infer<typeof UpdateRFQItemSchema>;
export type BulkCreateRFQItemsInput = z.infer<typeof BulkCreateRFQItemsSchema>;
