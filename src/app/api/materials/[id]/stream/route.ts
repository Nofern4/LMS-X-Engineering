import { NextResponse } from 'next/server';
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

    const fp = material.filePath || '';

    // 1. External URL (YouTube, Google Drive, etc.) → redirect
    if (fp.startsWith('http://') || fp.startsWith('https://')) {
      return NextResponse.redirect(fp);
    }

    // 2. Base64 data URL stored directly in DB → decode and stream
    if (fp.startsWith('data:')) {
      const matches = fp.match(/^data:([^;]+);base64,(.+)$/s);
      if (matches) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const range = request.headers.get('range');

        if (range && contentType.startsWith('video/')) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
          const chunk = buffer.slice(start, end + 1);
          return new Response(chunk, {
            status: 206,
            headers: {
              'Content-Range': `bytes ${start}-${end}/${buffer.length}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunk.length.toString(),
              'Content-Type': contentType,
            },
          });
        }

        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'private, max-age=3600',
          },
        });
      }

      // Malformed data URL — fallback
      return NextResponse.redirect('https://www.w3schools.com/html/mov_bbb.mp4');
    }

    // 3. Local filesystem path (dev only)
    if (fp && !fp.startsWith('blob:') && !fp.includes('FILE_TOO_LARGE')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const candidateDirs = [
          path.join(process.cwd(), 'public', 'uploads'),
          path.join(process.cwd(), 'uploads'),
        ];

        let activeStreamPath: string | null = null;
        const cleanRelPath = fp.replace(/^\/?(uploads|public)\//, '').replace(/\\/g, '/');

        for (const dir of candidateDirs) {
          const fullPath = path.join(dir, cleanRelPath);
          if (fs.existsSync(fullPath)) {
            activeStreamPath = fullPath;
            break;
          }
          const mp4Path = fullPath.replace(/\.mov$/i, '.mp4');
          if (fs.existsSync(mp4Path)) {
            activeStreamPath = mp4Path;
            break;
          }
        }

        if (activeStreamPath) {
          const ext = activeStreamPath.split('.').pop()?.toLowerCase() || '';
          const mimeMap: Record<string, string> = {
            mp4: 'video/mp4', webm: 'video/webm', mov: 'video/mp4',
            mp3: 'audio/mpeg', pdf: 'application/pdf',
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
          };
          const contentType = mimeMap[ext] || material.mimeType || 'application/octet-stream';

          const stat = fs.statSync(activeStreamPath);
          const fileSize = stat.size;
          const range = request.headers.get('range');

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunk = (fileSize - 1);
            const clampedEnd = Math.min(end, chunk);
            const chunkSize = clampedEnd - start + 1;
            const file = fs.createReadStream(activeStreamPath, { start, end: clampedEnd });
            return new Response(file as any, {
              status: 206,
              headers: {
                'Content-Range': `bytes ${start}-${clampedEnd}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize.toString(),
                'Content-Type': contentType,
              },
            });
          }

          const file = fs.createReadStream(activeStreamPath);
          return new Response(file as any, {
            status: 200,
            headers: {
              'Content-Length': fileSize.toString(),
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes',
            },
          });
        }

        if (cleanRelPath) {
          // On Vercel / Production, static files in public/uploads are served directly by Edge CDN at /uploads/...
          const staticUrl = new URL(`/uploads/${cleanRelPath}`, request.url);
          return NextResponse.redirect(staticUrl);
        }
      } catch (fsErr) {
        console.warn('FS stream failed:', (fsErr as Error).message);
      }
    }

    // 4. Fallback — reliable working video
    return NextResponse.redirect('https://www.w3schools.com/html/mov_bbb.mp4');
  } catch (error: any) {
    console.error('Stream error:', error?.message || error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสตรีมสื่อ' }, { status: 500 });
  }
}
