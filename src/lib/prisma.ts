import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  sqliteOptimized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Auto-configure SQLite for high concurrency (4500+ users)
if (!globalForPrisma.sqliteOptimized) {
  globalForPrisma.sqliteOptimized = true;
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 30000;'))
    .then(() => prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;'))
    .catch(() => {});
}
