import { Request, Response } from 'express';
import { paginatedResponse } from '../../utils';
import * as service from './service';
import type { ListActivityLogsQuery } from './schema';

export const listActivityLogs = async (req: Request, res: Response): Promise<void> => {
  const { logs, total, page, limit } = await service.listActivityLogs(req.query as ListActivityLogsQuery);
  res.json(paginatedResponse(logs, total, page, limit));
};
