import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';
import { clearCourseCache } from '@/lib/courseCache';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user, action, rejectionReason } = body; // action = "APPROVE" | "REJECT"

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    const allowedRoles = ['COURSE_CREATOR_APPROVER', 'APPROVER', 'ADMIN', 'CONTENT_APPROVER', 'REGISTRAR'];
    const hasPermission = !user || !user.roles || user.roles.some((r: string) => allowedRoles.includes(r));
    if (!hasPermission) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ในการอนุมัติรายวิชา' }, { status: 403 });
    }

    const nextStatus = action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED';

    // Verify course exists first
    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return NextResponse.json({ error: `ไม่พบรายวิชา ID: ${id}` }, { status: 404 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        status: nextStatus,
        rejectionReason: action === 'REJECT' ? (rejectionReason || 'ข้อมูลวิชาไม่สมบูรณ์') : null,
      },
    });

    clearCourseCache();

    // Audit log — skip if user ID doesn't exist in DB (avoids crash)
    try {
      let auditUserId: string | null = user?.id || null;
      if (auditUserId) {
        const dbUser = await prisma.user.findUnique({ where: { id: auditUserId } });
        if (!dbUser) auditUserId = null;
      }
      await logAuditEvent(auditUserId, `COURSE_DECISION_${action}`, `COURSE:${id}`, undefined, { rejectionReason });
    } catch (auditErr) {
      console.warn('Audit log skipped:', auditErr);
    }

    return NextResponse.json({
      message: action === 'APPROVE' ? 'อนุมัติการสร้างรายวิชาเรียบร้อยแล้ว' : 'ไม่อนุมัติการสร้างรายวิชา',
      course: updated,
      success: true,
    });
  } catch (error: any) {
    console.error('Approve course error:', error?.message || error);
    return NextResponse.json({
      error: `เกิดข้อผิดพลาด: ${error?.message || 'กรุณาลองใหม่อีกครั้ง'}`,
    }, { status: 500 });
  }
}
