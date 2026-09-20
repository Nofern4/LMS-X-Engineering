import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function fix() {
  // AI401 ต้อง PUBLISHED (ไม่ใช่ PENDING_APPROVAL)
  const r1 = await p.course.updateMany({
    where: { code: { in: ['AI401', 'EE305', 'SE302', 'AUTO101'] } },
    data: { status: 'PUBLISHED' as any },
  });
  console.log('Fixed statuses to PUBLISHED:', r1);

  // EE305 และ ME201 ควรเป็น APPROVAL_REQUIRED (closed courses)
  const r2 = await p.course.updateMany({
    where: { code: { in: ['EE305', 'ME201'] } },
    data: { accessType: 'APPROVAL_REQUIRED' as any },
  });

  // AI401, SE302, AUTO101 ควรเป็น OPEN
  await p.course.updateMany({
    where: { code: { in: ['AI401', 'SE302', 'AUTO101'] } },
    data: { accessType: 'OPEN' as any },
  });
  console.log('EE305 set to APPROVAL_REQUIRED:', r2);

  const courses = await p.course.findMany({
    select: { code: true, status: true, accessType: true, _count: { select: { materials: true } } },
    orderBy: { code: 'asc' },
  });
  console.log('\n✅ Final course status:');
  for (const c of courses) {
    console.log(`  ${c.code}: status=${c.status}, access=${c.accessType}, materials=${c._count.materials}`);
  }
}

fix().finally(() => p.$disconnect());
