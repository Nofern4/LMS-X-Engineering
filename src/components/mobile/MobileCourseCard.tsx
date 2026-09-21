'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, ChevronRight, Clock } from 'lucide-react';

interface MobileCourseCardProps {
  id: string;
  code: string;
  title: string;
  category?: string;
  enrollmentCount?: number;
  instructorName?: string;
  status?: string;
  isEnrolled?: boolean;
  href?: string;
}

export function MobileCourseCard({
  id,
  code,
  title,
  category,
  enrollmentCount = 0,
  instructorName,
  status,
  isEnrolled = false,
  href,
}: MobileCourseCardProps) {
  const targetHref = href || `/m/courses/${id}`;

  // Generate a consistent gradient based on course code
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
  ];
  const gradientIndex = code.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <Link
      href={targetHref}
      className="flex items-stretch bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden active:scale-[0.98] transition-all duration-150"
    >
      {/* Color accent stripe */}
      <div className={`w-1.5 bg-gradient-to-b ${gradient} flex-shrink-0`} />

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* Code badge */}
            <span className="inline-block px-2 py-0.5 bg-black text-[#CEF34B] text-[10px] font-black rounded-lg mb-1.5 font-mono">
              {code}
            </span>

            {/* Title */}
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
              {title}
            </h3>

            {/* Category + Instructor */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {category && (
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {category}
                </span>
              )}
              {instructorName && (
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {instructorName}
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
        </div>

        {/* Footer meta */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Users className="w-3 h-3" />
              {enrollmentCount} คน
            </span>
            {status === 'PENDING_APPROVAL' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" />
                รอการอนุมัติ
              </span>
            )}
          </div>
          {isEnrolled && (
            <span className="text-[10px] font-black text-black bg-[#CEF34B] px-2.5 py-1 rounded-full">
              กำลังเรียน
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
