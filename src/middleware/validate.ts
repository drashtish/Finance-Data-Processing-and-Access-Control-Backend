import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError('Invalid input', formatZodErrors(result.error)));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ValidationError('Invalid query parameters', formatZodErrors(result.error)));
    }
    // Store validated + coerced query in res.locals so controllers can read it
    // (Express 5 makes req.query read-only)
    res.locals['validatedQuery'] = result.data;
    next();
  };
}
