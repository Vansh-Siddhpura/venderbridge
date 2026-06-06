import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export const findActivityLogs = async (params: {
  skip: number; take: number;
  userId?: string; entityType?: string; entityId?: string; action?: string;
}) => {
  const where: Prisma.ActivityLogWhereInput = {
    ...(params.userId && { userId: params.userId }),
    ...(params.entityType && { entityType: params.entityType }),
    ...(params.entityId && { entityId: params.entityId }),
    ...(params.action && { action: params.action }),
  };

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      skip: params.skip, take: params.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total };
};
