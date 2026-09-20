const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running WAL checkpoint...');
  const cp = await prisma.$queryRawUnsafe('PRAGMA wal_checkpoint(TRUNCATE);');
  console.log('Checkpoint:', cp);
  const jm = await prisma.$queryRawUnsafe('PRAGMA journal_mode = DELETE;');
  console.log('Journal mode:', jm);
  await prisma.$disconnect();
  console.log('Done!');
}

main().catch(console.error);
