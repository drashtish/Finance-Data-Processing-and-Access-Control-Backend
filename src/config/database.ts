import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';
import { env } from './env';

const adapter = new PrismaLibSql({ url: env.DATABASE_URL });
const db = new PrismaClient({ adapter });

export default db;
