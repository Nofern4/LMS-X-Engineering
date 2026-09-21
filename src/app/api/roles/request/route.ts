import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/rbac';

// GET: Fetch role requests for a specific user or all requests for registrar
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const all = searchParams.get('all') === 'true';

    let whereClause: any = {};

    if (all) {
      if (status) whereClause.status = status;
    } else if (userId) {
      whereClause.userId = userId;
      if (status) whereClause.status = status;
    } else if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ requests: [] });
      }
      whereClause.userId = user.id;
      if (status) whereClause.status = status;
    }

    const requests = await prisma.roleRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
            userRoles: {
              include: { role: true },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Deduplicate requests taking only the newest request per user + role + requestType
    const seen = new Set<string>();
    const deduplicatedRequests = requests.filter((req) => {
      const uId = req.userId || req.user?.id || req.user?.email || 'unknown';
      const rName = req.roleName === 'APPROVER' ? 'COURSE_CREATOR_APPROVER' : req.roleName;
      const key = `${uId}_${rName}_${req.requestType || 'GRANT'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ requests: deduplicatedRequests });
  } catch (error: any) {
    console.error('Fetch role requests error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลคำขอสิทธิ์ได้' }, { status: 500 });
  }
}

// POST: Submit a new role request (GRANT) or instant relinquish/request REVOKE
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, userId, roleName, requestType = 'GRANT', reason, instantRevoke = false } = body;

    if (!roleName) {
      return NextResponse.json({ error: 'กรุณาระบุบทบาท (Role)' }, { status: 400 });
    }

    // Resolve user
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { userRoles: { include: { role: true } } },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้งานในระบบ' }, { status: 404 });
    }

    const currentRoleNames = user.userRoles.map((ur) => ur.role.name);

    // Case 1: Instant Revoke / Relinquish
    if (instantRevoke || requestType === 'REVOKE') {
      if (!currentRoleNames.includes(roleName) && !(roleName === 'APPROVER' && currentRoleNames.includes('COURSE_CREATOR_APPROVER'))) {
        return NextResponse.json({ error: `ผู้ใช้งานไม่ได้ถือครองบทบาท ${roleName} อยู่ในปัจจุบัน` }, { status: 400 });
      }

      // Check if user is trying to remove their only remaining role
      if (currentRoleNames.length <= 1) {
        return NextResponse.json({ error: 'ไม่สามารถยกเลิกบทบาทสุดท้ายได้ เนื่องจากต้องมีอย่างน้อย 1 บทบาทในระบบ' }, { status: 400 });
      }

      const matchedRoleName = currentRoleNames.includes(roleName)
        ? roleName
        : (roleName === 'COURSE_CREATOR_APPROVER' && currentRoleNames.includes('APPROVER'))
        ? 'APPROVER'
        : (roleName === 'APPROVER' && currentRoleNames.includes('COURSE_CREATOR_APPROVER'))
        ? 'COURSE_CREATOR_APPROVER'
        : roleName;

      // Find role record
      const dbRole = await prisma.role.findFirst({
        where: {
          OR: [
            { name: matchedRoleName },
            ...(matchedRoleName === 'COURSE_CREATOR_APPROVER' ? [{ name: 'APPROVER' }] : []),
            ...(matchedRoleName === 'APPROVER' ? [{ name: 'COURSE_CREATOR_APPROVER' }] : [])
          ]
        }
      });
      if (dbRole) {
        await prisma.userRole.deleteMany({
          where: {
            userId: user.id,
            roleId: dbRole.id,
          },
        });
      }

      // Create approved record for the revoke log
      const reqRecord = await prisma.roleRequest.create({
        data: {
          userId: user.id,
          roleName,
          requestType: 'REVOKE',
          status: 'APPROVED',
          reason: reason || 'ผู้ใช้งานกดยกเลิก/สละสิทธิ์ด้วยตนเองผ่านระบบ Header',
          reviewNote: 'ระบบดำเนินการปลดสิทธิ์ทันทีตามคำขอของผู้ใช้',
        },
      });

      await logAuditEvent(
        user.id,
        'ROLE_RELINQUISHED_SELF',
        `ROLE:${roleName}`,
        undefined,
        { roleName, reason }
      );

      // Fetch updated roles
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { userRoles: { include: { role: true } } },
      });
      const updatedRoles = updatedUser?.userRoles.map((ur) => ur.role.name) || [];

      return NextResponse.json({
        message: `ยกเลิกบทบาท ${roleName} สำเร็จแล้ว`,
        roles: updatedRoles,
        request: reqRecord,
      });
    }

    // Case 2: Request New Role (GRANT)
    if (currentRoleNames.includes(roleName) || (roleName === 'APPROVER' && currentRoleNames.includes('COURSE_CREATOR_APPROVER'))) {
      return NextResponse.json({ error: `คุณมีบทบาท ${roleName} อยู่แล้ว ไม่จำเป็นต้องขอเพิ่ม` }, { status: 400 });
    }

    // Check pending requests - if already pending, update reason and bump timestamp to latest
    const pendingReq = await prisma.roleRequest.findFirst({
      where: {
        userId: user.id,
        roleName: { in: [roleName, roleName === 'APPROVER' ? 'COURSE_CREATOR_APPROVER' : 'APPROVER'] },
        status: 'PENDING',
        requestType: 'GRANT',
      },
    });

    let newRequest;
    if (pendingReq) {
      newRequest = await prisma.roleRequest.update({
        where: { id: pendingReq.id },
        data: {
          reason: reason || pendingReq.reason || 'ยื่นคำขอรับสิทธิ์ผ่านแถบ Header',
          createdAt: new Date(),
        },
      });
    } else {
      // Create new role request
      newRequest = await prisma.roleRequest.create({
        data: {
          userId: user.id,
          roleName,
          requestType: 'GRANT',
          status: 'PENDING',
          reason: reason || 'ยื่นคำขอรับสิทธิ์ผ่านแถบ Header',
        },
      });
    }

    // Notify Registrar users
    try {
      const registrars = await prisma.user.findMany({
        where: {
          userRoles: {
            some: { role: { name: 'REGISTRAR' } },
          },
        },
      });

      for (const reg of registrars) {
        await prisma.notification.create({
          data: {
            userId: reg.id,
            title: `คำขอรับสิทธิ์บทบาทใหม่: ${roleName}`,
            message: `${user.name} (${user.email}) ได้ส่งคำขอรับสิทธิ์บทบาท ${roleName} เหตุผล: ${reason || '-'}`,
            type: 'INFO',
            link: '/registrar/users',
          },
        });
      }
    } catch (notifErr) {
      console.warn('Could not notify registrars:', notifErr);
    }

    await logAuditEvent(
      user.id,
      'ROLE_REQUEST_SUBMITTED',
      `ROLE:${roleName}`,
      undefined,
      { roleName, reason }
    );

    return NextResponse.json({
      message: `ส่งคำขอรับสิทธิ์บทบาท ${roleName} ไปยังนายทะเบียนเรียบร้อยแล้ว`,
      request: newRequest,
    });
  } catch (error: any) {
    console.error('Role request submit error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการส่งคำขอสิทธิ์' }, { status: 500 });
  }
}

// PATCH: Review (Approve / Reject) by Registrar
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, action, reviewerEmail, reviewNote, userId, userEmail, roleName: bodyRoleName } = body;

    if (!action) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (ต้องการ action)' }, { status: 400 });
    }

    let roleReq = null;
    if (requestId) {
      roleReq = await prisma.roleRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });
    }

    // Fallback: If not found by ID (e.g. multi-container serverless or regenerated IDs), locate by user & roleName
    let resolvedUser: any = roleReq?.user || null;
    let targetRoleName = roleReq?.roleName || bodyRoleName;

    if (!resolvedUser) {
      if (userId) {
        resolvedUser = await prisma.user.findUnique({
          where: { id: userId },
          include: { userRoles: { include: { role: true } } },
        });
      } else if (userEmail) {
        resolvedUser = await prisma.user.findUnique({
          where: { email: userEmail },
          include: { userRoles: { include: { role: true } } },
        });
      }
    }

    if (!roleReq && resolvedUser && targetRoleName) {
      roleReq = await prisma.roleRequest.findFirst({
        where: {
          userId: resolvedUser.id,
          OR: [
            { roleName: targetRoleName },
            ...(targetRoleName === 'APPROVER' ? [{ roleName: 'COURSE_CREATOR_APPROVER' }] : []),
            ...(targetRoleName === 'COURSE_CREATOR_APPROVER' ? [{ roleName: 'APPROVER' }] : []),
          ],
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
    }

    // If still no user found, return error
    if (!resolvedUser && !roleReq) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลคำขอหรือผู้ใช้งานที่ระบุ' }, { status: 404 });
    }

    const finalUserId = resolvedUser?.id || roleReq?.userId;
    const finalRoleName = targetRoleName || roleReq?.roleName || 'PROFESSOR';
    const finalRequestType = roleReq?.requestType || 'GRANT';

    let reviewerId = null;
    if (reviewerEmail) {
      const revUser = await prisma.user.findUnique({ where: { email: reviewerEmail } });
      if (revUser) reviewerId = revUser.id;
    }

    if (action === 'APPROVE') {
      // Find role in DB with alias fallback (APPROVER -> COURSE_CREATOR_APPROVER)
      let roleNameToFind = finalRoleName;
      if (roleNameToFind === 'APPROVER') roleNameToFind = 'COURSE_CREATOR_APPROVER';

      let dbRole = await prisma.role.findUnique({ where: { name: roleNameToFind } });
      if (!dbRole) {
        dbRole = await prisma.role.findFirst({
          where: {
            OR: [
              { name: roleNameToFind },
              { name: finalRoleName },
              { name: 'COURSE_CREATOR_APPROVER' },
            ],
          },
        });
      }

      if (!dbRole) {
        // Create role if missing
        try {
          dbRole = await prisma.role.create({
            data: {
              name: roleNameToFind,
              description: roleNameToFind,
            },
          });
        } catch {}
      }

      if (dbRole && finalUserId) {
        if (finalRequestType === 'GRANT') {
          // Assign role if not exists
          const exists = await prisma.userRole.findUnique({
            where: {
              userId_roleId: {
                userId: finalUserId,
                roleId: dbRole.id,
              },
            },
          });

          if (!exists) {
            await prisma.userRole.create({
              data: {
                userId: finalUserId,
                roleId: dbRole.id,
              },
            });
          }
        } else if (finalRequestType === 'REVOKE') {
          // Remove role
          await prisma.userRole.deleteMany({
            where: {
              userId: finalUserId,
              roleId: dbRole.id,
            },
          });
        }
      }

      // Update the request record (or create one if it was missing)
      let updated = null;
      if (roleReq?.id) {
        updated = await prisma.roleRequest.update({
          where: { id: roleReq.id },
          data: {
            status: 'APPROVED',
            reviewerId,
            reviewNote: reviewNote || 'นายทะเบียนอนุมัติคำขอแล้ว',
          },
        });
      } else if (finalUserId) {
        updated = await prisma.roleRequest.create({
          data: {
            userId: finalUserId,
            roleName: finalRoleName,
            requestType: finalRequestType,
            status: 'APPROVED',
            reviewerId,
            reviewNote: reviewNote || 'นายทะเบียนอนุมัติคำขอแล้ว',
          },
        });
      }

      // Also clean up any other pending duplicate requests for this user & role
      if (finalUserId) {
        await prisma.roleRequest.updateMany({
          where: {
            userId: finalUserId,
            roleName: { in: [finalRoleName, roleNameToFind, 'APPROVER', 'COURSE_CREATOR_APPROVER'] },
            status: 'PENDING',
          },
          data: {
            status: 'APPROVED',
            reviewerId,
            reviewNote: reviewNote || 'นายทะเบียนอนุมัติคำขอแล้ว',
          },
        });
      }

      // Fetch fresh updated roles for this user
      const freshUser = await prisma.user.findUnique({
        where: { id: finalUserId },
        include: { userRoles: { include: { role: true } } },
      });
      const updatedRoles = freshUser?.userRoles.map((ur) => ur.role.name) || [];
      if (!updatedRoles.includes(roleNameToFind) && finalRequestType === 'GRANT') {
        updatedRoles.push(roleNameToFind);
      }

      // Send notification to user
      try {
        await prisma.notification.create({
          data: {
            userId: finalUserId,
            title: `คำขอสิทธิ์ ${finalRoleName} ได้รับการอนุมัติแล้ว`,
            message: finalRequestType === 'GRANT'
              ? `ยินดีด้วย! คุณได้รับสิทธิ์บทบาท ${finalRoleName} แล้ว สามารถสลับโหมดใช้งานได้จากเมนูโปรไฟล์ทันที`
              : `คำขอยกเลิกบทบาท ${finalRoleName} ได้รับการอนุมัติแล้ว`,
            type: 'SUCCESS',
          },
        });
      } catch {}

      return NextResponse.json({
        message: 'อนุมัติคำขอเรียบร้อยแล้ว',
        request: updated,
        roles: updatedRoles,
        success: true,
      });
    } else if (action === 'REJECT') {
      let updated = null;
      if (roleReq?.id) {
        updated = await prisma.roleRequest.update({
          where: { id: roleReq.id },
          data: {
            status: 'REJECTED',
            reviewerId,
            reviewNote: reviewNote || 'นายทะเบียนปฏิเสธคำขอ',
          },
        });
      }

      if (finalUserId) {
        await prisma.roleRequest.updateMany({
          where: {
            userId: finalUserId,
            roleName: { in: [finalRoleName, 'APPROVER', 'COURSE_CREATOR_APPROVER'] },
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
            reviewerId,
            reviewNote: reviewNote || 'นายทะเบียนปฏิเสธคำขอ',
          },
        });

        try {
          await prisma.notification.create({
            data: {
              userId: finalUserId,
              title: `คำขอสิทธิ์ ${finalRoleName} ไม่ผ่านการอนุมัติ`,
              message: `คำขอสิทธิ์บทบาท ${finalRoleName} ของคุณถูกปฏิเสธ: ${reviewNote || 'ไม่ระบุเหตุผล'}`,
              type: 'WARNING',
            },
          });
        } catch {}
      }

      return NextResponse.json({
        message: 'ปฏิเสธคำขอเรียบร้อยแล้ว',
        request: updated,
        success: true,
      });
    }

    return NextResponse.json({ error: 'Action ไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    console.error('Role request review error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบคำขอ' }, { status: 500 });
  }
}
