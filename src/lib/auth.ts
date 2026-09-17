import { UserStatus } from '@prisma/client';

export function isAllowedInstitutionalEmail(email: string, allowedDomainsConfig?: string): boolean {
  if (!email || !email.includes('@')) return false;

  const rawConfig = allowedDomainsConfig || process.env.ALLOWED_EMAIL_DOMAINS || '@student.x-karchang.ac.th,@x-karchang.ac.th';
  const allowedDomains = rawConfig
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean);

  const lowerEmail = email.toLowerCase();
  return allowedDomains.some(domain => lowerEmail.endsWith(domain.startsWith('@') ? domain : `@${domain}`));
}

export function isUserStatusActive(status: UserStatus | string): boolean {
  return status === UserStatus.ACTIVE || status === 'ACTIVE';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  studentId?: string | null;
  department?: string | null;
  status: UserStatus | string;
  roles: string[];
}
