import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, key, value } = body;

    // Director Read-Only Check
    if (body.userRoles?.includes('DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only)'
      }, { status: 403 });
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: `System setting ${key}` }
    });

    await logAuditEvent(userId, 'UPDATE_SYSTEM_SETTING', `SETTING:${key}`, undefined, { value });

    return NextResponse.json({ message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', setting });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' }, { status: 500 });
  }
}
