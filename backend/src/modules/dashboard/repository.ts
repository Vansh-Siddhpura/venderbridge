import prisma from '../../config/database';
import { UserRole } from '@prisma/client';

/**
 * Aggregates global procurement dashboard stats.
 * For VENDOR users, statistics are scoped to their own vendorId.
 */
export const getDashboardStats = async (role: UserRole, vendorId?: string | null) => {
  if (role === UserRole.VENDOR && vendorId) {
    const [openRFQs, mySubmittedQuotations, myPurchaseOrders, outstandingInvoices] = await Promise.all([
      prisma.rFQVendor.count({
        where: { vendorId, status: 'INVITED' },
      }),
      prisma.quotation.count({
        where: { vendorId, status: 'SUBMITTED', deletedAt: null },
      }),
      prisma.purchaseOrder.count({
        where: { vendorId, status: { in: ['PENDING', 'ACKNOWLEDGED'] }, deletedAt: null },
      }),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        where: { vendorId, status: { in: ['DRAFT', 'SENT', 'OVERDUE'] }, deletedAt: null },
      }),
    ]);

    return {
      pendingApprovals: openRFQs,
      activeRFQs: mySubmittedQuotations,
      posThisMonth: myPurchaseOrders,
      invoicesOutstanding: Number(outstandingInvoices._sum.totalAmount ?? 0),
    };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [pendingApprovals, activeRFQs, posThisMonth, outstandingInvoices] = await Promise.all([
    prisma.quotation.count({
      where: { status: 'SUBMITTED', deletedAt: null },
    }),
    prisma.rFQ.count({
      where: { status: 'PUBLISHED', deletedAt: null },
    }),
    prisma.purchaseOrder.count({
      where: {
        deletedAt: null,
        createdAt: { gte: monthStart },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['DRAFT', 'SENT', 'OVERDUE'] }, deletedAt: null },
    }),
  ]);

  return {
    pendingApprovals,
    activeRFQs,
    posThisMonth,
    invoicesOutstanding: Number(outstandingInvoices._sum.totalAmount ?? 0),
  };
};

/**
 * Latest RFQs visible to the user (vendors only see ones they were invited to).
 */
export const getRecentRFQs = async (role: UserRole, vendorId?: string | null) => {
  if (role === UserRole.VENDOR && vendorId) {
    const rfqVendors = await prisma.rFQVendor.findMany({
      where: { vendorId },
      include: { rfq: true },
      orderBy: { invitedAt: 'desc' },
      take: 5,
    });

    return rfqVendors
      .filter((rv) => rv.rfq && !rv.rfq.deletedAt)
      .map((rv) => ({
        id: rv.rfq.id,
        rfqNumber: rv.rfq.rfqNumber,
        title: rv.rfq.title,
        status: rv.rfq.status,
        deadline: rv.rfq.deadline,
        createdAt: rv.rfq.createdAt,
      }));
  }

  const rfqs = await prisma.rFQ.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      status: true,
      deadline: true,
      createdAt: true,
    },
  });
  return rfqs;
};

/**
 * Recent invoices the user is allowed to see.
 */
export const getRecentInvoices = async (role: UserRole, vendorId?: string | null) => {
  const where =
    role === UserRole.VENDOR && vendorId
      ? { vendorId, deletedAt: null }
      : { deletedAt: null };

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      vendor: { select: { companyName: true } },
    },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    vendorName: inv.vendor?.companyName ?? '—',
    totalAmount: Number(inv.totalAmount),
    status: inv.status,
    createdAt: inv.createdAt,
    dueDate: inv.dueDate,
  }));
};
