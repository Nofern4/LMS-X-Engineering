'use client';

import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function RegistrarDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [usersCount, setUsersCount] = useState<number>(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/registrar/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.roleStats) setStats(data.roleStats);
        if (data.users) {
          setUsersCount(data.users.length);
          setRecentUsers(data.users.slice(0, 5));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Registrar Portal Hero Header */}
      <div className="p-6 sm:p-8 bg-black text-white rounded-3xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ระบบจัดการสิทธิ์
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <Link href="/registrar/users">
            <Button
              variant="primary"
              size="md"
              className="bg-[#CEF34B] hover:bg-[#b8dc3e] text-black font-black shadow-md border-0 text-xs rounded-xl px-5 py-2.5 transition-all"
              rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
            >
              จัดการสิทธิ์ผู้ใช้ทั้งหมด
            </Button>
          </Link>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#CEF34B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#e0e7ff] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">นักศึกษา / นักเรียน</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats['STUDENT'] || 0} คน</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#e0e7ff] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">อาจารย์ / ครูผู้สอน</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats['PROFESSOR'] || 0} ท่าน</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#e0e7ff] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ผู้พิจารณาอนุมัติ</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {(stats['COURSE_CREATOR_APPROVER'] || 0) + (stats['CONTENT_APPROVER'] || 0)} คน
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#e0e7ff] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">บัญชีทั้งหมดในระบบ</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{usersCount} บัญชี</p>
            </div>
          </CardBody>
        </Card>
      </div>


      {/* Recent Users List */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">ผู้ใช้งานล่าสุดในระบบ (Recent Users)</h3>
            <p className="text-xs text-slate-500">รายชื่อผู้สมัครสมาชิกล่าสุดพร้อมสถานะบทบาทปัจจุบัน</p>
          </div>
          <Link href="/registrar/users">
            <Button variant="secondary" size="sm" className="text-xs font-bold">
              ดูและจัดการสิทธิ์ทั้งหมด
            </Button>
          </Link>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3.5 pl-6">ชื่อ-นามสกุล</th>
                <th className="p-3.5">อีเมลสถาบัน</th>
                <th className="p-3.5">แผนก/สังกัด</th>
                <th className="p-3.5">บทบาท (Role)</th>
                <th className="p-3.5 pr-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.map((u) => {
                const primaryRole = u.userRoles?.[0]?.role?.name || 'STUDENT';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3.5 text-slate-600">{u.department || u.studentId || '-'}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          primaryRole === 'REGISTRAR'
                            ? 'luxury'
                            : primaryRole === 'PROFESSOR'
                            ? 'bronze'
                            : primaryRole === 'COURSE_CREATOR_APPROVER'
                            ? 'warning'
                            : primaryRole === 'DIRECTOR'
                            ? 'danger'
                            : 'success'
                        }
                        size="sm"
                      >
                        {primaryRole}
                      </Badge>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <Link href={`/registrar/users?search=${encodeURIComponent(u.email)}`}>
                        <Button variant="secondary" size="sm" className="text-[11px] font-bold">
                          จัดการมอบสิทธิ์
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
