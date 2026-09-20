import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where,
      include: {
        course: { select: { id: true, code: true, title: true, category: true, accessType: true } },
        student: { select: { id: true, name: true, email: true, studentId: true, department: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    console.error('Get all enrollments error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเข้าเรียน' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, studentId, action, rejectionReason, user } = body; // action: 'APPROVE' | 'REJECT' | 'REMOVE'

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    const allowedRoles = ['COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER', 'ADMIN', 'APPROVER'];
    const hasPermission = user?.roles?.some((r: string) => allowedRoles.includes(r));
    if (!user || !hasPermission) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์อนุมัติการเข้าเรียน (สิทธิ์เฉพาะผู้มีอำนาจอนุมัติเท่านั้น)' }, { status: 403 });
    }

    if (!courseId || !studentId) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (courseId, studentId)' }, { status: 400 });
    }

    let nextStatus: 'APPROVED' | 'REJECTED' | 'REMOVED' = 'APPROVED';
    if (action === 'REJECT') nextStatus = 'REJECTED';
    if (action === 'REMOVE') nextStatus = 'REMOVED';

    const updated = await prisma.courseEnrollment.update({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
      data: {
        status: nextStatus,
        approvedById: action === 'APPROVE' ? user.id : null,
        approvedAt: action === 'APPROVE' ? new Date() : null,
        rejectedAt: action === 'REJECT' ? new Date() : null,
        rejectionReason: action === 'REJECT' ? rejectionReason || 'ไม่อนุมัติโดยผู้อนุมัติ' : null,
      },
    });

    await logAuditEvent(user.id, `STUDENT_ENROLLMENT_${action}`, `COURSE:${courseId}:STUDENT:${studentId}`, undefined, {
      courseId,
      studentId,
      action,
    });

    return NextResponse.json({
      message: `ดำเนินการ ${action === 'APPROVE' ? 'อนุมัติการเข้าเรียน' : 'ไม่อนุมัติการเข้าเรียน'} เรียบร้อยแล้ว`,
      enrollment: updated,
    });
  } catch (error: any) {
    console.error('Approve enrollment error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
