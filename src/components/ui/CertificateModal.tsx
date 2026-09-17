'use client';

import React from 'react';
import { Award, CheckCircle2, Download, X, ShieldCheck, Share2 } from 'lucide-react';
import { Button } from './Button';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  courseTitle?: string;
  courseCode?: string;
  completionDate?: string;
  instructorName?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName = 'สมชาย เรียนดี (Somchai)',
  courseTitle = 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)',
  courseCode = 'CS101',
  completionDate = '8 กันยายน 2026',
  instructorName = 'ผศ.ดร.วิชาญ สอนดี',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14110f]/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#f9f6f0] rounded-[2.5rem] max-w-2xl w-full border border-[#c5ab8d] shadow-warm-xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-[#f4efe6] text-[#75583f] hover:bg-[#e8dec9] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Inner Frame */}
        <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-[#ffffff] via-[#f9f6f0] to-[#f4efe6] relative overflow-hidden">
          {/* Subtle Corner Accents */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#c5ab8d] rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-[#c5ab8d] rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-[#c5ab8d] rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#c5ab8d] rounded-br-2xl pointer-events-none" />

          {/* Logo & Badge Icon */}
          <div className="flex justify-center items-center mb-4">
            <img src="/images/logo.png" alt="X Engineering Logo" className="h-16 w-auto object-contain drop-shadow-md" />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[#9c6843]">
            ใบประกาศนียบัตรสถาบันการศึกษา (Institutional Certificate)
          </p>

          <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#3d2c20] tracking-tight mt-2">
            ใบรับรองการผ่านการศึกษารายวิชา
          </h2>
          <p className="text-[11px] text-[#8e827b] mt-1 tracking-wider uppercase font-semibold">CERTIFICATE OF COURSE COMPLETION</p>

          <div className="my-6 py-5 border-y border-[#d9c9b0] max-w-md mx-auto space-y-2">
            <p className="text-xs text-[#75583f] font-medium">ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</p>
            <p className="font-serif-luxury text-2xl font-bold text-[#3d2c20]">{studentName}</p>
            <p className="text-xs text-[#75583f] leading-relaxed">
              ได้ศึกษาและผ่านการประเมินผลการเรียนรู้ตามหลักสูตร มหาวิทยาลัย Xการช่าง ในรายวิชา
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-[#3d2c20] text-[#f9f6f0] font-bold rounded-full text-xs mb-1">
                {courseCode}
              </span>
              <p className="font-serif-luxury text-lg font-bold text-[#3d2c20]">{courseTitle}</p>
            </div>
          </div>

          {/* Signatures & Verification */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2 text-xs text-[#75583f]">
            <div>
              <div className="font-serif-luxury italic text-base font-bold text-[#3d2c20] border-b border-[#d9c9b0] pb-1 mb-1">
                {instructorName}
              </div>
              <p className="text-[11px] text-[#8e827b]">อาจารย์ผู้สอนรายวิชา</p>
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-[#3d2c20] border-b border-[#d9c9b0] pb-1 mb-1">
                {completionDate}
              </div>
              <p className="text-[11px] text-[#8e827b]">วันที่สำเร็จการศึกษา</p>
            </div>
          </div>

          {/* Verification Code */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#395340] font-semibold bg-[#4a6b53]/10 py-2.5 px-4 rounded-full max-w-xs mx-auto border border-[#4a6b53]/30">
            <ShieldCheck className="w-4 h-4 text-[#4a6b53]" />
            <span>รหัสรับรองระบบ: INST-CERT-{Math.floor(100000 + Math.random() * 900000)}</span>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="luxury"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => alert('เริ่มดาวน์โหลดใบประกาศนียบัตร PDF...')}
              className="shadow-warm-md font-bold rounded-full text-xs"
            >
              ดาวน์โหลด PDF
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => alert('คัดลอกลิงก์ตรวจสอบใบประกาศเรียบร้อยแล้ว')}
              className="border-[#d9c9b0] text-[#3d2c20] hover:bg-[#f4efe6] rounded-full text-xs font-semibold"
            >
              แชร์ใบรับรอง
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

