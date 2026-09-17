'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function CourseApproverDashboard() {
  const [activeTab, setActiveTab] = useState<'COURSES' | 'MATERIALS'>('COURSES');
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [itemType, setItemType] = useState<'COURSE' | 'MATERIAL'>('COURSE');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch courses waiting approval
    fetch('/api/courses')
      .then((r) => r.json())
      .then((d) => {
        const pending = (d.courses || []).filter((c: any) => c.status === 'PENDING_APPROVAL');
        setCourses(pending.length > 0 ? pending : [
          {
            id: 'demo-pending-1',
            code: 'AI401',
            title: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง (AI & Machine Learning)',
            description: 'โครงสร้างวิชาใหม่ที่ขออนุมัติเปิดสอนสำหรับสาขาวิทยาการข้อมูลและวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัย Xการช่าง',
            category: 'วิทยาการข้อมูล',
            semester: '1',
            academicYear: '2026',
            status: 'PENDING_APPROVAL',
            createdBy: { name: 'ผศ.ดร.วิชาญ สอนดี', email: 'professor@x-karchang.ac.th' },
          }
        ]);
      });

    // Seed mock materials waiting approval
    setMaterials([
      {
        id: 'mat-pending-1',
        title: 'วิดีโอสาธิตการเชื่อมวงจรไฟฟ้าด้วย PLC แบบเรียลไทม์',
        courseCode: 'EE305',
        uploadedBy: 'ผศ.ดร.วิชาญ สอนดี',
        type: 'VIDEO',
        fileSize: '450 MB',
        status: 'PENDING_REVIEW',
      },
      {
        id: 'mat-pending-2',
        title: 'คู่มือความปลอดภัยปฏิบัติการเครื่องกลอุตสาหกรรม (PDF)',
        courseCode: 'ME201',
        uploadedBy: 'ผศ.ดร.วิชาญ สอนดี',
        type: 'PDF',
        fileSize: '15.4 MB',
        status: 'PENDING_REVIEW',
      },
    ]);
  }, []);

  const handleOpenDecision = (item: any, type: 'COURSE' | 'MATERIAL', decision: 'APPROVE' | 'REJECT') => {
    setSelectedItem(item);
    setItemType(type);
    setActionType(decision);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedItem) return;
    setIsLoading(true);

    try {
      if (itemType === 'COURSE') {
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
      } else if (itemType === 'MATERIAL') {
        setMaterials((prev) => prev.filter((m) => m.id !== selectedItem.id));
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
      {/* Approver Header Banner with Professional Tone */}
      <div className="p-6 sm:p-8 bg-black text-white rounded-3xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2.5 relative z-10 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            พิจารณาอนุมัติรายวิชาและสื่อการสอน
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            ตรวจสอบความถูกต้องของโครงสร้างรายวิชาและสื่อการเรียนรู้จากคณาจารย์ ก่อนเปิดให้ลงทะเบียนและเผยแพร่ในระบบ
          </p>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards for Approver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('COURSES')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'COURSES'
              ? 'bg-black text-white border-black shadow-lg ring-2 ring-[#CEF34B]/50'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border transition-all ${
                activeTab === 'COURSES'
                  ? 'bg-[#CEF34B] text-black border-[#CEF34B]'
                  : 'bg-slate-900 text-[#CEF34B] border-slate-800'
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <span
              className={`px-3.5 py-1 rounded-full font-extrabold text-xs transition-all ${
                activeTab === 'COURSES'
                  ? 'bg-[#CEF34B] text-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {courses.length} คำขอ
            </span>
          </div>
          <h3 className={`text-base font-extrabold mt-4 ${activeTab === 'COURSES' ? 'text-white' : 'text-slate-900'}`}>
            1. คำขอเปิดรายวิชาใหม่
          </h3>
          <p className={`text-xs mt-1 ${activeTab === 'COURSES' ? 'text-slate-300' : 'text-slate-500'}`}>
            ตรวจสอบโครงสร้างรายวิชาและรายละเอียดหลักสูตร
          </p>
        </div>

        <div
          onClick={() => setActiveTab('MATERIALS')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'MATERIALS'
              ? 'bg-black text-white border-black shadow-lg ring-2 ring-[#CEF34B]/50'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border transition-all ${
                activeTab === 'MATERIALS'
                  ? 'bg-[#CEF34B] text-black border-[#CEF34B]'
                  : 'bg-slate-900 text-[#CEF34B] border-slate-800'
              }`}
            >
              <FileCheck className="w-6 h-6" />
            </div>
            <span
              className={`px-3.5 py-1 rounded-full font-extrabold text-xs transition-all ${
                activeTab === 'MATERIALS'
                  ? 'bg-[#CEF34B] text-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {materials.length} คำขอ
            </span>
          </div>
          <h3 className={`text-base font-extrabold mt-4 ${activeTab === 'MATERIALS' ? 'text-white' : 'text-slate-900'}`}>
            2. สื่อการเรียนการสอน
          </h3>
          <p className={`text-xs mt-1 ${activeTab === 'MATERIALS' ? 'text-slate-300' : 'text-slate-500'}`}>
            ตรวจสอบวิดีโอปฏิบัติการและเอกสารประกอบการสอน
          </p>
        </div>
      </div>

      {/* Main Approval Action Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        {/* Navigation Tabs (Signature Lime Pill Aesthetic) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('COURSES')}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'COURSES'
                ? 'bg-black text-[#CEF34B] shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'COURSES' ? 'text-[#CEF34B]' : 'text-slate-500'}`} />
            <span>คำขอเปิดรายวิชา ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MATERIALS')}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'MATERIALS'
                ? 'bg-black text-[#CEF34B] shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileCheck className={`w-4 h-4 ${activeTab === 'MATERIALS' ? 'text-[#CEF34B]' : 'text-slate-500'}`} />
            <span>สื่อการเรียนรู้ ({materials.length})</span>
          </button>
        </div>

        {/* TAB 1: อนุมัติสร้างรายวิชา */}
        {activeTab === 'COURSES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                  <th className="p-3.5 pl-6">รหัสวิชา</th>
                  <th className="p-3.5">ชื่อรายวิชา</th>
                  <th className="p-3.5">อาจารย์ผู้ขอเปิด</th>
                  <th className="p-3.5">หมวดหมู่</th>
                  <th className="p-3.5">สถานะ</th>
                  <th className="p-3.5 pr-6 text-right">ปุ่มกดอนุมัติเปิดวิชา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      ไม่มีคำขอเปิดรายวิชาที่ค้างอยู่ในระบบ
                    </td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 pl-6 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="p-3.5 font-bold text-slate-900">{c.title}</td>
                      <td className="p-3.5 text-slate-600">{c.createdBy?.name || 'ผศ.ดร.วิชาญ สอนดี'}</td>
                      <td className="p-3.5 text-slate-600">{c.category}</td>
                      <td className="p-3.5">
                        <span className="px-3 py-1 rounded-full bg-black text-[#CEF34B] font-mono text-[10px] font-extrabold border border-slate-800 shadow-xs inline-flex items-center gap-1">
                          รอการอนุมัติ
                        </span>
                      </td>
                      <td className="p-3.5 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDecision(c, 'COURSE', 'APPROVE')}
                          className="bg-[#CEF34B] hover:bg-[#bce038] text-black rounded-full text-xs font-extrabold px-4 py-2 transition-all shadow-xs inline-flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-black" />
                          <span>อนุมัติเปิดรายวิชา</span>
                        </button>
                        <button
                          onClick={() => handleOpenDecision(c, 'COURSE', 'REJECT')}
                          className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full text-xs font-bold px-4 py-2 transition-all inline-flex items-center gap-1.5"
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

        {/* TAB 2: อนุมัติสื่อการสอน */}
        {activeTab === 'MATERIALS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                  <th className="p-3.5 pl-6">ประเภทสื่อ</th>
                  <th className="p-3.5">ชื่อสื่อการเรียนรู้</th>
                  <th className="p-3.5">รายวิชา</th>
                  <th className="p-3.5">ผู้อัปโหลด</th>
                  <th className="p-3.5">ขนาดไฟล์</th>
                  <th className="p-3.5 pr-6 text-right">ปุ่มกดอนุมัติสื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      ไม่มีสื่อการเรียนรู้ที่ค้างรอการตรวจสอบ
                    </td>
                  </tr>
                ) : (
                  materials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 pl-6">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#CEF34B] font-mono font-bold text-[10px]">
                          {m.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{m.title}</td>
                      <td className="p-3.5 font-mono text-slate-900 font-bold">{m.courseCode}</td>
                      <td className="p-3.5 text-slate-600">{m.uploadedBy}</td>
                      <td className="p-3.5 font-mono text-slate-500">{m.fileSize}</td>
                      <td className="p-3.5 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDecision(m, 'MATERIAL', 'APPROVE')}
                          className="bg-[#CEF34B] hover:bg-[#bce038] text-black rounded-full text-xs font-extrabold px-4 py-2 transition-all shadow-xs inline-flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-black" />
                          <span>อนุมัติสื่อการสอน</span>
                        </button>
                        <button
                          onClick={() => handleOpenDecision(m, 'MATERIAL', 'REJECT')}
                          className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full text-xs font-bold px-4 py-2 transition-all inline-flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>ส่งกลับแก้ไข</span>
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

      {/* Decision Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'APPROVE' ? 'ยืนยันการอนุมัติ' : 'ระบุข้อคิดเห็นเพื่อส่งกลับแก้ไข'}
        footer={
          <>
            <button 
              className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 px-5 py-2 text-xs font-bold transition-all" 
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </button>
            <button
              className={`rounded-full text-xs font-extrabold px-6 py-2 shadow-sm transition-all ${
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
            คุณกำลังพิจารณาคำขอสำหรับ: <strong className="text-black font-extrabold">{selectedItem?.title || selectedItem?.code || selectedItem?.studentName}</strong>
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
