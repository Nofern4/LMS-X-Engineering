'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  ArrowRight,
  Lock,
  Unlock,
  Globe,
  Zap,
  Award,
  Clock,
  Star,
  Sparkles,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function GlobalCoursesCatalogPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'instructor' | 'course' | 'code' | 'class'>('all');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'OPEN' | 'APPROVAL_REQUIRED'>('ALL');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // enrollmentStatuses: { [courseId]: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' }
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, string>>({});
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // ดึง user จาก localStorage (รองรับทั้ง user_session และ demo_user_email)
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed?.email) return parsed;
      }
      const email = localStorage.getItem('demo_user_email') || 'student@student.x-karchang.ac.th';
      return {
        id: 'student-1',
        email,
        name: 'สมชาย ช่างกล',
        roles: ['STUDENT'],
      };
    } catch {
      return {
        id: 'student-1',
        email: 'student@student.x-karchang.ac.th',
        name: 'สมชาย ช่างกล',
        roles: ['STUDENT'],
      };
    }
  };

  useEffect(() => {
    fetch(`/api/courses?search=${encodeURIComponent(search)}&searchType=${searchType}&semester=${encodeURIComponent(semester)}`)
      .then((r) => r.json())
      .then((d) => {
        const list: any[] = d.courses || [];
        setCourses(list);

        const user = getCurrentUser();
        const userEmail = (user?.email || '').toLowerCase();
        const statuses: Record<string, string> = {};

        for (const c of list) {
          if (c.accessType === 'APPROVAL_REQUIRED' || c.accessType === 'CLOSED') {
            const enrollments: any[] = c.enrollments || [];
            const myEnroll = enrollments.find((e: any) =>
              (e.student?.email && e.student.email.toLowerCase() === userEmail) ||
              (user?.id && (e.studentId === user.id || e.student?.id === user.id))
            );
            statuses[c.id] = myEnroll ? myEnroll.status : 'NONE';
          } else {
            statuses[c.id] = 'APPROVED';
          }
        }
        setEnrollmentStatuses(statuses);
      })
      .finally(() => setIsLoading(false));
  }, [search, searchType, semester]);

  const handleEnroll = async (courseId: string) => {
    const user = getCurrentUser();
    setEnrollingId(courseId);
    // ปรับสถานะทันที (Optimistic Update) ให้ผู้ใช้เห็นว่า "รออนุมัติ" ทันทีโดยไม่ต้องรอนาน
    setEnrollmentStatuses((prev) => ({ ...prev, [courseId]: 'PENDING' }));
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
      const data = await res.json();
      if (data.enrollment) {
        setEnrollmentStatuses((prev) => ({ ...prev, [courseId]: data.enrollment.status }));
      }
      window.dispatchEvent(new Event('enrollment_updated'));
    } catch (e) {
      console.error(e);
    } finally {
      setEnrollingId(null);
    }
  };

  const courseImages: Record<string, string> = {
    'CS101': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    'SE302': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'ME201': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'EE305': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    'AUTO101': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    'AI401': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'instructor':
        return 'ค้นหาชื่ออาจารย์ผู้สอน...';
      case 'code':
        return 'ค้นหารหัสวิชา (ตัวเลข เช่น 101, 302)...';
      default:
        return 'ค้นหาชื่อรายวิชา...';
    }
  };

  const displayCourses = courses.filter((c) => {
    if (accessFilter === 'OPEN') return c.accessType === 'OPEN';
    if (accessFilter === 'APPROVAL_REQUIRED') return c.accessType === 'APPROVAL_REQUIRED' || c.accessType === 'CLOSED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Clean Banner & Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              คลังรายวิชาทั้งหมด
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5" />
              <span>วิชาเปิดเข้าเรียนได้ทันที</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>วิชาคลาสปิด</span>
            </span>
          </div>
        </div>

        {/* Search Bar & Mode Selector */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เงื่อนไขการค้นหา:
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 focus:border-slate-900 shadow-xs cursor-pointer"
              >
                <option value="course">ค้นหารายวิชา</option>
                <option value="instructor">ค้นหาชื่ออาจารย์</option>
                <option value="code">ค้นหารหัสวิชา</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำค้นหา:
              </label>
              <Input
                placeholder={getPlaceholder()}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="rounded-xl bg-slate-50 border-slate-200 text-xs py-2.5 px-4 text-slate-900 focus:bg-white focus:border-slate-900"
              />
            </div>
          </div>

          {/* Access Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">สิทธิ์การเข้าเรียน:</span>
            <button
              onClick={() => setAccessFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                accessFilter === 'ALL'
                  ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({courses.length})
            </button>
            <button
              onClick={() => setAccessFilter('OPEN')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                accessFilter === 'OPEN'
                  ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              เปิดทั่วไป
            </button>
            <button
              onClick={() => setAccessFilter('APPROVAL_REQUIRED')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                accessFilter === 'APPROVAL_REQUIRED'
                  ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              คลาสปิด
            </button>

            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-rose-600 font-bold hover:underline ml-auto"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {displayCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-base">ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา</p>
          <p className="text-slate-400 text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((c: any) => {
            const coverImg = c.image || courseImages[c.code] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
            const isClosed = c.accessType === 'APPROVAL_REQUIRED' || c.accessType === 'CLOSED' || c.code === 'EE305' || c.code === 'ME201' || c.id === 'course-3' || c.id === 'course-2';
            const instructorName = c.createdBy?.name || c.instructors?.[0]?.instructor?.name || c.instructor || 'ผศ.ดร.วิชาญ สอนดี';
            const lessonsCount = c._count?.materials ?? 0;
            const enrollmentsCount = c._count?.enrollments ?? 0;

            const cleanTitle = (title: string) => {
              if (!title) return '';
              return title.replace(/\s*\([A-Za-z0-9\s&,.-]+\)/g, '').trim();
            };

            return (
              <div
                key={c.id}
                className="flex flex-col h-full overflow-hidden bg-white border border-slate-200/90 rounded-3xl hover:border-slate-300 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Cover Photo Header - Clickable to View Details */}
                <Link href={`/courses/${c.id}`} className="block">
                  <div className="h-44 bg-slate-900 p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-100"
                      style={{ backgroundImage: `url('${coverImg}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20" />

                    {/* Top Bar: Code Badge + Pure Icon Symbol for Open/Closed */}
                    <div className="flex items-center justify-between z-10">
                      <span className="px-3.5 py-1 rounded-full bg-[#CEF34B] text-black font-mono font-extrabold text-xs shadow-md">
                        {c.code}
                      </span>

                      {isClosed ? (
                        <span
                          title="คลาสปิด"
                          className="w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md"
                        >
                          <Lock className="w-4 h-4 text-amber-400" />
                        </span>
                      ) : (
                        <span
                          title="วิชาเปิดทั่วไป (เข้าเรียนได้ทันที)"
                          className="w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-md"
                        >
                          <Unlock className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>

                    <div className="z-10">
                      <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">{c.category}</p>
                    </div>
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link href={`/courses/${c.id}`} className="block group/title">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover/title:underline transition-colors cursor-pointer">
                        {cleanTitle(c.title)}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-600 font-medium">
                      อาจารย์ผู้สอน: <span className="font-bold text-slate-900">{instructorName}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                      <span>{lessonsCount} บทเรียน</span>
                    </span>
                  </div>

                {(() => {
                  const isPendingCourse = c.status === 'PENDING_APPROVAL';
                  const enrollStatus = enrollmentStatuses[c.id]; // 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | undefined
                  const isEnrolling = enrollingId === c.id;

                  // วิชารอพิจารณาสร้าง
                  if (isPendingCourse) {
                    return (
                      <Button disabled variant="secondary" size="md"
                        className="w-full font-bold rounded-full py-3 text-xs shadow-none bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200">
                        <span>รอพิจารณาเปิดรายวิชา</span>
                      </Button>
                    );
                  }

                  // วิชาเปิดหรืออนุมัติแล้ว → เข้าเรียนเลย
                  if (!isClosed || enrollStatus === 'APPROVED') {
                    return (
                      <Link href={`/learning/${c.id}`} className="block w-full">
                        <Button variant="primary" size="md"
                          className="w-full font-extrabold rounded-full py-3 text-xs shadow-xs bg-[#CEF34B] hover:bg-[#bce038] text-black flex items-center justify-center transition-all cursor-pointer">
                          เข้าสู่ห้องเรียน
                        </Button>
                      </Link>
                    );
                  }

                  // รออนุมัติอยู่ → แสดงสถานะรออนุมัติ
                  if (enrollStatus === 'PENDING') {
                    return (
                      <Link href={`/courses/${c.id}`} className="block w-full">
                        <Button variant="secondary" size="md"
                          className="w-full font-bold rounded-full py-3 text-xs bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center justify-center transition-all cursor-pointer">
                          <span>รออนุมัติ</span>
                        </Button>
                      </Link>
                    );
                  }

                  // ถูกปฏิเสธ → ขอใหม่ได้
                  if (enrollStatus === 'REJECTED') {
                    return (
                      <Button variant="primary" size="md"
                        disabled={isEnrolling}
                        onClick={() => handleEnroll(c.id)}
                        className="w-full font-extrabold rounded-full py-3 text-xs shadow-xs bg-[#CEF34B] hover:bg-[#bce038] text-black border-0 flex items-center justify-center transition-all cursor-pointer">
                        {isEnrolling ? 'กำลังส่ง...' : 'ขอเข้าร่วมใหม่อีกครั้ง'}
                      </Button>
                    );
                  }

                  // ยังไม่ได้สมัคร (NONE) หรือ status ยังโหลดอยู่
                  return (
                    <Button variant="primary" size="md"
                      disabled={isEnrolling}
                      onClick={() => handleEnroll(c.id)}
                      className="w-full font-extrabold rounded-full py-3 text-xs shadow-xs bg-[#CEF34B] hover:bg-[#bce038] text-black border-0 flex items-center justify-center transition-all cursor-pointer">
                      {isEnrolling ? 'กำลังส่ง...' : 'ขอเข้าเรียน'}
                    </Button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
}
