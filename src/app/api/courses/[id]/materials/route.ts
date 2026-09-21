import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const materials = await prisma.learningMaterial.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    });

    // Strip base64 data from list response for performance (only return metadata)
    const sanitized = materials.map((m) => ({
      ...m,
      filePath: m.filePath?.startsWith('data:') ? '[STORED_AS_DATAURL]' : m.filePath,
      fileSize: Number(m.fileSize),
    }));

    return NextResponse.json({ materials: sanitized });
  } catch (error: any) {
    console.error('Get materials error:', error?.message || error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Director Read-Only Check
    const userJson = request.headers.get('x-user');
    let reqUser: any = null;
    if (userJson) {
      try { reqUser = JSON.parse(userJson); } catch (e) {}
    }

    if (reqUser && reqUser.roles?.includes('DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only) ไม่สามารถอัปโหลดสื่อได้'
      }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const type = (formData.get('type') as string) || 'DOCUMENT';
    const userId = formData.get('userId') as string;
    const file = formData.get('file') as File | null;
    const externalLink = formData.get('link') as string | null;

    if (!title || !userId) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อสื่อการเรียนรู้และ userId' }, { status: 400 });
    }

    // Validate userId exists in DB
    const uploader = await prisma.user.findUnique({ where: { id: userId } });
    if (!uploader) {
      // Try to find any admin user as fallback uploader
      const fallbackUser = await prisma.user.findFirst({
        where: { userRoles: { some: { role: { name: { in: ['PROFESSOR', 'ADMIN', 'REGISTRAR'] } } } } },
      });
      if (!fallbackUser) {
        return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่' }, { status: 400 });
      }
    }

    const finalUserId = uploader?.id || (await prisma.user.findFirst())?.id;
    if (!finalUserId) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้งานในระบบ' }, { status: 400 });
    }

    // Query course storage limit & current usage
    const course = await prisma.course.findUnique({
      where: { id },
      include: { materials: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'ไม่พบรายวิชาที่ระบุ' }, { status: 404 });
    }

    const currentUsedBytes = course.materials.reduce((sum, m) => sum + Number(m.fileSize), 0);
    const newFileSizeBytes = file ? file.size : 0;
    const limitBytes = course.storageLimitGb * 1024 * 1024 * 1024;

    if (file && currentUsedBytes + newFileSizeBytes > limitBytes) {
      const usedGb = (currentUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
      return NextResponse.json({
        error: `พื้นที่จัดเก็บของรายวิชานี้เต็มแล้ว (ใช้ไปแล้ว ${usedGb} GB / ${course.storageLimitGb} GB)`,
        usedGb,
        limitGb: course.storageLimitGb,
      }, { status: 400 });
    }

    let filePath = externalLink || '';
    let mimeType = 'application/octet-stream';

    if (file) {
      mimeType = file.type || 'application/octet-stream';
      const buffer = Buffer.from(await file.arrayBuffer());

      // Try local filesystem first (works in dev), fallback to base64 data URL (works on Vercel)
      let savedToFs = false;
      try {
        const fs = await import('fs');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'uploads', 'courses', id);

        // Only attempt if we can actually write (not Vercel read-only)
        if (!process.env.VERCEL) {
          fs.mkdirSync(uploadDir, { recursive: true });
          const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const fullPath = path.join(uploadDir, safeName);
          fs.writeFileSync(fullPath, buffer);
          filePath = `courses/${id}/${safeName}`;
          savedToFs = true;
        }
      } catch (fsErr) {
        console.warn('FS write skipped (Vercel environment):', (fsErr as Error).message);
      }

      if (!savedToFs) {
        // Store as base64 data URL — works on any serverless platform
        // For large files, truncate and store just the reference
        if (buffer.length > 5 * 1024 * 1024) {
          // Files > 5MB: store external link placeholder (user should use YouTube/Drive links)
          filePath = externalLink || `data:${mimeType};info,FILE_TOO_LARGE_USE_EXTERNAL_LINK`;
        } else {
          filePath = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }
      }
    }

    const material = await prisma.learningMaterial.create({
      data: {
        courseId: id,
        title,
        description,
        type: type as any,
        filePath,
        fileSize: BigInt(newFileSizeBytes),
        mimeType,
        duration: 0,
        status: 'APPROVED',
        uploadedById: finalUserId,
      },
    });

    try {
      await logAuditEvent(finalUserId, 'UPLOAD_MATERIAL', `MATERIAL:${material.id}`, undefined, {
        title,
        type,
        fileSize: newFileSizeBytes,
      });
    } catch (auditErr) {
      console.warn('Audit log skipped:', auditErr);
    }

    return NextResponse.json({
      message: 'อัปโหลดสื่อการเรียนรู้สำเร็จ',
      material: {
        ...material,
        fileSize: Number(material.fileSize),
        // Don't return full base64 in response
        filePath: filePath.startsWith('data:') ? `[STORED_INLINE_${type}]` : filePath,
      },
    });
  } catch (error: any) {
    console.error('Upload material error:', error?.message || error);
    return NextResponse.json({
      error: `เกิดข้อผิดพลาด: ${error?.message || 'กรุณาลองใหม่อีกครั้ง'}`,
    }, { status: 500 });
  }
}
