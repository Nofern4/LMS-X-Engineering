'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, X, ArrowLeft } from 'lucide-react';

interface MobileTopBarProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
}

export function MobileTopBar({ title, showBack = false, showSearch = true }: MobileTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    try {
      setUnread(parseInt(localStorage.getItem('unread_notifications') || '0'));
    } catch {}
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/m/courses?search=${encodeURIComponent(searchVal.trim())}`);
      setIsSearchOpen(false);
      setSearchVal('');
    }
  };

  // Determine page title based on pathname
  const pageTitle = title || (() => {
    if (pathname === '/m') return 'LMS X-Engineering';
    if (pathname.startsWith('/m/courses')) return 'รายวิชาทั้งหมด';
    if (pathname.startsWith('/m/enrollments')) return 'การเรียนของฉัน';
    if (pathname.startsWith('/m/notifications')) return 'การแจ้งเตือน';
    if (pathname.startsWith('/m/profile')) return 'โปรไฟล์';
    return 'LMS';
  })();

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Back button or Logo */}
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          ) : (
            <Link href="/m" className="flex items-center gap-2 mr-1">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-[#CEF34B] font-black text-xs">LMS</span>
              </div>
            </Link>
          )}

          {/* Title */}
          <h1 className="flex-1 font-black text-sm text-slate-900 truncate">{pageTitle}</h1>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Search className="w-4.5 h-4.5 text-slate-600" style={{ width: 18, height: 18 }} />
              </button>
            )}

            <Link
              href="/m/notifications"
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="text-slate-600" style={{ width: 18, height: 18 }} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center h-14 px-3 gap-2 border-b border-slate-100">
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-100 rounded-2xl px-4 py-2.5 gap-2">
                <Search className="text-slate-500 flex-shrink-0" style={{ width: 16, height: 16 }} />
                <input
                  autoFocus
                  type="search"
                  placeholder="ค้นหารายวิชา, อาจารย์..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </form>
            <button
              onClick={() => { setIsSearchOpen(false); setSearchVal(''); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-sm font-bold text-slate-600"
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Quick search suggestions */}
          <div className="p-4 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">ค้นหาด่วน</p>
            {['วิศวกรรมเครื่องกล', 'ไฟฟ้า', 'คอมพิวเตอร์'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSearchVal(q);
                  router.push(`/m/courses?search=${encodeURIComponent(q)}`);
                  setIsSearchOpen(false);
                  setSearchVal('');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <Search className="text-slate-400 flex-shrink-0" style={{ width: 16, height: 16 }} />
                <span className="text-sm text-slate-700 font-medium">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
