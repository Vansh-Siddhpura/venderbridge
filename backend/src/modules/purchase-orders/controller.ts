import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils';
import * as service from './service';
import type { UpdatePOStatusInput, ListPOsQuery } from './schema';

const ip = (req: Request) => req.ip ?? 'unknown';

export const listPOs = async (req: Request, res: Response): Promise<void> => {
  const { pos, total, page, limit } = await service.listPOs(req.query as ListPOsQuery, req.user!.role, req.user!.vendorId);
  res.json(paginatedResponse(pos, total, page, limit));
};

export const getPO = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.getPO((req.params.id as string), req.user!.role, req.user!.vendorId)));
};

export const generatePO = async (req: Request, res: Response): Promise<void> => {
  const po = await service.generatePO(req.body.quotationId, req.user!.userId, ip(req));
  res.status(201).json(successResponse(po, 'Purchase order generated'));
};

export const updatePOStatus = async (req: Request, res: Response): Promise<void> => {
  const po = await service.updatePOStatus(
    (req.params.id as string), req.body as UpdatePOStatusInput,
    req.user!.role, req.user!.vendorId, req.user!.userId, ip(req)
  );
  res.json(successResponse(po, 'PO status updated'));
};
