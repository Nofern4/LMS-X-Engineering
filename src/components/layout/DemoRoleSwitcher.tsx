'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Eye, GraduationCap, BookOpen, Wrench, ShieldCheck } from 'lucide-react';
import { RoleName } from '@/lib/rbac';

interface UserDemoOption {
  role: RoleName;
  email: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  badgeColor: string;
}

const DEMO_USERS: UserDemoOption[] = [
  {
    role: 'STUDENT',
    email: 'student@student.x-karchang.ac.th',
    name: 'สมชาย ช่างกล',
    label: '1. นักเรียน (Student)',
    icon: <GraduationCap className="w-4 h-4" />,
    badgeColor: 'bg-[#CEF34B]',
  },
  {
    role: 'PROFESSOR',
    email: 'professor@x-karchang.ac.th',
    name: 'ผศ.ดร.วิชาญ สอนดี',
    label: '2. อาจารย์ (Teacher)',
    icon: <BookOpen className="w-4 h-4" />,
    badgeColor: 'bg-amber-400',
  },
  {
    role: 'COURSE_CREATOR_APPROVER',
    email: 'course.approver@x-karchang.ac.th',
    name: 'รศ.ดร.อนุมัติ วิชาการ',
    label: '3. คนอนุมัติ (Approver)',
    icon: <ShieldCheck className="w-4 h-4" />,
    badgeColor: 'bg-blue-400',
  },
  {
    role: 'DIRECTOR',
    email: 'director@x-karchang.ac.th',
    name: 'ผอ.ดร.บริหาร วิสัยทัศน์',
    label: '4. ผอ. (Director)',
    icon: <Eye className="w-4 h-4" />,
    badgeColor: 'bg-rose-400',
  },
  {
    role: 'REGISTRAR',
    email: 'registrar@x-karchang.ac.th',
    name: 'นายอนุมัติ ทะเบียนเรียน',
    label: '5. นายทะเบียน (Registrar)',
    icon: <UserCheck className="w-4 h-4" />,
    badgeColor: 'bg-emerald-400',
  },
];

export const DemoRoleSwitcher: React.FC = () => {
  const [currentEmail, setCurrentEmail] = useState<string>('student@student.x-karchang.ac.th');

  useEffect(() => {
    const saved = localStorage.getItem('demo_user_email');
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/course-approver')) {
      setCurrentEmail('course.approver@x-karchang.ac.th');
      localStorage.setItem('demo_user_email', 'course.approver@x-karchang.ac.th');
    } else if (typeof window !== 'undefined' && window.location.pathname.startsWith('/director')) {
      setCurrentEmail('director@x-karchang.ac.th');
      localStorage.setItem('demo_user_email', 'director@x-karchang.ac.th');
    } else if (saved) {
      setCurrentEmail(saved);
    }
  }, []);

  const handleSelectRole = (email: string, targetRole: RoleName) => {
    localStorage.setItem('demo_user_email', email);
    setCurrentEmail(email);
    
    if (targetRole === 'REGISTRAR') window.location.href = '/registrar';
    else if (targetRole === 'DIRECTOR') window.location.href = '/director';
    else if (targetRole === 'PROFESSOR') window.location.href = '/professor';
    else if (targetRole === 'COURSE_CREATOR_APPROVER' || targetRole === 'CONTENT_APPROVER' || targetRole === 'APPROVER') window.location.href = '/course-approver';
    else window.location.href = '/student';
  };

  const currentUser = DEMO_USERS.find((u) => u.email === currentEmail) || DEMO_USERS[0];

  return (
    <div className="bg-black text-white text-xs sm:text-sm border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 z-50 font-sans shadow-sm">
      
      {/* Current User Role Info */}
      <div className="flex items-center gap-2.5">
        <img src="/images/logo.png" alt="X Engineering Logo" className="h-6 w-auto object-contain" />
        <span className="inline-flex items-center gap-2 bg-slate-900 px-3.5 py-1 rounded-full text-slate-100 border border-slate-700 shadow-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${currentUser.badgeColor}`} />
          <span className="font-bold text-white text-xs sm:text-sm">{currentUser.name}</span>
          <span className="text-[#CEF34B] text-xs font-mono">({currentUser.role})</span>
        </span>
      </div>

      {/* Role Quick Switcher Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-slate-400 text-xs font-semibold mr-1 hidden md:inline">สลับบทบาททดลอง:</span>
        {DEMO_USERS.map((user) => {
          const isActive = user.email === currentEmail;
          return (
            <button
              key={user.email}
              onClick={() => handleSelectRole(user.email, user.role)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all text-xs font-extrabold whitespace-nowrap ${
                isActive
                  ? 'bg-[#CEF34B] text-black shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {user.icon}
              <span>{user.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              window.location.href = '/courses';
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-extrabold whitespace-nowrap transition-all ml-2"
          title="ล้างประวัติการเข้าเรียน ข้อมูลการดูวิดีโอ และสิทธิ์อนุมัติทั้งหมด"
        >
          <span>🔄 รีเซ็ตข้อมูลการเรียนทั้งหมด</span>
        </button>
      </div>
    </div>
  );
};
