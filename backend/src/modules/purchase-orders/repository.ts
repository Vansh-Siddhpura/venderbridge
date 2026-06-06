import prisma from '../../config/database';
import { POStatus, Prisma } from '@prisma/client';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';
const Decimal = Prisma.Decimal;

const poInclude = {
  vendor: { select: { id: true, companyName: true, email: true, gstin: true, address: true } },
  quotation: { select: { id: true, quotationNumber: true, rfqId: true } },
  items: true,
} satisfies Prisma.PurchaseOrderInclude;

export const findPOs = async (params: {
  skip: number; take: number;
  status?: POStatus; vendorId?: string;
  sortBy: string; sortOrder: 'asc' | 'desc';
}) => {
  const where: Prisma.PurchaseOrderWhereInput = {
    deletedAt: null,
    ...(params.status && { status: params.status }),
    ...(params.vendorId && { vendorId: params.vendorId }),
  };
  const [pos, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: { vendor: { select: { id: true, companyName: true } }, _count: { select: { items: true } } },
      skip: params.skip, take: params.take,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);
  return { pos, total };
};

export const findPOById = async (id: string) => {
  return prisma.purchaseOrder.findFirst({ where: { id, deletedAt: null }, include: poInclude });
};

export const findPOByQuotation = async (quotationId: string) => {
  return prisma.purchaseOrder.findFirst({ where: { quotationId, deletedAt: null } });
};

export const createPOFromQuotation = async (
  quotationId: string, poNumber: string, userId: string, ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });
    if (!quotation) throw new Error('Quotation not found');

    const po = await tx.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: quotation.vendorId,
        quotationId,
        status: POStatus.PENDING,
        totalAmount: quotation.totalAmount,
        items: {
          create: quotation.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: poInclude,
    });

    await tx.activityLog.create({
      data: {
        userId, action: ACTIVITY_ACTIONS.PO_GENERATED,
        entityType: ENTITY_TYPES.PO, entityId: po.id,
        metadata: { after: { poNumber, quotationId, totalAmount: quotation.totalAmount.toString() } },
        ipAddress: ip,
      },
    });

    return po;
  });
};

export const updatePOStatus = async (
  id: string, status: POStatus, userId: string, ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const before = await tx.purchaseOrder.findUnique({ where: { id }, select: { status: true } });
    const po = await tx.purchaseOrder.update({
      where: { id },
      data: {
        status,
        ...(status === POStatus.ACKNOWLEDGED && { acknowledgedAt: new Date() }),
        ...(status === POStatus.FULFILLED && { fulfilledAt: new Date() }),
      },
    });
    await tx.activityLog.create({
      data: {
        userId, action: ACTIVITY_ACTIONS.PO_STATUS_UPDATED,
        entityType: ENTITY_TYPES.PO, entityId: id,
        metadata: { before: { status: before?.status }, after: { status } },
        ipAddress: ip,
      },
    });
    return po;
  });
};
