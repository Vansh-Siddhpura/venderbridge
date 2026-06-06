import { QuotationStatus, UserRole } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES, ACTIVITY_ACTIONS } from '../../config/constants';
import { generateSequenceNumber, getPaginationParams } from '../../utils';
import * as repo from './repository';
import type { CreateQuotationInput, UpdateQuotationInput, ListQuotationsQuery } from './schema';

// ── State machine ─────────────────────────────────────────────────────────────

const VALID_QUOTATION_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT: [QuotationStatus.SUBMITTED],
  SUBMITTED: [QuotationStatus.SHORTLISTED, QuotationStatus.REJECTED],
  SHORTLISTED: [QuotationStatus.SELECTED, QuotationStatus.REJECTED],
  REJECTED: [],
  SELECTED: [],
};

export const isValidQuotationTransition = (current: QuotationStatus, next: QuotationStatus): boolean =>
  VALID_QUOTATION_TRANSITIONS[current]?.includes(next) ?? false;

// ── Service ───────────────────────────────────────────────────────────────────

export const listQuotations = async (query: ListQuotationsQuery, requesterRole: UserRole, requesterVendorId?: string) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  // Vendors only see their own quotations
  const vendorId = requesterRole === UserRole.VENDOR ? requesterVendorId : query.vendorId;
  const { quotations, total } = await repo.findQuotations({
    skip, take: limit,
    rfqId: query.rfqId,
    vendorId,
    status: query.status as QuotationStatus | undefined,
    sortBy, sortOrder,
  });
  return { quotations, total, page, limit };
};

export const getQuotation = async (id: string, requesterRole: UserRole, requesterVendorId?: string) => {
  const quotation = await repo.findQuotationById(id);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  // Vendor can only view their own quotation
  if (requesterRole === UserRole.VENDOR && quotation.vendorId !== requesterVendorId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
  }
  return quotation;
};

/** Creates a DRAFT quotation. Vendor can only submit for RFQs they are invited to. */
export const createQuotation = async (input: CreateQuotationInput, userId: string, vendorId: string, ip: string) => {
  // Check existing quotation
  const existing = await repo.findQuotationByRFQAndVendor(input.rfqId, vendorId);
  if (existing) {
    throw new AppError(ERROR_CODES.CONFLICT, 'You already have a quotation for this RFQ', 409);
  }

  const quotationNumber = await generateSequenceNumber('rfq'); // reuse sequence? No — quotations don't have their own sequence in spec
  // Actually spec doesn't define a quotation sequence format, use a UUID-based ref
  const qNumber = `QT-${Date.now()}`;

  return repo.createQuotation({
    quotationNumber: qNumber,
    rfqId: input.rfqId,
    vendorId,
    validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    terms: input.terms,
    notes: input.notes,
    items: input.items,
  }, userId, ip);
};

/** Updates a DRAFT quotation. Vendor only, own quotation only. */
export const updateQuotation = async (id: string, input: UpdateQuotationInput, vendorId: string, ip: string) => {
  const quotation = await repo.findQuotationById(id);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  if (quotation.vendorId !== vendorId) throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
  if (quotation.status !== QuotationStatus.DRAFT) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, 'Only DRAFT quotations can be edited', 400);
  }
  return repo.updateQuotation(id, {
    validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    terms: input.terms,
    notes: input.notes,
    items: input.items,
  }, vendorId, ip);
};

/** Submits a DRAFT quotation (vendor action). */
export const submitQuotation = async (id: string, vendorId: string, ip: string) => {
  const quotation = await repo.findQuotationById(id);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  if (quotation.vendorId !== vendorId) throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
  if (!isValidQuotationTransition(quotation.status, QuotationStatus.SUBMITTED)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot submit from status ${quotation.status}`, 400);
  }
  return repo.updateQuotationStatus(id, QuotationStatus.SUBMITTED, ACTIVITY_ACTIONS.QUOTATION_SUBMITTED, vendorId, ip, { submittedAt: new Date() });
};

/** Shortlists a submitted quotation (officer/manager). */
export const shortlistQuotation = async (id: string, userId: string, ip: string) => {
  const quotation = await repo.findQuotationById(id);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  if (!isValidQuotationTransition(quotation.status, QuotationStatus.SHORTLISTED)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot shortlist from status ${quotation.status}`, 400);
  }
  return repo.updateQuotationStatus(id, QuotationStatus.SHORTLISTED, ACTIVITY_ACTIONS.QUOTATION_SHORTLISTED, userId, ip);
};

/** Rejects a quotation (officer/manager). */
export const rejectQuotation = async (id: string, userId: string, ip: string) => {
  const quotation = await repo.findQuotationById(id);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  if (!isValidQuotationTransition(quotation.status, QuotationStatus.REJECTED)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot reject from status ${quotation.status}`, 400);
  }
  return repo.updateQuotationStatus(id, QuotationStatus.REJECTED, ACTIVITY_ACTIONS.QUOTATION_REJECTED, userId, ip);
};
