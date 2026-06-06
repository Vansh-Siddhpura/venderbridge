import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils';
import * as service from './service';
import type {
  CreateVendorInput,
  UpdateVendorInput,
  UpdateVendorStatusInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListVendorsQuery,
} from './schema';

const ip = (req: Request) => req.ip ?? 'unknown';

// ── Vendors ───────────────────────────────────────────────────────────────────

export const listVendors = async (req: Request, res: Response): Promise<void> => {
  const { vendors, total, page, limit } = await service.listVendors(req.query as ListVendorsQuery);
  res.json(paginatedResponse(vendors, total, page, limit));
};

export const getVendor = async (req: Request, res: Response): Promise<void> => {
  const vendor = await service.getVendor((req.params.id as string));
  res.json(successResponse(vendor));
};

export const createVendor = async (req: Request, res: Response): Promise<void> => {
  const vendor = await service.createVendor(req.body as CreateVendorInput, req.user!.userId, ip(req));
  res.status(201).json(successResponse(vendor, 'Vendor created'));
};

export const updateVendor = async (req: Request, res: Response): Promise<void> => {
  const vendor = await service.updateVendor(
    (req.params.id as string),
    req.body as UpdateVendorInput,
    req.user!.userId,
    req.user!.role,
    req.user!.vendorId,
    ip(req)
  );
  res.json(successResponse(vendor, 'Vendor updated'));
};

export const updateVendorStatus = async (req: Request, res: Response): Promise<void> => {
  const vendor = await service.updateVendorStatus(
    (req.params.id as string),
    req.body as UpdateVendorStatusInput,
    req.user!.userId,
    ip(req)
  );
  res.json(successResponse(vendor, 'Vendor status updated'));
};

// ── Categories ────────────────────────────────────────────────────────────────

export const listCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await service.listCategories(req.query.search as string | undefined);
  res.json(successResponse(categories));
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await service.createCategory(req.body as CreateCategoryInput);
  res.status(201).json(successResponse(category, 'Category created'));
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await service.updateCategory((req.params.id as string), req.body as UpdateCategoryInput);
  res.json(successResponse(category, 'Category updated'));
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await service.deleteCategory((req.params.id as string));
  res.json(successResponse(null, 'Category deleted'));
};
