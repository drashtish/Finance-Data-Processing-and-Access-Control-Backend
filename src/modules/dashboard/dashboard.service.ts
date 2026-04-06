import db from '../../config/database';
import type { DashboardQuery, TrendsQuery } from './dashboard.schema';

function buildDateFilter(query: DashboardQuery) {
  if (!query.date_from && !query.date_to) return undefined;
  return {
    ...(query.date_from ? { gte: new Date(query.date_from) } : {}),
    ...(query.date_to ? { lte: new Date(query.date_to) } : {}),
  };
}

/**
 * GET /dashboard/summary
 * Total income, total expenses, net balance, record count — all non-deleted.
 */
export async function getSummary(query: DashboardQuery) {
  const dateFilter = buildDateFilter(query);
  const where = {
    isDeleted: false,
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const [incomeAgg, expenseAgg, totalCount] = await Promise.all([
    db.financialRecord.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    db.financialRecord.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    db.financialRecord.count({ where }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalRecords: totalCount,
    incomeCount: incomeAgg._count.id,
    expenseCount: expenseAgg._count.id,
  };
}

/**
 * GET /dashboard/by-category
 * Breakdown of totals per category, sorted by total desc.
 */
export async function getByCategory(query: DashboardQuery) {
  const dateFilter = buildDateFilter(query);
  const where = {
    isDeleted: false,
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const records = await db.financialRecord.groupBy({
    by: ['category', 'type'],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  // Merge type breakdown per category
  const categoryMap = new Map<
    string,
    { category: string; income: number; expenses: number; count: number }
  >();

  for (const row of records) {
    const existing = categoryMap.get(row.category) ?? {
      category: row.category,
      income: 0,
      expenses: 0,
      count: 0,
    };
    const amount = Number(row._sum.amount ?? 0);
    if (row.type === 'INCOME') existing.income += amount;
    else existing.expenses += amount;
    existing.count += row._count.id;
    categoryMap.set(row.category, existing);
  }

  return Array.from(categoryMap.values())
    .map((c) => ({ ...c, net: c.income - c.expenses }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

/**
 * GET /dashboard/trends
 * Monthly or daily income vs expense totals over time.
 */
export async function getTrends(query: TrendsQuery) {
  const dateFilter =
    query.date_from || query.date_to
      ? {
          ...(query.date_from ? { gte: new Date(query.date_from) } : {}),
          ...(query.date_to ? { lte: new Date(query.date_to) } : {}),
        }
      : undefined;

  const records = await db.financialRecord.findMany({
    where: {
      isDeleted: false,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    select: { amount: true, type: true, date: true },
    orderBy: { date: 'asc' },
  });

  // Group in memory — SQLite has limited date truncation support
  const bucketMap = new Map<string, { income: number; expenses: number }>();

  for (const r of records) {
    const d = new Date(r.date);
    const key =
      query.group_by === 'day'
        ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
        : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

    const bucket = bucketMap.get(key) ?? { income: 0, expenses: 0 };
    const amount = Number(r.amount);
    if (r.type === 'INCOME') bucket.income += amount;
    else bucket.expenses += amount;
    bucketMap.set(key, bucket);
  }

  return Array.from(bucketMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, { income, expenses }]) => ({
      period,
      income,
      expenses,
      net: income - expenses,
    }));
}

/**
 * GET /dashboard/recent-activity
 * Last N audit log entries (default 10).
 */
export async function getRecentActivity(limit = 10) {
  const logs = await db.auditLog.findMany({
    where: { entityType: 'FinancialRecord' },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      entityId: true,
      timestamp: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return logs;
}
