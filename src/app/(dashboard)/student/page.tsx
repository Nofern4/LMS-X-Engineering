'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  Clock,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Wrench,
  Users,
  ShieldCheck,
  Headphones,
  Calendar,
  Star,
  Search,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CertificateModal } from '@/components/ui/CertificateModal';

export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lastWatchedCourse, setLastWatchedCourse] = useState<any>({
    title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (CS101)',
    lesson: 'บทที่ 3 - การรับค่าข้อมูลและโครงสร้างเงื่อนไข Control Flow',
    link: '/learning/course-1',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80',
    isUnfinished: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('last_watched_video');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title && parsed.isUnfinished !== false) {
          setLastWatchedCourse(parsed);
        } else if (parsed && parsed.isUnfinished === false) {
          setLastWatchedCourse(null);
        }
      }
    } catch (e) {}
  }, []);

  const myEnrolledCourses = [
    {
      code: 'CS101',
      title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน',
      category: 'วิศวกรรมคอมพิวเตอร์',
      type: 'MANDATORY',
      accessType: 'PUBLIC',
      approvalStatus: 'APPROVED',
      instructor: 'ผศ.ดร.วิชาญ สอนดี',
      link: '/learning/course-1',
    },
    {
      code: 'EE305',
      title: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT',
      category: 'ช่างไฟฟ้ากำลัง',
      type: 'MANDATORY',
      accessType: 'CLOSED',
      approvalStatus: 'APPROVED',
      approvedBy: 'คนอนุมัติ',
      instructor: 'ผศ.ดร.วิชาญ สอนดี',
      link: '/learning/course-3',
    },
    {
      code: 'ME201',
      title: 'กลศาสตร์เครื่องกลและการออกแบบอัตโนมัติ',
      category: 'ช่างกลโรงงาน',
      type: 'ELECTIVE',
      accessType: 'CLOSED',
      approvalStatus: 'PENDING',
      instructor: 'อ.สมเกียรติ ช่างเครื่อง',
      link: '/learning/course-2',
    },
    {
      code: 'AUTO101',
      title: 'เทคโนโลยีช่างยนต์และยานยนต์ไฟฟ้า EV',
      category: 'เทคโนโลยีช่างยนต์',
      type: 'ELECTIVE',
      accessType: 'PUBLIC',
      approvalStatus: 'APPROVED',
      instructor: 'ผศ.ดร.วิชาญ สอนดี',
      link: '/learning/course-4',
    },
    {
      code: 'SE302',
      title: 'สถาปัตยกรรมซอฟต์แวร์และการออกแบบระบบ',
      category: 'วิศวกรรมซอฟต์แวร์',
      type: 'ELECTIVE',
      accessType: 'PUBLIC',
      approvalStatus: 'APPROVED',
      instructor: 'ผศ.ดร.วิชาญ สอนดี',
      link: '/learning/course-5',
    },
  ];

  const featuredCourses = [
    {
      id: 'course-1',
      code: 'CS101',
      title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน',
      category: 'วิศวกรรมคอมพิวเตอร์',
      credits: '3 หน่วยกิต',
      rating: '4.9 (120 รีวิว)',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'course-5',
      code: 'SE302',
      title: 'สถาปัตยกรรมซอฟต์แวร์และการออกแบบระบบ',
      category: 'วิศวกรรมซอฟต์แวร์',
      credits: '3 หน่วยกิต',
      rating: '4.9 (90 รีวิว)',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'course-2',
      code: 'ME201',
      title: 'กลศาสตร์เครื่องกลและการออกแบบอัตโนมัติ',
      category: 'ช่างกลโรงงาน',
      credits: '3 หน่วยกิต',
      rating: '4.8 (95 รีวิว)',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'course-3',
      code: 'EE305',
      title: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT',
      category: 'ช่างไฟฟ้ากำลัง',
      credits: '4 หน่วยกิต',
      rating: '4.9 (140 รีวิว)',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'course-4',
      code: 'AUTO101',
      title: 'เทคโนโลยีช่างยนต์และยานยนต์ไฟฟ้า EV',
      category: 'เทคโนโลยีช่างยนต์',
      credits: '3 หน่วยกิต',
      rating: '4.7 (88 รีวิว)',
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    },
  ];

  useEffect(() => {
    Promise.all([
      fetch('/api/courses?status=PUBLISHED').then((r) => r.json()),
      fetch('/api/announcements').then((r) => r.json()),
    ])
      .then(([courseData, annData]) => {
        setCourses(courseData.courses || []);
        setAnnouncements(annData.announcements || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredCourses.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredCourses.length) % featuredCourses.length);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-20 text-slate-900 font-sans">
      
      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        studentName="สมชาย ช่างกล (Somchai)"
        courseTitle="การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)"
        courseCode="CS101"
      />

      {/* 1. Hero Banner Section - Text directly on cover image with soft text shadow scrim */}
      {lastWatchedCourse && lastWatchedCourse.isUnfinished && (
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[360px] sm:min-h-[400px] flex items-end p-8 sm:p-12 text-white group bg-slate-900">
          {/* Full Brightness Background Image (100% Opacity) */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-100"
            style={{
              backgroundImage: `url('${lastWatchedCourse.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80'}')`,
            }}
          />

          {/* Soft Shadow Gradient Scrim behind text so words don't get lost on bright image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Text Content directly on top of cover image */}
          <div className="relative z-10 w-full max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CEF34B]/20 backdrop-blur-md border border-[#CEF34B]/40 text-[#CEF34B] text-xs sm:text-sm font-bold shadow-md">
              <PlayCircle className="w-4 h-4 text-[#CEF34B]" />
              <span>คลิปเรียนที่ดูค้างไว้ล่าสุด</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              {lastWatchedCourse.title}
            </h1>

            <p className="text-sm sm:text-base text-[#CEF34B] max-w-2xl leading-relaxed font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {lastWatchedCourse.lesson}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link href={lastWatchedCourse.link}>
                <button className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold text-base px-8 py-3.5 rounded-full shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-3">
                  <span>เข้าเรียนต่อ</span>
                  <div className="w-7 h-7 rounded-full bg-black text-[#CEF34B] flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}



      {/* 3. Featured Courses Grid with TOP CONTROLS & #CEF34B Lime Pills */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-xs space-y-7">
        
        {/* Controls Bar AT THE TOP */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              รายวิชาแนะนำประจำภาคเรียน
            </h2>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Category Filter Pills (Lime Green Active Accent) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200 text-xs sm:text-sm font-bold">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeCategory === 'ALL' ? 'bg-[#CEF34B] text-black font-extrabold shadow-xs' : 'text-slate-700 hover:text-black'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setActiveCategory('COMPUTER')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeCategory === 'COMPUTER' ? 'bg-[#CEF34B] text-black font-extrabold shadow-xs' : 'text-slate-700 hover:text-black'
                }`}
              >
                คอมพิวเตอร์
              </button>
              <button
                onClick={() => setActiveCategory('MECHANICAL')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeCategory === 'MECHANICAL' ? 'bg-[#CEF34B] text-black font-extrabold shadow-xs' : 'text-slate-700 hover:text-black'
                }`}
              >
                ช่างกล
              </button>
            </div>

            {/* Prev/Next Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-black hover:text-[#CEF34B] flex items-center justify-center transition-all shadow-xs"
                title="ย้อนกลับ"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-black hover:text-[#CEF34B] flex items-center justify-center transition-all shadow-xs"
                title="ถัดไป"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid with Lime Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((c) => (
            <div
              key={c.id}
              className="group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-[340px] flex flex-col justify-between p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-slate-900"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-100"
                style={{ backgroundImage: `url('${c.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20" />

              {/* Top Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#CEF34B] text-black font-mono font-extrabold text-xs sm:text-sm">
                  {c.code}
                </span>
              </div>

              {/* Bottom Card Title & Rating */}
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{c.category}</p>
                <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#CEF34B] transition-colors">
                  {c.title}
                </h3>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 pt-2 border-t border-white/20">
                  <span className="flex items-center gap-1 text-[#CEF34B] font-bold">
                    <Star className="w-4 h-4 fill-[#CEF34B]" />
                    {c.rating}
                  </span>
                  <Link href={`/learning/${c.id}`} className="text-[#CEF34B] font-extrabold hover:underline flex items-center gap-1.5">
                    <span>เข้าเรียน</span>
                    <ArrowRight className="w-4 h-4 text-[#CEF34B]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Link (Lime Pill Button) */}
        <div className="flex items-center justify-center pt-3">
          <Link href="/courses">
            <button className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold rounded-full px-9 py-3.5 text-base shadow-md transition-all">
              ดูรายวิชาทั้งหมดในสถาบัน
            </button>
          </Link>
        </div>
      </div>

      {/* 4. Student Enrolled Courses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-3">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-black" />
              <span>รายวิชาที่เข้าเรียน</span>
            </h3>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-black text-[#CEF34B] font-extrabold text-xs sm:text-sm self-start sm:self-auto">
            รวม {myEnrolledCourses.length} วิชา
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">รหัสวิชา</th>
                <th className="p-4">ชื่อรายวิชา</th>
                <th className="p-4">สถานะการอนุมัติสิทธิ์</th>
                <th className="p-4 pr-6 text-right">การเข้าเรียน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myEnrolledCourses.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-mono font-extrabold text-slate-900 text-sm sm:text-base">{item.code}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900 text-sm sm:text-base">{item.title}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{item.category} • อาจารย์: {item.instructor}</p>
                  </td>
                  <td className="p-4">
                    {item.approvalStatus === 'APPROVED' ? (
                      <span className="px-3 py-1.5 rounded-full bg-[#CEF34B]/30 text-black border border-[#CEF34B] font-extrabold text-xs inline-flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-black" />
                        {item.accessType === 'CLOSED' ? 'อนุมัติแล้ว (โดยคนอนุมัติ)' : 'เข้าเรียนได้ทันที'}
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        รอ "คนอนุมัติ" กดอนุมัติสิทธิ์
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {item.approvalStatus === 'APPROVED' ? (
                      <Link href={item.link}>
                        <button className="bg-black hover:bg-slate-800 text-[#CEF34B] font-bold rounded-full text-xs sm:text-sm px-5 py-2 shadow-xs inline-flex items-center justify-center">
                          <span>เข้าสู่ห้องเรียน</span>
                        </button>
                      </Link>
                    ) : (
                      <Link href={item.link}>
                        <button className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold rounded-full text-xs sm:text-sm px-5 py-2 shadow-xs inline-flex items-center justify-center">
                          <span>รออนุมัติ</span>
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
