import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

/**
 * validateBody — Zod schema validation middleware for request body.
 * Parses req.body through the provided Zod schema.
 * On failure, throws an AppError with ZodError details attached (caught by errorHandler).
 *
 * @param schema - Any Zod schema to validate req.body against
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Throw ZodError directly so the global errorHandler formats it correctly
      throw new ZodError(result.error.issues);
    }
    req.body = result.data as T;
    next();
  };
};

/**
 * validateQuery — Zod schema validation middleware for query params.
 * Same pattern as validateBody but operates on req.query.
 *
 * @param schema - Any Zod schema to validate req.query against
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
    req.query = result.data as typeof req.query;
    next();
  };
};
