import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../generated/prisma/enums';
import { ForbiddenError } from '../utils/errors';

export function requireRole(...roles: Role[]) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const user = _req.user;

    if (!user || !roles.includes(user.role)) {
      return next(new ForbiddenError());
    }

    next();
  };
}
