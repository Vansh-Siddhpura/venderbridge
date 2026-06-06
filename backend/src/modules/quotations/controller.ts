import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils';
import * as service from './service';
import type { CreateQuotationInput, UpdateQuotationInput, ListQuotationsQuery } from './schema';

const ip = (req: Request) => req.ip ?? 'unknown';

export const listQuotations = async (req: Request, res: Response): Promise<void> => {
  const { quotations, total, page, limit } = await service.listQuotations(
    req.query as ListQuotationsQuery, req.user!.role, req.user!.vendorId
  );
  res.json(paginatedResponse(quotations, total, page, limit));
};
export const getQuotation = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.getQuotation((req.params.id as string), req.user!.role, req.user!.vendorId)));
};
export const createQuotation = async (req: Request, res: Response): Promise<void> => {
  if (!req.user!.vendorId) throw new Error('No vendor ID on user');
  const quotation = await service.createQuotation(req.body as CreateQuotationInput, req.user!.userId, req.user!.vendorId, ip(req));
  res.status(201).json(successResponse(quotation, 'Quotation created'));
};
export const updateQuotation = async (req: Request, res: Response): Promise<void> => {
  if (!req.user!.vendorId) throw new Error('No vendor ID on user');
  res.json(successResponse(await service.updateQuotation((req.params.id as string), req.body as UpdateQuotationInput, req.user!.vendorId, ip(req)), 'Quotation updated'));
};
export const submitQuotation = async (req: Request, res: Response): Promise<void> => {
  if (!req.user!.vendorId) throw new Error('No vendor ID on user');
  res.json(successResponse(await service.submitQuotation((req.params.id as string), req.user!.vendorId, ip(req)), 'Quotation submitted'));
};
export const shortlistQuotation = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.shortlistQuotation((req.params.id as string), req.user!.userId, ip(req)), 'Quotation shortlisted'));
};
export const rejectQuotation = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.rejectQuotation((req.params.id as string), req.user!.userId, ip(req)), 'Quotation rejected'));
};
