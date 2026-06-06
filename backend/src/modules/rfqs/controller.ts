import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils';
import * as service from './service';
import type {
  CreateRFQInput, UpdateRFQInput, AssignVendorsInput,
  ListRFQsQuery, CreateRFQItemInput, UpdateRFQItemInput, BulkCreateRFQItemsInput,
} from './schema';

const ip = (req: Request) => req.ip ?? 'unknown';

// ── RFQs ──────────────────────────────────────────────────────────────────────
export const listRFQs = async (req: Request, res: Response): Promise<void> => {
  const { rfqs, total, page, limit } = await service.listRFQs(req.query as ListRFQsQuery);
  res.json(paginatedResponse(rfqs, total, page, limit));
};
export const getRFQ = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.getRFQ((req.params.id as string))));
};
export const createRFQ = async (req: Request, res: Response): Promise<void> => {
  const rfq = await service.createRFQ(req.body as CreateRFQInput, req.user!.userId, ip(req));
  res.status(201).json(successResponse(rfq, 'RFQ created'));
};
export const updateRFQ = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.updateRFQ((req.params.id as string), req.body as UpdateRFQInput, req.user!.userId, ip(req)), 'RFQ updated'));
};
export const publishRFQ = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.publishRFQ((req.params.id as string), req.user!.userId, ip(req)), 'RFQ published'));
};
export const closeRFQ = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.closeRFQ((req.params.id as string), req.user!.userId, ip(req)), 'RFQ closed'));
};
export const cancelRFQ = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.cancelRFQ((req.params.id as string), req.user!.userId, ip(req)), 'RFQ cancelled'));
};
export const assignVendors = async (req: Request, res: Response): Promise<void> => {
  const result = await service.assignVendors((req.params.id as string), req.body as AssignVendorsInput, req.user!.userId, ip(req));
  res.json(successResponse(result, 'Vendors assigned'));
};

// ── RFQ Items ─────────────────────────────────────────────────────────────────
export const addRFQItem = async (req: Request, res: Response): Promise<void> => {
  const result = await service.addRFQItem((req.params.rfqId as string), req.body as CreateRFQItemInput, req.user!.userId, ip(req));
  res.status(201).json(successResponse(result, 'Item added'));
};
export const addRFQItems = async (req: Request, res: Response): Promise<void> => {
  const result = await service.addRFQItems((req.params.rfqId as string), req.body as BulkCreateRFQItemsInput, req.user!.userId, ip(req));
  res.status(201).json(successResponse(result, 'Items added'));
};
export const updateRFQItem = async (req: Request, res: Response): Promise<void> => {
  const result = await service.updateRFQItem((req.params.rfqId as string), (req.params.itemId as string), req.body as UpdateRFQItemInput, req.user!.userId, ip(req));
  res.json(successResponse(result, 'Item updated'));
};
export const deleteRFQItem = async (req: Request, res: Response): Promise<void> => {
  await service.deleteRFQItem((req.params.rfqId as string), (req.params.itemId as string), req.user!.userId, ip(req));
  res.json(successResponse(null, 'Item removed'));
};
