'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Lock, Unlock, Globe, PlayCircle, FileText, CheckCircle2, Clock, Send, HardDrive, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data.course);
        // Check local demo enrollment status
        if (id === 'course-1' || data.course?.code === 'CS101' || data.course?.accessType === 'OPEN') {
          setEnrollmentStatus('APPROVED');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRequestEnroll = async () => {
    setIsRequesting(true);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { id: 'student-1', roles: ['STUDENT'] } }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnrollmentStatus(data.enrollment?.status || 'PENDING');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRequesting(false);
    }
  };

  if (!course) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดรายละเอียดรายวิชา...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12 text-slate-900 font-sans">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ย้อนกลับไปคลังรายวิชา</span>
      </button>

      {/* Hero Header */}
      <div className="p-7 rounded-3xl bg-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="neutral" className="bg-slate-800 text-amber-400 font-bold text-xs border border-slate-700">
            {course.code}
          </Badge>
          {course.accessType === 'APPROVAL_REQUIRED' ? (
            <span className="px-3 py-1 rounded-full bg-amber-950/90 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>วิชาคลาสแบบปิด (ต้องให้คนอนุมัติกดอนุมัติสิทธิ์)</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>วิชาเปิดทั่วไป (เข้าเรียนได้ทันที)</span>
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 font-medium text-xs">
            {course.category}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{course.title}</h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">{course.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-slate-800 pt-4 font-medium">
          <div>
            <span className="text-slate-400 block text-xs">อาจารย์ผู้สอน:</span>
            <span className="font-bold text-white text-xs">{course.createdBy?.name || 'ผศ.ดร.วิชาญ สอนดี'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">ภาคการเรียน/ปีการศึกษา:</span>
            <span className="font-bold text-white text-xs">{course.semester}/{course.academicYear}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">ผู้เรียนในรายวิชา:</span>
            <span className="font-bold text-white text-xs">{course._count?.enrollments || 1} คน</span>
          </div>
        </div>
      </div>

      {/* Access Permission Control Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>สิทธิ์การเข้าเรียนในรายวิชา (Access Permission Status)</span>
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            {enrollmentStatus === 'APPROVED'
              ? 'คุณได้รับการอนุมัติสิทธิ์เข้าร่วมรายวิชานี้เรียบร้อยแล้ว สามารถเข้าสู่ห้องเรียนได้ทันที'
              : enrollmentStatus === 'PENDING'
              ? 'คำขอของคุณถูกส่งไปยัง "Role คนอนุมัติ" เรียบร้อยแล้ว อยู่ระหว่างรอการกดอนุมัติสิทธิ์เข้าคลาสแบบปิด'
              : course.accessType === 'APPROVAL_REQUIRED'
              ? 'วิชานี้เป็นคลาสแบบปิดเฉพาะ ต้องส่งคำขอสิทธิ์ถึง "คนอนุมัติ (Course Approver)" เพื่ออนุมัติก่อนเข้าเรียน'
              : 'วิชานี้เป็นวิชาเปิดทั่วไป คนใน มหาวิทยาลัย Xการช่าง สามารถเข้าเรียนได้ทันที'}
          </p>
        </div>

        <div>
          {enrollmentStatus === 'APPROVED' ? (
            <Link href={`/learning/${course.id}`}>
              <Button variant="primary" size="lg" className="font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 shadow-xs flex items-center gap-2 text-xs" leftIcon={<PlayCircle className="w-4 h-4 text-amber-400" />}>
                เข้าสู่ห้องเรียน (Enter Class)
              </Button>
            </Link>
          ) : enrollmentStatus === 'PENDING' ? (
            <Button variant="outline" size="lg" disabled className="rounded-xl border-slate-200 bg-slate-100 text-amber-700 text-xs font-semibold" leftIcon={<Clock className="w-4 h-4 text-amber-600" />}>
              ⏳ รอ "คนอนุมัติ" กดอนุมัติสิทธิ์...
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              isLoading={isRequesting}
              onClick={handleRequestEnroll}
              leftIcon={<Send className="w-4 h-4 text-amber-400" />}
              className="font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 shadow-xs text-xs"
            >
              ขออนุมัติเข้าเรียนคลาสแบบปิด
            </Button>
          )}
        </div>
      </div>

      {/* Syllabus & Learning Materials List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>สื่อการเรียนรู้ในวิชานี้ ({course.materials?.length || 2} บทเรียน)</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {course.materials?.map((m: any, idx: number) => (
            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {m.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.description || 'สื่อการสอนในระบบ'}</p>
                </div>
              </div>

              <div>
                {enrollmentStatus === 'APPROVED' ? (
                  <Link href={`/learning/${course.id}`}>
                    <Button variant="ghost" size="sm" className="text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold" leftIcon={<PlayCircle className="w-3.5 h-3.5 text-amber-600" />}>
                      รับชมสื่อ
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> ต้องให้คนอนุมัติก่อน
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
