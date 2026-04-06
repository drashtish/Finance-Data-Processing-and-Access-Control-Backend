import * as RecordsRepository from './records.repository';
import { NotFoundError } from '../../utils/errors';
import type { CreateRecordInput, UpdateRecordInput, RecordQuery } from './records.schema';
import db from '../../config/database';

export async function getAll(query: RecordQuery) {
  const { records, total } = await RecordsRepository.findAll(query);
  const totalPages = Math.ceil(total / query.limit);
  return {
    records,
    meta: { page: query.page, limit: query.limit, total, totalPages },
  };
}

export async function getById(id: string) {
  const record = await RecordsRepository.findById(id);
  if (!record) throw new NotFoundError('Financial record not found');
  return record;
}

export async function create(input: CreateRecordInput, createdById: string) {
  const record = await RecordsRepository.create({
    ...input,
    date: new Date(input.date),
    createdById,
  });

  await db.auditLog.create({
    data: {
      action: 'CREATED',
      entityType: 'FinancialRecord',
      entityId: record.id,
      after: JSON.stringify(record),
      userId: createdById,
    },
  });

  return record;
}

export async function update(id: string, input: UpdateRecordInput, requestingUserId: string) {
  const existing = await RecordsRepository.findById(id);
  if (!existing) throw new NotFoundError('Financial record not found');

  const updateData: {
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: Date;
    notes?: string;
  } = {
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  };

  const updated = await RecordsRepository.update(id, updateData);

  await db.auditLog.create({
    data: {
      action: 'UPDATED',
      entityType: 'FinancialRecord',
      entityId: id,
      before: JSON.stringify(existing),
      after: JSON.stringify(updated),
      userId: requestingUserId,
    },
  });

  return updated;
}

export async function remove(id: string, requestingUserId: string) {
  const existing = await RecordsRepository.findById(id);
  if (!existing) throw new NotFoundError('Financial record not found');

  await RecordsRepository.softDelete(id, requestingUserId);

  await db.auditLog.create({
    data: {
      action: 'DELETED',
      entityType: 'FinancialRecord',
      entityId: id,
      before: JSON.stringify(existing),
      userId: requestingUserId,
    },
  });
}
