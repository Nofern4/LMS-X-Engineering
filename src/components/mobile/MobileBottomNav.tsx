'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  GraduationCap,
  Bell,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/m', icon: Home, label: 'หน้าหลัก', exact: true },
  { href: '/m/courses', icon: BookOpen, label: 'รายวิชา', exact: false },
  { href: '/m/enrollments', icon: GraduationCap, label: 'การเรียน', exact: false },
  { href: '/m/notifications', icon: Bell, label: 'แจ้งเตือน', exact: false },
  { href: '/m/profile', icon: User, label: 'โปรไฟล์', exact: false },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // Check unread notifications count from local storage or API
    try {
      const n = parseInt(localStorage.getItem('unread_notifications') || '0');
      setUnread(n);
    } catch {}
  }, []);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const isNotification = item.href === '/m/notifications';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 relative ${
                active ? 'text-black' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#CEF34B] rounded-b-full" />
              )}

              {/* Icon with optional badge */}
              <div className="relative">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 ${
                    active ? 'bg-black scale-110' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      active ? 'text-[#CEF34B]' : 'text-slate-400'
                    }`}
                  />
                </div>
                {isNotification && unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold leading-none transition-all duration-200 ${
                  active ? 'text-black' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
