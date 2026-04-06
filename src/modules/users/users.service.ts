import bcrypt from 'bcryptjs';
import * as UsersRepo from './users.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/errors';
import db from '../../config/database';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './users.schema';
import type { Role, UserStatus } from '../../generated/prisma/enums';

export async function getAll(query: ListUsersQuery) {
  const { page, limit, status, role } = query;
  const { users, total } = await UsersRepo.findAll({
    page,
    limit,
    status: status as UserStatus | undefined,
    role: role as Role | undefined,
  });

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getById(id: string) {
  const user = await UsersRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function create(input: CreateUserInput) {
  const existing = await UsersRepo.findByEmail(input.email);
  if (existing) throw new ConflictError('A user with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await UsersRepo.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role as Role,
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'CREATED',
      entityType: 'user',
      entityId: user.id,
      after: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
    },
  });

  return user;
}

export async function update(id: string, input: UpdateUserInput, requestingUserId: string) {
  const user = await UsersRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');

  // Prevent admin from deactivating their own account
  if (input.status === 'INACTIVE' && id === requestingUserId) {
    throw new BadRequestError('You cannot deactivate your own account');
  }

  const before = { name: user.name, role: user.role, status: user.status };
  const updated = await UsersRepo.update(id, input as { name?: string; role?: Role; status?: UserStatus });

  await db.auditLog.create({
    data: {
      userId: requestingUserId,
      action: 'UPDATED',
      entityType: 'user',
      entityId: id,
      before: JSON.stringify(before),
      after: JSON.stringify({ name: updated.name, role: updated.role, status: updated.status }),
    },
  });

  return updated;
}
