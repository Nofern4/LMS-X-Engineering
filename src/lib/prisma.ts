import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// If running in Vercel Serverless environment, ensure SQLite db is copied to writable /tmp
if (process.env.VERCEL) {
  const currentDbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  if (currentDbUrl.startsWith('file:')) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          try {
            fs.copyFileSync(cand, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy sqlite file to /tmp:', e);
          }
        }
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  sqliteOptimized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: process.env.DATABASE_URL ? { db: { url: process.env.DATABASE_URL } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Auto-configure SQLite for high concurrency
if (!globalForPrisma.sqliteOptimized) {
  globalForPrisma.sqliteOptimized = true;
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 30000;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;'))
    .catch(() => {});
}
