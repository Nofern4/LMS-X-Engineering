'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  GraduationCap,
  BookOpen,
  ChevronRight,
  LogOut,
  Monitor,
  Smartphone,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'นักศึกษา',
  PROFESSOR: 'อาจารย์ผู้สอน',
  ADMIN: 'ผู้ดูแลระบบ',
  REGISTRAR: 'เจ้าหน้าที่ทะเบียน',
  DIRECTOR: 'ผู้อำนวยการ',
  COURSE_CREATOR_APPROVER: 'ผู้อนุมัติรายวิชา',
  CONTENT_APPROVER: 'ผู้อนุมัติเนื้อหา',
  APPROVER: 'ผู้อนุมัติ',
};

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'bg-blue-50 text-blue-700 border-blue-200',
  PROFESSOR: 'bg-purple-50 text-purple-700 border-purple-200',
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
  REGISTRAR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DIRECTOR: 'bg-amber-50 text-amber-700 border-amber-200',
  COURSE_CREATOR_APPROVER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CONTENT_APPROVER: 'bg-teal-50 text-teal-700 border-teal-200',
  APPROVER: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function MobileProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) setUser(JSON.parse(sess));
    } catch {}

    fetch('/api/courses/enrollments?status=APPROVED&limit=100&t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setEnrollmentCount(d.enrollments?.length || 0))
      .catch(() => {});
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleLogout = () => {
    try {
      localStorage.removeItem('user_session');
      localStorage.removeItem('demo_user_email');
    } catch {}
    router.push('/login');
  };

  const menuItems = [
    {
      icon: Monitor,
      label: 'สลับไปหน้าโน้ตบุ๊ก',
      sublabel: 'ใช้ระบบ Desktop เต็มรูปแบบ',
      href: '/dashboard',
      external: false,
    },
    {
      icon: BookOpen,
      label: 'ค้นหารายวิชา',
      sublabel: 'เลือกเรียนวิชาที่ต้องการ',
      href: '/m/courses',
      external: false,
    },
    {
      icon: GraduationCap,
      label: 'การเรียนของฉัน',
      sublabel: `${enrollmentCount} วิชาที่ลงทะเบียนไว้`,
      href: '/m/enrollments',
      external: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Profile hero */}
      <div className="bg-black text-white px-5 pt-5 pb-8 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#CEF34B]/10 rounded-full blur-3xl" />

        <div className="flex flex-col items-center text-center relative z-10">
          {/* Avatar */}
          <div className="w-20 h-20 bg-[#CEF34B] rounded-3xl flex items-center justify-center mb-3 shadow-lg">
            <span className="text-2xl font-black text-black">{initials}</span>
          </div>

          <h2 className="text-lg font-black text-white">{user?.name || 'ผู้ใช้งาน'}</h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {user?.email || 'ไม่ระบุอีเมล'}
          </p>

          {/* Role badges */}
          {user?.roles && user.roles.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {user.roles.map((r: string) => (
                <span
                  key={r}
                  className="px-2.5 py-1 bg-white/10 border border-white/20 text-white text-[10px] font-bold rounded-full"
                >
                  {ROLE_LABELS[r] || r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md grid grid-cols-3 divide-x divide-slate-100 overflow-hidden">
          {[
            { label: 'วิชาที่เรียน', value: enrollmentCount },
            { label: 'สิทธิ์ทั้งหมด', value: user?.roles?.length || 1 },
            { label: 'สถานะ', value: 'Active' },
          ].map((s) => (
            <div key={s.label} className="p-3 text-center">
              <p className="text-lg font-black text-slate-900">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-5 space-y-3">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">
          เมนูการใช้งาน
        </p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden divide-y divide-slate-50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.sublabel}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </a>
            );
          })}
        </div>

        {/* Roles info */}
        {user?.roles && user.roles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 space-y-2.5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-black text-slate-600">สิทธิ์การเข้าถึงในระบบ</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((r: string) => (
                <span
                  key={r}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl border ${
                    ROLE_COLORS[r] || 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {ROLE_LABELS[r] || r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mobile notice */}
        <div className="bg-[#CEF34B]/10 border border-[#CEF34B]/30 rounded-2xl p-4 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-black">โหมดมือถือ</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              คุณกำลังใช้งาน LMS ในโหมดมือถือ สำหรับฟีเจอร์ครบถ้วน กรุณาใช้ Desktop
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  );
}
