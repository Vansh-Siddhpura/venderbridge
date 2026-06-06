import prisma from '../../config/database';
import { UserRole, Prisma } from '@prisma/client';

// Never return passwordHash in any query
const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  vendorId: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  vendor: { select: { id: true, companyName: true, status: true } },
} satisfies Prisma.UserSelect;

export const findUsers = async (params: {
  skip: number;
  take: number;
  search?: string;
  role?: UserRole;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) => {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(params.role && { role: params.role }),
    ...(params.search && {
      OR: [
        { email: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      skip: params.skip,
      take: params.take,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

export const findUserById = async (id: string) => {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: userSelect,
  });
};

export const updateUser = async (
  id: string,
  data: Partial<{ firstName: string; lastName: string; isActive: boolean; role: UserRole }>
) => {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
};

export const softDeleteUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true },
  });
};
