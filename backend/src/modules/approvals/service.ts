import { ApprovalAction, QuotationStatus } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES } from '../../config/constants';
import * as repo from './repository';
import { findQuotationById } from '../quotations/repository';
import type { CreateApprovalInput } from './schema';

/**
 * Creates an approval action on a quotation.
 * - APPROVE: quotation → SELECTED (only from SHORTLISTED)
 * - REJECT: quotation → REJECTED (from SUBMITTED or SHORTLISTED)
 * - REQUEST_REVISION: quotation stays SUBMITTED
 * @throws NOT_FOUND if quotation doesn't exist
 * @throws INVALID_TRANSITION if quotation not in approvable state
 */
export const createApproval = async (
  quotationId: string,
  input: CreateApprovalInput,
  approverId: string,
  ip: string
) => {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);

  const approvableStatuses: QuotationStatus[] = [QuotationStatus.SUBMITTED, QuotationStatus.SHORTLISTED];
  if (!approvableStatuses.includes(quotation.status)) {
    throw new AppError(
      ERROR_CODES.INVALID_TRANSITION,
      `Cannot take approval action on a quotation in ${quotation.status} status`,
      400
    );
  }

  // APPROVE only allowed from SHORTLISTED
  if (input.action === 'APPROVE' && quotation.status !== QuotationStatus.SHORTLISTED) {
    throw new AppError(
      ERROR_CODES.INVALID_TRANSITION,
      'Quotation must be SHORTLISTED before it can be APPROVED',
      400
    );
  }

  return repo.createApproval(
    quotationId,
    approverId,
    input.action as ApprovalAction,
    input.comments,
    ip
  );
};

/**
 * Gets the full approval history for a quotation.
 * @throws NOT_FOUND if quotation doesn't exist
 */
export const getApprovalHistory = async (quotationId: string) => {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) throw new AppError(ERROR_CODES.NOT_FOUND, 'Quotation not found', 404);
  return repo.findApprovalsByQuotation(quotationId);
};
