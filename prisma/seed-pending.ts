import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding pending requests for approver, registrar, and student...');

  // 1. Set course XK-740 to PENDING_APPROVAL so Course Approver has a pending course request
  const c740 = await prisma.course.findUnique({ where: { code: 'XK-740' } });
  if (c740) {
    await prisma.course.update({
      where: { id: c740.id },
      data: { status: 'PENDING_APPROVAL' },
    });
    console.log('Set XK-740 status to PENDING_APPROVAL');
  }

  // 2. Set course XK-987 to PENDING_APPROVAL as well
  const c987 = await prisma.course.findUnique({ where: { code: 'XK-987' } });
  if (c987) {
    await prisma.course.update({
      where: { id: c987.id },
      data: { status: 'PENDING_APPROVAL' },
    });
    console.log('Set XK-987 status to PENDING_APPROVAL');
  }

  // 3. Find students for pending course enrollment
  const student1 = await prisma.user.findFirst({
    where: { email: 'student@student.x-karchang.ac.th' },
  });
  const student2 = await prisma.user.findFirst({
    where: { email: 'student2@student.x-karchang.ac.th' },
  });

  const targetCourse = await prisma.course.findFirst({
    where: { code: 'CS101' },
  });

  if (student1 && targetCourse) {
    await prisma.courseEnrollment.upsert({
      where: {
        courseId_studentId: {
          courseId: targetCourse.id,
          studentId: student1.id,
        },
      },
      update: { status: 'PENDING' },
      create: {
        courseId: targetCourse.id,
        studentId: student1.id,
        status: 'PENDING',
      },
    });
    console.log('Added pending enrollment for student1 on CS101');
  }

  if (student2 && targetCourse) {
    await prisma.courseEnrollment.upsert({
      where: {
        courseId_studentId: {
          courseId: targetCourse.id,
          studentId: student2.id,
        },
      },
      update: { status: 'PENDING' },
      create: {
        courseId: targetCourse.id,
        studentId: student2.id,
        status: 'PENDING',
      },
    });
    console.log('Added pending enrollment for student2 on CS101');
  }

  // 4. Add pending Role Requests for Registrar
  if (student1) {
    await prisma.roleRequest.deleteMany({
      where: {
        userId: student1.id,
        status: 'PENDING',
      },
    });

    await prisma.roleRequest.create({
      data: {
        userId: student1.id,
        roleName: 'PROFESSOR',
        requestType: 'GRANT',
        status: 'PENDING',
        reason: 'ขอรับสิทธิ์อาจารย์พิเศษ เพื่อทดสอบเปิดสอนวิชาฝึกงานช่างยนต์',
      },
    });
    console.log('Created pending role request for PROFESSOR');
  }

  if (student2) {
    await prisma.roleRequest.deleteMany({
      where: {
        userId: student2.id,
        status: 'PENDING',
      },
    });

    await prisma.roleRequest.create({
      data: {
        userId: student2.id,
        roleName: 'COURSE_CREATOR_APPROVER',
        requestType: 'GRANT',
        status: 'PENDING',
        reason: 'ขอรับสิทธิ์กรรมการตรวจประเมินรายวิชาและสื่อการสอน',
      },
    });
    console.log('Created pending role request for COURSE_CREATOR_APPROVER');
  }

  console.log('All pending requests successfully seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
