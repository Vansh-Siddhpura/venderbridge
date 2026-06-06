import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

/**
 * Middleware to verify JWT access token
 * STUB: Returns 501 Not Implemented — will be implemented in auth module
 */
export const verifyToken = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError('Auth middleware not implemented yet', 501));
};

/**
 * Middleware to check user role(s) for authorization
 * STUB: Returns 501 Not Implemented — will be implemented in auth module
 * @param allowedRoles - Array of roles that are permitted access
 */
export const checkRole = (...allowedRoles: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    console.log('Allowed roles:', allowedRoles);
    next(new AppError('Role check middleware not implemented yet', 501));
  };
};
