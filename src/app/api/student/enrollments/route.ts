import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'student@student.x-karchang.ac.th';
    const studentId = searchParams.get('studentId');

    // Find student
    const student = await prisma.user.findFirst({
      where: studentId ? { id: studentId } : { email },
    });

    if (!student) {
      return NextResponse.json({ enrollments: [] });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        course: {
          include: {
            instructors: {
              include: {
                instructor: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            _count: {
              select: { materials: true, enrollments: true },
            },
          },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ enrollments, student });
  } catch (error: any) {
    console.error('Get student enrollments error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน' }, { status: 500 });
  }
}
