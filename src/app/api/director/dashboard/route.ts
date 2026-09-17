import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      activeStudentsCount,
      professorsCount,
      approversCount,
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
      totalMaterials,
      totalVideos,
      coursesList,
      recentAnnouncements,
      materials
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE', userRoles: { some: { role: { name: 'STUDENT' } } } } }),
      prisma.user.count({ where: { status: 'ACTIVE', userRoles: { some: { role: { name: 'PROFESSOR' } } } } }),
      prisma.user.count({ where: { status: 'ACTIVE', userRoles: { some: { role: { name: { in: ['COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER'] } } } } } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.course.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.courseEnrollment.count(),
      prisma.learningMaterial.count(),
      prisma.learningMaterial.count({ where: { type: 'VIDEO' } }),
      prisma.course.findMany({
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          title: true,
          category: true,
          status: true,
          accessType: true,
          createdBy: { select: { name: true } },
          _count: { select: { enrollments: true, materials: true } },
        },
      }),
      prisma.announcement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, level: true, publishedAt: true },
      }),
      prisma.learningMaterial.findMany({ select: { fileSize: true } })
    ]);

    // Calculate total storage in GB
    const totalStorageBytes = materials.reduce((acc, m) => acc + Number(m.fileSize), 0);
    const storageUsedGb = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);

    // Dynamic materials per course for charts
    const courseMaterialStats = coursesList.map(c => ({
      code: c.code,
      title: c.title.replace(/\s*\([A-Za-z0-9\s&,.-]+\)/g, '').trim(),
      materials: c._count.materials,
      enrollments: c._count.enrollments,
      category: c.category,
      status: c.status
    }));

    // Category distribution
    const categoryCountMap: Record<string, number> = {};
    coursesList.forEach(c => {
      categoryCountMap[c.category] = (categoryCountMap[c.category] || 0) + 1;
    });
    const categoryStats = Object.entries(categoryCountMap).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      overview: {
        totalStudents: activeStudentsCount,
        totalProfessors: professorsCount,
        totalApprovers: approversCount,
        totalCourses,
        publishedCourses,
        pendingCourses,
        totalEnrollments,
        totalMaterials,
        totalVideos,
        storageUsedGb,
      },
      courses: coursesList,
      courseMaterialStats,
      categoryStats,
      recentAnnouncements,
      readOnlyNotice: 'โหมดผู้อำนวยการ: แสดงผลข้อมูลและสถิติภาพรวมสถาบัน (Read-Only)',
    });
  } catch (error: any) {
    console.error('Director dashboard API error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดสถิติ' }, { status: 500 });
  }
}

