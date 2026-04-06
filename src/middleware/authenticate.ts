import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import db from '../config/database';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7); // remove "Bearer "
    const payload = verifyToken(token);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    if (user.status === 'INACTIVE') {
      throw new ForbiddenError('This account has been deactivated', 'ACCOUNT_INACTIVE');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
