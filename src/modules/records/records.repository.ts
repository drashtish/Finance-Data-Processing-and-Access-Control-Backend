import db from '../../config/database';
import type { Prisma } from '../../generated/prisma/client';
import type { RecordQuery } from './records.schema';

function buildWhere(query: RecordQuery): Prisma.FinancialRecordWhereInput {
  const where: Prisma.FinancialRecordWhereInput = { isDeleted: false };

  if (query.type) where.type = query.type;
  if (query.category) where.category = { contains: query.category };
  if (query.date_from || query.date_to) {
    where.date = {
      ...(query.date_from ? { gte: new Date(query.date_from) } : {}),
      ...(query.date_to ? { lte: new Date(query.date_to) } : {}),
    };
  }
  if (query.min_amount !== undefined || query.max_amount !== undefined) {
    where.amount = {
      ...(query.min_amount !== undefined ? { gte: query.min_amount } : {}),
      ...(query.max_amount !== undefined ? { lte: query.max_amount } : {}),
    };
  }

  return where;
}

function buildOrderBy(sort: RecordQuery['sort']): Prisma.FinancialRecordOrderByWithRelationInput {
  const map: Record<string, Prisma.FinancialRecordOrderByWithRelationInput> = {
    date_asc: { date: 'asc' },
    date_desc: { date: 'desc' },
    amount_asc: { amount: 'asc' },
    amount_desc: { amount: 'desc' },
  };
  return map[sort] ?? { date: 'desc' };
}

const recordSelect = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.FinancialRecordSelect;

export async function findAll(query: RecordQuery) {
  const where = buildWhere(query);
  const orderBy = buildOrderBy(query.sort);
  const skip = (query.page - 1) * query.limit;

  const [total, records] = await Promise.all([
    db.financialRecord.count({ where }),
    db.financialRecord.findMany({ where, orderBy, skip, take: query.limit, select: recordSelect }),
  ]);

  return { records, total };
}

export async function findById(id: string) {
  return db.financialRecord.findFirst({ where: { id, isDeleted: false }, select: recordSelect });
}

export async function create(data: {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: Date;
  notes?: string;
  createdById: string;
}) {
  return db.financialRecord.create({ data, select: recordSelect });
}

export async function update(
  id: string,
  data: {
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: Date;
    notes?: string;
  },
) {
  return db.financialRecord.update({ where: { id }, data, select: recordSelect });
}

export async function softDelete(id: string, deletedById: string) {
  return db.financialRecord.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedById },
    select: { id: true },
  });
}
