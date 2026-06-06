import { UserRole } from '@prisma/client';
import * as repo from './repository';

export const getDashboard = async (role: UserRole, vendorId?: string | null) => {
  const [stats, recentRFQs, recentInvoices] = await Promise.all([
    repo.getDashboardStats(role, vendorId),
    repo.getRecentRFQs(role, vendorId),
    repo.getRecentInvoices(role, vendorId),
  ]);

  return { stats, recentRFQs, recentInvoices };
};
