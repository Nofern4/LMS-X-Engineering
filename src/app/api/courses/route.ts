import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforceReadOnlyIfDirector, logAuditEvent } from '@/lib/rbac';
import { AuthenticatedUser } from '@/lib/auth';
import { getCacheEntry, setCacheEntry, clearCourseCache as clearCache } from '@/lib/courseCache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const searchType = searchParams.get('searchType') || 'all'; // 'all' | 'instructor' | 'course' | 'code' | 'class'
    const category = searchParams.get('category') || '';
    const semester = searchParams.get('semester') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Never cache PENDING_APPROVAL queries so approvers always see live real-time state
    const isApprovalQuery = status === 'PENDING_APPROVAL';
    const cacheKey = `${search}_${searchType}_${category}_${semester}_${status}_${page}_${limit}`;
    if (!isApprovalQuery) {
      const cached = getCacheEntry(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.data);
      }
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search.trim()) {
      const q = search.trim();
      if (searchType === 'instructor') {
        where.OR = [
          { createdBy: { name: { contains: q } } },
          { instructors: { some: { instructor: { name: { contains: q } } } } },
        ];
      } else if (searchType === 'course') {
        where.title = { contains: q };
      } else if (searchType === 'code') {
        where.code = { contains: q };
      } else if (searchType === 'class') {
        where.OR = [
          { title: { contains: q } },
          { code: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
        ];
      } else {
        // 'all'
        where.OR = [
          { code: { contains: q } },
          { title: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
          { createdBy: { name: { contains: q } } },
          { instructors: { some: { instructor: { name: { contains: q } } } } },
        ];
      }
    }
    if (category) where.category = category;
    if (semester) where.semester = semester;
    if (status) where.status = status;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          instructors: { include: { instructor: { select: { id: true, name: true, email: true } } } },
          enrollments: {
            select: {
              id: true,
              studentId: true,
              status: true,
              student: { select: { email: true } },
            },
          },
          _count: { select: { enrollments: true, materials: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const result = {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache result for 4 seconds to collapse simultaneous requests into 1 DB query
    if (!isApprovalQuery) {
      setCacheEntry(cacheKey, result, 4000);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get courses error:', error);
    return NextResponse.json({ 
      error: error?.message ? `เกิดข้อผิดพลาด: ${error.message}` : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  clearCache(); // invalidate cache on new course creation
  try {
    const body = await request.json();
    const {
      user,
      code,
      title,
      description,
      category,
      semester,
      academicYear,
      accessType,
      storageLimitGb,
      hasQuiz,
      quizUrl,
      initialMaterial,
    } = body;

    // Director Read-Only Check
    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only) ไม่สามารถสร้างรายวิชาได้'
      }, { status: 403 });
    }

    if (!code || !title || !user?.id) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อรายวิชาให้ครบถ้วน' }, { status: 400 });
    }

    // Auto-resolve code uniqueness if duplicate
    let finalCode = code;
    let existing = await prisma.course.findUnique({ where: { code: finalCode } });
    let counter = 1;
    while (existing) {
      finalCode = `XK-${Math.floor(100 + Math.random() * 900)}${counter > 1 ? `-${counter}` : ''}`;
      existing = await prisma.course.findUnique({ where: { code: finalCode } });
      counter++;
    }

    // Find valid user in DB
    let validUserId = user?.id;
    let dbUser = await prisma.user.findUnique({ where: { id: validUserId || '' } });
    if (!dbUser) {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: user?.email || '' },
            { userRoles: { some: { role: { name: 'PROFESSOR' } } } },
            { email: 'professor@x-karchang.ac.th' }
          ]
        }
      });
      if (dbUser) validUserId = dbUser.id;
    }

    if (!validUserId) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้สร้างรายวิชาในระบบ' }, { status: 400 });
    }

    // Prepare initial material if provided (ensure no client-side blob URLs are saved)
    let initialFilePath = initialMaterial?.filePath || initialMaterial?.videoUrl || '';
    if (!initialFilePath || initialFilePath.startsWith('blob:')) {
      initialFilePath = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }

    const materialData = initialMaterial ? {
      title: initialMaterial.title?.trim() || `บทที่ 1: แนะนำรายวิชา ${title}`,
      description: initialMaterial.description?.trim() || '',
      type: initialMaterial.type || 'VIDEO',
      filePath: initialFilePath,
      fileSize: BigInt(initialMaterial.fileSize || 52428800), // ~50MB default
      mimeType: initialMaterial.mimeType || (initialMaterial.type === 'VIDEO' ? 'video/mp4' : 'application/pdf'),
      duration: initialMaterial.duration || 3600,
      status: 'APPROVED' as const,
      visibility: true,
      uploadedById: validUserId,
    } : null;

    const course = await prisma.course.create({
      data: {
        code: finalCode,
        title,
        description: description?.trim() || '',
        category: category || 'ทั่วไป',
        semester: semester || '1',
        academicYear: academicYear || '2026',
        accessType: accessType || 'APPROVAL_REQUIRED',
        storageLimitGb: parseFloat(storageLimitGb || '10.0'),
        hasQuiz: Boolean(hasQuiz),
        quizUrl: quizUrl || null,
        createdById: validUserId,
        status: 'PENDING_APPROVAL',
        instructors: {
          create: {
            instructorId: validUserId,
          },
        },
        ...(materialData ? {
          materials: {
            create: materialData,
          },
        } : {}),
      },
      include: {
        materials: true,
      },
    });

    await logAuditEvent(user.id, 'CREATE_COURSE', `COURSE:${course.id}`, undefined, { code: finalCode, title });

    // Serialize BigInt fields (fileSize) to string for JSON compatibility
    const serializedCourse = {
      ...course,
      materials: (course.materials || []).map((m: any) => ({
        ...m,
        fileSize: m.fileSize ? m.fileSize.toString() : '0',
      })),
    };

    return NextResponse.json({ message: 'สร้างรายวิชาฉบับร่างสำเร็จ', course: serializedCourse });
  } catch (error: any) {
    console.error('Create course error:', error);
    return NextResponse.json({ 
      error: error?.message ? `เกิดข้อผิดพลาด: ${error.message}` : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' 
    }, { status: 500 });
  }
}
