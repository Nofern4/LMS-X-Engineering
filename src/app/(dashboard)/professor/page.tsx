'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  HardDrive,
  Clock,
  Eye,
  UserCheck,
  BarChart3,
  TrendingUp,
  Search,
  Calendar,
  Sparkles,
  Award,
  AlertCircle,
  FileText,
  Lock,
  Globe,
  Video,
  Upload,
  Link2,
  ArrowRight,
  ArrowLeft,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function ProfessorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CS101');
  const [isLoading, setIsLoading] = useState(true);

  // Professor Taught Courses Selector List
  const [professorCourses, setProfessorCourses] = useState([
    { code: 'CS101', label: 'CS101 (วิศวกรรมคอมพิวเตอร์)', category: 'วิศวกรรมคอมพิวเตอร์' },
    { code: 'SE302', label: 'SE302 (วิศวกรรมซอฟต์แวร์)', category: 'วิศวกรรมซอฟต์แวร์' },
    { code: 'ME201', label: 'ME201 (ช่างกลโรงงาน)', category: 'ช่างกลโรงงาน' },
    { code: 'EE305', label: 'EE305 (ช่างไฟฟ้ากำลัง)', category: 'ช่างไฟฟ้ากำลัง' },
    { code: 'AUTO101', label: 'AUTO101 (เทคโนโลยีช่างยนต์)', category: 'เทคโนโลยีช่างยนต์' },
  ]);

  // Create Course Modal State (2-Step Wizard)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('วิศวกรรมคอมพิวเตอร์');
  const [newDescription, setNewDescription] = useState('');
  const [newAccessType, setNewAccessType] = useState<'APPROVAL_REQUIRED' | 'OPEN'>('APPROVAL_REQUIRED');

  // Step 2 Media & Quiz State
  const [materialType, setMaterialType] = useState<'VIDEO' | 'DOCUMENT'>('VIDEO');
  const [materialTitle, setMaterialTitle] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [hasGoogleFormsQuiz, setHasGoogleFormsQuiz] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState('');

  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const handleOpenCreateModal = () => {
    setCreateStep(1);
    setNewCode('');
    setNewTitle('');
    setNewDescription('');
    setMaterialType('VIDEO');
    setMaterialTitle('');
    setUploadedFileName(null);
    setHasGoogleFormsQuiz(false);
    setGoogleFormsUrl('');
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    if (searchParams?.get('create') === 'true') {
      handleOpenCreateModal();
    }
  }, [searchParams]);

  // Mock student course enrollment & program completion status
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([
    {
      id: 'att-1',
      studentId: 'XK-65010042',
      name: 'สมชาย ช่างกล',
      department: 'ช่างกลโรงงาน & วิศวกรรมคอมพิวเตอร์',
      courseCode: 'CS101',
      enrolledDate: '16 ก.ย. 2026, 09:30 น.',
      progress: 100,
      status: 'COMPLETED',
      topic: 'วิชาบังคับสาขา • เรียนจบโปรแกรมคอร์สแล้ว',
    },
    {
      id: 'att-2',
      studentId: 'XK-65010088',
      name: 'สมศักดิ์ ไฟฟ้า',
      department: 'ช่างไฟฟ้ากำลัง',
      courseCode: 'CS101',
      enrolledDate: '15 ก.ย. 2026, 14:15 น.',
      progress: 50,
      status: 'IN_PROGRESS',
      topic: 'บทที่ 1: แนะนำวิชา และการติดตั้งเครื่องมือพัฒนา',
    },
    {
      id: 'att-3',
      studentId: 'XK-65010112',
      name: 'อนันต์ เครื่องกล',
      department: 'วิศวกรรมเครื่องกล Xการช่าง',
      courseCode: 'CS101',
      enrolledDate: '14 ก.ย. 2026, 11:00 น.',
      progress: 75,
      status: 'IN_PROGRESS',
      topic: 'บทที่ 2: โครงสร้างไฟล์และสถาปัตยกรรมระบบ',
    },
    {
      id: 'att-4',
      studentId: 'XK-65010204',
      name: 'กิตติพงษ์ ยานยนต์',
      department: 'เทคโนโลยีช่างยนต์',
      courseCode: 'ME201',
      enrolledDate: '12 ก.ย. 2026, 10:20 น.',
      progress: 100,
      status: 'COMPLETED',
      topic: 'บทที่ 2: ระบบไฮดรอลิกในงานอุตสาหกรรม',
    },
    {
      id: 'att-5',
      studentId: 'XK-65010310',
      name: 'ณัฐวุฒิ การช่าง',
      department: 'ช่างไฟฟ้ากำลัง',
      courseCode: 'ME201',
      enrolledDate: '10 ก.ย. 2026, 16:45 น.',
      progress: 25,
      status: 'IN_PROGRESS',
      topic: 'บทที่ 1: ปูพื้นฐานระบบไฟฟ้ารวม',
    },
    {
      id: 'att-6',
      studentId: 'XK-65010420',
      name: 'วิชัย ไฟฟ้า',
      department: 'ช่างไฟฟ้ากำลัง',
      courseCode: 'EE305',
      enrolledDate: '11 ก.ย. 2026, 13:10 น.',
      progress: 60,
      status: 'IN_PROGRESS',
      topic: 'บทที่ 1: ระบบควบคุม PLC และ IoT',
    }
  ]);

  // Mock course interest metrics (คลาสไหนที่นักเรียนสนใจ)
  const courseInterestData = [
    {
      code: 'CS101',
      title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน',
      category: 'วิศวกรรมคอมพิวเตอร์',
      interestScore: 98,
      viewsCount: 24500,
      enrolledCount: 142,
      topMaterial: 'วิดีโอปฏิบัติการที่ 1: ติดตั้งสภาพแวดล้อมระบบ (ดูซ้ำ 1,420 ครั้ง)',
      trend: '+24% สัปดาห์นี้',
    },
    {
      code: 'ME201',
      title: 'กลศาสตร์เครื่องกลและการออกแบบระบบอัตโนมัติ',
      category: 'ช่างกลโรงงาน',
      interestScore: 92,
      viewsCount: 18200,
      enrolledCount: 98,
      topMaterial: 'คู่มือความปลอดภัยประจำห้องปฏิบัติการ (ดูซ้ำ 980 ครั้ง)',
      trend: '+18% สัปดาห์นี้',
    },
    {
      code: 'EE305',
      title: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT',
      category: 'ช่างไฟฟ้ากำลัง',
      interestScore: 85,
      viewsCount: 11900,
      enrolledCount: 76,
      topMaterial: 'การเขียนโปรแกรม PLC ควบคุมวงจรไฟฟ้า (ดูซ้ำ 650 ครั้ง)',
      trend: '+12% สัปดาห์นี้',
    },
  ];

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        if (data.courses?.[0]?.id) {
          fetch(`/api/courses/${data.courses[0].id}/students`)
            .then((r) => r.json())
            .then((ed) => setEnrollments(ed.enrollments || []));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleApproveStudent = async (courseId: string, studentId: string) => {
    await fetch(`/api/courses/${courseId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: { id: 'prof-1', roles: ['PROFESSOR'] },
        studentId,
        action: 'APPROVE',
      }),
    });
    setEnrollments((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status: 'APPROVED' } : e))
    );
  };

  const handleRejectStudent = async (courseId: string, studentId: string) => {
    await fetch(`/api/courses/${courseId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: { id: 'prof-1', roles: ['PROFESSOR'] },
        studentId,
        action: 'REJECT',
      }),
    });
    setEnrollments((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status: 'REJECTED' } : e))
    );
  };

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createStep === 1) {
      if (!newCode.trim() || !newTitle.trim()) return;
      setCreateStep(2);
      return;
    }

    setIsSubmittingCourse(true);
    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: 'prof-1', roles: ['PROFESSOR'] },
          code: newCode.trim(),
          title: newTitle.trim(),
          description: newDescription.trim() || 'รายวิชาใหม่ประจำภาคเรียน',
          category: newCategory,
          semester: '1',
          academicYear: '2026',
          accessType: newAccessType,
          storageLimitGb: '1.0',
        }),
      });

      const newCourseCode = newCode.trim();
      const newCourseItem = {
        code: newCourseCode,
        label: `${newCourseCode} (${newCategory})`,
        category: newCategory,
      };

      setProfessorCourses((prev) => [...prev, newCourseItem]);
      setSelectedCourseCode(newCourseCode);

      // Seed initial student log for created course
      setAttendanceLogs((prev) => [
        ...prev,
        {
          id: `att-${Date.now()}`,
          studentId: 'XK-65010999',
          name: 'สมเกียรติ ช่างใหม่',
          department: newCategory,
          courseCode: newCourseCode,
          enrolledDate: 'เมื่อสักครู่',
          progress: 0,
          status: 'IN_PROGRESS',
          topic: materialTitle.trim() || 'บทที่ 1: สื่อการเรียนและแบบทดสอบ',
        }
      ]);

      setCreateSuccessMsg(`สร้างรายวิชา ${newCourseCode} - ${newTitle.trim()} พร้อมสื่อเรียนสำเร็จแล้ว!`);
      setTimeout(() => setCreateSuccessMsg(null), 4000);

      // Reset form & close modal
      setNewCode('');
      setNewTitle('');
      setNewDescription('');
      setCreateStep(1);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const filteredAttendance = attendanceLogs.filter((log) => log.courseCode === selectedCourseCode);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Header Banner for Teacher Portal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
        <div className="space-y-1 z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ผศ.ดร.วิชาญ สอนดี
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-black stroke-[3]" />}
            className="rounded-full font-extrabold text-xs py-3 px-6 bg-[#CEF34B] hover:bg-[#bce038] text-black shadow-lg border-0 transition-all transform hover:scale-105 whitespace-nowrap"
          >
            สร้างรายวิชาใหม่
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {createSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* Metric Cards - Teacher Specific Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center border border-slate-800 shadow-xs">
            <BookOpen className="w-6 h-6 text-[#CEF34B]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">รายวิชาที่สอน</p>
            <p className="text-xl font-extrabold text-slate-900">{professorCourses.length} รายวิชา</p>
            <p className="text-[10px] text-slate-500 font-bold">มหาวิทยาลัย Xการช่าง</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">อัตราการเรียนจบโปรแกรม</p>
            <p className="text-xl font-extrabold text-emerald-600">86.5%</p>
            <p className="text-[10px] text-slate-500">ประเมินจากการเรียนครบ 100%</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">วิชาที่มีความสนใจสูงสุด</p>
            <p className="text-lg font-extrabold text-slate-900">CS101 (98%)</p>
            <p className="text-[10px] text-amber-600 font-bold">24,500 Material Views</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">นักศึกษาในความดูแล</p>
            <p className="text-xl font-extrabold text-slate-900">240 คน</p>
            <p className="text-[10px] text-slate-500">ทุกสาขาการช่าง</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: รายชื่อนักศึกษาที่ลงเรียน & สถานะการเรียนจบโปรแกรม */}
      <div id="enrollment" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>รายชื่อนักศึกษาที่ลงเรียน</span>
            </h2>
          </div>

          {/* Select Course Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {professorCourses.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCourseCode(c.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${selectedCourseCode === c.code
                    ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                    : 'text-slate-700 hover:text-black bg-white/60'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enrollment Summary Banner for Selected Course */}
        <div className="px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-semibold">นักศึกษาที่ลงเรียนทั้งหมด</span>
            <p className="text-xl font-extrabold text-slate-900">
              {filteredAttendance.length} คน
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
            <span className="text-emerald-700 font-semibold">เรียนจบโปรแกรมแล้ว (100%)</span>
            <p className="text-xl font-extrabold text-emerald-700">
              {filteredAttendance.filter((a) => a.status === 'COMPLETED').length} คน
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-1">
            <span className="text-amber-800 font-semibold">กำลังเรียนอยู่ (In Progress)</span>
            <p className="text-xl font-extrabold text-amber-800">
              {filteredAttendance.filter((a) => a.status === 'IN_PROGRESS').length} คน
            </p>
          </div>
        </div>

        {/* Enrollment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 border-y border-slate-200 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">รหัสนักศึกษา</th>
                <th className="p-4">ชื่อ-นามสกุล</th>
                <th className="p-4">สาขาวิชา/แผนก</th>
                <th className="p-4">วันเวลาที่ลงเรียน</th>
                <th className="p-4">รายละเอียดรายวิชา</th>
                <th className="p-4 pr-6 text-center">สถานะการเรียนจบโปรแกรม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    ไม่พบบันทึกการลงเรียนในรายวิชาที่เลือก ({selectedCourseCode})
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-extrabold text-slate-900">{log.studentId}</td>
                    <td className="p-4 font-bold text-slate-900">{log.name}</td>
                    <td className="p-4 text-slate-600">{log.department}</td>
                    <td className="p-4 font-mono text-slate-500">{log.enrolledDate}</td>
                    <td className="p-4 text-slate-900 font-medium">{log.topic}</td>
                    <td className="p-4 pr-6 text-center">
                      <span
                        className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs inline-flex items-center gap-1.5 ${log.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                      >
                        {log.status === 'COMPLETED'
                          ? '✅ เรียนจบแล้ว (100%)'
                          : `⏳ กำลังเรียนอยู่ (${log.progress}%)`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: คลาสไหนที่นักเรียนสนใจ (Course Interest Analytics) */}
      <div id="interest" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-[#CEF34B] text-xs font-extrabold">
              Course Interest Analytics
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-900" />
            <span>รายงานวิเคราะห์: คลาสไหนที่นักเรียนสนใจเป็นพิเศษ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ข้อมูลความนิยมและสถิติการเปิดดูสื่อเรียนซ้ำของผู้เรียน มหาวิทยาลัย Xการช่าง
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {courseInterestData.map((item) => (
            <div
              key={item.code}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#CEF34B] text-black font-mono font-extrabold text-xs">
                    {item.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    {item.trend}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.category}</p>
              </div>

              {/* Interest Score Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>ระดับความสนใจของผู้เรียน</span>
                  <span className="text-slate-900 font-extrabold">{item.interestScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.interestScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-[11px]">สื่อที่มีการดูซ้ำสูงสุด:</p>
                <p className="text-[11px] text-slate-600 line-clamp-2">{item.topMaterial}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">ยอดเข้าชมสื่อ:</span>
                <span className="font-mono font-extrabold text-slate-900">{item.viewsCount.toLocaleString()} ครั้ง</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Pending Student Enrollment Requests */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>คำขอเข้าร่วมรายวิชาที่รอการอนุมัติจากอาจารย์ผู้สอน</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
            รอการพิจารณา {enrollments.filter((e) => e.status === 'PENDING').length || 1} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">รหัสนักศึกษา</th>
                <th className="p-4">ชื่อ-นามสกุล</th>
                <th className="p-4">อีเมลสถาบัน</th>
                <th className="p-4">สถานะคำขอ</th>
                <th className="p-4 pr-6 text-right">การอนุมัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    ไม่มีคำขอเข้าร่วมรายวิชาที่ค้างอยู่
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-extrabold text-slate-900">{e.student?.studentId || 'XK-65010088'}</td>
                    <td className="p-4 font-bold text-slate-900">{e.student?.name || 'สมศักดิ์ ไฟฟ้า'}</td>
                    <td className="p-4 text-slate-600">{e.student?.email || 'student2@student.x-karchang.ac.th'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full font-extrabold text-xs ${e.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : e.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {e.status === 'PENDING' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveStudent(e.courseId, e.studentId)}
                            className="bg-slate-900 hover:bg-slate-800 text-[#CEF34B] rounded-full text-xs font-extrabold px-4 py-2 border-0"
                            leftIcon={<CheckCircle className="w-3.5 h-3.5 text-[#CEF34B]" />}
                          >
                            อนุมัติเข้าเรียน
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectStudent(e.courseId, e.studentId)}
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full text-xs font-extrabold px-4 py-2"
                            leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          >
                            ปฏิเสธ
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal Popup (2-Step Wizard) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          createStep === 1
            ? 'สร้างรายวิชาใหม่'
            : 'อัพโหลดสื่อการเรียน & แบบทดสอบ'
        }
        footer={
          createStep === 1 ? (
            <>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />}
                className="rounded-xl bg-[#CEF34B] hover:bg-[#bce038] text-black text-xs font-extrabold shadow-md border-0 px-6 whitespace-nowrap"
                disabled={!newCode.trim() || !newTitle.trim()}
                onClick={() => setCreateStep(2)}
              >
                ถัดไป
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5 text-slate-600" />}
                className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap"
                onClick={() => setCreateStep(1)}
              >
                ย้อนกลับ
              </Button>
              <Button
                variant="primary"
                className="rounded-xl bg-[#CEF34B] hover:bg-[#bce038] text-black text-xs font-extrabold shadow-md border-0 px-6"
                isLoading={isSubmittingCourse}
                onClick={handleCreateCourseSubmit}
              >
                บันทึกสร้างรายวิชาและบทเรียน
              </Button>
            </>
          )
        }
      >
        <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs font-sans">
          {createStep === 1 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    รหัสวิชา (Course Code) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="ตัวอย่าง: CS103, EE401"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    ชื่อรายวิชา (Course Title) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="ตัวอย่าง: ปัญญาประดิษฐ์ในงานช่าง"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  หมวดหมู่ / สาขาวิชา (Department / Category)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900"
                >
                  <option value="วิศวกรรมคอมพิวเตอร์">วิศวกรรมคอมพิวเตอร์</option>
                  <option value="ช่างกลโรงงาน">ช่างกลโรงงาน</option>
                  <option value="ช่างไฟฟ้ากำลัง">ช่างไฟฟ้ากำลัง</option>
                  <option value="เทคโนโลยีช่างยนต์">เทคโนโลยีช่างยนต์</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  คำอธิบายรายวิชา (Course Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุรายละเอียดวัตถุประสงค์และขอบเขตการสอนของรายวิชานี้..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  นโยบายการเข้าเรียน (Access Policy)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="accessType"
                      value="APPROVAL_REQUIRED"
                      checked={newAccessType === 'APPROVAL_REQUIRED'}
                      onChange={() => setNewAccessType('APPROVAL_REQUIRED')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      คลาสแบบปิด (ต้องได้รับการอนุมัติ)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="accessType"
                      value="OPEN"
                      checked={newAccessType === 'OPEN'}
                      onChange={() => setNewAccessType('OPEN')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      เปิดทั่วไป (เข้าเรียนได้ทันที)
                    </span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Material & Quiz Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    เลือกประเภทไฟล์สื่อการเรียน (Material File Type)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMaterialType('VIDEO')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${materialType === 'VIDEO'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <Video className={`w-5 h-5 ${materialType === 'VIDEO' ? 'text-[#CEF34B]' : 'text-slate-500'}`} />
                      <div>
                        <p className="font-extrabold text-xs">วิดีโอการเรียน</p>
                        <p className={`text-[10px] ${materialType === 'VIDEO' ? 'text-slate-300' : 'text-slate-500'}`}>
                          MP4, WebM, MKV
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaterialType('DOCUMENT')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${materialType === 'DOCUMENT'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <FileText className={`w-5 h-5 ${materialType === 'DOCUMENT' ? 'text-[#CEF34B]' : 'text-slate-500'}`} />
                      <div>
                        <p className="font-extrabold text-xs">ไฟล์เอกสาร</p>
                        <p className={`text-[10px] ${materialType === 'DOCUMENT' ? 'text-slate-300' : 'text-slate-500'}`}>
                          PDF, DOCX, PPTX
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    ชื่อหัวข้อ / บทเรียน (Lesson Title)
                  </label>
                  <Input
                    placeholder={
                      materialType === 'VIDEO'
                        ? 'ตัวอย่าง: บทที่ 1: การติดตั้งและใช้งานเบื้องต้น'
                        : 'ตัวอย่าง: คู่มือปฏิบัติการและสไลด์ประกอบการสอน'
                    }
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-900">
                      แนบไฟล์สื่อการสอน ({materialType === 'VIDEO' ? 'Video File' : 'Document File'})
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      จำกัดขนาดไฟล์ไม่เกิน 1 GB
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 rounded-2xl p-4 text-center transition-all relative">
                    <input
                      type="file"
                      accept={materialType === 'VIDEO' ? 'video/*' : '.pdf,.docx,.pptx'}
                      onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                    {uploadedFileName ? (
                      <div>
                        <p className="font-bold text-emerald-700 text-xs flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {uploadedFileName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">คลิกเพื่อเปลี่ยนไฟล์</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-700 text-xs">คลิกหรือลากไฟล์มาวางเพื่ออัพโหลด</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          รองรับไฟล์ {materialType === 'VIDEO' ? 'MP4 / WebM' : 'PDF / DOCX'} (สูงสุดไม่เกิน 1 GB ต่อไฟล์)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Forms Post-Lesson Quiz Options */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={hasGoogleFormsQuiz}
                      onChange={(e) => setHasGoogleFormsQuiz(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 accent-slate-900"
                    />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                        มีแบบทดสอบหลังเรียนไหม? (ใช้ Google Forms)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ติ๊กเลือกเพื่อใส่ลิงก์แบบทดสอบสำหรับนักศึกษาทำหลังเรียนเสร็จ
                      </p>
                    </div>
                  </label>

                  {hasGoogleFormsQuiz && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 animate-fadeIn">
                      <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                        ลิงก์แบบทดสอบ Google Forms (Google Forms URL) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        placeholder="https://forms.google.com/..."
                        value={googleFormsUrl}
                        onChange={(e) => setGoogleFormsUrl(e.target.value)}
                        className="rounded-xl text-xs bg-white border-indigo-200 focus:border-indigo-600"
                      />
                      <p className="text-[10px] text-indigo-700 font-medium">
                        * ระบบจะนำลิงก์ Google Forms นี้ไปแสดงในแถบแบบทดสอบหลังเรียนของนักศึกษาโดยเฉพาะ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}
