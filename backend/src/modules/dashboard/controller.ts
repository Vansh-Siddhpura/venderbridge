import { Request, Response } from 'express';
import { successResponse } from '../../utils';
import * as service from './service';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  const data = await service.getDashboard(req.user!.role, req.user!.vendorId ?? null);
  res.json(successResponse(data));
};
