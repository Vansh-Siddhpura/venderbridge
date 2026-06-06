import { POStatus, UserRole } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES } from '../../config/constants';
import { generateSequenceNumber, getPaginationParams } from '../../utils';
import * as repo from './repository';
import type { UpdatePOStatusInput, ListPOsQuery } from './schema';
import { findQuotationById } from '../quotations/repository';

export const listPOs = async (query: ListPOsQuery, requesterRole: UserRole, requesterVendorId?: string) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  const vendorId = requesterRole === UserRole.VENDOR ? requesterVendorId : query.vendorId;
  const { pos, total } = await repo.findPOs({
    skip, take: limit,
    status: query.status as POStatus | undefined,
    vendorId, sortBy, sortOrder,
  });
  return { pos, total, page, limit };
};

export const getPO = async (id: string, requesterRole: UserRole, requesterVendorId?: string) => {
  const po = await repo.findPOById(id);
  if (!po) throw new AppError(ERROR_CODES.NOT_FOUND, 'Purchase order not found', 404);
  if (requesterRole === UserRole.VENDOR && po.vendorId !== requesterVendorId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
  }
  return po;
};

/**
 * Generates a PO from an APPROVED (SELECTED) quotation.
 * Admin/Manager only.
 */
export const generatePO = async (quotationId: string, userId: string, ip: string) => {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  if (quotation.status !== 'SELECTED') {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, 'PO can only be generated from a SELECTED quotation', 400);
  }

  const existing = await repo.findPOByQuotation(quotationId);
  if (existing) throw new AppError(ERROR_CODES.CONFLICT, 'PO already exists for this quotation', 409);

  const poNumber = await generateSequenceNumber('po');
  return repo.createPOFromQuotation(quotationId, poNumber, userId, ip);
};

export const updatePOStatus = async (
  id: string, input: UpdatePOStatusInput, requesterRole: UserRole, requesterVendorId: string | undefined, userId: string, ip: string
) => {
  const po = await repo.findPOById(id);
  if (!po) throw new AppError(ERROR_CODES.NOT_FOUND, 'Purchase order not found', 404);

  // Vendor rules: can only ACKNOWLEDGE or FULFILL their own POs
  if (requesterRole === UserRole.VENDOR) {
    if (po.vendorId !== requesterVendorId) throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
    if (input.status === POStatus.CANCELLED) throw new AppError(ERROR_CODES.FORBIDDEN, 'Vendors cannot cancel POs', 403);
  }

  // Admin/Manager rules: can CANCEL, but not ACKNOWLEDGE/FULFILL
  if (requesterRole !== UserRole.VENDOR) {
    if (input.status !== POStatus.CANCELLED) throw new AppError(ERROR_CODES.FORBIDDEN, 'Only vendors can acknowledge or fulfill POs', 403);
  }

  const validTransitions: Record<POStatus, POStatus[]> = {
    PENDING: [POStatus.ACKNOWLEDGED, POStatus.CANCELLED],
    ACKNOWLEDGED: [POStatus.FULFILLED, POStatus.CANCELLED],
    FULFILLED: [],
    CANCELLED: [],
  };

  if (!validTransitions[po.status]?.includes(input.status as POStatus)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot transition PO from ${po.status} to ${input.status}`, 400);
  }

  return repo.updatePOStatus(id, input.status as POStatus, userId, ip);
};
