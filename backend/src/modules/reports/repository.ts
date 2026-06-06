import prisma from '../../config/database';

export const getDashboardStats = async (vendorId?: string) => {
  if (vendorId) {
    // Vendor-specific stats
    const [rfqCount, quoteCount, poCount, invoiceCount] = await Promise.all([
      prisma.rFQVendor.count({ where: { vendorId } }),
      prisma.quotation.count({ where: { vendorId } }),
      prisma.purchaseOrder.count({ where: { vendorId } }),
      prisma.invoice.count({ where: { vendorId } }),
    ]);
    return { rfqCount, quoteCount, poCount, invoiceCount };
  }

  // Global stats for internal users
  const [vendorCount, rfqCount, poCount, invoiceCount] = await Promise.all([
    prisma.vendor.count({ where: { deletedAt: null } }),
    prisma.rFQ.count({ where: { deletedAt: null } }),
    prisma.purchaseOrder.count({ where: { deletedAt: null } }),
    prisma.invoice.count({ where: { deletedAt: null } }),
  ]);
  return { vendorCount, rfqCount, poCount, invoiceCount };
};

export const getSpendByCategory = async () => {
  // Aggregate total po amount grouped by vendor category
  const pos = await prisma.purchaseOrder.findMany({
    where: { deletedAt: null, status: { not: 'CANCELLED' } },
    include: { vendor: { include: { category: true } } },
  });

  const categorySpend: Record<string, { categoryName: string; amount: number }> = {};

  for (const po of pos) {
    const catId = po.vendor.categoryId || 'uncategorized';
    const catName = po.vendor.category?.name || 'Uncategorized';

    if (!categorySpend[catId]) {
      categorySpend[catId] = { categoryName: catName, amount: 0 };
    }
    categorySpend[catId].amount += po.totalAmount.toNumber();
  }

  return Object.values(categorySpend).sort((a, b) => b.amount - a.amount);
};
