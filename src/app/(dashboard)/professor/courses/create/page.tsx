'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Save, Send, HardDrive, Lock, Globe } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function CreateCoursePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('วิทยาการคอมพิวเตอร์');
  const [semester, setSemester] = useState('1');
  const [academicYear, setAcademicYear] = useState('2026');
  const [accessType, setAccessType] = useState<'OPEN' | 'APPROVAL_REQUIRED'>('APPROVAL_REQUIRED');
  const [storageLimitGb, setStorageLimitGb] = useState('10.0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (isSubmitApproval: boolean) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: 'prof-1', roles: ['PROFESSOR'] },
          code: code.trim() || `XK-${Math.floor(1000 + Math.random() * 9000)}`,
          title,
          description,
          category,
          semester,
          academicYear,
          accessType,
          storageLimitGb,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการสร้างรายวิชา');
        setIsLoading(false);
        return;
      }

      if (isSubmitApproval && data.course?.id) {
        await fetch(`/api/courses/${data.course.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: { id: 'prof-1', roles: ['PROFESSOR'] } }),
        });
      }

      router.push('/professor');
    } catch (err: any) {
      setError('ไม่สามารถเชื่อมต่อระบบได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">สร้างรายวิชาใหม่ (Create Course)</h1>
          <p className="text-xs text-slate-500">กรอกข้อมูลรายละเอียดรายวิชาและกำหนดโควต้าพื้นที่จัดเก็บสื่อ</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">รายละเอียดรายวิชา (Course Information)</h3>
        </CardHeader>

        <CardBody className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <Input
              label="ชื่อรายวิชา (Course Name)"
              required
              placeholder="ตัวอย่าง: การวิเคราะห์และออกแบบระบบ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              คำอธิบายรายวิชา (Description)
            </label>
            <textarea
              rows={4}
              required
              placeholder="อธิบายวัตถุประสงค์การเรียนรู้ ขอบเขตเนื้อหา และผลลัพธ์การเรียนรู้ของวิชา..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                หมวดหมู่ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:ring-brand-500"
              >
                <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
                <option value="วิศวกรรมซอฟต์แวร์">วิศวกรรมซอฟต์แวร์</option>
                <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
                <option value="วิทยาการข้อมูล">วิทยาการข้อมูล</option>
                <option value="ศึกษาทั่วไป">ศึกษาทั่วไป</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                ภาคการเรียน (Semester)
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:ring-brand-500"
              >
                <option value="1">ภาคการเรียนที่ 1</option>
                <option value="2">ภาคการเรียนที่ 2</option>
                <option value="3">ภาคฤดูร้อน</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                ปีการศึกษา (Academic Year)
              </label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>

          {/* Access Policy & Storage Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                นโยบายการเข้าเรียน (Access Type)
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer bg-slate-50/50">
                  <input
                    type="radio"
                    name="accessType"
                    value="APPROVAL_REQUIRED"
                    checked={accessType === 'APPROVAL_REQUIRED'}
                    onChange={() => setAccessType('APPROVAL_REQUIRED')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      ต้องได้รับการอนุมัติ (Approval Required)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      นักศึกษาต้องส่งคำขอเข้าร่วมรายวิชา และรออาจารย์พิจารณาอนุมัติ (ไม่ใช้ Password)
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer bg-slate-50/50">
                  <input
                    type="radio"
                    name="accessType"
                    value="OPEN"
                    checked={accessType === 'OPEN'}
                    onChange={() => setAccessType('OPEN')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      เปิดเสรี (Open Access)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      นักศึกษาของสถาบันสามารถเข้าร่วมและดูสื่อการเรียนรู้ได้ทันทีตามนโยบาย
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                โควต้าพื้นที่จัดเก็บรายวิชา (Storage Limit)
              </label>
              <Input
                type="number"
                step="0.5"
                label=""
                placeholder="10.0"
                value={storageLimitGb}
                onChange={(e) => setStorageLimitGb(e.target.value)}
                leftIcon={<HardDrive className="w-4 h-4 text-brand-600" />}
                helperText="กำหนดขนาดพื้นที่จัดเก็บรวมสูงสุดในหน่วย Gigabytes (GB) สำหรับรายวิชานี้"
              />
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              isLoading={isLoading}
              onClick={() => handleSubmit(false)}
              leftIcon={<Save className="w-4 h-4" />}
            >
              บันทึกร่าง (Save Draft)
            </Button>

            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={() => handleSubmit(true)}
              leftIcon={<Send className="w-4 h-4" />}
              className="font-bold shadow-lg shadow-brand-600/20"
            >
              ส่งขออนุมัติรายวิชา (Submit for Approval)
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
