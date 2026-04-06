import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { failure } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(failure(err.message, err.code, err.details));
    return;
  }

  // Unexpected error — log server-side, never expose internals to client
  console.error('[Unhandled Error]', err);
  res.status(500).json(failure('An unexpected error occurred', 'INTERNAL_ERROR'));
}
