import db from '../../config/database';
import type { Role, UserStatus } from '../../generated/prisma/enums';

// Fields safe to return — passwordHash never leaves this layer
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findAll(filters: {
  status?: UserStatus;
  role?: Role;
  page: number;
  limit: number;
}) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.role ? { role: filters.role } : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: safeUserSelect,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}

export async function findById(id: string) {
  return db.user.findUnique({ where: { id }, select: safeUserSelect });
}

export async function findByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function create(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}) {
  return db.user.create({ data, select: safeUserSelect });
}

export async function update(id: string, data: { name?: string; role?: Role; status?: UserStatus }) {
  return db.user.update({ where: { id }, data, select: safeUserSelect });
}
