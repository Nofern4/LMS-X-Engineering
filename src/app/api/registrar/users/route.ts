import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';
import { isAllowedInstitutionalEmail } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const roleFilter = searchParams.get('role') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { studentId: { contains: search } },
        { department: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (roleFilter) {
      const targetRoles = (roleFilter === 'APPROVER' || roleFilter === 'COURSE_CREATOR_APPROVER')
        ? ['COURSE_CREATOR_APPROVER', 'APPROVER']
        : [roleFilter];
      where.userRoles = {
        some: {
          role: {
            name: { in: targetRoles },
          },
        },
      };
    }

    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const [totalMatching, totalAllUsers, users, allRoles, roleCounts] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit > 0 ? limit : 100,
        select: {
          id: true,
          email: true,
          name: true,
          studentId: true,
          department: true,
          status: true,
          createdAt: true,
          userRoles: {
            select: {
              role: {
                select: { id: true, name: true, description: true },
              },
            },
          },
        },
      }),
      prisma.role.findMany({ select: { id: true, name: true } }),
      prisma.userRole.groupBy({
        by: ['roleId'],
        _count: { roleId: true },
      }),
    ]);

    const roleStats: Record<string, number> = {};
    const countByRoleId: Record<string, number> = {};
    for (const item of roleCounts) {
      countByRoleId[item.roleId] = item._count.roleId;
    }
    for (const r of allRoles) {
      roleStats[r.name] = countByRoleId[r.id] || 0;
    }

    return NextResponse.json({ 
      users, 
      totalMatching, 
      totalAllUsers, 
      roleStats 
    });
  } catch (error: any) {
    console.error('Registrar get users error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', users: [], totalMatching: 0, totalAllUsers: 0, roleStats: {} }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { registrarUserId, targetUserId, roleNames, newRoleName, newEmail, newName, status, department, studentId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'กรุณาระบุผู้ใช้งานที่ต้องการแก้ไข' }, { status: 400 });
    }

    // 1. Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้งานที่ระบุ' }, { status: 404 });
    }

    const updateData: any = {};

    // 2. Validate & Update Email if provided
    if (newEmail && newEmail !== targetUser.email) {
      const domainSetting = await prisma.systemSetting.findUnique({
        where: { key: 'ALLOWED_EMAIL_DOMAINS' },
      });
      const allowedDomains = domainSetting?.value || '@student.x-karchang.ac.th,@x-karchang.ac.th';
      if (!isAllowedInstitutionalEmail(newEmail, allowedDomains)) {
        return NextResponse.json({
          error: 'อีเมลใหม่ต้องใช้อีกโดเมนของสถาบัน (@x-karchang.ac.th หรือ @student.x-karchang.ac.th)',
        }, { status: 400 });
      }

      const existingEmail = await prisma.user.findUnique({ where: { email: newEmail } });
      if (existingEmail && existingEmail.id !== targetUserId) {
        return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' }, { status: 400 });
      }

      updateData.email = newEmail;
    }

    if (newName) updateData.name = newName;
    if (status) updateData.status = status;
    if (department !== undefined) updateData.department = department;
    if (studentId !== undefined) updateData.studentId = studentId;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: updateData,
      });
    }

    // 3. Update Multi-Roles (if roleNames array is provided) or single newRoleName
    const targetRoleList: string[] = Array.isArray(roleNames) 
      ? roleNames 
      : (newRoleName ? [newRoleName] : []);

    if (targetRoleList.length > 0) {
      // Find all specified role IDs in DB
      const dbRoles = await prisma.role.findMany({
        where: { name: { in: targetRoleList } },
      });

      if (dbRoles.length === 0) {
        return NextResponse.json({ error: 'ไม่พบบทบาทที่เลือกในระบบ' }, { status: 400 });
      }

      // Remove existing roles for this user and recreate all assigned multi-roles
      await prisma.userRole.deleteMany({ where: { userId: targetUserId } });
      
      for (const roleObj of dbRoles) {
        await prisma.userRole.create({
          data: {
            userId: targetUserId,
            roleId: roleObj.id,
          },
        });
      }
    }

    await logAuditEvent(
      registrarUserId || 'registrar-system',
      'REGISTRAR_UPDATE_USER_ROLE',
      `USER:${targetUserId}`,
      undefined,
      { targetRoleList, newEmail, status, previousRoles: targetUser.userRoles.map(r => r.role.name) }
    );

    return NextResponse.json({ message: 'อัปเดตบทบาทและข้อมูลผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Registrar update user error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, roleName, roleNames, department, studentId, password } = body;

    const initialRoleList: string[] = Array.isArray(roleNames) && roleNames.length > 0 
      ? roleNames 
      : (roleName ? [roleName] : ['PROFESSOR']);

    // Ensure staff roles automatically include STUDENT as required (2 roles by default)
    if (!initialRoleList.includes('STUDENT')) {
      initialRoleList.push('STUDENT');
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูล ชื่อ และ อีเมล ให้ครบถ้วน' }, { status: 400 });
    }

    const domainSetting = await prisma.systemSetting.findUnique({
      where: { key: 'ALLOWED_EMAIL_DOMAINS' },
    });
    const allowedDomains = domainSetting?.value || '@student.x-karchang.ac.th,@x-karchang.ac.th';
    if (!isAllowedInstitutionalEmail(email, allowedDomains)) {
      return NextResponse.json({
        error: 'อีเมลต้องลงท้ายด้วย @x-karchang.ac.th หรือ @student.x-karchang.ac.th เท่านั้น',
      }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'อีเมลนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }

    const dbRoles = await prisma.role.findMany({
      where: { name: { in: initialRoleList } },
    });

    if (dbRoles.length === 0) {
      return NextResponse.json({ error: 'ไม่พบ Role ที่เลือก' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: password || 'xkarchang2026',
        department: department || null,
        studentId: studentId || null,
        status: 'ACTIVE',
        userRoles: {
          create: dbRoles.map(r => ({ roleId: r.id })),
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    await logAuditEvent(
      'registrar-system',
      'REGISTRAR_CREATE_USER',
      `USER:${newUser.id}`,
      undefined,
      { email, initialRoleList, name }
    );

    return NextResponse.json({ message: 'สร้างบัญชีผู้ใช้งานใหม่เรียบร้อยแล้ว', user: newUser });
  } catch (error: any) {
    console.error('Registrar create user error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างบัญชี' }, { status: 500 });
  }
}
