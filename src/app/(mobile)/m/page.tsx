'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Bell,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function MobileHomePage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'อรุณสวัสดิ์' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  useEffect(() => {
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) setUser(JSON.parse(sess));
    } catch {}

    Promise.all([
      fetch('/api/courses?limit=6&t=' + Date.now(), { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/courses/enrollments?status=APPROVED&limit=4&t=' + Date.now(), {
        cache: 'no-store',
      }).then((r) => r.json()),
    ])
      .then(([cData, eData]) => {
        setCourses(cData.courses || []);
        setEnrollments(eData.enrollments || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const quickActions = [
    {
      label: 'รายวิชาทั้งหมด',
      icon: BookOpen,
      href: '/m/courses',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'การเรียนของฉัน',
      icon: GraduationCap,
      href: '/m/enrollments',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'การแจ้งเตือน',
      icon: Bell,
      href: '/m/notifications',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'สถิติการเรียน',
      icon: TrendingUp,
      href: '/m/profile',
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Hero greeting banner */}
      <div className="bg-black text-white px-5 pt-5 pb-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#CEF34B]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-xs text-slate-400 font-medium">{greeting} 👋</p>
            <h2 className="text-xl font-black text-white mt-0.5">
              {user?.name?.split(' ')[0] || 'นักศึกษา'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              LMS X-Engineering — มหาวิทยาลัยเทคโนโลยี
            </p>
          </div>
          <div className="w-11 h-11 bg-[#CEF34B] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3 relative z-10">
          {[
            { label: 'วิชาทั้งหมด', value: courses.length || '—' },
            { label: 'กำลังเรียน', value: enrollments.length || '—' },
            { label: 'เสร็จแล้ว', value: '0' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10"
            >
              <p className="text-lg font-black text-[#CEF34B]">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="px-4 py-5 space-y-6">
        {/* Quick Actions */}
        <section>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            เมนูด่วน
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-xs active:scale-95 transition-transform"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Continue Learning */}
        {enrollments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                เรียนต่อจากที่ค้างไว้
              </h3>
              <Link
                href="/m/enrollments"
                className="text-[11px] font-bold text-black flex items-center gap-0.5"
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {enrollments.slice(0, 2).map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-4 active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-[#CEF34B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-slate-500">
                      {e.course?.code}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {e.course?.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {e.course?.category || 'รายวิชา'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Courses */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              รายวิชาล่าสุด
            </h3>
            <Link
              href="/m/courses"
              className="text-[11px] font-bold text-black flex items-center gap-0.5"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((c) => {
                const gradients = [
                  'from-violet-500 to-purple-600',
                  'from-blue-500 to-cyan-600',
                  'from-emerald-500 to-teal-600',
                  'from-amber-500 to-orange-600',
                  'from-rose-500 to-pink-600',
                ];
                const g = gradients[c.code?.charCodeAt(0) % gradients.length] || gradients[0];
                return (
                  <Link
                    key={c.id}
                    href={`/courses/${c.id}`}
                    className="flex items-stretch bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden active:scale-[0.98] transition-all"
                  >
                    <div className={`w-1.5 bg-gradient-to-b ${g} flex-shrink-0`} />
                    <div className="flex-1 p-3.5">
                      <span className="inline-block px-2 py-0.5 bg-black text-[#CEF34B] text-[10px] font-black rounded-md mb-1 font-mono">
                        {c.code}
                      </span>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{c.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {c.category || 'ทั่วไป'} · {c._count?.enrollments || 0} คน
                      </p>
                    </div>
                    <div className="flex items-center pr-4">
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
