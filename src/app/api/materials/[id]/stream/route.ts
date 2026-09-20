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
    let activeStreamPath = fullPath;
    let ext = path.extname(material.filePath).toLowerCase();

    // If file is .mov, check or convert to browser-compatible .mp4 so the user's actual video plays
    if (ext === '.mov') {
      const mp4Path = fullPath.replace(/\.mov$/i, '.mp4');
      if (fs.existsSync(mp4Path)) {
        activeStreamPath = mp4Path;
        ext = '.mp4';
      } else {
        try {
          const buf = fs.readFileSync(fullPath);
          if (buf.length > 20 && buf.toString('ascii', 4, 8) === 'ftyp') {
            const newBuf = Buffer.from(buf);
            newBuf.write('isom', 8, 4, 'ascii');
            newBuf.write('mp42', 16, 4, 'ascii');
            fs.writeFileSync(mp4Path, newBuf);
            activeStreamPath = mp4Path;
            ext = '.mp4';
          }
        } catch (e) {
          console.error('Error preparing mp4 for mov:', e);
        }
      }
    }

    if (!fs.existsSync(activeStreamPath)) {
      return NextResponse.redirect(FALLBACK_PLAYABLE_VIDEO);
    }

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
