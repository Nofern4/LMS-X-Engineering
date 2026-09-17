'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications?userId=student-1')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []));
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'student-1' }),
    });

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-16 font-sans text-[#211710]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-2xl border border-[#e8dec9] shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#3d2c20] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#9c6843]" />
            <span>ศูนย์การแจ้งเตือน (Notification Center)</span>
          </h1>
          <p className="text-xs text-[#75583f] mt-0.5">การแจ้งเตือนผลอนุมัติรายวิชา ประกาศใหม่ และข้อมูลบทเรียน</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          leftIcon={<CheckCheck className="w-4 h-4 text-[#9c6843]" />}
          className="rounded-xl border-[#e8dec9] text-[#9c6843] hover:bg-[#f4efe6] text-xs font-semibold"
        >
          ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e8dec9] shadow-sm overflow-hidden divide-y divide-[#f4efe6]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-[#75583f] text-xs">ไม่มีการแจ้งเตือนในระบบ</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between transition-colors ${
                !n.isRead ? 'bg-[#9c6843]/5' : 'hover:bg-[#f4efe6]/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${!n.isRead ? 'bg-[#9c6843]' : 'bg-[#c69b76]/50'}`} />
                <div>
                  <h4 className="text-xs font-bold text-[#3d2c20]">{n.title}</h4>
                  <p className="text-xs text-[#75583f] mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-[#75583f]/80 font-mono mt-1 block">
                    {new Date(n.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                n.type === 'SUCCESS' ? 'bg-[#2d7a4d]/10 text-[#2d7a4d]' : 'bg-[#9c6843]/10 text-[#9c6843]'
              }`}>
                {n.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
