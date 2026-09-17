'use client';

import React, { useState } from 'react';
import { FileCheck, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

export default function ContentApproverDashboard() {
  const [materials, setMaterials] = useState([
    {
      id: 'mat-pending-1',
      title: 'วิดีโอสาธิตการออกแบบ Clean Architecture & Hexagonal Patterns',
      description: 'สื่อการเรียนใช้วิดีโอ MP4 คุณภาพสูง ความยาว 60 นาที',
      type: 'VIDEO',
      filePath: 'materials/clean_arch_demo.mp4',
      fileSize: '850 MB',
      courseCode: 'SE302',
      uploadedBy: 'ผศ.ดร.วิชาญ สอนดี',
      status: 'PENDING_REVIEW',
    },
  ]);

  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleDecision = (material: any, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT') {
      setSelectedMaterial(material);
      setIsModalOpen(true);
    } else {
      setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    }
  };

  const confirmReject = () => {
    setMaterials((prev) => prev.filter((m) => m.id !== selectedMaterial?.id));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Content Approver Banner */}
      <div className="p-6 sm:p-8 bg-black text-white rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#CEF34B]/20 text-[#CEF34B] font-extrabold text-xs border border-[#CEF34B]/40 inline-block">
            CONTENT APPROVER PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            รายการสื่อการเรียนรู้ที่รอการตรวจสอบ (Content Review)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            ตรวจสอบความถูกต้อง ลิขสิทธิ์ และคุณภาพของวิดีโอ เอกสาร และสื่อการเรียนก่อนเผยแพร่
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-900" />
            <span>คิวสื่อที่รอการอนุมัติ (Material Review Queue)</span>
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {materials.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              ไม่มีสื่อการเรียนรู้ค้างรอการตรวจสอบ
            </div>
          ) : (
            materials.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-black text-[#CEF34B] font-mono font-extrabold text-[10px] border border-slate-800">
                        {m.courseCode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {m.type}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">ขนาด: {m.fileSize}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-2">{m.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">อัปโหลดโดย: {m.uploadedBy}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(m, 'APPROVE')}
                      className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold rounded-full px-4 py-2 text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-black" />
                      <span>อนุมัติสื่อ</span>
                    </button>
                    <button
                      onClick={() => handleDecision(m, 'REJECT')}
                      className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full px-4 py-2 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>ไม่อนุมัติ</span>
                    </button>
                  </div>
                </div>

                {/* Preview Window */}
                {m.type === 'VIDEO' ? (
                  <VideoPlayer src={`/api/materials/${m.id}/stream`} title={m.title} className="max-w-2xl rounded-2xl overflow-hidden shadow-xs" />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
                    <FileText className="w-4 h-4 text-slate-900" />
                    <span>เอกสารประกอบการเรียน (PDF/Doc) สามารถดาวน์โหลดเพื่อตรวจสอบได้</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="ระบุเหตุผลในการไม่อนุมัติสื่อ"
        footer={
          <>
            <button className="rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 px-5 py-2 text-xs font-bold" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </button>
            <button className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-2 text-xs shadow-sm" onClick={confirmReject}>
              ยืนยันปฏิเสธสื่อ
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">กรุณาระบุเหตุผลเพื่อให้ผู้สอนนำไปปรับปรุงสื่อการเรียนรู้</p>
          <textarea
            rows={3}
            placeholder="ตัวอย่าง: คุณภาพเสียงเบาเกินไป หรือวิดีโอมีปัญหาด้านลิขสิทธิ์..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:border-black focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}
