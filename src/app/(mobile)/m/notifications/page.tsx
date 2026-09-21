'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Megaphone, BookOpen, ShieldCheck, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'ANNOUNCEMENT' | 'ENROLLMENT' | 'COURSE' | 'SYSTEM';
  title: string;
  body: string;
  createdAt: string;
  isRead?: boolean;
}

const TYPE_META: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  ANNOUNCEMENT: {
    icon: <Megaphone className="w-4 h-4" />,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  ENROLLMENT: {
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  COURSE: {
    icon: <ShieldCheck className="w-4 h-4" />,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
  },
  SYSTEM: {
    icon: <Bell className="w-4 h-4" />,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'ANNOUNCEMENT',
    title: 'ประกาศจากระบบ LMS',
    body: 'ยินดีต้อนรับสู่ระบบ LMS X-Engineering ภาคเรียนที่ 2/2567',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'ENROLLMENT',
    title: 'คำขอลงทะเบียนได้รับการอนุมัติ',
    body: 'คำขอเข้าเรียนในรายวิชาวิศวกรรมเครื่องกลของคุณได้รับการอนุมัติแล้ว',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: true,
  },
  {
    id: '3',
    type: 'COURSE',
    title: 'รายวิชาใหม่พร้อมเปิดสอนแล้ว',
    body: 'รายวิชา CAD/CAM สำหรับงานช่าง เปิดรับสมัครแล้ว',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}

export default function MobileNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try fetching real announcements, fallback to mocks
    fetch('/api/announcements?limit=20&t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.announcements?.length > 0) {
          const mapped: Notification[] = data.announcements.map((a: any) => ({
            id: a.id,
            type: 'ANNOUNCEMENT' as const,
            title: a.title,
            body: a.content || a.body || '',
            createdAt: a.createdAt,
            isRead: false,
          }));
          setNotifications(mapped);
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
        }
      })
      .catch(() => setNotifications(MOCK_NOTIFICATIONS))
      .finally(() => setIsLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    localStorage.setItem('unread_notifications', '0');
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-5 bg-black text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#CEF34B]/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs text-slate-400">การแจ้งเตือน</p>
            <h2 className="text-xl font-black text-white">
              {unreadCount > 0 ? (
                <span>
                  ยังไม่ได้อ่าน{' '}
                  <span className="text-[#CEF34B]">{unreadCount}</span> รายการ
                </span>
              ) : (
                'อ่านครบแล้ว ✓'
              )}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-bold bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-xl"
            >
              อ่านทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-sm">ไม่มีการแจ้งเตือน</p>
            <p className="text-xs text-slate-400 mt-1">คุณรับทราบทุกอย่างแล้ว</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.SYSTEM;
            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border shadow-xs p-4 flex items-start gap-3.5 transition-all ${
                  !n.isRead ? 'border-black/10 shadow-md' : 'border-slate-100'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}
                >
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm leading-snug ${
                        !n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-[#CEF34B] rounded-full flex-shrink-0 mt-1 border border-black/20" />
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{n.body}</p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
