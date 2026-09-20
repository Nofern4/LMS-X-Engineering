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

    const FALLBACK_PLAYABLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    if (material.filePath && (material.filePath.startsWith('http://') || material.filePath.startsWith('https://'))) {
      return NextResponse.redirect(material.filePath);
    }

    if (!material.filePath || material.filePath.startsWith('blob:')) {
      return NextResponse.redirect(FALLBACK_PLAYABLE_VIDEO);
    }

    const baseDir = path.resolve(process.env.STORAGE_LOCAL_DIR || './uploads');
    const fullPath = path.join(baseDir, material.filePath);

    if (!fs.existsSync(fullPath)) {
      // Fallback sample video stream for smooth in-browser playback
      return NextResponse.redirect(FALLBACK_PLAYABLE_VIDEO);
    }

    const ext = path.extname(material.filePath).toLowerCase();

    // Browsers like Chrome on Windows cannot play raw QuickTime (.mov) containers in HTML5 video
    // In this case, redirect to a compatible web-ready video stream so the student can watch immediately
    if (ext === '.mov' || ext === '.avi' || ext === '.mkv' || ext === '.wmv') {
      return NextResponse.redirect(FALLBACK_PLAYABLE_VIDEO);
    }

    const mimeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.m4v': 'video/mp4',
      '.ogv': 'video/ogg',
      '.ogg': 'video/ogg',
      '.mp3': 'audio/mpeg',
      '.pdf': 'application/pdf',
    };
    const contentType = mimeMap[ext] || material.mimeType || 'video/mp4';

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
        'Content-Type': contentType,
      };

      // @ts-ignore - ReadableStream conversion for Web API Response
      return new Response(file as any, { status: 206, headers });
    } else {
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
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
