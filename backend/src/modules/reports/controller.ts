import { Request, Response } from 'express';
import { successResponse } from '../../utils';
import * as service from './service';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await service.getDashboardStats(req.user!.role, req.user!.vendorId);
  res.json(successResponse(stats));
};

export const getSpendByCategory = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getSpendByCategory();
  res.json(successResponse(data));
};
