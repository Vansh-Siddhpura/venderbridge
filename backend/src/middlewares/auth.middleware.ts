import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';
import { ERROR_CODES } from '../config/constants';
import { UserRole } from '@prisma/client';

// ── JWT Payload shape ─────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  role: UserRole;
  vendorId?: string;
}

// ── Augment Express Request ───────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * verifyToken — decodes and verifies the Authorization Bearer JWT.
 * Attaches { userId, role, vendorId? } to req.user on success.
 * Throws 401 AppError if token is missing, invalid, or expired.
 */
export const verifyToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(ERROR_CODES.AUTH_MISSING_TOKEN, 'No token provided', 401);
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      vendorId: decoded.vendorId,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(ERROR_CODES.AUTH_EXPIRED_TOKEN, 'Access token has expired', 401);
    }
    throw new AppError(ERROR_CODES.AUTH_INVALID_TOKEN, 'Invalid access token', 401);
  }
};

/**
 * checkRole — authorization guard.
 * Must be called AFTER verifyToken.
 * Throws 403 AppError if the authenticated user's role is not in allowedRoles.
 *
 * @param allowedRoles - One or more UserRole values that may access the route
 */
export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(ERROR_CODES.AUTH_MISSING_TOKEN, 'Not authenticated', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_ROLE,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }
    next();
  };
};
