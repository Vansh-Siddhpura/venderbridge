import prisma from '../../config/database';
import { RFQStatus, RFQVendorStatus, Prisma } from '@prisma/client';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';

const rfqInclude = {
  creator: { select: { id: true, firstName: true, lastName: true, email: true } },
  items: { orderBy: { sortOrder: 'asc' as const } },
  rfqVendors: {
    include: { vendor: { select: { id: true, companyName: true, email: true, status: true } } },
  },
  _count: { select: { quotations: true } },
} satisfies Prisma.RFQInclude;

// ── RFQ CRUD ──────────────────────────────────────────────────────────────────

export const findRFQs = async (params: {
  skip: number;
  take: number;
  search?: string;
  status?: RFQStatus;
  createdBy?: string; // for vendor-scoped views
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) => {
  const where: Prisma.RFQWhereInput = {
    deletedAt: null,
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { title: { contains: params.search, mode: 'insensitive' } },
        { rfqNumber: { contains: params.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { items: true, rfqVendors: true, quotations: true } },
      },
      skip: params.skip,
      take: params.take,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.rFQ.count({ where }),
  ]);

  return { rfqs, total };
};

export const findRFQById = async (id: string) => {
  return prisma.rFQ.findFirst({
    where: { id, deletedAt: null },
    include: rfqInclude,
  });
};

export const findRFQByNumber = async (rfqNumber: string) => {
  return prisma.rFQ.findFirst({ where: { rfqNumber, deletedAt: null } });
};

export const createRFQ = async (
  data: { title: string; description?: string; deadline?: Date; rfqNumber: string; createdBy: string },
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const rfq = await tx.rFQ.create({ data });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.RFQ_CREATED,
        entityType: ENTITY_TYPES.RFQ,
        entityId: rfq.id,
        metadata: { after: { rfqNumber: rfq.rfqNumber, title: rfq.title } },
        ipAddress: ip,
      },
    });
    return rfq;
  });
};

export const updateRFQ = async (
  id: string,
  data: Prisma.RFQUpdateInput,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const rfq = await tx.rFQ.update({ where: { id }, data });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.RFQ_UPDATED,
        entityType: ENTITY_TYPES.RFQ,
        entityId: id,
        metadata: {},
        ipAddress: ip,
      },
    });
    return rfq;
  });
};

export const updateRFQStatus = async (
  id: string,
  status: RFQStatus,
  action: string,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const before = await tx.rFQ.findUnique({ where: { id }, select: { status: true } });
    const rfq = await tx.rFQ.update({ where: { id }, data: { status } });
    await tx.activityLog.create({
      data: {
        userId,
        action,
        entityType: ENTITY_TYPES.RFQ,
        entityId: id,
        metadata: { before: { status: before?.status }, after: { status } },
        ipAddress: ip,
      },
    });
    return rfq;
  });
};

export const softDeleteRFQ = async (id: string) => {
  return prisma.rFQ.update({ where: { id }, data: { deletedAt: new Date() } });
};

// ── RFQ Vendor assignment ─────────────────────────────────────────────────────

export const assignVendorsToRFQ = async (
  rfqId: string,
  vendorIds: string[],
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    // Upsert — skip duplicates
    const records = await Promise.all(
      vendorIds.map((vendorId) =>
        tx.rFQVendor.upsert({
          where: { rfqId_vendorId: { rfqId, vendorId } },
          update: {},
          create: { rfqId, vendorId, status: RFQVendorStatus.INVITED },
        })
      )
    );

    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.RFQ_VENDORS_ASSIGNED,
        entityType: ENTITY_TYPES.RFQ,
        entityId: rfqId,
        metadata: { vendorIds },
        ipAddress: ip,
      },
    });

    return records;
  });
};

export const findRFQVendor = async (rfqId: string, vendorId: string) => {
  return prisma.rFQVendor.findUnique({
    where: { rfqId_vendorId: { rfqId, vendorId } },
  });
};

export const updateRFQVendorStatus = async (
  rfqId: string,
  vendorId: string,
  status: RFQVendorStatus
) => {
  return prisma.rFQVendor.update({
    where: { rfqId_vendorId: { rfqId, vendorId } },
    data: {
      status,
      ...(status === RFQVendorStatus.VIEWED && { viewedAt: new Date() }),
      ...(status === RFQVendorStatus.SUBMITTED || status === RFQVendorStatus.DECLINED
        ? { respondedAt: new Date() }
        : {}),
    },
  });
};

// ── RFQ Items ─────────────────────────────────────────────────────────────────

export const findRFQItems = async (rfqId: string) => {
  return prisma.rFQItem.findMany({
    where: { rfqId },
    orderBy: { sortOrder: 'asc' },
  });
};

export const findRFQItemById = async (id: string) => {
  return prisma.rFQItem.findUnique({ where: { id } });
};

export const createRFQItems = async (
  rfqId: string,
  items: Array<{ description: string; quantity: number; unit: string; specifications?: Record<string, unknown>; sortOrder?: number }>,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const created = await tx.rFQItem.createMany({
      data: items.map((item) => ({
        rfqId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        specifications: item.specifications as Prisma.InputJsonValue | undefined,
        sortOrder: item.sortOrder ?? 0,
      })),
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.RFQ_ITEM_ADDED,
        entityType: ENTITY_TYPES.RFQ,
        entityId: rfqId,
        metadata: { count: items.length },
        ipAddress: ip,
      },
    });

    return created;
  });
};

export const updateRFQItem = async (
  id: string,
  data: Partial<{ description: string; quantity: number; unit: string; specifications: any; sortOrder: number }>,
  userId: string,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const updateData = {
      ...data,
      ...(data.specifications !== undefined && { specifications: data.specifications as Prisma.InputJsonValue }),
    };
    const item = await tx.rFQItem.update({ where: { id }, data: updateData });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.RFQ_ITEM_UPDATED,
        entityType: ENTITY_TYPES.RFQ_ITEM,
        entityId: id,
        metadata: {},
        ipAddress: ip,
      },
    });
    return item;
  });
};

export const deleteRFQItem = async (id: string, userId: string, ip: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.rFQItem.delete({ where: { id } });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.RFQ_ITEM_REMOVED,
        entityType: ENTITY_TYPES.RFQ_ITEM,
        entityId: id,
        metadata: {},
        ipAddress: ip,
      },
    });
  });
};
