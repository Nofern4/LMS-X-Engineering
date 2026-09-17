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

    const updated = await prisma.course.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' }
    });

    await logAuditEvent(user?.id || null, 'SUBMIT_COURSE_APPROVAL', `COURSE:${id}`);

    return NextResponse.json({ message: 'ส่งขออนุมัติสร้างรายวิชาเรียบร้อยแล้ว', course: updated });
  } catch (error: any) {
    console.error('Submit course approval error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
