'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setIsLoading(false));
  }, [search]);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: 'admin-1',
        targetUserId: userId,
        status: newStatus,
      }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">จัดการผู้ใช้งานและสิทธิ์ (User & Role Management)</h1>
          <p className="text-xs text-slate-500">จัดการสถานะ Active/Graduated/Disabled และกำหนดสิทธิ์ของบัญชีในสถาบัน</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 flex items-center justify-between">
          <div className="w-72">
            <Input
              placeholder="ค้นหาชื่อ อีเมล หรือรหัสนักศึกษา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3.5 pl-6">ชื่อ-นามสกุล</th>
                <th className="p-3.5">อีเมลสถาบัน</th>
                <th className="p-3.5">รหัสนักศึกษา/สังกัด</th>
                <th className="p-3.5">บทบาท (Role)</th>
                <th className="p-3.5">สถานะ (Status)</th>
                <th className="p-3.5 pr-6 text-right">การจัดการสถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-6 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                  <td className="p-3.5 text-slate-600">{u.studentId || u.department || '-'}</td>
                  <td className="p-3.5">
                    <Badge variant="primary" size="sm">
                      {u.userRoles?.[0]?.role?.name || 'STUDENT'}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={u.status === 'ACTIVE' ? 'success' : u.status === 'GRADUATED' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 pr-6 text-right space-x-2">
                    {u.status === 'ACTIVE' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUpdateStatus(u.id, 'DISABLED')}
                      >
                        ระงับสิทธิ์
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                      >
                        เปิดใช้งาน
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
