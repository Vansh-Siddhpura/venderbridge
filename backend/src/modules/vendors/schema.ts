import { z } from 'zod';

const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().default('India'),
});

export const CreateVendorSchema = z.object({
  companyName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  contactPerson: z.string().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  address: AddressSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const UpdateVendorStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING']),
  notes: z.string().max(500).optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const ListVendorsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  categoryId: z.string().uuid().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
export type UpdateVendorStatusInput = z.infer<typeof UpdateVendorStatusSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type ListVendorsQuery = z.infer<typeof ListVendorsQuerySchema>;
