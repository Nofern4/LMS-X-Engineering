import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user } = body;

    // Resolve real student in DB first
    const userEmail = user?.email || (typeof user === 'string' ? user : '');
    const userId = user?.id || '';

    const studentUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [{ email: 'student@student.x-karchang.ac.th' }])
        ]
      },
      include: {
        userRoles: { include: { role: true } }
      }
    });

    if (!studentUser) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้งานในระบบ' }, { status: 404 });
    }

    const roles = user?.roles || studentUser.userRoles.map((ur: any) => ur.role.name);
    if (roles.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    let course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      const aliasMap: Record<string, string> = {
        'course-1': 'CS101', 'course-2': 'ME201', 'course-3': 'EE305',
        'course-4': 'AUTO101', 'course-5': 'SE302', 'course-6': 'AI401',
      };
      const searchCode = aliasMap[id] || id;
      course = await prisma.course.findUnique({ where: { code: searchCode } });
    }

    if (!course) {
      return NextResponse.json({ error: 'ไม่พบรายวิชาที่ระบุ' }, { status: 404 });
    }

    const realStudentId = studentUser.id;

    // ตรวจสอบ enrollment ที่มีอยู่แล้ว
    const existing = await prisma.courseEnrollment.findUnique({
      where: { courseId_studentId: { courseId: course.id, studentId: realStudentId } }
    });

    // ถ้าอนุมัติแล้ว → ไม่ต้องทำอะไร
    if (existing && existing.status === 'APPROVED') {
      return NextResponse.json({ message: 'คุณได้รับการอนุมัติเข้าเรียนแล้ว', enrollment: existing });
    }
    // ถ้ารออยู่ → ไม่ต้อง re-apply
    if (existing && existing.status === 'PENDING') {
      return NextResponse.json({ message: 'คำขอของคุณยังรออยู่ระหว่างพิจารณา', enrollment: existing });
    }

    const initialStatus = course.accessType === 'OPEN' ? 'APPROVED' : 'PENDING';

    // สร้างใหม่หรือ reset จาก REJECTED → PENDING/APPROVED
    const enrollment = await prisma.courseEnrollment.upsert({
      where: { courseId_studentId: { courseId: course.id, studentId: realStudentId } },
      update: {
        status: initialStatus,
        requestedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
        approvedById: null,
        approvedAt: null,
      },
      create: {
        courseId: course.id,
        studentId: realStudentId,
        status: initialStatus,
        requestedAt: new Date(),
      }
    });

    await logAuditEvent(realStudentId, 'ENROLLMENT_REQUESTED', `COURSE:${course.id}`, undefined, { status: initialStatus });

    return NextResponse.json({
      message: initialStatus === 'APPROVED' ? 'เข้าร่วมรายวิชาเรียบร้อยแล้ว' : 'ส่งคำขอเข้าเรียนเรียบร้อยแล้ว รอการอนุมัติจากอาจารย์ผู้สอน',
      enrollment
    });
  } catch (error: any) {
    console.error('Enroll course error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
