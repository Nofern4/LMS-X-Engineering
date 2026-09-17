import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAllowedInstitutionalEmail } from '@/lib/auth';
import { logAuditEvent } from '@/lib/rbac';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, studentId, department } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูล ชื่อ, อีเมล และรหัสผ่าน ให้ครบถ้วน' }, { status: 400 });
    }

    // 1. Verify institutional email domain
    const domainSetting = await prisma.systemSetting.findUnique({
      where: { key: 'ALLOWED_EMAIL_DOMAINS' },
    });
    const allowedDomains = domainSetting?.value || '@student.x-karchang.ac.th,@x-karchang.ac.th';

    if (!isAllowedInstitutionalEmail(email, allowedDomains)) {
      return NextResponse.json({
        error: 'กรุณาใช้อีเมลสถาบัน มหาวิทยาลัย Xการช่าง (@student.x-karchang.ac.th)',
      }, { status: 400 });
    }

    // 2. Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'อีเมลนี้ได้ถูกลงทะเบียนในระบบแล้ว' }, { status: 400 });
    }

    // 3. Everyone gets default STUDENT role on registration
    let studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: {
          name: 'STUDENT',
          description: 'สิทธิ์นักศึกษา/นักเรียน สำหรับเข้าเรียนและเข้าชมสื่อ มหาวิทยาลัย Xการช่าง',
        },
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password,
        studentId: studentId || null,
        department: department || 'นักศึกษาสถาบัน มหาวิทยาลัย Xการช่าง',
        status: 'ACTIVE',
        userRoles: {
          create: {
            roleId: studentRole.id,
          },
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    await logAuditEvent(newUser.id, 'USER_REGISTER_SUCCESS', email, undefined, { role: 'STUDENT' });

    return NextResponse.json({
      message: 'ลงทะเบียนสำเร็จ! เข้าสู่ระบบในฐานะนักเรียนเรียบร้อยแล้ว',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        studentId: newUser.studentId,
        department: newUser.department,
        status: newUser.status,
        roles: ['STUDENT'],
      },
    });
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
