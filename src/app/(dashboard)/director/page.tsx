'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  FolderGit2,
  BarChart2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Video,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DirectorDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/director/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const overview = data?.overview || {
    totalStudents: 9,
    totalProfessors: 4,
    totalApprovers: 5,
    totalCourses: 6,
    publishedCourses: 5,
    pendingCourses: 1,
    totalEnrollments: 3,
    totalMaterials: 28,
    totalVideos: 16,
    storageUsedGb: '7.21',
  };

  const chartMaterialsData = data?.courseMaterialStats || [
    { code: 'CS101', title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน', materials: 12 },
    { code: 'ME201', title: 'กลศาสตร์เครื่องกลและการออกแบบระบบอัตโนมัติ', materials: 8 },
    { code: 'EE305', title: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT', materials: 3 },
    { code: 'AUTO101', title: 'เทคโนโลยีช่างยนต์และยานยนต์ไฟฟ้า EV', materials: 3 },
    { code: 'SE302', title: 'สถาปัตยกรรมซอฟต์แวร์และการออกแบบระบบ', materials: 2 },
    { code: 'AI401', title: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง', materials: 0 },
  ];

  const courseStatusPieData = [
    { name: 'อนุมัติเปิดสอนแล้ว', value: overview.publishedCourses, color: '#CEF34B' },
    { name: 'รอการพิจารณาอนุมัติ', value: overview.pendingCourses, color: '#0f172a' },
  ];

  const coursesList = data?.courses || [];

  const cleanTitle = (title: string) => {
    if (!title) return '';
    return title.replace(/\s*\([A-Za-z0-9\s&,.-]+\)/g, '').trim();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* 1. Director Header Banner */}
      <div className="p-6 sm:p-8 bg-black text-white rounded-3xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            แดชบอร์ดภาพรวมและสถิติการดำเนินงาน
          </h1>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Overview Metrics Bar (Plain Total Courses Count, No Attendance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold border border-slate-800 shadow-xs flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">นักศึกษาในระบบ</p>
            <p className="text-2xl font-black text-slate-900">{overview.totalStudents} คน</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">มหาวิทยาลัย Xการช่าง</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold border border-slate-800 shadow-xs flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">อาจารย์/ครูผู้สอน</p>
            <p className="text-2xl font-black text-slate-900">{overview.totalProfessors} ท่าน</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">ทุกสาขาวิชาช่าง</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold border border-slate-800 shadow-xs flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">รายวิชาที่เปิดสอน</p>
            <p className="text-2xl font-black text-slate-900">{overview.totalCourses} วิชา</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">รายวิชาในระบบทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold border border-slate-800 shadow-xs flex-shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">สื่อการเรียนรู้ทั้งหมด</p>
            <p className="text-2xl font-black text-slate-900">{overview.totalMaterials} รายการ</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">คลังสื่อการสอนและเอกสาร</p>
          </div>
        </div>
      </div>

      {/* 3. Three-Pillar Institutional Overview (Students, Faculty, Approvers) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-[#CEF34B] flex items-center justify-center font-bold">
            <Layers className="w-4 h-4 text-[#CEF34B]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              ภาพรวมการดำเนินงานของสถาบัน (3 ฝ่ายหลัก)
            </h2>
            <p className="text-xs text-slate-500">
              สรุปสถานะการมีส่วนร่วมและการดำเนินงานของฝั่งนักศึกษา คณาจารย์ผู้สอน และผู้พิจารณาอนุมัติ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Students */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                  ฝั่งนักศึกษา
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">1. ข้อมูลภาพรวมผู้เรียน</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                นักศึกษาในระบบลงทะเบียนและเข้าถึงห้องเรียนออนไลน์ พร้อมศึกษาบทเรียนและสื่อมัลติมีเดีย
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">จำนวนนักศึกษาในระบบ:</span>
                <span className="font-extrabold text-slate-900">{overview.totalStudents} คน</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">การลงทะเบียนเรียน:</span>
                <span className="font-extrabold text-slate-900">{overview.totalEnrollments} รายการ</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">การเข้าถึงสื่อการเรียน:</span>
                <span className="font-bold text-emerald-600">เปิดใช้งานปกติ</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Teachers/Faculty */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                  <Users className="w-5 h-5" />
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                  ฝั่งอาจารย์ผู้สอน
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">2. ข้อมูลภาพรวมคณาจารย์</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                คณาจารย์ประจำสาขาวิชาช่างจัดเตรียมเนื้อหาหลักสูตร สร้างรายวิชา และอัปโหลดสื่อการสอน
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">อาจารย์ผู้สอนทั้งหมด:</span>
                <span className="font-extrabold text-slate-900">{overview.totalProfessors} ท่าน</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">รายวิชาที่จัดทำ:</span>
                <span className="font-extrabold text-slate-900">{overview.totalCourses} รายวิชา</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">สื่อและวิดีโอที่อัปโหลด:</span>
                <span className="font-extrabold text-slate-900">{overview.totalMaterials} บทเรียน</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Approvers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                  ฝั่งผู้พิจารณาอนุมัติ
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">3. ข้อมูลการพิจารณาอนุมัติ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                การตรวจสอบมาตรฐานวิชาการ พิจารณาเปิดรายวิชาใหม่ และอนุมัติสื่อการเรียนรู้ก่อนเผยแพร่
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">ผู้มีสิทธิ์อนุมัติ:</span>
                <span className="font-extrabold text-slate-900">{overview.totalApprovers} ท่าน</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">รายวิชาที่อนุมัติแล้ว:</span>
                <span className="font-extrabold text-emerald-600">{overview.publishedCourses} วิชา</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">คำขอที่รอการพิจารณา:</span>
                <span className="font-extrabold text-amber-600">{overview.pendingCourses} วิชา (AI401)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Crystal-Clear Analytics Charts (Legible, Single-Metric) */}
      <div id="reports" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Materials count per course */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-900" />
                <span>สถิติจำนวนสื่อการเรียนรู้แยกตามรายวิชา (รายการ)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ความพร้อมของสื่อ วิดีโอ และเอกสารประกอบการสอนในแต่ละรายวิชาที่เปิดในระบบ
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartMaterialsData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} รายการ`, 'จำนวนสื่อการสอน']}
                  labelFormatter={(label: any) => {
                    const item = chartMaterialsData.find((d: any) => d.code === label);
                    return item ? `${item.code}: ${item.title}` : label;
                  }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="materials" fill="#0f172a" radius={[8, 8, 0, 0]} name="จำนวนสื่อการสอน (รายการ)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Course Approval Status Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>สัดส่วนสถานะรายวิชา</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">จำแนกระหว่างวิชาที่เปิดสอนแล้วและรออนุมัติ</p>
          </div>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseStatusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {courseStatusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} วิชา`, 'จำนวน']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#CEF34B] border border-slate-800" />
              <span className="font-semibold text-slate-700">อนุมัติแล้ว ({overview.publishedCourses} วิชา)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <span className="font-semibold text-slate-700">รออนุมัติ ({overview.pendingCourses} วิชา)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Director Summary Table (Matching Canonical DB Courses Exactly) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-900" />
              <span>ตารางสรุปรายวิชาและสื่อการเรียนรู้ในระบบ (ภาพรวมทั้งสถาบัน)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              แสดงข้อมูลรายวิชาและสื่อการสอนที่เชื่อมต่อกับฐานข้อมูลจริงโดยตรง
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-black text-[#CEF34B] text-[11px] font-mono font-bold">
            ทั้งหมด {coursesList.length} วิชา
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                <th className="p-3.5 pl-6">รหัสวิชา</th>
                <th className="p-3.5">ชื่อรายวิชา</th>
                <th className="p-3.5">สาขาวิชา</th>
                <th className="p-3.5">อาจารย์ผู้สอน</th>
                <th className="p-3.5 text-center">สื่อการสอน</th>
                <th className="p-3.5 pr-6 text-right">สถานะรายวิชา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coursesList.map((c: any) => {
                const isPending = c.status === 'PENDING_APPROVAL';
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-extrabold text-slate-900">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {cleanTitle(c.title)}
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {c.category}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {c.createdBy?.name || 'ผศ.ดร.วิชาญ สอนดี'}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                      {c._count?.materials || 0} รายการ
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          รอพิจารณาอนุมัติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CEF34B]/20 text-slate-900 border border-[#CEF34B] font-extrabold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          อนุมัติเปิดสอนแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

