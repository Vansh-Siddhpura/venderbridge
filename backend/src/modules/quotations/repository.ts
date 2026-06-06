import prisma from '../../config/database';
import { QuotationStatus, Prisma } from '@prisma/client';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';
const Decimal = Prisma.Decimal;

const quotationInclude = {
  vendor: { select: { id: true, companyName: true, email: true } },
  rfq: { select: { id: true, rfqNumber: true, title: true, status: true } },
  items: true,
  approvals: {
    include: { approver: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.QuotationInclude;

export const findQuotations = async (params: {
  skip: number; take: number;
  rfqId?: string; vendorId?: string; status?: QuotationStatus;
  sortBy: string; sortOrder: 'asc' | 'desc';
}) => {
  const where: Prisma.QuotationWhereInput = {
    deletedAt: null,
    ...(params.rfqId && { rfqId: params.rfqId }),
    ...(params.vendorId && { vendorId: params.vendorId }),
    ...(params.status && { status: params.status }),
  };
  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: {
        vendor: { select: { id: true, companyName: true } },
        rfq: { select: { id: true, rfqNumber: true, title: true } },
        _count: { select: { items: true } },
      },
      skip: params.skip, take: params.take,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.quotation.count({ where }),
  ]);
  return { quotations, total };
};

export const findQuotationById = async (id: string) => {
  return prisma.quotation.findFirst({
    where: { id, deletedAt: null },
    include: quotationInclude,
  });
};

export const findQuotationByRFQAndVendor = async (rfqId: string, vendorId: string) => {
  return prisma.quotation.findFirst({
    where: { rfqId, vendorId, deletedAt: null },
  });
};

export const createQuotation = async (
  data: {
    quotationNumber: string; rfqId: string; vendorId: string;
    validUntil?: Date; terms?: string; notes?: string;
    items: Array<{ rfqItemId?: string; description: string; quantity: number; unit: string; unitPrice: number; notes?: string }>;
  },
  userId: string, ip: string
) => {
  const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.create({
      data: {
        quotationNumber: data.quotationNumber,
        rfqId: data.rfqId,
        vendorId: data.vendorId,
        status: QuotationStatus.DRAFT,
        totalAmount: new Decimal(totalAmount),
        validUntil: data.validUntil,
        terms: data.terms,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            rfqItemId: item.rfqItemId,
            description: item.description,
            quantity: new Decimal(item.quantity),
            unit: item.unit,
            unitPrice: new Decimal(item.unitPrice),
            totalPrice: new Decimal(item.quantity * item.unitPrice),
            notes: item.notes,
          })),
        },
      },
      include: quotationInclude,
    });
    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.QUOTATION_CREATED,
        entityType: ENTITY_TYPES.QUOTATION,
        entityId: quotation.id,
        metadata: { after: { quotationNumber: quotation.quotationNumber, totalAmount } },
        ipAddress: ip,
      },
    });
    return quotation;
  });
};

export const updateQuotation = async (
  id: string,
  data: {
    validUntil?: Date | null; terms?: string; notes?: string;
    items?: Array<{ rfqItemId?: string; description: string; quantity: number; unit: string; unitPrice: number; notes?: string }>;
  },
  userId: string, ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const totalAmount = data.items
      ? data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      : undefined;

    if (data.items) {
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });
    }

    const quotation = await tx.quotation.update({
      where: { id },
      data: {
        ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
        ...(data.terms !== undefined && { terms: data.terms }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(totalAmount !== undefined && { totalAmount: new Decimal(totalAmount) }),
        ...(data.items && {
          items: {
            create: data.items.map((item) => ({
              rfqItemId: item.rfqItemId,
              description: item.description,
              quantity: new Decimal(item.quantity),
              unit: item.unit,
              unitPrice: new Decimal(item.unitPrice),
              totalPrice: new Decimal(item.quantity * item.unitPrice),
              notes: item.notes,
            })),
          },
        }),
      },
      include: quotationInclude,
    });
    await tx.activityLog.create({
      data: {
        userId, action: ACTIVITY_ACTIONS.QUOTATION_UPDATED,
        entityType: ENTITY_TYPES.QUOTATION, entityId: id,
        metadata: {}, ipAddress: ip,
      },
    });
    return quotation;
  });
};

export const updateQuotationStatus = async (
  id: string, status: QuotationStatus, action: string,
  userId: string, ip: string,
  extra?: { submittedAt?: Date }
) => {
  return prisma.$transaction(async (tx) => {
    const before = await tx.quotation.findUnique({ where: { id }, select: { status: true } });
    const quotation = await tx.quotation.update({
      where: { id },
      data: { status, ...(extra?.submittedAt && { submittedAt: extra.submittedAt }) },
    });
    await tx.activityLog.create({
      data: {
        userId, action,
        entityType: ENTITY_TYPES.QUOTATION, entityId: id,
        metadata: { before: { status: before?.status }, after: { status } },
        ipAddress: ip,
      },
    });
    return quotation;
  });
};
