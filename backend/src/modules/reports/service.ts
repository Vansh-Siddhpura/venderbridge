import { UserRole } from '@prisma/client';
import * as repo from './repository';

export const getDashboardStats = async (role: UserRole, vendorId?: string) => {
  return repo.getDashboardStats(role === UserRole.VENDOR ? vendorId : undefined);
};

export const getSpendByCategory = async () => {
  return repo.getSpendByCategory();
};
