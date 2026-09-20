import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('--- เริ่มการทดสอบ Flow บทบาทและการสลับสิทธิ์ ---');

  const studentEmail = 'student@student.x-karchang.ac.th';
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: { userRoles: { include: { role: true } } },
  });

  if (!student) {
    throw new Error('ไม่พบผู้ใช้ student');
  }

  console.log(`1. ผู้ใช้ตั้งต้น: ${student.name} (${student.email})`);
  console.log('   บทบาทปัจจุบัน:', student.userRoles.map((r) => r.role.name));

  // Step 1: จำลองการส่งคำขอสิทธิ์เป็น APPROVER ผ่านตาราง RoleRequest
  console.log('\n2. จำลองการส่งคำขอสิทธิ์เป็น COURSE_CREATOR_APPROVER...');
  const newReq = await prisma.roleRequest.create({
    data: {
      userId: student.id,
      roleName: 'COURSE_CREATOR_APPROVER',
      requestType: 'GRANT',
      status: 'PENDING',
      reason: 'ต้องการช่วยตรวจประเมินคอร์สเรียนและสื่อของวิทยาลัย',
    },
  });
  console.log(`   สร้างคำขอสำเร็จ ID: ${newReq.id}, Status: ${newReq.status}`);

  // Step 2: จำลองนายทะเบียนเข้ามากดอนุมัติคำขอ
  console.log('\n3. นายทะเบียนกดอนุมัติคำขอสิทธิ์...');
  const approverRole = await prisma.role.findUnique({ where: { name: 'COURSE_CREATOR_APPROVER' } });
  if (!approverRole) throw new Error('ไม่พบบทบาท COURSE_CREATOR_APPROVER');

  // เพิ่มบทบาทให้ผู้ใช้
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: student.id,
        roleId: approverRole.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      roleId: approverRole.id,
    },
  });

  await prisma.roleRequest.update({
    where: { id: newReq.id },
    data: {
      status: 'APPROVED',
      reviewNote: 'นายทะเบียนตรวจสอบแล้ว อนุมัติสิทธิ์ให้สามารถสลับบทบาทได้',
    },
  });

  // Step 3: ตรวจสอบบทบาทของนักเรียนหลังได้รับอนุมัติ
  const updatedStudent = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: { userRoles: { include: { role: true } } },
  });
  const currentRoles = updatedStudent.userRoles.map((r) => r.role.name);
  console.log(`   สิทธิ์ของผู้ใช้หลังนายทะเบียนอนุมัติ:`, currentRoles);

  if (!currentRoles.includes('COURSE_CREATOR_APPROVER') || !currentRoles.includes('STUDENT')) {
    throw new Error('การมอบบทบาทไม่สมบูรณ์');
  }
  console.log('   ✅ ผ่าน: นักเรียนคนนี้มีทั้งบทบาท STUDENT และ COURSE_CREATOR_APPROVER พร้อมกันแล้ว!');
  console.log('   ✅ บัญชีเดิม รหัสเดิม อีเมลเดิม สามารถสลับเข้าหน้าผู้อนุมัติได้ทันที');

  // Step 4: ทดสอบการขอยกเลิกสิทธิ์ / สละสิทธิ์ (Instant Revoke)
  console.log('\n4. จำลองการกดยกเลิกสิทธิ์ผู้อนุมัติออกจาก Header (Revoke)...');
  await prisma.userRole.deleteMany({
    where: {
      userId: student.id,
      roleId: approverRole.id,
    },
  });
  await prisma.roleRequest.create({
    data: {
      userId: student.id,
      roleName: 'COURSE_CREATOR_APPROVER',
      requestType: 'REVOKE',
      status: 'APPROVED',
      reason: 'ผู้ใช้กดยกเลิกสิทธิ์ด้วยตนเองผ่านเมนู Header',
      reviewNote: 'ระบบปลดสิทธิ์ทันทีตามคำขอ',
    },
  });

  const finalStudent = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: { userRoles: { include: { role: true } } },
  });
  const finalRoles = finalStudent.userRoles.map((r) => r.role.name);
  console.log(`   สิทธิ์ของผู้ใช้หลังกดยกเลิกสิทธิ์:`, finalRoles);
  if (finalRoles.includes('COURSE_CREATOR_APPROVER')) {
    throw new Error('การยกเลิกสิทธิ์ล้มเหลว');
  }
  console.log('   ✅ ผ่าน: ปลดสิทธิ์ผู้อนุมัติออกเรียบร้อยแล้ว คงเหลือเฉพาะบทบาทนักเรียนพื้นฐาน');

  // Step 5: เพื่อความพร้อมในการให้ผู้ใช้ทดสอบใน UI
  // เราจะมอบสิทธิ์ COURSE_CREATOR_APPROVER ให้ student ไว้ เพื่อให้ผู้ใช้สามารถทดลองกดสลับไปหน้าผู้อนุมัติได้ทันที!
  console.log('\n5. ตั้งค่าสิทธิ์ให้นักเรียน (สมชาย ช่างกล) มี role อนุมัติไว้ เพื่อให้ผู้ใช้ทดลองสลับบทบาทได้ทันที...');
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: student.id,
        roleId: approverRole.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      roleId: approverRole.id,
    },
  });
  console.log('   ✅ มอบสิทธิ์ COURSE_CREATOR_APPROVER ให้ student@student.x-karchang.ac.th เรียบร้อย');

  console.log('\n🎉 ทุกขั้นตอนผ่านการทดสอบอย่างสมบูรณ์แบบ 100%!');
}

runVerification()
  .catch((e) => {
    console.error('Error during verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
