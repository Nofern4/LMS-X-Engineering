'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MobileCourseCard } from '@/components/mobile/MobileCourseCard';
import { Search, SlidersHorizontal, X, BookOpen } from 'lucide-react';

const CATEGORIES = ['ทั้งหมด', 'วิศวกรรม', 'วิทยาศาสตร์', 'บริหาร', 'ศิลปศาสตร์', 'ช่างกล'];

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('ทั้งหมด');
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', t: Date.now().toString() });
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'ทั้งหมด') params.set('category', category);
      const res = await fetch(`/api/courses?${params}`, { cache: 'no-store' });
      const data = await res.json();
      setCourses(data.courses || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setIsLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-100 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 gap-2 shadow-xs">
            <Search className="text-slate-400 flex-shrink-0" style={{ width: 16, height: 16 }} />
            <input
              type="search"
              placeholder="ค้นหารายวิชา, รหัส, อาจารย์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X className="text-slate-400" style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${
              showFilter || category !== 'ทั้งหมด'
                ? 'bg-black border-black text-[#CEF34B]'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <SlidersHorizontal style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Category pills */}
        {showFilter && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  category === cat
                    ? 'bg-black text-[#CEF34B]'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4">
        {/* Count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500 font-medium">
            {isLoading ? 'กำลังโหลด...' : `พบ ${total} รายวิชา`}
          </p>
          {category !== 'ทั้งหมด' && (
            <button
              onClick={() => setCategory('ทั้งหมด')}
              className="text-[11px] font-bold text-rose-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> ล้างตัวกรอง
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-sm">ไม่พบรายวิชา</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <MobileCourseCard
                key={c.id}
                id={c.id}
                code={c.code}
                title={c.title}
                category={c.category}
                enrollmentCount={c._count?.enrollments || 0}
                instructorName={c.createdBy?.name}
                status={c.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoursesSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-10 bg-slate-100 rounded-2xl animate-pulse" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

export default function MobileCoursesPage() {
  return (
    <Suspense fallback={<CoursesSkeleton />}>
      <CoursesContent />
    </Suspense>
  );
}
