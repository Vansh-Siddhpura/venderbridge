import { RFQStatus } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES, ACTIVITY_ACTIONS } from '../../config/constants';
import { generateSequenceNumber, getPaginationParams } from '../../utils';
import { sendRFQInviteEmail } from '../../utils/email';
import * as repo from './repository';
import type {
  CreateRFQInput, UpdateRFQInput, AssignVendorsInput,
  ListRFQsQuery, CreateRFQItemInput, UpdateRFQItemInput, BulkCreateRFQItemsInput,
} from './schema';
import { findVendorById } from '../vendors/repository';

// ── State machine ─────────────────────────────────────────────────────────────

const VALID_RFQ_TRANSITIONS: Record<RFQStatus, RFQStatus[]> = {
  DRAFT: [RFQStatus.PUBLISHED, RFQStatus.CANCELLED],
  PUBLISHED: [RFQStatus.CLOSED, RFQStatus.CANCELLED],
  CLOSED: [],
  CANCELLED: [],
};

export const isValidRFQTransition = (current: RFQStatus, next: RFQStatus): boolean =>
  VALID_RFQ_TRANSITIONS[current]?.includes(next) ?? false;

// ── RFQ Service ───────────────────────────────────────────────────────────────

/** Lists RFQs with pagination, search, and status filter. */
export const listRFQs = async (query: ListRFQsQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  const { rfqs, total } = await repo.findRFQs({
    skip, take: limit,
    search: query.search,
    status: query.status as RFQStatus | undefined,
    sortBy, sortOrder,
  });
  return { rfqs, total, page, limit };
};

/** Gets a single RFQ with full details. @throws NOT_FOUND */
export const getRFQ = async (id: string) => {
  const rfq = await repo.findRFQById(id);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  return rfq;
};

/**
 * Creates a new RFQ in DRAFT status.
 * Generates race-safe sequence number.
 */
export const createRFQ = async (input: CreateRFQInput, userId: string, ip: string) => {
  const rfqNumber = await generateSequenceNumber('rfq');
  return repo.createRFQ(
    {
      title: input.title,
      description: input.description,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      rfqNumber,
      createdBy: userId,
    },
    userId, ip
  );
};

/**
 * Updates an RFQ. Only allowed while status = DRAFT.
 * @throws INVALID_TRANSITION if RFQ is not in DRAFT
 */
export const updateRFQ = async (id: string, input: UpdateRFQInput, userId: string, ip: string) => {
  const rfq = await repo.findRFQById(id);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  if (rfq.status !== RFQStatus.DRAFT) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, 'RFQ can only be edited in DRAFT status', 400);
  }
  return repo.updateRFQ(id, {
    ...(input.title && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.deadline !== undefined && { deadline: input.deadline ? new Date(input.deadline) : null }),
  }, userId, ip);
};

/** Transitions RFQ to PUBLISHED. Validates it has items and assigned vendors. */
export const publishRFQ = async (id: string, userId: string, ip: string) => {
  const rfq = await repo.findRFQById(id);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  if (!isValidRFQTransition(rfq.status, RFQStatus.PUBLISHED)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot publish RFQ from status ${rfq.status}`, 400);
  }
  if (rfq.items.length === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'RFQ must have at least one item before publishing', 400);
  }
  if (rfq.rfqVendors.length === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'RFQ must have at least one vendor assigned before publishing', 400);
  }

  const updated = await repo.updateRFQStatus(id, RFQStatus.PUBLISHED, ACTIVITY_ACTIONS.RFQ_PUBLISHED, userId, ip);

  // Send invite emails to all assigned vendors (non-fatal)
  const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  for (const rv of rfq.rfqVendors) {
    sendRFQInviteEmail(
      rv.vendor.email, rv.vendor.companyName,
      rfq.rfqNumber, rfq.title, rfq.deadline, frontendUrl
    ).catch(() => {});
  }

  return updated;
};

/** Transitions RFQ to CLOSED. */
export const closeRFQ = async (id: string, userId: string, ip: string) => {
  const rfq = await repo.findRFQById(id);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  if (!isValidRFQTransition(rfq.status, RFQStatus.CLOSED)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot close RFQ from status ${rfq.status}`, 400);
  }
  return repo.updateRFQStatus(id, RFQStatus.CLOSED, ACTIVITY_ACTIONS.RFQ_CLOSED, userId, ip);
};

/** Transitions RFQ to CANCELLED. */
export const cancelRFQ = async (id: string, userId: string, ip: string) => {
  const rfq = await repo.findRFQById(id);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  if (!isValidRFQTransition(rfq.status, RFQStatus.CANCELLED)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot cancel RFQ from status ${rfq.status}`, 400);
  }
  return repo.updateRFQStatus(id, RFQStatus.CANCELLED, ACTIVITY_ACTIONS.RFQ_CANCELLED, userId, ip);
};

/**
 * Assigns vendors to an RFQ. Validates vendors exist and are APPROVED.
 * Idempotent — re-assigning an already-invited vendor is a no-op.
 */
export const assignVendors = async (id: string, input: AssignVendorsInput, userId: string, ip: string) => {
  const rfq = await repo.findRFQById(id);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  if (rfq.status === RFQStatus.CANCELLED || rfq.status === RFQStatus.CLOSED) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, 'Cannot assign vendors to a closed or cancelled RFQ', 400);
  }

  // Validate all vendors exist
  await Promise.all(
    input.vendorIds.map(async (vid) => {
      const vendor = await findVendorById(vid);
      if (!vendor) throw new AppError(ERROR_CODES.NOT_FOUND, `Vendor ${vid} not found`, 404);
    })
  );

  return repo.assignVendorsToRFQ(id, input.vendorIds, userId, ip);
};

// ── RFQ Items ─────────────────────────────────────────────────────────────────

const assertDraftRFQ = async (rfqId: string) => {
  const rfq = await repo.findRFQById(rfqId);
  if (!rfq) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ not found', 404);
  if (rfq.status !== RFQStatus.DRAFT) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, 'Items can only be modified on DRAFT RFQs', 400);
  }
  return rfq;
};

export const addRFQItems = async (rfqId: string, input: BulkCreateRFQItemsInput, userId: string, ip: string) => {
  await assertDraftRFQ(rfqId);
  return repo.createRFQItems(rfqId, input.items, userId, ip);
};

export const addRFQItem = async (rfqId: string, input: CreateRFQItemInput, userId: string, ip: string) => {
  await assertDraftRFQ(rfqId);
  return repo.createRFQItems(rfqId, [input], userId, ip);
};

export const updateRFQItem = async (rfqId: string, itemId: string, input: UpdateRFQItemInput, userId: string, ip: string) => {
  await assertDraftRFQ(rfqId);
  const item = await repo.findRFQItemById(itemId);
  if (!item || item.rfqId !== rfqId) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ item not found', 404);
  return repo.updateRFQItem(itemId, input, userId, ip);
};

export const deleteRFQItem = async (rfqId: string, itemId: string, userId: string, ip: string) => {
  await assertDraftRFQ(rfqId);
  const item = await repo.findRFQItemById(itemId);
  if (!item || item.rfqId !== rfqId) throw new AppError(ERROR_CODES.NOT_FOUND, 'RFQ item not found', 404);
  return repo.deleteRFQItem(itemId, userId, ip);
};
