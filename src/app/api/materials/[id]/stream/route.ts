import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const material = await prisma.learningMaterial.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!material) {
      return NextResponse.json({ error: 'ไม่พบสื่อการเรียนรู้' }, { status: 404 });
    }

    const baseDir = path.resolve(process.env.STORAGE_LOCAL_DIR || './uploads');
    const fullPath = path.join(baseDir, material.filePath);

    if (!fs.existsSync(fullPath)) {
      // Fallback sample video response for demonstration if physical video file hasn't been uploaded yet
      return NextResponse.json({
        message: 'Streaming endpoint ready. Upload a physical video file to stream.',
        materialTitle: material.title
      });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(fullPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': material.mimeType || 'video/mp4',
      };

      // @ts-ignore - ReadableStream conversion for Web API Response
      return new Response(file as any, { status: 206, headers });
    } else {
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': material.mimeType || 'video/mp4',
      };

      const file = fs.createReadStream(fullPath);
      // @ts-ignore
      return new Response(file as any, { status: 200, headers });
    }
  } catch (error: any) {
    console.error('Video stream error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสตรีมวิดีโอ' }, { status: 500 });
  }
}
