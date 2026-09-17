import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึง Audit Logs' }, { status: 500 });
  }
}
