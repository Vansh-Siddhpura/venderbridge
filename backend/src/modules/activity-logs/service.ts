import { getPaginationParams } from '../../utils';
import * as repo from './repository';
import type { ListActivityLogsQuery } from './schema';

export const listActivityLogs = async (query: ListActivityLogsQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { logs, total } = await repo.findActivityLogs({
    skip, take: limit,
    userId: query.userId,
    entityType: query.entityType,
    entityId: query.entityId,
    action: query.action,
  });
  return { logs, total, page, limit };
};
