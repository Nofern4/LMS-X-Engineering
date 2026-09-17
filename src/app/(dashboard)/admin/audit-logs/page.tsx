'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, []);

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
          <h1 className="text-xl font-bold text-slate-900">บันทึกกิจกรรมความปลอดภัย (Audit Logs)</h1>
          <p className="text-xs text-slate-500">ตรวจสอบประวัติการทำรายการสำคัญในระบบทั้งหมด</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <span>ประวัติกิจกรรมระบบ (System Security Audit Trail)</span>
          </h3>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3.5 pl-6">เวลา (Timestamp)</th>
                <th className="p-3.5">ผู้ทำรายการ (User)</th>
                <th className="p-3.5">การกระทำ (Action)</th>
                <th className="p-3.5">ทรัพยากร (Resource)</th>
                <th className="p-3.5 pr-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-6 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString('th-TH')}</td>
                  <td className="p-3.5 font-bold text-slate-900">{log.user?.name || 'System / Guest'}</td>
                  <td className="p-3.5">
                    <Badge variant="primary" size="sm">{log.action}</Badge>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{log.resource}</td>
                  <td className="p-3.5 pr-6 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
