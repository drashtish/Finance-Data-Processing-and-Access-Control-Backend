import bcrypt from 'bcryptjs';
import db from '../../config/database';
import { signToken } from '../../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import type { LoginInput } from './auth.schema';

export async function login(input: LoginInput) {
  const user = await db.user.findUnique({
    where: { email: input.email },
  });

  // Same error for "not found" and "wrong password" — prevents email enumeration
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.status === 'INACTIVE') {
    throw new ForbiddenError('This account has been deactivated', 'ACCOUNT_INACTIVE');
  }

  const token = signToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
