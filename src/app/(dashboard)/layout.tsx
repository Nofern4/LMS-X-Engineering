'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { RoleName } from '@/lib/rbac';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read email from session/demo switcher
    const demoEmail = localStorage.getItem('demo_user_email') || 'student@student.x-karchang.ac.th';

    // Fetch live user info via auth API
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: demoEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          // Fallback mock session for local dev
          const getRolesForEmail = (e: string) => {
            if (e.includes('registrar')) return ['REGISTRAR', 'STUDENT'];
            if (e.includes('director')) return ['DIRECTOR', 'STUDENT'];
            if (e.includes('prof')) return ['PROFESSOR', 'STUDENT'];
            if (e.includes('approver')) return ['COURSE_CREATOR_APPROVER', 'STUDENT'];
            return ['STUDENT'];
          };

          setCurrentUser({
            id: 'demo-user-1',
            name: demoEmail.includes('registrar')
              ? 'นายอนุมัติ ทะเบียนเรียน (Registrar)'
              : demoEmail.includes('director')
              ? 'ผอ.ดร.บริหาร วิสัยทัศน์ (ผอ. มหาลัย Xการช่าง)'
              : demoEmail.includes('prof')
              ? 'ผศ.ดร.วิชาญ สอนดี (อาจารย์ Xการช่าง)'
              : demoEmail.includes('approver')
              ? 'รศ.ดร.อนุมัติ วิชาการ (คนอนุมัติ)'
              : 'สมชาย ช่างกล (นักศึกษา)',
            email: demoEmail,
            roles: getRolesForEmail(demoEmail),
          });
        }
      })
      .catch(() => {
        setCurrentUser({
          id: 'demo-user-1',
          name: 'สมชาย ช่างกล',
          email: demoEmail,
          roles: ['STUDENT'],
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#f8fafc] items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-2xl mx-auto bg-slate-200" />
          <Skeleton className="h-4 w-48 mx-auto bg-slate-200" />
          <p className="text-xs text-slate-500 font-bold">กำลังโหลดเลเยอร์หน้าเว็บ มหาวิทยาลัย Xการช่าง...</p>
        </div>
      </div>
    );
  }

  const pathname = usePathname();
  let role: RoleName = currentUser?.roles?.[0] || 'STUDENT';
  let userName = currentUser?.name || 'ผู้ใช้งาน';

  if (pathname?.startsWith('/course-approver') || pathname?.startsWith('/content-approver')) {
    role = 'COURSE_CREATOR_APPROVER';
    if (!currentUser || currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'รศ.ดร.อนุมัติ วิชาการ (คนอนุมัติ)';
    }
  } else if (pathname?.startsWith('/director')) {
    role = 'DIRECTOR';
    if (!currentUser || currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'ผอ.ดร.บริหาร วิสัยทัศน์ (ผอ. มหาลัย Xการช่าง)';
    }
  } else if (pathname?.startsWith('/professor')) {
    role = 'PROFESSOR';
    if (!currentUser || currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'ผศ.ดร.วิชาญ สอนดี (อาจารย์ Xการช่าง)';
    }
  } else if (pathname?.startsWith('/registrar')) {
    role = 'REGISTRAR';
    if (!currentUser || currentUser?.roles?.[0] === 'STUDENT') {
      userName = 'นายอนุมัติ ทะเบียนเรียน (Registrar)';
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8fafc] text-slate-900 relative transition-colors duration-300">
      {/* Demo Role Switcher Bar */}
      <DemoRoleSwitcher />

      {/* Main LMS Top Navigation Header */}
      <Header role={role} userName={userName} unreadNotifications={2} />

      {/* Main Full-Width Content Container (No Left Sidebar) */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-fadeIn relative z-10">
        {children}
      </main>
    </div>
  );
}
