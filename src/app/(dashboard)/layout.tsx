'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { RoleName } from '@/lib/rbac';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePageTranslator } from '@/lib/i18n/usePageTranslator';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  usePageTranslator();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) return JSON.parse(sess);
    } catch {}
    return null;
  });

  const fetchCurrentUserData = () => {
    // Read email from session/demo switcher
    let demoEmail = 'student@student.x-karchang.ac.th';
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) {
        const p = JSON.parse(sess);
        if (p.email) demoEmail = p.email;
      } else {
        demoEmail = localStorage.getItem('demo_user_email') || 'student@student.x-karchang.ac.th';
      }
    } catch {}

    const locallyApproved: string[] = (() => {
      try {
        return JSON.parse(localStorage.getItem(`approved_roles_${demoEmail}`) || '[]');
      } catch {
        return [];
      }
    })();

    // Fetch live user info via auth API
    fetch(`/api/auth/login?email=${encodeURIComponent(demoEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const userRoles = Array.isArray(data.user.roles) ? [...data.user.roles] : ['STUDENT'];
          locallyApproved.forEach((r) => {
            if (!userRoles.includes(r)) userRoles.push(r);
          });
          data.user.roles = userRoles;
          setCurrentUser(data.user);
        } else {
          // Fallback mock session for local dev
          const getRolesForEmail = (e: string) => {
            const baseRoles = e.includes('registrar') ? ['REGISTRAR', 'STUDENT']
              : e.includes('director') ? ['DIRECTOR', 'STUDENT']
              : e.includes('prof') ? ['PROFESSOR', 'STUDENT']
              : e.includes('approver') ? ['COURSE_CREATOR_APPROVER', 'STUDENT']
              : ['STUDENT'];
            locallyApproved.forEach((r) => {
              if (!baseRoles.includes(r)) baseRoles.push(r);
            });
            return baseRoles;
          };

          setCurrentUser({
            id: 'demo-user-1',
            name: demoEmail.includes('registrar')
              ? 'นายอนุมัติ ทะเบียนเรียน'
              : demoEmail.includes('director')
              ? 'ผอ.ดร.บริหาร วิสัยทัศน์'
              : demoEmail.includes('prof')
              ? 'ผศ.ดร.วิชาญ สอนดี'
              : demoEmail.includes('approver')
              ? 'รศ.ดร.อนุมัติ วิชาการ'
              : 'สมชาย ช่างกล',
            email: demoEmail,
            roles: getRolesForEmail(demoEmail),
          });
        }
      })
      .catch(() => {
        const fallbackRoles = ['STUDENT'];
        locallyApproved.forEach((r) => {
          if (!fallbackRoles.includes(r)) fallbackRoles.push(r);
        });
        setCurrentUser({
          id: 'demo-user-1',
          name: 'สมชาย ช่างกล',
          email: demoEmail,
          roles: fallbackRoles,
        });
      });
  };

  useEffect(() => {
    fetchCurrentUserData();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'role_last_updated' || e.key?.startsWith('approved_roles_') || e.key === 'user_session') {
        fetchCurrentUserData();
      }
    };
    window.addEventListener('role_updated', fetchCurrentUserData);
    window.addEventListener('role_switched', fetchCurrentUserData);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('role_updated', fetchCurrentUserData);
      window.removeEventListener('role_switched', fetchCurrentUserData);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  let role: RoleName = currentUser?.roles?.[0] || 'STUDENT';
  let userName = currentUser?.name || 'ผู้ใช้งาน';

  const userHasApproverRole = currentUser?.roles?.includes('COURSE_CREATOR_APPROVER') || currentUser?.roles?.includes('APPROVER');
  const userHasDirectorRole = currentUser?.roles?.includes('DIRECTOR');
  const userHasProfessorRole = currentUser?.roles?.includes('PROFESSOR');
  const userHasRegistrarRole = currentUser?.roles?.includes('REGISTRAR');

  if (pathname?.startsWith('/course-approver') || pathname?.startsWith('/content-approver')) {
    role = 'COURSE_CREATOR_APPROVER';
    if (!userHasApproverRole && currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'รศ.ดร.อนุมัติ วิชาการ';
    }
  } else if (pathname?.startsWith('/director')) {
    role = 'DIRECTOR';
    if (!userHasDirectorRole && currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'ผอ.ดร.บริหาร วิสัยทัศน์';
    }
  } else if (pathname?.startsWith('/professor')) {
    role = 'PROFESSOR';
    if (!userHasProfessorRole && currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'ผศ.ดร.วิชาญ สอนดี';
    }
  } else if (pathname?.startsWith('/registrar')) {
    role = 'REGISTRAR';
    if (!userHasRegistrarRole && currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'นายอนุมัติ ทะเบียนเรียน';
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8fafc] text-slate-900 relative transition-colors duration-300">
      {/* Main LMS Top Navigation Header */}
      <Header role={role} userName={userName} unreadNotifications={2} />

      {/* Main Full-Width Content Container (No Left Sidebar) */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-fadeIn relative z-10">
        {children}
      </main>
    </div>
  );
}
