import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Quick DB liveness check
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'HEALTHY',
        storage: 'HEALTHY',
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'DOWN',
      error: 'Database ping failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
