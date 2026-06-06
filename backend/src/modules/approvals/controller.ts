import { Request, Response } from 'express';
import { successResponse } from '../../utils';
import * as service from './service';
import type { CreateApprovalInput } from './schema';

export const createApproval = async (req: Request, res: Response): Promise<void> => {
  const approval = await service.createApproval(
    (req.params.quotationId as string),
    req.body as CreateApprovalInput,
    req.user!.userId,
    req.ip ?? 'unknown'
  );
  res.status(201).json(successResponse(approval, 'Approval recorded'));
};

export const getApprovalHistory = async (req: Request, res: Response): Promise<void> => {
  const history = await service.getApprovalHistory((req.params.quotationId as string));
  res.json(successResponse(history));
};
