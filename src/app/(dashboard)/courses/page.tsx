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
  const [category, setCategory] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // enrollmentStatuses: { [courseId]: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' }
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, string>>({});
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // ดึง user จาก localStorage
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  };

  useEffect(() => {
    fetch(`/api/courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&semester=${encodeURIComponent(semester)}`)
      .then((r) => r.json())
      .then(async (d) => {
        const list: any[] = d.courses || [];
        setCourses(list);

        // สำหรับวิชาที่ต้องอนุมัติ ดึง enrollment status ของ user ปัจจุบัน
        const user = getCurrentUser();
        const statuses: Record<string, string> = {};
        for (const c of list) {
          if (c.accessType === 'APPROVAL_REQUIRED') {
            try {
              const r2 = await fetch(`/api/courses/${c.id}`);
              const d2 = await r2.json();
              const enrollments: any[] = d2.course?.enrollments || [];
              const myEnroll = user
                ? enrollments.find((e: any) => e.studentId === user.id || e.student?.id === user.id)
                : null;
              statuses[c.id] = myEnroll ? myEnroll.status : 'NONE';
            } catch { statuses[c.id] = 'NONE'; }
          } else {
            statuses[c.id] = 'APPROVED';
          }
        }
        setEnrollmentStatuses(statuses);
      })
      .finally(() => setIsLoading(false));
  }, [search, category, semester]);

  const handleEnroll = async (courseId: string) => {
    const user = getCurrentUser();
    if (!user) return;
    setEnrollingId(courseId);
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
    } finally {
      setEnrollingId(null);
    }
  };

  const categories = [
    { label: 'ทั้งหมด', value: '' },
    { label: 'วิศวกรรมคอมพิวเตอร์', value: 'วิศวกรรมคอมพิวเตอร์' },
    { label: 'วิศวกรรมซอฟต์แวร์', value: 'วิศวกรรมซอฟต์แวร์' },
    { label: 'ช่างกลโรงงาน', value: 'ช่างกลโรงงาน' },
    { label: 'ช่างไฟฟ้ากำลัง', value: 'ช่างไฟฟ้ากำลัง' },
    { label: 'เทคโนโลยีช่างยนต์', value: 'เทคโนโลยีช่างยนต์' },
    { label: 'วิทยาการข้อมูล', value: 'วิทยาการข้อมูล' },
  ];

  const courseImages: Record<string, string> = {
    'CS101': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    'SE302': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'ME201': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'EE305': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    'AUTO101': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    'AI401': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  };

  const displayCourses = courses;


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
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <Input
                placeholder="ค้นหาชื่อวิชา, รหัสวิชา (CS101, EE305), หรือชื่ออาจารย์ผู้สอน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="rounded-xl bg-slate-50 border-slate-200 text-xs py-2.5 px-4 text-slate-900 focus:bg-white focus:border-slate-900"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900"
              >
                <option value="">ทุกภาคการเรียน</option>
                <option value="1">ภาคการเรียนที่ 1</option>
                <option value="2">ภาคการเรียนที่ 2</option>
              </select>
            </div>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">หมวดหมู่:</span>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  category === cat.value
                    ? 'bg-black text-[#CEF34B] shadow-xs'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
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
            const instructorName = c.createdBy?.name || c.instructor || 'ผศ.ดร.วิชาญ สอนดี';
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
                {/* Cover Photo Header */}
                <div className="h-44 bg-slate-900 p-4 flex flex-col justify-between relative overflow-hidden">
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
                        title="คลาสแบบปิด (ต้องขออนุมัติ)"
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

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-black transition-colors">
                      {cleanTitle(c.title)}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      อาจารย์ผู้สอน: <span className="font-bold text-slate-900">{instructorName}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                      <span>{lessonsCount} บทเรียน</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                      <Users className="w-3.5 h-3.5" />
                      <span>{enrollmentsCount} ผู้เรียน</span>
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
                          className="w-full font-extrabold rounded-full py-3 text-xs shadow-xs bg-[#CEF34B] hover:bg-[#bce038] text-black flex items-center justify-center transition-all">
                          เข้าสู่ห้องเรียน
                        </Button>
                      </Link>
                    );
                  }

                  // รออนุมัติอยู่
                  if (enrollStatus === 'PENDING') {
                    return (
                      <Button disabled variant="secondary" size="md"
                        className="w-full font-bold rounded-full py-3 text-xs shadow-none bg-amber-50 text-amber-700 border border-amber-300 cursor-not-allowed">
                        ⏳ รออนุมัติจากอาจารย์
                      </Button>
                    );
                  }

                  // ถูกปฏิเสธ → ขอใหม่ได้
                  if (enrollStatus === 'REJECTED') {
                    return (
                      <Button variant="primary" size="md"
                        disabled={isEnrolling}
                        onClick={() => handleEnroll(c.id)}
                        className="w-full font-extrabold rounded-full py-3 text-xs shadow-xs bg-rose-600 hover:bg-rose-700 text-white border-0 flex items-center justify-center transition-all">
                        {isEnrolling ? 'กำลังส่ง...' : '↩ ขอเข้าร่วมใหม่อีกครั้ง'}
                      </Button>
                    );
                  }

                  // ยังไม่ได้สมัคร (NONE) หรือ status ยังโหลดอยู่
                  return (
                    <Button variant="primary" size="md"
                      disabled={isEnrolling}
                      onClick={() => handleEnroll(c.id)}
                      className="w-full font-extrabold rounded-full py-3 text-xs shadow-xs bg-slate-900 hover:bg-slate-700 text-[#CEF34B] border-0 flex items-center justify-center transition-all">
                      {isEnrolling ? 'กำลังส่ง...' : '✋ ขอเข้าร่วมเรียน'}
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
