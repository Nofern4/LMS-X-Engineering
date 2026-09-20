import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: id },
      include: {
        student: { select: { id: true, name: true, email: true, studentId: true, department: true, status: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    console.error('Get enrolled students error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user, studentId, action, rejectionReason } = body; // action: "APPROVE" | "REJECT" | "REMOVE"

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    const allowedRoles = ['PROFESSOR', 'ADMIN', 'COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER', 'REGISTRAR'];
    const hasPermission = user?.roles?.some((r: string) => allowedRoles.includes(r));
    if (!user || !hasPermission) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์อนุมัตินักเรียนในรายวิชานี้' }, { status: 403 });
    }

    let nextStatus: 'APPROVED' | 'REJECTED' | 'REMOVED' = 'APPROVED';
    if (action === 'REJECT') nextStatus = 'REJECTED';
    if (action === 'REMOVE') nextStatus = 'REMOVED';

    const updated = await prisma.courseEnrollment.update({
      where: {
        courseId_studentId: {
          courseId: id,
          studentId: studentId,
        }
      },
      data: {
        status: nextStatus,
        approvedById: action === 'APPROVE' ? user.id : null,
        approvedAt: action === 'APPROVE' ? new Date() : null,
        rejectedAt: action === 'REJECT' ? new Date() : null,
        rejectionReason: action === 'REJECT' ? rejectionReason || 'ไม่อนุมัติโดยอาจารย์ผู้สอน' : null,
      }
    });

    await logAuditEvent(user.id, `STUDENT_ENROLLMENT_${action}`, `COURSE:${id}:STUDENT:${studentId}`);

    return NextResponse.json({
      message: `ดำเนินการ ${action} นักเรียนเรียบร้อยแล้ว`,
      enrollment: updated
    });
  } catch (error: any) {
    console.error('Manage student enrollment error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
