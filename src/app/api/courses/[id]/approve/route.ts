import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user, action, rejectionReason } = body; // action = "APPROVE" | "REJECT"

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)' }, { status: 403 });
    }

    if (!user || (!user.roles?.includes('COURSE_CREATOR_APPROVER') && !user.roles?.includes('ADMIN'))) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ในการอนุมัติรายวิชา' }, { status: 403 });
    }

    const nextStatus = action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED';

    const updated = await prisma.course.update({
      where: { id },
      data: {
        status: nextStatus,
        rejectionReason: action === 'REJECT' ? rejectionReason || 'ข้อมูลวิชาไม่สมบูรณ์' : null
      }
    });

    await logAuditEvent(user.id, `COURSE_DECISION_${action}`, `COURSE:${id}`, undefined, { rejectionReason });

    return NextResponse.json({
      message: action === 'APPROVE' ? 'อนุมัติการสร้างรายวิชาเรียบร้อยแล้ว' : 'ไม่อนุมัติการสร้างรายวิชา',
      course: updated
    });
  } catch (error: any) {
    console.error('Approve course error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
