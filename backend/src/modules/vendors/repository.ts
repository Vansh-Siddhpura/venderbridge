import prisma from '../../config/database';
import { VendorStatus, Prisma } from '@prisma/client';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';

// ── Vendors ───────────────────────────────────────────────────────────────────

export const findVendors = async (params: {
  skip: number;
  take: number;
  search?: string;
  status?: VendorStatus;
  categoryId?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) => {
  const where: Prisma.VendorWhereInput = {
    deletedAt: null,
    ...(params.status && { status: params.status }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.search && {
      OR: [
        { companyName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      skip: params.skip,
      take: params.take,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.vendor.count({ where }),
  ]);

  return { vendors, total };
};

export const findVendorById = async (id: string) => {
  return prisma.vendor.findFirst({
    where: { id, deletedAt: null },
    include: { category: { select: { id: true, name: true } } },
  });
};

export const findVendorByEmail = async (email: string) => {
  return prisma.vendor.findFirst({ where: { email, deletedAt: null } });
};

export const createVendor = async (
  data: Prisma.VendorCreateInput,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.create({ data });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.VENDOR_REGISTERED,
        entityType: ENTITY_TYPES.VENDOR,
        entityId: vendor.id,
        metadata: { after: { companyName: vendor.companyName } },
        ipAddress: ip,
      },
    });
    return vendor;
  });
};

export const updateVendor = async (
  id: string,
  data: Prisma.VendorUpdateInput,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.update({ where: { id }, data });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.VENDOR_UPDATED,
        entityType: ENTITY_TYPES.VENDOR,
        entityId: id,
        metadata: {},
        ipAddress: ip,
      },
    });
    return vendor;
  });
};

export const updateVendorStatus = async (
  id: string,
  status: VendorStatus,
  notes: string | undefined,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.findFirst({ where: { id, deletedAt: null } });
    const vendor_updated = await tx.vendor.update({
      where: { id },
      data: { status, ...(notes && { notes }) },
    });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.VENDOR_STATUS_UPDATED,
        entityType: ENTITY_TYPES.VENDOR,
        entityId: id,
        metadata: { before: { status: vendor?.status }, after: { status } },
        ipAddress: ip,
      },
    });
    return vendor_updated;
  });
};

export const softDeleteVendor = async (id: string) => {
  return prisma.vendor.update({ where: { id }, data: { deletedAt: new Date() } });
};

// ── Vendor Categories ─────────────────────────────────────────────────────────

export const findCategories = async (search?: string) => {
  return prisma.vendorCategory.findMany({
    where: {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    orderBy: { name: 'asc' },
  });
};

export const findCategoryById = async (id: string) => {
  return prisma.vendorCategory.findFirst({ where: { id, deletedAt: null } });
};

export const createCategory = async (data: { name: string; description?: string }) => {
  return prisma.vendorCategory.create({ data });
};

export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string }
) => {
  return prisma.vendorCategory.update({ where: { id }, data });
};

export const softDeleteCategory = async (id: string) => {
  return prisma.vendorCategory.update({ where: { id }, data: { deletedAt: new Date() } });
};
