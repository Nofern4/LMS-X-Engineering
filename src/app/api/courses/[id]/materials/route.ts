import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStorageService } from '@/lib/storage';
import { logAuditEvent } from '@/lib/rbac';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const materials = await prisma.learningMaterial.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ materials });
  } catch (error: any) {
    console.error('Get materials error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Director Read-Only Check
    const userJson = request.headers.get('x-user');
    let user: any = null;
    if (userJson) {
      try { user = JSON.parse(userJson); } catch (e) {}
    }

    if (user && user.roles?.includes('DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only) ไม่สามารถอัปโหลดสื่อได้'
      }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const type = (formData.get('type') as string) || 'DOCUMENT';
    const userId = formData.get('userId') as string;
    const file = formData.get('file') as File | null;
    const externalLink = formData.get('link') as string | null;

    if (!title || !userId) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อสื่อการเรียนรู้' }, { status: 400 });
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

    // REQUIREMENT #8: Enforce Course Storage Limit
    if (currentUsedBytes + newFileSizeBytes > limitBytes) {
      const usedGb = (currentUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
      return NextResponse.json({
        error: `พื้นที่จัดเก็บของรายวิชานี้เต็มแล้ว (ใช้ไปแล้ว ${usedGb} GB / ${course.storageLimitGb} GB)`,
        usedGb,
        limitGb: course.storageLimitGb,
      }, { status: 400 });
    }

    let filePath = externalLink || '';
    let mimeType = file ? file.type : 'text/plain';
    let duration = 0;

    if (file) {
      const storage = getStorageService();
      let buffer = Buffer.from(await file.arrayBuffer());
      let fileName = file.name;
      let fileType = file.type;

      // Auto-convert QuickTime (.mov) containers with H.264 video to web-standard .mp4 for instant browser playback
      if (fileName.toLowerCase().endsWith('.mov') || fileType === 'video/quicktime') {
        if (buffer.length > 20 && buffer.toString('ascii', 4, 8) === 'ftyp') {
          buffer.write('isom', 8, 4, 'ascii');
          buffer.write('mp42', 16, 4, 'ascii');
          fileName = fileName.replace(/\.mov$/i, '.mp4');
          fileType = 'video/mp4';
        }
      }

      const uploaded = await storage.upload(buffer, fileName, fileType, `courses/${id}`);
      filePath = uploaded.filePath;
      mimeType = uploaded.mimeType;
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
        duration,
        status: 'APPROVED',
        uploadedById: userId,
      },
    });

    await logAuditEvent(userId, 'UPLOAD_MATERIAL', `MATERIAL:${material.id}`, undefined, {
      title,
      type,
      fileSize: newFileSizeBytes,
    });

    return NextResponse.json({
      message: 'อัปโหลดสื่อการเรียนรู้สำเร็จ',
      material: {
        ...material,
        fileSize: Number(material.fileSize),
      },
    });
  } catch (error: any) {
    console.error('Upload material error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
