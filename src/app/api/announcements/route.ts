import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const where: any = {};
    if (courseId) {
      where.OR = [
        { level: 'SYSTEM' },
        { courseId: courseId },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, code: true, title: true } },
      }
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงประกาศ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, content, level, courseId, userRoles } = body;

    // Director Read-Only Check
    if (userRoles?.includes('DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)'
      }, { status: 403 });
    }

    if (!title || !content || !userId) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลประกาศให้ครบถ้วน' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        level: level || 'SYSTEM',
        courseId: courseId || null,
        createdById: userId,
        status: 'PUBLISHED',
      }
    });

    await logAuditEvent(userId, 'CREATE_ANNOUNCEMENT', `ANNOUNCEMENT:${announcement.id}`);

    return NextResponse.json({ message: 'สร้างประกาศเรียบร้อยแล้ว', announcement });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างประกาศ' }, { status: 500 });
  }
}
