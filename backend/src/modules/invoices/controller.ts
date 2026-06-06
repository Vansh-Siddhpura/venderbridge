import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils';
import * as service from './service';
import type { UpdateInvoiceStatusInput, ListInvoicesQuery } from './schema';

const ip = (req: Request) => req.ip ?? 'unknown';

export const listInvoices = async (req: Request, res: Response): Promise<void> => {
  const { invoices, total, page, limit } = await service.listInvoices(req.query as ListInvoicesQuery, req.user!.role, req.user!.vendorId as string);
  res.json(paginatedResponse(invoices, total, page, limit));
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  res.json(successResponse(await service.getInvoice((req.params.id as string), req.user!.role, req.user!.vendorId as string)));
};

export const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  if (!(req.user!.vendorId as string)) throw new Error('Vendor ID required to generate invoice');
  const invoice = await service.generateInvoice(req.body.poId, req.user!.vendorId as string, req.user!.userId, ip(req));
  res.status(201).json(successResponse(invoice, 'Invoice generated'));
};

export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  const invoice = await service.updateInvoiceStatus(
    (req.params.id as string), req.body as UpdateInvoiceStatusInput, req.user!.userId, ip(req)
  );
  res.json(successResponse(invoice, 'Invoice status updated'));
};

export const downloadInvoicePdf = async (req: Request, res: Response): Promise<void> => {
  const result = await service.downloadInvoicePdf((req.params.id as string), req.user!.role, req.user!.vendorId as string);

  if (result.type === 'url') {
    res.redirect(result.url as string); // Redirect to Cloudinary URL
  } else {
    // Send dynamically generated buffer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }
};
