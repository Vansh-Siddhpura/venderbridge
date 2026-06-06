import { UserRole } from '@prisma/client';

/**
 * Augmented Express Request with authenticated user info.
 * Populated by verifyToken middleware.
 */
export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  vendorId?: string;
}

/**
 * Standard API success response shape.
 * { success: true, data: T, message?: string }
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated list response shape.
 * { success: true, data: { items: T[], total, page, limit } }
 */
export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

/**
 * Standard API error response shape.
 * { success: false, error: { code, message, details? } }
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

/**
 * Common list query parameters (parsed from req.query).
 */
export interface ListQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
