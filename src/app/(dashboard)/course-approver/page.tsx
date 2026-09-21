'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  ShieldCheck,
  UserCheck,
  Users,
  RefreshCw,
  History,
  Clock,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface DecisionHistoryItem {
  id: string;
  type: 'COURSE' | 'ENROLLMENT';
  title: string;
  subtitle?: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
  timestamp: string;
}

export default function CourseApproverDashboard() {
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'enrollments' | 'history'>('enrollments');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Persistent record of approved / rejected decisions so they never pop back into pending list
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('approver_decision_history') || '[]');
    } catch {
      return [];
    }
  });

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemType, setItemType] = useState<'COURSE' | 'ENROLLMENT'>('ENROLLMENT');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const isActionPendingRef = React.useRef(false);

  const fetchApprovals = async () => {
    if (isActionPendingRef.current) return;
    try {
      setIsRefreshing(true);
      const [cRes, eRes] = await Promise.all([
        fetch('/api/courses?status=PENDING_APPROVAL&t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/courses/enrollments?status=PENDING&t=' + Date.now(), { cache: 'no-store' }),
      ]);
      const [cData, eData] = await Promise.all([cRes.json(), eRes.json()]);

      // Read latest processed decisions from localStorage — only used to avoid brief flicker
      // when a decision was just confirmed. We ALWAYS show items that are still PENDING in the DB,
      // because the server is the source of truth (handles API errors, resubmissions, etc.)
      let recentlyProcessedIds = new Set<string>();
      try {
        const savedHistory: DecisionHistoryItem[] = JSON.parse(localStorage.getItem('approver_decision_history') || '[]');
        // Only exclude items processed within the last 30 seconds (prevents flicker from optimistic update)
        const RECENTLY_THRESHOLD = 30_000;
        const now = Date.now();
        savedHistory.forEach((h) => {
          // Parse timestamp — if recent, add to exclusion set
          try {
            const ts = new Date(h.timestamp).getTime();
            if (now - ts < RECENTLY_THRESHOLD) {
              recentlyProcessedIds.add(h.id);
            }
          } catch {
            // If timestamp can't be parsed, skip exclusion — let server data win
          }
        });
      } catch {}

      // Show all items still PENDING in the DB; only suppress very recently acted-on items
      const pendingCourses = (cData.courses || []).filter((c: any) => !recentlyProcessedIds.has(c.id) && c.status === 'PENDING_APPROVAL');
      const pendingEnrollments = (eData.enrollments || []).filter((e: any) => !recentlyProcessedIds.has(e.id) && e.status === 'PENDING');

      if (!isActionPendingRef.current) {
        setCourses(pendingCourses);
        setEnrollments(pendingEnrollments);
      }
    } catch (err) {
      console.error('fetchApprovals error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchApprovals();
    const handleUpdate = () => fetchApprovals();
    window.addEventListener('enrollment_updated', handleUpdate);
    window.addEventListener('course_updated', handleUpdate);
    const interval = setInterval(fetchApprovals, 12000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('enrollment_updated', handleUpdate);
      window.removeEventListener('course_updated', handleUpdate);
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
    const targetItem = selectedItem;
    const targetType = itemType;
    const targetAction = actionType;
    const targetReason = rejectionReason;

    // 1. Immediately record in persistent history so it will NEVER reappear in pending queue
    const title = targetType === 'COURSE'
      ? (targetItem.title || targetItem.code)
      : (targetItem.student?.name || 'นักศึกษา');
    const subtitle = targetType === 'COURSE'
      ? `รหัสวิชา: ${targetItem.code}`
      : `${targetItem.course?.code} - ${targetItem.course?.title}`;

    const newRecord: DecisionHistoryItem = {
      id: targetItem.id,
      type: targetType,
      title,
      subtitle,
      action: targetAction,
      reason: targetReason || undefined,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [newRecord, ...decisionHistory.filter((h) => h.id !== targetItem.id)];
    setDecisionHistory(nextHistory);
    try {
      localStorage.setItem('approver_decision_history', JSON.stringify(nextHistory));
    } catch {}

    // 2. Permanently remove from local view state immediately
    if (targetType === 'COURSE') {
      setCourses((prev) => prev.filter((c) => c.id !== targetItem.id));
    } else {
      setEnrollments((prev) => prev.filter((e) => e.id !== targetItem.id));
    }

    // 3. Show clear, prominent feedback toast according to action clicked
    setFeedbackToast({
      type: targetAction === 'APPROVE' ? 'success' : 'danger',
      text: targetAction === 'APPROVE'
        ? `✅ อนุมัติ "${title}" สำเร็จแล้ว ข้อมูลถูกบันทึกลงระบบเรียบร้อย`
        : `❌ ไม่อนุมัติ "${title}" เรียบร้อยแล้ว`,
    });
    setIsModalOpen(false);
    setTimeout(() => setFeedbackToast(null), 5000);

    // 4. Send API request to persist on server
    let userPayload: any = { id: 'approver-1', roles: ['COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER', 'APPROVER', 'ADMIN'] };
    try {
      const sess = localStorage.getItem('user_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        const userRoles = Array.isArray(parsed?.roles) ? parsed.roles : [];
        userPayload = {
          id: parsed.id || 'approver-1',
          email: parsed.email,
          roles: Array.from(new Set([...userRoles, 'COURSE_CREATOR_APPROVER', 'CONTENT_APPROVER', 'APPROVER', 'ADMIN'])),
        };
      }
    } catch {}

    try {
      let res: Response;
      if (targetType === 'COURSE') {
        res = await fetch(`/api/courses/${targetItem.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userPayload,
            action: targetAction,
            rejectionReason: targetReason,
          }),
        });
      } else {
        res = await fetch('/api/courses/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: targetItem.id,
            courseId: targetItem.courseId || targetItem.course?.id,
            studentId: targetItem.studentId || targetItem.student?.id,
            action: targetAction,
            rejectionReason: targetReason,
            user: userPayload,
          }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('course_updated'));
        window.dispatchEvent(new Event('enrollment_updated'));
        localStorage.setItem('last_course_update', Date.now().toString());
        localStorage.setItem('last_enrollment_update', Date.now().toString());
      }
    } catch (e: any) {
      console.error('Decision error:', e);
      setFeedbackToast({
        type: 'danger',
        text: `⚠️ เกิดข้อผิดพลาดในการบันทึกผล: ${e?.message || 'กรุณาลองใหม่อีกครั้ง'}`,
      });
      fetchApprovals();
    }
  };

  const handleClearHistory = () => {
    if (confirm('คุณต้องการล้างประวัติการพิจารณาออกจากหน้านี้หรือไม่? (ข้อมูลที่อนุมัติแล้วในระบบจะไม่เปลี่ยนแปลง)')) {
      setDecisionHistory([]);
      try {
        localStorage.removeItem('approver_decision_history');
      } catch {}
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Toast Notice */}
      {feedbackToast && (
        <div className={`p-4 rounded-2xl font-black text-sm flex items-center justify-between shadow-xl animate-fadeIn border-2 ${
          feedbackToast.type === 'success'
            ? 'bg-[#CEF34B] text-black border-black'
            : 'bg-rose-500 text-white border-rose-700'
        }`}>
          <div className="flex items-center gap-3">
            {feedbackToast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-white flex-shrink-0" />
            )}
            <span>{feedbackToast.text}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="p-1 hover:opacity-70 cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

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
            <span className="px-3.5 py-1 rounded-full bg-[#CEF34B] text-black font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm">
              <Users className="w-3.5 h-3.5 text-black" />
              <span>คำขอเข้าเรียนรออนุมัติ: {enrollments.length} คน</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ระบบพิจารณาและอนุมัติ
          </h1>
          <p className="text-xs text-slate-400">
            พิจารณาอนุมัติคำขอเปิดรายวิชาใหม่จากอาจารย์ผู้สอน และอนุมัติสิทธิ์การเข้าเรียนของนักศึกษา ({enrollments.length} คน)
          </p>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards for Approver (Clickable to switch tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
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
              {courses.length} วิชา
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
              {enrollments.length} คน
            </span>
          </div>
          <h3 className={`text-base font-extrabold mt-4 ${activeTab === 'enrollments' ? 'text-white' : 'text-slate-900'}`}>
            อนุมัติการเข้าเรียน
          </h3>
          <p className={`text-xs mt-1 ${activeTab === 'enrollments' ? 'text-slate-300' : 'text-slate-500'}`}>
            คำขอเข้าเรียนของนักศึกษาที่รอการอนุมัติ
          </p>
        </div>

        {/* Card 3: Decision History */}
        <div
          onClick={() => setActiveTab('history')}
          className={`p-6 rounded-3xl transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-black text-white border-2 border-[#CEF34B] shadow-xl scale-[1.02]'
              : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              activeTab === 'history'
                ? 'bg-[#CEF34B] text-black border border-[#CEF34B]'
                : 'bg-slate-100 text-slate-800'
            }`}>
              <History className="w-6 h-6" />
            </div>
            <span className={`px-3.5 py-1 rounded-full font-extrabold text-xs shadow-xs ${
              activeTab === 'history'
                ? 'bg-[#CEF34B] text-black'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {decisionHistory.length} รายการ
            </span>
          </div>
          <h3 className={`text-base font-extrabold mt-4 ${activeTab === 'history' ? 'text-white' : 'text-slate-900'}`}>
            ประวัติการพิจารณา
          </h3>
          <p className={`text-xs mt-1 ${activeTab === 'history' ? 'text-slate-300' : 'text-slate-500'}`}>
            รายการที่พิจารณาอนุมัติ/ไม่อนุมัติแล้ว
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
              <span>คำขอเปิดรายวิชา</span>
              <span
                key={`courses-badge-${courses.length}`}
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'courses'
                    ? 'bg-[#CEF34B] text-black shadow-xs'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {courses.length}
              </span>
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
              <span>อนุมัติการเข้าเรียน</span>
              <span
                key={`enroll-badge-${enrollments.length}`}
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'enrollments'
                    ? 'bg-[#CEF34B] text-black shadow-xs'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {enrollments.length} คน
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <History className="w-4 h-4 text-[#CEF34B]" />
              <span>ประวัติการพิจารณา</span>
              <span
                key={`history-badge-${decisionHistory.length}`}
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'history'
                    ? 'bg-[#CEF34B] text-black shadow-xs'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {decisionHistory.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchApprovals()}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-black rounded-xl text-xs font-bold text-slate-700 hover:text-black transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="ดึงข้อมูลคำขอล่าสุดจากเซิร์ฟเวอร์"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-black' : 'text-slate-500'}`} />
              <span>{isRefreshing ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
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

        {/* Tab 3: Decision History Table */}
        {activeTab === 'history' && (
          <div className="overflow-x-auto animate-fadeIn">
            <div className="p-4 px-6 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-black text-slate-800">
                  ประวัติการดำเนินการพิจารณา ({decisionHistory.length} รายการ)
                </h4>
                <p className="text-[11px] text-slate-500">
                  รายการที่กดอนุมัติหรือไม่อนุมัติแล้วจะไม่ปรากฏในรายการรอด้านบนอีกต่อไป
                </p>
              </div>
              {decisionHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors font-bold cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างประวัติ</span>
                </button>
              )}
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">รายการ / ผู้ขอ</th>
                  <th className="p-4">ประเภทคำขอ</th>
                  <th className="p-4">ผลการพิจารณา</th>
                  <th className="p-4">วันที่ - เวลา</th>
                  <th className="p-4 pr-6">เหตุผล / หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decisionHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                      ยังไม่มีประวัติการพิจารณาในรอบนี้ (เมื่อกดอนุมัติหรือไม่อนุมัติ รายการจะถูกบันทึกไว้ที่นี่ทันที)
                    </td>
                  </tr>
                ) : (
                  decisionHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-500 font-medium">{item.subtitle}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          item.type === 'COURSE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {item.type === 'COURSE' ? 'เปิดรายวิชาใหม่' : 'เข้าเรียนของนักศึกษา'}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.action === 'APPROVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CEF34B] text-black border border-black/20 font-black text-[11px] shadow-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-black" />
                            <span>อนุมัติแล้ว</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-black text-[11px] shadow-xs">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>ไม่อนุมัติ</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(item.timestamp).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-slate-600 text-[11px]">
                        {item.reason ? (
                          <span className="text-rose-600 font-medium italic bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                            "{item.reason}"
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
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

