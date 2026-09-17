import { AuthenticatedUser } from './auth';
import { prisma } from './prisma';

export type RoleName = 
  | 'STUDENT'
  | 'PROFESSOR'
  | 'APPROVER'
  | 'COURSE_CREATOR_APPROVER'
  | 'CONTENT_APPROVER'
  | 'DIRECTOR'
  | 'REGISTRAR';

export function hasRole(user: AuthenticatedUser, role: RoleName): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(user: AuthenticatedUser, roles: RoleName[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some(r => user.roles.includes(r));
}

export function isDirector(user: AuthenticatedUser): boolean {
  return hasRole(user, 'DIRECTOR');
}

export function isRegistrar(user: AuthenticatedUser): boolean {
  return hasRole(user, 'REGISTRAR');
}

export function enforceReadOnlyIfDirector(user: AuthenticatedUser, httpMethod: string): void {
  if (isDirector(user) && httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpMethod !== 'OPTIONS') {
    throw new Error('DIRECTOR_READ_ONLY_VIOLATION: Director role is strictly read-only and cannot mutate data.');
  }
}

export async function canAccessCourseMaterial(user: AuthenticatedUser, courseId: string): Promise<boolean> {
  if (!user) return false;
  
  // Director (Read-Only) & Approvers can view material
  if (hasAnyRole(user, ['DIRECTOR', 'APPROVER', 'COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER'])) {
    return true;
  }

  // Professor can access if it's their course
  if (hasRole(user, 'PROFESSOR')) {
    const isInstructor = await prisma.courseInstructor.findFirst({
      where: { courseId, instructorId: user.id }
    });
    if (isInstructor) return true;
    
    const isCreator = await prisma.course.findFirst({
      where: { id: courseId, createdById: user.id }
    });
    if (isCreator) return true;
  }

  // Student can access if enrollment is APPROVED
  if (hasRole(user, 'STUDENT')) {
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId: user.id,
        status: 'APPROVED'
      }
    });
    if (enrollment) return true;

    // Or if course is OPEN and published
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: 'PUBLISHED',
        accessType: 'OPEN'
      }
    });
    if (course) return true;
  }

  return false;
}

export async function logAuditEvent(
  userId: string | null,
  action: string,
  resource: string,
  ipAddress?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        ipAddress: ipAddress || '127.0.0.1',
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  } catch (err) {
    console.error('Audit log failure:', err);
  }
}
