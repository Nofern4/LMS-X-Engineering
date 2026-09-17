import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user } = body;

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    if (!user || !user.roles?.includes('STUDENT')) {
      return NextResponse.json({ error: 'เฉพาะนักศึกษาเท่านั้นที่สามารถขอเข้าร่วมรายวิชาได้' }, { status: 403 });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: 'ไม่พบรายวิชาที่ระบุ' }, { status: 404 });
    }

    const initialStatus = course.accessType === 'OPEN' ? 'APPROVED' : 'PENDING';

    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        courseId_studentId: {
          courseId: id,
          studentId: user.id,
        }
      },
      update: {
        status: initialStatus,
        requestedAt: new Date(),
      },
      create: {
        courseId: id,
        studentId: user.id,
        status: initialStatus,
        requestedAt: new Date(),
      }
    });

    await logAuditEvent(user.id, 'ENROLLMENT_REQUESTED', `COURSE:${id}`, undefined, { status: initialStatus });

    return NextResponse.json({
      message: initialStatus === 'APPROVED' ? 'เข้าร่วมรายวิชาเรียบร้อยแล้ว' : 'ส่งคำขอเข้าเรียนเรียบร้อยแล้ว รอการอนุมัติจากอาจารย์ผู้สอน',
      enrollment
    });
  } catch (error: any) {
    console.error('Enroll course error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
