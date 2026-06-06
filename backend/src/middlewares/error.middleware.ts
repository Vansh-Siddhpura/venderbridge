import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// ── AppError ──────────────────────────────────────────────────────────────────
/**
 * Custom operational error with a machine-readable code, human message, and HTTP status.
 * Always throw this instead of generic Error inside services.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(code: string, message: string, statusCode: number, isOperational = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ── Global Error Handler ──────────────────────────────────────────────────────
/**
 * Express global error middleware — must be registered last.
 * Emits the spec-compliant shape:
 *   { success: false, error: { code, message, details? } }
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProd = process.env.NODE_ENV === 'production';

  // ── Zod validation error ─────────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues,
      },
    });
    return;
  }

  // ── AppError (operational) ───────────────────────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Unexpected AppError', { code: err.code, message: err.message, stack: err.stack });
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(!isProd && { stack: err.stack }),
      },
    });
    return;
  }

  // ── JSON parse errors ────────────────────────────────────────────────────
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON in request body' },
    });
    return;
  }

  // ── Prisma unique constraint (P2002) ─────────────────────────────────────
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  ) {
    res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'A record with that value already exists' },
    });
    return;
  }

  // ── Prisma record not found (P2025) ──────────────────────────────────────
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2025'
  ) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Record not found' },
    });
    return;
  }

  // ── Unexpected / unknown error ───────────────────────────────────────────
  logger.error('💥 Unexpected error', { err });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An unexpected error occurred' : String(err),
      ...(!isProd && err instanceof Error && { stack: err.stack }),
    },
  });
};
