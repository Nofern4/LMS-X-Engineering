'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Bell,
  Megaphone,
  BarChart3,
  CheckSquare,
  FileCheck,
  Eye,
  FolderOpen,
  Wrench,
  Award,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { RoleName } from '@/lib/rbac';
import { UserProfileModal } from '../ui/UserProfileModal';

interface SidebarProps {
  role: RoleName;
  userName: string;
  email: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, userName, email }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const loadAvatar = () => {
      try {
        const saved = localStorage.getItem(`user_avatar_${email}`) || localStorage.getItem('user_avatar');
        if (saved) setAvatarUrl(saved);
      } catch (e) {}
    };
    loadAvatar();
    window.addEventListener('profile_updated', loadAvatar);
    return () => window.removeEventListener('profile_updated', loadAvatar);
  }, [email]);
  const isDirector = role === 'DIRECTOR';

  const handleLogout = () => {
    localStorage.removeItem('demo_user_email');
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  const getNavItems = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { label: 'หน้าเว็บเรียน (My Portal)', href: '/student', icon: <GraduationCap className="w-5 h-5" /> },
          { label: 'คลังวิชาเรียน Xการช่าง', href: '/courses', icon: <BookOpen className="w-5 h-5" /> },
          { label: 'การแจ้งเตือน', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
        ];
      case 'PROFESSOR':
        return [
          { label: 'แดชบอร์ดอาจารย์', href: '/professor', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'สร้างรายวิชาใหม่', href: '/professor/courses/create', icon: <BookOpen className="w-5 h-5" /> },
          { label: 'คลังรายวิชาทั้งหมด', href: '/courses', icon: <FolderOpen className="w-5 h-5" /> },
        ];
      case 'COURSE_CREATOR_APPROVER':
      case 'CONTENT_APPROVER':
      case 'APPROVER':
        return [
          { label: 'ศูนย์อนุมัติ (Approver Portal)', href: '/course-approver', icon: <ShieldCheck className="w-5 h-5" /> },
          { label: 'อนุมัติสื่อการเรียนรู้', href: '/content-approver', icon: <FileCheck className="w-5 h-5" /> },
        ];
      case 'DIRECTOR':
        return [
          { label: 'ผู้บริหาร ผอ. (Executive Portal)', href: '/director', icon: <Eye className="w-5 h-5" /> },
          { label: 'ภาพรวมรายวิชา (Read-Only)', href: '/courses', icon: <BookOpen className="w-5 h-5" /> },
          { label: 'สถิติสถาบัน & การเข้าเรียน', href: '/director#reports', icon: <BarChart3 className="w-5 h-5" /> },
        ];
      case 'REGISTRAR':
        return [
          { label: 'ศูนย์งานนายทะเบียน', href: '/registrar', icon: <UserCheck className="w-5 h-5" /> },
          { label: 'จัดการสิทธิ์ & แต่งตั้งอาจารย์', href: '/registrar/users', icon: <ShieldCheck className="w-5 h-5" /> },
          { label: 'คลังรายวิชาทั้งหมด', href: '/courses', icon: <BookOpen className="w-5 h-5" /> },
        ];
      default:
        return [
          { label: 'รายวิชาทั้งหมด', href: '/courses', icon: <BookOpen className="w-5 h-5" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white text-slate-900 flex flex-col h-screen sticky top-0 border-r border-slate-200 select-none flex-shrink-0 font-sans shadow-xs z-40">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black text-white">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="X Engineering Logo" className="h-10 w-auto object-contain bg-white/10 p-1 rounded-lg" />
          <div>
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">X-Mechanics LMS</p>
          </div>
        </div>
      </div>

      {/* Director Read-Only Banner */}
      {isDirector && (
        <div className="mx-3 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <Eye className="w-4 h-4 text-rose-700 flex-shrink-0" />
          <span className="font-bold">ผอ. (Read-Only 100%)</span>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          เมนูระบบการเรียนรู้
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/student' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-150 ${
                isActive
                  ? 'bg-black text-[#CEF34B] shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className={isActive ? 'text-[#CEF34B]' : 'text-slate-400'}>{item.icon}</span>
              <span className="truncate tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout Box */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity flex-1"
            title="คลิกเพื่อดูและจัดการโปรไฟล์นักศึกษา/บุคลากร"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 text-[#CEF34B] flex items-center justify-center font-black text-xs uppercase flex-shrink-0 overflow-hidden border border-slate-300">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{userName.slice(0, 2)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userName={userName}
        userEmail={email}
        role={role}
      />
    </aside>
  );
};
