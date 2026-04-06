import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../generated/prisma/enums';
import { UnauthorizedError } from './errors';

export interface TokenPayload {
  userId: string;
  role: Role;
}

export function signToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
