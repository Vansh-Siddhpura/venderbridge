import { VendorStatus, UserRole } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES } from '../../config/constants';
import { getPaginationParams } from '../../utils';
import { sendVendorApprovedEmail } from '../../utils/email';
import * as repo from './repository';
import type {
  CreateVendorInput,
  UpdateVendorInput,
  UpdateVendorStatusInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListVendorsQuery,
} from './schema';

// ── Vendors ───────────────────────────────────────────────────────────────────

export const listVendors = async (query: ListVendorsQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  const { vendors, total } = await repo.findVendors({
    skip,
    take: limit,
    search: query.search,
    status: query.status as VendorStatus | undefined,
    categoryId: query.categoryId,
    sortBy: sortBy === 'createdAt' ? 'createdAt' : sortBy,
    sortOrder,
  });
  return { vendors, total, page, limit };
};

export const getVendor = async (id: string) => {
  const vendor = await repo.findVendorById(id);
  if (!vendor) throw new AppError(ERROR_CODES.NOT_FOUND, 'Vendor not found', 404);
  return vendor;
};

export const createVendor = async (input: CreateVendorInput, userId: string, ip: string) => {
  const existing = await repo.findVendorByEmail(input.email);
  if (existing) throw new AppError(ERROR_CODES.CONFLICT, 'Vendor email already exists', 409);

  return repo.createVendor(
    {
      companyName: input.companyName,
      email: input.email,
      phone: input.phone,
      gstin: input.gstin,
      pan: input.pan,
      contactPerson: input.contactPerson,
      notes: input.notes,
      address: input.address ?? undefined,
      ...(input.categoryId && { category: { connect: { id: input.categoryId } } }),
    },
    userId,
    ip
  );
};

export const updateVendor = async (
  id: string,
  input: UpdateVendorInput,
  requesterId: string,
  requesterRole: UserRole,
  requesterVendorId: string | undefined,
  ip: string
) => {
  const vendor = await repo.findVendorById(id);
  if (!vendor) throw new AppError(ERROR_CODES.NOT_FOUND, 'Vendor not found', 404);

  if (requesterRole === UserRole.VENDOR && requesterVendorId !== id) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'Cannot update another vendor profile', 403);
  }

  return repo.updateVendor(
    id,
    {
      ...(input.companyName && { companyName: input.companyName }),
      ...(input.email && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.gstin !== undefined && { gstin: input.gstin }),
      ...(input.pan !== undefined && { pan: input.pan }),
      ...(input.contactPerson !== undefined && { contactPerson: input.contactPerson }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.address !== undefined && { address: input.address ?? undefined }),
      ...(input.categoryId !== undefined && {
        category: input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true },
      }),
    },
    requesterId,
    ip
  );
};

export const updateVendorStatus = async (
  id: string,
  input: UpdateVendorStatusInput,
  userId: string,
  ip: string
) => {
  const vendor = await repo.findVendorById(id);
  if (!vendor) throw new AppError(ERROR_CODES.NOT_FOUND, 'Vendor not found', 404);

  const updated = await repo.updateVendorStatus(
    id,
    input.status as VendorStatus,
    input.notes,
    userId,
    ip
  );

  if (input.status === 'APPROVED') {
    const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
    await sendVendorApprovedEmail(vendor.email, vendor.companyName, frontendUrl).catch(() => {});
  }

  return updated;
};

// ── Vendor Categories ─────────────────────────────────────────────────────────

export const listCategories = async (search?: string) => {
  return repo.findCategories(search);
};

export const getCategory = async (id: string) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw new AppError(ERROR_CODES.NOT_FOUND, 'Category not found', 404);
  return cat;
};

export const createCategory = async (input: CreateCategoryInput) => {
  return repo.createCategory(input);
};

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw new AppError(ERROR_CODES.NOT_FOUND, 'Category not found', 404);
  return repo.updateCategory(id, input);
};

export const deleteCategory = async (id: string) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw new AppError(ERROR_CODES.NOT_FOUND, 'Category not found', 404);
  return repo.softDeleteCategory(id);
};
