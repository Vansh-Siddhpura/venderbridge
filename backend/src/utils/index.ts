import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AUTH, PAGINATION, SEQUENCE, SequenceType } from '../config/constants';
import { AppError } from '../middlewares/error.middleware';
import { ERROR_CODES } from '../config/constants';
import { UserRole } from '@prisma/client';
import type { JwtPayload } from '../middlewares/auth.middleware';

// ── Password utilities ────────────────────────────────────────────────────────

/**
 * Hashes a plaintext password using bcrypt.
 * @param password - The plaintext password
 * @returns The bcrypt hash string
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
};

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * @param password - The plaintext password to check
 * @param hash - The stored bcrypt hash
 * @returns true if they match, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ── JWT utilities ─────────────────────────────────────────────────────────────

/**
 * Generates a signed JWT access token (15 minute expiry).
 * @param payload - The data to embed: { userId, role, vendorId? }
 * @returns Signed JWT string
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Generates a cryptographically secure random refresh token string.
 * This is stored in the DB and sent as httpOnly cookie.
 * @returns 64-char hex string
 */
export const generateRefreshTokenString = (): string => {
  return randomBytes(32).toString('hex');
};

// ── Pagination utilities ──────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Parses pagination + sort parameters from Express query string.
 * Enforces sensible defaults and MAX_LIMIT cap.
 */
export const getPaginationParams = (query: Record<string, unknown>): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page ?? PAGINATION.DEFAULT_PAGE), 10) || 1);
  const rawLimit = parseInt(String(query.limit ?? PAGINATION.DEFAULT_LIMIT), 10) || PAGINATION.DEFAULT_LIMIT;
  const limit = Math.min(rawLimit, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;
  const sortBy = String(query.sortBy ?? 'createdAt');
  const sortOrder: 'asc' | 'desc' = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

// ── Sequence number generator ─────────────────────────────────────────────────

/**
 * Generates the next sequence number for a given type using a SELECT FOR UPDATE
 * transaction to prevent race conditions.
 *
 * Returns strings like: RFQ-2025-00001 / PO-2025-00001 / INV-2025-00001
 *
 * @param type - 'rfq' | 'po' | 'invoice'
 * @throws AppError SEQUENCE_NOT_FOUND if the sequence row doesn't exist in DB
 */
export const generateSequenceNumber = async (type: SequenceType): Promise<string> => {
  const year = new Date().getFullYear();

  // Use a raw transaction with SELECT FOR UPDATE to prevent race conditions
  const result = await prisma.$transaction(async (tx) => {
    // Lock the row for update
    const rows = await tx.$queryRaw<Array<{ id: string; prefix: string; current_value: number; pad_length: number }>>`
      SELECT id, prefix, current_value, pad_length
      FROM sequences
      WHERE name = ${type}
      FOR UPDATE
    `;

    if (rows.length === 0) {
      throw new AppError(
        ERROR_CODES.SEQUENCE_NOT_FOUND,
        `Sequence "${type}" not found. Run the database seed.`,
        500
      );
    }

    const seq = rows[0];
    const nextValue = seq.current_value + 1;

    await tx.$executeRaw`
      UPDATE sequences SET current_value = ${nextValue} WHERE id = ${seq.id}::uuid
    `;

    const padded = String(nextValue).padStart(seq.pad_length, '0');
    return `${seq.prefix}-${year}-${padded}`;
  });

  return result;
};

// ── Number to words (for invoice grand total) ─────────────────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const convertChunk = (n: number): string => {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' + convertChunk(n % 100) : ''}`;
};

/**
 * Converts a number to its English words representation.
 * Used for invoice PDF grand total in words.
 *
 * @param amount - The number to convert (integer part; paise appended separately)
 * @returns e.g. "One Lakh Twenty Three Thousand Four Hundred Fifty Six and 78/100 Paise"
 */
export const numberToWords = (amount: number): string => {
  if (amount === 0) return 'Zero Rupees Only';

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const convertIndian = (n: number): string => {
    if (n === 0) return '';
    if (n < 1000) return convertChunk(n);

    const crore = Math.floor(n / 10_000_000);
    const lakh = Math.floor((n % 10_000_000) / 100_000);
    const thousand = Math.floor((n % 100_000) / 1000);
    const remainder = n % 1000;

    const parts: string[] = [];
    if (crore) parts.push(`${convertChunk(crore)} Crore`);
    if (lakh) parts.push(`${convertChunk(lakh)} Lakh`);
    if (thousand) parts.push(`${convertChunk(thousand)} Thousand`);
    if (remainder) parts.push(convertChunk(remainder));

    return parts.join(' ');
  };

  const rupeesWords = convertIndian(rupees);
  const paiseStr = paise ? ` and ${String(paise).padStart(2, '0')}/100 Paise` : ' Only';

  return `${rupeesWords} Rupees${paiseStr}`;
};

// ── API response helpers ──────────────────────────────────────────────────────

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const successResponse = <T>(data: T, message?: string): SuccessResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

export const paginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): SuccessResponse<PaginatedData<T>> => ({
  success: true,
  data: { items, total, page, limit },
  ...(message && { message }),
});
