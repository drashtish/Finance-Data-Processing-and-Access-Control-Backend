import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import bcrypt from 'bcryptjs';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../src/generated/prisma/client';

const DB_URL = process.env.DATABASE_URL ?? 'file:dev.db';
const adapter = new PrismaLibSql({ url: DB_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await db.user.upsert({
    where: { email: 'admin@finance.dev' },
    update: {},
    create: {
      name: 'Alice Chen',
      email: 'admin@finance.dev',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Analyst
  const analyst = await db.user.upsert({
    where: { email: 'analyst@finance.dev' },
    update: {},
    create: {
      name: 'Bob Marsh',
      email: 'analyst@finance.dev',
      passwordHash,
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  // Viewer
  await db.user.upsert({
    where: { email: 'viewer@finance.dev' },
    update: {},
    create: {
      name: 'Carol Singh',
      email: 'viewer@finance.dev',
      passwordHash,
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  // Sample financial records
  const records = [
    {
      amount: 85000,
      type: 'INCOME' as const,
      category: 'salary',
      date: new Date('2026-03-31'),
      notes: 'March salary',
      createdById: admin.id,
    },
    {
      amount: 3200,
      type: 'INCOME' as const,
      category: 'consulting',
      date: new Date('2026-03-20'),
      notes: 'Client A retainer',
      createdById: admin.id,
    },
    {
      amount: 1200,
      type: 'EXPENSE' as const,
      category: 'rent',
      date: new Date('2026-03-01'),
      notes: 'Office rent',
      createdById: admin.id,
    },
    {
      amount: 450,
      type: 'EXPENSE' as const,
      category: 'utilities',
      date: new Date('2026-03-15'),
      notes: 'Electricity bill',
      createdById: admin.id,
    },
    {
      amount: 72000,
      type: 'INCOME' as const,
      category: 'salary',
      date: new Date('2026-02-28'),
      notes: 'February salary',
      createdById: admin.id,
    },
    {
      amount: 1200,
      type: 'EXPENSE' as const,
      category: 'rent',
      date: new Date('2026-02-01'),
      notes: 'Office rent',
      createdById: analyst.id,
    },
    {
      amount: 800,
      type: 'EXPENSE' as const,
      category: 'software',
      date: new Date('2026-01-15'),
      notes: 'SaaS subscriptions',
      createdById: admin.id,
    },
  ];

  for (const record of records) {
    await db.financialRecord.create({ data: record });
  }

  console.log('Done. Seed credentials:');
  console.log('  admin@finance.dev   / password123  (ADMIN)');
  console.log('  analyst@finance.dev / password123  (ANALYST)');
  console.log('  viewer@finance.dev  / password123  (VIEWER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
