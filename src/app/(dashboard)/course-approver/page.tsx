'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function CourseApproverDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch courses waiting approval
    fetch('/api/courses')
      .then((r) => r.json())
      .then((d) => {
        const pending = (d.courses || []).filter((c: any) => c.status === 'PENDING_APPROVAL');
        setCourses(pending);
      });
  }, []);

  const handleOpenDecision = (course: any, decision: 'APPROVE' | 'REJECT') => {
    setSelectedItem(course);
    setActionType(decision);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedItem) return;
    setIsLoading(true);

    try {
      await fetch(`/api/courses/${selectedItem.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: 'approver-1', roles: ['COURSE_CREATOR_APPROVER'] },
          action: actionType,
          rejectionReason,
        }),
      });
      setCourses((prev) => prev.filter((c) => c.id !== selectedItem.id));
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
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#CEF34B]/20 text-[#CEF34B] font-extrabold text-xs border border-[#CEF34B]/40 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>อนุมัติรายวิชา</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            อนุมัติคำขอเปิดรายวิชา
          </h1>
         
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards for Approver */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-black text-white border border-black shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#CEF34B] text-black border border-[#CEF34B]">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="px-3.5 py-1 rounded-full font-extrabold text-xs bg-[#CEF34B] text-black shadow-xs">
              {courses.length} คำขอ
            </span>
          </div>
          <h3 className="text-base font-extrabold mt-4 text-white">
            คำขอเปิดรายวิชาใหม่
          </h3>
          <p className="text-xs mt-1 text-slate-300">
            รอการพิจารณาอนุมัติเปิดสอนในระบบ
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 text-[#CEF34B] border border-slate-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="px-3.5 py-1 rounded-full font-extrabold text-xs bg-slate-100 text-slate-700 border border-slate-200">
              ทุกสาขาวิชา
            </span>
          </div>
          <h3 className="text-base font-extrabold mt-4 text-slate-900">
            มาตรฐานวิชาการ
          </h3>
          <p className="text-xs mt-1 text-slate-500">
            เปิดกว้างให้นักศึกษาทุกหลักสูตรเข้าเรียนได้
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="px-3.5 py-1 rounded-full font-extrabold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              พร้อมใช้งาน
            </span>
          </div>
          <h3 className="text-base font-extrabold mt-4 text-slate-900">
            ระบบพิจารณาอัตโนมัติ
          </h3>
          <p className="text-xs mt-1 text-slate-500">
            แจ้งผลอนุมัติกลับไปยังผู้สอนทันที
          </p>
        </div>
      </div>

      {/* Main Approval Action Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-[#CEF34B] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                รายการคำขอเปิดรายวิชา ({courses.length})
              </h2>
              <p className="text-xs text-slate-500">ตรวจสอบรายละเอียดหลักสูตรและกดอนุมัติเพื่อเปิดใช้งาน</p>
            </div>
          </div>
        </div>

        {/* Course Approval Table */}
        <div className="overflow-x-auto">
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
                        onClick={() => handleOpenDecision(c, 'APPROVE')}
                        className="bg-[#CEF34B] hover:bg-[#bce038] text-black rounded-full text-xs font-extrabold px-4 py-2 transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-black" />
                        <span>อนุมัติเปิดรายวิชา</span>
                      </button>
                      <button
                        onClick={() => handleOpenDecision(c, 'REJECT')}
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
      </div>

      {/* Decision Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'APPROVE' ? 'ยืนยันการอนุมัติเปิดรายวิชา' : 'ระบุข้อคิดเห็นเพื่อส่งกลับแก้ไข'}
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
              {actionType === 'APPROVE' ? 'ยืนยันอนุมัติ' : 'ส่งกลับแก้ไข'}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-slate-900">
          <p>
            คุณกำลังพิจารณาคำขอสำหรับ: <strong className="text-black font-extrabold">{selectedItem?.title || selectedItem?.code}</strong>
          </p>

          {actionType === 'REJECT' && (
            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                ข้อเสนอแนะหรือสิ่งที่ต้องปรับปรุงแก้ไข
              </label>
              <textarea
                rows={3}
                required
                placeholder="ระบุรายละเอียดสิ่งที่ต้องการให้ผู้สอนปรับปรุงแก้ไขเพิ่มเติม..."
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
