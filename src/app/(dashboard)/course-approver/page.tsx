'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function CourseApproverDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'enrollments'>('courses');

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemType, setItemType] = useState<'COURSE' | 'ENROLLMENT'>('COURSE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isLoading, setIsLoading] = useState(false);

  const fetchApprovals = async () => {
    try {
      // 1. Fetch courses waiting approval
      const cRes = await fetch('/api/courses');
      const cData = await cRes.json();
      const pendingCourses = (cData.courses || []).filter((c: any) => c.status === 'PENDING_APPROVAL');
      setCourses(pendingCourses);

      // 2. Fetch student enrollment requests waiting approval
      const eRes = await fetch('/api/courses/enrollments?status=PENDING');
      const eData = await eRes.json();
      const pendingEnrollments = eData.enrollments || [];
      setEnrollments(pendingEnrollments);

      // Auto-switch to enrollments tab if there are student requests waiting and no course requests
      if (pendingCourses.length === 0 && pendingEnrollments.length > 0) {
        setActiveTab('enrollments');
      }
    } catch (err) {
      console.error('fetchApprovals error:', err);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const handleUpdate = () => fetchApprovals();
    window.addEventListener('enrollment_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('enrollment_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleOpenCourseDecision = (course: any, decision: 'APPROVE' | 'REJECT') => {
    setItemType('COURSE');
    setSelectedItem(course);
    setActionType(decision);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleOpenEnrollmentDecision = (enrollment: any, decision: 'APPROVE' | 'REJECT') => {
    setItemType('ENROLLMENT');
    setSelectedItem(enrollment);
    setActionType(decision);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedItem) return;
    setIsLoading(true);

    let userPayload: any = { id: 'approver-1', roles: ['COURSE_CREATOR_APPROVER'] };
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        userPayload = {
          id: parsed.id || 'approver-1',
          email: parsed.email,
          roles: parsed.roles || ['COURSE_CREATOR_APPROVER'],
        };
      }
    } catch {}

    try {
      if (itemType === 'COURSE') {
        await fetch(`/api/courses/${selectedItem.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userPayload,
            action: actionType,
            rejectionReason,
          }),
        });
        setCourses((prev) => prev.filter((c) => c.id !== selectedItem.id));
      } else {
        await fetch('/api/courses/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: selectedItem.courseId || selectedItem.course?.id,
            studentId: selectedItem.studentId || selectedItem.student?.id,
            action: actionType,
            rejectionReason,
            user: userPayload,
          }),
        });
        setEnrollments((prev) => prev.filter((e) => e.id !== selectedItem.id));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('enrollment_updated'));
        }
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Approver Header Banner */}
      <div className="p-6 sm:p-8 bg-black text-white rounded-3xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#CEF34B]/20 text-[#CEF34B] font-extrabold text-xs border border-[#CEF34B]/40 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>อนุมัติรายวิชา</span>
            </span>
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-xs border border-indigo-500/40 inline-flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>อนุมัติการเข้าเรียน</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ระบบพิจารณาและอนุมัติ
          </h1>
          <p className="text-xs text-slate-400">
            พิจารณาอนุมัติคำขอเปิดรายวิชาใหม่จากอาจารย์ผู้สอน และอนุมัติสิทธิ์การเข้าเรียนของนักศึกษา
          </p>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards for Approver (Clickable to switch tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {/* Card 1: Course Approvals */}
        <div
          onClick={() => setActiveTab('courses')}
          className={`p-6 rounded-3xl transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-black text-white border-2 border-[#CEF34B] shadow-xl scale-[1.02]'
              : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              activeTab === 'courses'
                ? 'bg-[#CEF34B] text-black border border-[#CEF34B]'
                : 'bg-slate-100 text-slate-800'
            }`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <span className={`px-3.5 py-1 rounded-full font-extrabold text-xs shadow-xs ${
              activeTab === 'courses'
                ? 'bg-[#CEF34B] text-black'
                : 'bg-slate-900 text-[#CEF34B]'
            }`}>
              {courses.length} คำขอ
            </span>
          </div>
          <h3 className={`text-base font-extrabold mt-4 ${activeTab === 'courses' ? 'text-white' : 'text-slate-900'}`}>
            คำขอเปิดรายวิชาใหม่
          </h3>
          <p className={`text-xs mt-1 ${activeTab === 'courses' ? 'text-slate-300' : 'text-slate-500'}`}>
            รอการพิจารณาอนุมัติเปิดสอนในระบบ
          </p>
        </div>

        {/* Card 2: Student Enrollment Approvals */}
        <div
          onClick={() => setActiveTab('enrollments')}
          className={`p-6 rounded-3xl transition-all cursor-pointer ${
            activeTab === 'enrollments'
              ? 'bg-black text-white border-2 border-[#CEF34B] shadow-xl scale-[1.02]'
              : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              activeTab === 'enrollments'
                ? 'bg-[#CEF34B] text-black border border-[#CEF34B]'
                : 'bg-slate-100 text-slate-800'
            }`}>
              <Users className="w-6 h-6" />
            </div>
            <span className={`px-3.5 py-1 rounded-full font-extrabold text-xs shadow-xs ${
              activeTab === 'enrollments'
                ? 'bg-[#CEF34B] text-black'
                : 'bg-slate-900 text-[#CEF34B]'
            }`}>
              {enrollments.length} คำขอ
            </span>
          </div>
          <h3 className={`text-base font-extrabold mt-4 ${activeTab === 'enrollments' ? 'text-white' : 'text-slate-900'}`}>
            อนุมัติการเข้าเรียน
          </h3>
          <p className={`text-xs mt-1 ${activeTab === 'enrollments' ? 'text-slate-300' : 'text-slate-500'}`}>
            คำขอเข้าเรียนของนักศึกษาที่รอการอนุมัติ
          </p>
        </div>
      </div>

      {/* Main Approval Action Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        {/* Tab Header Navigation */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#CEF34B]" />
              <span>คำขอเปิดรายวิชา ({courses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'enrollments'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4 text-[#CEF34B]" />
              <span>อนุมัติการเข้าเรียน ({enrollments.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Course Approval Table */}
        {activeTab === 'courses' && (
          <div className="overflow-x-auto animate-fadeIn">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">รหัสวิชา</th>
                  <th className="p-4">ชื่อรายวิชา</th>
                  <th className="p-4">อาจารย์ผู้ขอเปิด</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 pr-6 text-right">การพิจารณา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                      ไม่มีคำขอเปิดรายวิชาที่ค้างรอการตรวจสอบในระบบ
                    </td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="p-4 font-bold text-slate-900">{c.title}</td>
                      <td className="p-4 text-slate-600">{c.createdBy?.name || 'ผศ.ดร.วิชาญ สอนดี'}</td>
                      <td className="p-4 text-slate-600">{c.category}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-black text-[#CEF34B] font-mono text-[10px] font-extrabold border border-slate-800 shadow-xs inline-flex items-center gap-1">
                          รอการอนุมัติ
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenCourseDecision(c, 'APPROVE')}
                          className="bg-[#CEF34B] hover:bg-[#bce038] text-black rounded-full text-xs font-extrabold px-4 py-2 transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-black" />
                          <span>อนุมัติเปิดรายวิชา</span>
                        </button>
                        <button
                          onClick={() => handleOpenCourseDecision(c, 'REJECT')}
                          className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full text-xs font-bold px-4 py-2 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>ไม่อนุมัติ</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Student Enrollment Approval Table */}
        {activeTab === 'enrollments' && (
          <div className="overflow-x-auto animate-fadeIn">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">รหัสประจำตัว</th>
                  <th className="p-4">ชื่อ-นามสกุล นักศึกษา</th>
                  <th className="p-4">สาขาวิชา / อีเมล</th>
                  <th className="p-4">วิชาที่ขอเข้าเรียน</th>
                  <th className="p-4">วันที่ส่งคำขอ</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 pr-6 text-right">การพิจารณา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                      ไม่มีคำขอเข้าเรียนของนักศึกษาที่รอการอนุมัติในระบบ
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                        {e.student?.studentId || 'XK-65010999'}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {e.student?.name || 'นักศึกษา มหาวิทยาลัย Xการช่าง'}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>
                          <span>{e.student?.department || 'สาขาวิศวกรรมช่างกล'}</span>
                          <p className="text-[10px] text-slate-400 font-mono">{e.student?.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">
                          {e.course?.code} - {e.course?.title}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {e.requestedAt
                          ? new Date(e.requestedAt).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'เร็วๆ นี้'}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-extrabold border border-amber-200 shadow-xs inline-flex items-center gap-1">
                          รออนุมัติเข้าเรียน
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEnrollmentDecision(e, 'APPROVE')}
                          className="bg-[#CEF34B] hover:bg-[#bce038] text-black rounded-full text-xs font-extrabold px-4 py-2 transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-black" />
                          <span>อนุมัติเข้าเรียน</span>
                        </button>
                        <button
                          onClick={() => handleOpenEnrollmentDecision(e, 'REJECT')}
                          className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full text-xs font-bold px-4 py-2 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>ไม่อนุมัติ</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal (For both Courses and Enrollments) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          itemType === 'COURSE'
            ? actionType === 'APPROVE'
              ? 'ยืนยันการอนุมัติเปิดรายวิชา'
              : 'ระบุข้อคิดเห็นเพื่อส่งกลับแก้ไข'
            : actionType === 'APPROVE'
            ? 'ยืนยันการอนุมัติเข้าเรียนของนักศึกษา'
            : 'ระบุเหตุผลที่ไม่อนุมัติการเข้าเรียน'
        }
        footer={
          <>
            <button
              className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 px-5 py-2 text-xs font-bold transition-all cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </button>
            <button
              className={`rounded-full text-xs font-extrabold px-6 py-2 shadow-sm transition-all cursor-pointer ${
                actionType === 'APPROVE'
                  ? 'bg-[#CEF34B] hover:bg-[#bce038] text-black'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
              disabled={isLoading}
              onClick={handleConfirmDecision}
            >
              {actionType === 'APPROVE' ? 'ยืนยันอนุมัติ' : 'ยืนยันไม่อนุมัติ'}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-slate-900">
          {itemType === 'COURSE' ? (
            <p>
              คุณกำลังพิจารณาคำขอเปิดรายวิชา: <strong className="text-black font-extrabold">{selectedItem?.title || selectedItem?.code}</strong>
            </p>
          ) : (
            <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p>
                นักศึกษา: <strong className="text-black font-extrabold">{selectedItem?.student?.name}</strong> ({selectedItem?.student?.studentId || selectedItem?.student?.email})
              </p>
              <p>
                ขอเข้าเรียนในรายวิชา: <strong className="text-black font-extrabold">{selectedItem?.course?.code} - {selectedItem?.course?.title}</strong>
              </p>
            </div>
          )}

          {actionType === 'REJECT' && (
            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                เหตุผลหรือคำอธิบายเพิ่มเติม
              </label>
              <textarea
                rows={3}
                required
                placeholder="ระบุเหตุผลที่ไม่อนุมัติคำขอนี้..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

