import prisma from '../../config/database';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { ACTIVITY_ACTIONS, ENTITY_TYPES, GST } from '../../config/constants';
const Decimal = Prisma.Decimal;

const invoiceInclude = {
  vendor: { select: { id: true, companyName: true, email: true, gstin: true, address: true } },
  purchaseOrder: { select: { id: true, poNumber: true } },
  items: true,
} satisfies Prisma.InvoiceInclude;

export const findInvoices = async (params: {
  skip: number; take: number;
  status?: InvoiceStatus; vendorId?: string; poId?: string;
  sortBy: string; sortOrder: 'asc' | 'desc';
}) => {
  const where: Prisma.InvoiceWhereInput = {
    deletedAt: null,
    ...(params.status && { status: params.status }),
    ...(params.vendorId && { vendorId: params.vendorId }),
    ...(params.poId && { poId: params.poId }),
  };
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { vendor: { select: { id: true, companyName: true } }, _count: { select: { items: true } } },
      skip: params.skip, take: params.take,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.invoice.count({ where }),
  ]);
  return { invoices, total };
};

export const findInvoiceById = async (id: string) => {
  return prisma.invoice.findFirst({ where: { id, deletedAt: null }, include: invoiceInclude });
};

export const findInvoiceByPO = async (poId: string) => {
  return prisma.invoice.findFirst({ where: { purchaseOrderId: poId, deletedAt: null } });
};

export const createInvoiceFromPO = async (
  poId: string, invoiceNumber: string, userId: string, ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });
    if (!po) throw new Error('PO not found');

    const defaultGstRate = new Decimal(18); // 18% standard GST
    let subtotal = new Decimal(0);
    let totalCgst = new Decimal(0);
    let totalSgst = new Decimal(0);

    const invoiceItems = po.items.map((item) => {
      const lineSubtotal = item.quantity.mul(item.unitPrice);
      const cgstAmount = lineSubtotal.mul(defaultGstRate.div(2)).div(100);
      const sgstAmount = lineSubtotal.mul(defaultGstRate.div(2)).div(100);
      const lineTotal = lineSubtotal.add(cgstAmount).add(sgstAmount);

      subtotal = subtotal.add(lineSubtotal);
      totalCgst = totalCgst.add(cgstAmount);
      totalSgst = totalSgst.add(sgstAmount);

      return {
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        gstRate: defaultGstRate,
        cgstAmount,
        sgstAmount,
        lineTotal,
      };
    });

    const totalAmount = subtotal.add(totalCgst).add(totalSgst);

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        vendorId: po.vendorId,
        purchaseOrderId: poId,
        status: InvoiceStatus.SENT, // Auto SENT state (can be changed to DRAFT in a full implementation)
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 net
        subtotal,
        totalCgst,
        totalSgst,
        totalAmount,
        items: { create: invoiceItems },
      },
      include: invoiceInclude,
    });

    await tx.activityLog.create({
      data: {
        userId, action: ACTIVITY_ACTIONS.INVOICE_CREATED,
        entityType: ENTITY_TYPES.INVOICE, entityId: invoice.id,
        metadata: { after: { invoiceNumber, purchaseOrderId: poId, totalAmount: totalAmount.toString() } },
        ipAddress: ip,
      },
    });

    return invoice;
  });
};

export const updateInvoicePdfUrl = async (id: string, pdfUrl: string) => {
  return prisma.invoice.update({
    where: { id },
    data: { pdfUrl },
  });
};

export const updateInvoiceStatus = async (
  id: string, status: InvoiceStatus, notes: string | undefined, userId: string, ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const before = await tx.invoice.findUnique({ where: { id }, select: { status: true } });
    const invoice = await tx.invoice.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
        ...(status === InvoiceStatus.PAID && { paidAt: new Date() }),
      },
    });
    await tx.activityLog.create({
      data: {
        userId, action: ACTIVITY_ACTIONS.INVOICE_STATUS_UPDATED,
        entityType: ENTITY_TYPES.INVOICE, entityId: id,
        metadata: { before: { status: before?.status }, after: { status } },
        ipAddress: ip,
      },
    });
    return invoice;
  });
};
