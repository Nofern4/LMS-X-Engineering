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

import { clearCourseCache } from '@/lib/courseCache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, studentId, action, rejectionReason, user, enrollmentId } = body; // action: 'APPROVE' | 'REJECT' | 'REMOVE'

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    const allowedRoles = ['COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER', 'ADMIN', 'APPROVER', 'REGISTRAR'];
    const hasPermission = !user || !user.roles || user.roles.some((r: string) => allowedRoles.includes(r));
    if (!hasPermission) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์อนุมัติการเข้าเรียน (สิทธิ์เฉพาะผู้มีอำนาจอนุมัติเท่านั้น)' }, { status: 403 });
    }

    let nextStatus: 'APPROVED' | 'REJECTED' | 'REMOVED' = 'APPROVED';
    if (action === 'REJECT') nextStatus = 'REJECTED';
    if (action === 'REMOVE') nextStatus = 'REMOVED';

    // Locate the enrollment record flexibly
    let targetEnrollment: any = null;
    if (enrollmentId) {
      targetEnrollment = await prisma.courseEnrollment.findUnique({ where: { id: enrollmentId } });
    }
    if (!targetEnrollment && courseId && studentId) {
      targetEnrollment = await prisma.courseEnrollment.findFirst({
        where: {
          courseId,
          OR: [
            { studentId },
            { student: { id: studentId } },
            { student: { studentId } },
            { student: { email: studentId } },
          ],
        },
      });
    }

    if (!targetEnrollment) {
      if (!courseId || !studentId) {
        return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (courseId, studentId หรือ enrollmentId)' }, { status: 400 });
      }
    }

    // Resolve valid approver id to avoid foreign key violation
    let validApproverId: string | null = null;
    if (action === 'APPROVE') {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) validApproverId = dbUser.id;
      }
      if (!validApproverId && user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) validApproverId = dbUser.id;
      }
    }

    let updated;
    if (targetEnrollment) {
      updated = await prisma.courseEnrollment.update({
        where: { id: targetEnrollment.id },
        data: {
          status: nextStatus,
          approvedById: validApproverId,
          approvedAt: action === 'APPROVE' ? new Date() : null,
          rejectedAt: action === 'REJECT' ? new Date() : null,
          rejectionReason: action === 'REJECT' ? rejectionReason || 'ไม่อนุมัติโดยผู้อนุมัติ' : null,
        },
      });
    } else {
      updated = await prisma.courseEnrollment.update({
        where: {
          courseId_studentId: {
            courseId,
            studentId,
          },
        },
        data: {
          status: nextStatus,
          approvedById: validApproverId,
          approvedAt: action === 'APPROVE' ? new Date() : null,
          rejectedAt: action === 'REJECT' ? new Date() : null,
          rejectionReason: action === 'REJECT' ? rejectionReason || 'ไม่อนุมัติโดยผู้อนุมัติ' : null,
        },
      });
    }

    clearCourseCache();

    let auditUserId = validApproverId;
    await logAuditEvent(auditUserId, `STUDENT_ENROLLMENT_${action}`, `COURSE:${courseId || targetEnrollment?.courseId}:STUDENT:${studentId || targetEnrollment?.studentId}`, undefined, {
      courseId: courseId || targetEnrollment?.courseId,
      studentId: studentId || targetEnrollment?.studentId,
      action,
    });

    return NextResponse.json({
      message: `ดำเนินการ ${action === 'APPROVE' ? 'อนุมัติการเข้าเรียน' : 'ไม่อนุมัติการเข้าเรียน'} เรียบร้อยแล้ว`,
      enrollment: updated,
      success: true,
    });
  } catch (error: any) {
    console.error('Approve enrollment error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
