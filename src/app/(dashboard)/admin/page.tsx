'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Settings, ShieldAlert, BookOpen, HardDrive, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(4615);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        if (d.total) setTotalUsers(d.total);
        else if (d.users) setTotalUsers(d.users.length);
      });
    fetch('/api/admin/system').then((r) => r.json()).then((d) => setSettings(d.settings || []));
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-[#211710]">
      <div className="p-6 bg-white rounded-2xl border border-[#e8dec9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#9c6843]/10 text-[#9c6843] font-semibold text-[11px] border border-[#9c6843]/20">
            System Administrator Portal
          </span>
          <h1 className="text-xl font-bold text-[#3d2c20] mt-2">แผงควบคุมระบบสำหรับผู้ดูแลระบบ (Admin)</h1>
          <p className="text-xs text-[#75583f] mt-0.5">จัดการบัญชีผู้ใช้ สิทธิ์การใช้งาน โดเมนอีเมลสถาบัน การตั้งค่าระบบ และ Audit Logs</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="primary" size="sm" className="rounded-xl bg-[#9c6843] hover:bg-[#855432] text-white font-semibold text-xs shadow-sm" leftIcon={<Users className="w-4 h-4 text-white" />}>
              จัดการผู้ใช้
            </Button>
          </Link>
          <Link href="/admin/system">
            <Button variant="outline" size="sm" className="rounded-xl border-[#e8dec9] text-[#3d2c20] text-xs font-semibold hover:bg-[#f4efe6]" leftIcon={<Settings className="w-4 h-4 text-[#75583f]" />}>
              ตั้งค่าระบบ
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#e8dec9] p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#947252]/10 text-[#947252] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#75583f]">ผู้ใช้งานในระบบทั้งหมด</p>
            <p className="text-xl font-bold text-[#3d2c20]">{totalUsers.toLocaleString()} บัญชี</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8dec9] p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#9c6843]/10 text-[#9c6843] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#75583f]">โดเมนสถาบันที่อนุญาต</p>
            <p className="text-xs font-mono font-semibold text-[#9c6843] mt-0.5">@student.x-karchang.ac.th</p>
            <p className="text-xs font-mono font-semibold text-[#9c6843]">@x-karchang.ac.th</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8dec9] p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#2d7a4d]/10 text-[#2d7a4d] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#75583f]">สถานะระบบ (24/7 Health)</p>
            <p className="text-xs font-bold text-[#2d7a4d] mt-0.5">SYSTEM ONLINE 100%</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/admin/users" className="block">
          <div className="bg-white rounded-2xl border border-[#e8dec9] p-6 shadow-sm hover:border-[#9c6843]/50 transition-all duration-200">
            <Users className="w-7 h-7 text-[#9c6843] mb-3" />
            <h3 className="text-sm font-bold text-[#3d2c20]">จัดการผู้ใช้งานและสิทธิ์ (User & Roles)</h3>
            <p className="text-xs text-[#75583f] mt-1">เปิด/ปิดการใช้งานบัญชี เปลี่ยนแปลง Role ปรับปรุงสถานะ Active/Graduated</p>
          </div>
        </Link>

        <Link href="/admin/system" className="block">
          <div className="bg-white rounded-2xl border border-[#e8dec9] p-6 shadow-sm hover:border-[#9c6843]/50 transition-all duration-200">
            <Settings className="w-7 h-7 text-[#b45309] mb-3" />
            <h3 className="text-sm font-bold text-[#3d2c20]">กำหนดค่าระบบ (System Configuration)</h3>
            <p className="text-xs text-[#75583f] mt-1">กำหนด ALLOWED_EMAIL_DOMAINS และ COURSE_STORAGE_LIMIT_GB</p>
          </div>
        </Link>

        <Link href="/admin/audit-logs" className="block">
          <div className="bg-white rounded-2xl border border-[#e8dec9] p-6 shadow-sm hover:border-[#9c6843]/50 transition-all duration-200">
            <ShieldAlert className="w-7 h-7 text-[#947252] mb-3" />
            <h3 className="text-sm font-bold text-[#3d2c20]">บันทึกกิจกรรมความปลอดภัย (Audit Logs)</h3>
            <p className="text-xs text-[#75583f] mt-1">ตรวจสอบประวัติการ Login การอนุมัติวิชา และการอัปโหลดสื่อ</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
