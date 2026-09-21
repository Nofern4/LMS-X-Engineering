'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  APPROVED: {
    label: 'กำลังเรียน',
    color: 'bg-[#CEF34B] text-black border-black/20',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  PENDING: {
    label: 'รออนุมัติ',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <Clock className="w-3 h-3" />,
  },
  REJECTED: {
    label: 'ไม่ผ่าน',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function MobileEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const fetchEnrollments = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await fetch('/api/courses/enrollments?limit=100&t=' + Date.now(), {
        cache: 'no-store',
      });
      const data = await res.json();
      setEnrollments(data.enrollments || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const filtered =
    activeFilter === 'ALL'
      ? enrollments
      : enrollments.filter((e) => e.status === activeFilter);

  const approvedCount = enrollments.filter((e) => e.status === 'APPROVED').length;
  const pendingCount = enrollments.filter((e) => e.status === 'PENDING').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header summary */}
      <div className="bg-black text-white px-5 pt-4 pb-6 relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#CEF34B]/10 rounded-full blur-2xl" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-xs text-slate-400 font-medium">การลงทะเบียนของฉัน</p>
            <h2 className="text-xl font-black text-white mt-0.5">{enrollments.length} วิชา</h2>
          </div>
          <button
            onClick={() => fetchEnrollments(true)}
            className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <RefreshCw
              className={`text-white ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ width: 16, height: 16 }}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
          {[
            { label: 'กำลังเรียน', value: approvedCount, color: 'text-[#CEF34B]' },
            { label: 'รออนุมัติ', value: pendingCount, color: 'text-amber-400' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 rounded-2xl p-3 border border-white/10"
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border-b border-slate-100 overflow-x-auto scrollbar-hide">
        {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((f) => {
          const labels: Record<string, string> = {
            ALL: 'ทั้งหมด',
            APPROVED: 'กำลังเรียน',
            PENDING: 'รออนุมัติ',
            REJECTED: 'ไม่ผ่าน',
          };
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === f
                  ? 'bg-black text-[#CEF34B]'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-sm">ไม่มีรายวิชา</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">คุณยังไม่ได้ลงทะเบียนเรียน</p>
            <Link
              href="/m/courses"
              className="px-5 py-2.5 bg-black text-[#CEF34B] font-black text-sm rounded-2xl"
            >
              ค้นหารายวิชา
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const statusInfo = STATUS_MAP[e.status] || STATUS_MAP.PENDING;
              return (
                <div
                  key={e.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#CEF34B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-bold text-slate-400">
                      {e.course?.code}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {e.course?.title}
                    </p>
                    <div className="mt-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                  {e.status === 'APPROVED' && (
                    <Link href={`/learning/${e.courseId}`} className="flex-shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
