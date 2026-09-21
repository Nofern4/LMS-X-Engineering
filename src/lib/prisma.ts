import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// If running in Vercel Serverless environment, ensure SQLite db is copied to writable /tmp
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'dev.db');
  if (!fs.existsSync(tmpDbPath)) {
    const candidates = [
      path.join(process.cwd(), 'public', 'data', 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(__dirname, 'public', 'data', 'dev.db'),
      path.join(__dirname, 'prisma', 'dev.db'),
      path.join(__dirname, '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', '..', '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', '..', '..', '..', 'prisma', 'dev.db'),
    ];
    let copied = false;
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        try {
          fs.copyFileSync(cand, tmpDbPath);
          console.log(`[Vercel DB] Successfully initialized sqlite DB from ${cand} to ${tmpDbPath}`);
          copied = true;
          break;
        } catch (e) {
          console.error('[Vercel DB] Failed to copy sqlite file to /tmp:', e);
        }
      }
    }
    if (!copied) {
      console.warn('[Vercel DB] Could not find candidate dev.db to copy to /tmp');
    }
  }

  // Always point DATABASE_URL to /tmp/dev.db when on Vercel so writes never fail
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
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

// Auto-configure SQLite for high concurrency and ultra-fast performance
if (!globalForPrisma.sqliteOptimized) {
  globalForPrisma.sqliteOptimized = true;
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .catch(() => prisma.$queryRawUnsafe('PRAGMA journal_mode = DELETE;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA mmap_size = 268435456;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;'))
    .catch(() => {});
}
