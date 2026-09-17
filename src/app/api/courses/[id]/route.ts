import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceReadOnlyIfDirector, logAuditEvent } from '@/lib/rbac';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, department: true } },
        instructors: { include: { instructor: { select: { id: true, name: true, email: true } } } },
        materials: {
          orderBy: { order: 'asc' },
          include: { uploadedBy: { select: { id: true, name: true } } }
        },
        enrollments: {
          include: { student: { select: { id: true, name: true, email: true, studentId: true } } }
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true } } }
        },
        _count: { select: { enrollments: true, materials: true } }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'ไม่พบรายวิชาที่ระบุ' }, { status: 404 });
    }

    // Calculate total materials storage used for this course
    const totalBytes = course.materials.reduce((acc, m) => acc + Number(m.fileSize), 0);
    const usedStorageGb = totalBytes / (1024 * 1024 * 1024);

    return NextResponse.json({
      course: {
        ...course,
        usedStorageGb,
        remainingStorageGb: Math.max(0, course.storageLimitGb - usedStorageGb)
      }
    });
  } catch (error: any) {
    console.error('Get course detail error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user, title, description, category, semester, academicYear, accessType, storageLimitGb, status } = body;

    // Director Read-Only Check
    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only) ไม่สามารถแก้ไขรายวิชาได้'
      }, { status: 403 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(semester && { semester }),
        ...(academicYear && { academicYear }),
        ...(accessType && { accessType }),
        ...(storageLimitGb && { storageLimitGb: parseFloat(storageLimitGb) }),
        ...(status && { status }),
      }
    });

    await logAuditEvent(user?.id || null, 'UPDATE_COURSE', `COURSE:${id}`, undefined, { updated });

    return NextResponse.json({ message: 'อัปเดตข้อมูลรายวิชาสำเร็จ', course: updated });
  } catch (error: any) {
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
