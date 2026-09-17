import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body;

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    } else if (userId) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ message: 'อัปเดตสถานะการแจ้งเตือนเรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน' }, { status: 500 });
  }
}
