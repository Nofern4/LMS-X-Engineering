import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { studentId: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: { include: { role: true } }
        }
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total });
  } catch (error: any) {
    console.error('Get admin users error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminUserId, targetUserId, status, roleName } = body;

    // Director Read-Only check
    const adminUser = adminUserId ? await prisma.user.findUnique({
      where: { id: adminUserId },
      include: { userRoles: { include: { role: true } } }
    }) : null;

    if (adminUser?.userRoles.some(ur => ur.role.name === 'DIRECTOR')) {
      return NextResponse.json({
        error: 'DIRECTOR_READ_ONLY: ผู้อำนวยการมีสิทธิ์อ่านข้อมูลอย่างเดียว (Read-Only) ไม่สามารถแก้ไขผู้ใช้งานได้'
      }, { status: 403 });
    }

    if (status) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { status }
      });
    }

    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (role) {
        // Remove existing roles and assign new role
        await prisma.userRole.deleteMany({ where: { userId: targetUserId } });
        await prisma.userRole.create({
          data: { userId: targetUserId, roleId: role.id }
        });
      }
    }

    await logAuditEvent(adminUserId, 'UPDATE_USER_MANAGEMENT', `USER:${targetUserId}`, undefined, { status, roleName });

    return NextResponse.json({ message: 'อัปเดตผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
