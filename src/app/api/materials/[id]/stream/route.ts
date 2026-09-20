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

    // Clean filePath to remove leading slashes or 'uploads/'
    let cleanRelPath = material.filePath.replace(/^\/?uploads\/?/, '').replace(/^\//, '');

    // Check candidate base directories (local dev and Vercel public directory)
    const candidateDirs = [
      path.join(process.cwd(), 'public', 'uploads'),
      path.resolve('./public/uploads'),
      path.resolve(process.env.STORAGE_LOCAL_DIR || './uploads'),
      path.join(process.cwd(), 'uploads'),
    ];

    let activeStreamPath: string | null = null;
    let foundInPublic = false;

    for (const dir of candidateDirs) {
      const p1 = path.join(dir, cleanRelPath);
      const p2 = path.join(dir, cleanRelPath.replace(/\.mov$/i, '.mp4'));
      if (fs.existsSync(p2)) {
        activeStreamPath = p2;
        cleanRelPath = cleanRelPath.replace(/\.mov$/i, '.mp4');
        if (dir.includes('public')) foundInPublic = true;
        break;
      }
      if (fs.existsSync(p1)) {
        activeStreamPath = p1;
        if (dir.includes('public')) foundInPublic = true;
        break;
      }
    }

    // If served from public, we can redirect directly to Vercel CDN static path for fastest streaming
    if (foundInPublic) {
      const url = new URL(`/uploads/${cleanRelPath.replace(/\\/g, '/')}`, request.url);
      return NextResponse.redirect(url);
    }

    if (!activeStreamPath || !fs.existsSync(activeStreamPath)) {
      return NextResponse.redirect(FALLBACK_PLAYABLE_VIDEO);
    }

    const ext = path.extname(activeStreamPath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/mp4',
      '.m4v': 'video/mp4',
      '.ogv': 'video/ogg',
      '.ogg': 'video/ogg',
      '.mp3': 'audio/mpeg',
      '.pdf': 'application/pdf',
    };
    const contentType = mimeMap[ext] || 'video/mp4';

    const stat = fs.statSync(activeStreamPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(activeStreamPath, { start, end });

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

      const file = fs.createReadStream(activeStreamPath);
      // @ts-ignore
      return new Response(file as any, { status: 200, headers });
    }
  } catch (error: any) {
    console.error('Video stream error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสตรีมวิดีโอ' }, { status: 500 });
  }
}
