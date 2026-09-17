'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, GraduationCap, BookOpen, Wrench, ShieldCheck, Eye, UserCheck, LogOut, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { UserProfileModal } from '../ui/UserProfileModal';
import { RoleName } from '@/lib/rbac';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  role: RoleName;
  userName: string;
  unreadNotifications?: number;
}

export const Header: React.FC<HeaderProps> = ({ role, userName, unreadNotifications = 1 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userEmail, setUserEmail] = useState('student@student.x-karchang.ac.th');

  useEffect(() => {
    const loadProfile = () => {
      try {
        const storedSession = localStorage.getItem('user_session');
        let email = 'student@student.x-karchang.ac.th';
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          if (parsed.email) email = parsed.email;
        }
        setUserEmail(email);
        const avatar = localStorage.getItem(`user_avatar_${email}`) || localStorage.getItem('user_avatar');
        if (avatar) setAvatarUrl(avatar);
      } catch (e) {}
    };

    loadProfile();
    window.addEventListener('profile_updated', loadProfile);
    return () => window.removeEventListener('profile_updated', loadProfile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('demo_user_email');
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  const getRoleBadgeVariant = (r: RoleName) => {
    switch (r) {
      case 'STUDENT': return 'success';
      case 'PROFESSOR': return 'bronze';
      case 'COURSE_CREATOR_APPROVER': return 'warning';
      case 'CONTENT_APPROVER': return 'info';
      case 'APPROVER': return 'warning';
      case 'DIRECTOR': return 'danger';
      case 'REGISTRAR': return 'luxury';
      default: return 'neutral';
    }
  };

  const effectiveRole: RoleName = (pathname?.startsWith('/course-approver') || pathname?.startsWith('/content-approver'))
    ? 'COURSE_CREATOR_APPROVER'
    : pathname?.startsWith('/director')
    ? 'DIRECTOR'
    : pathname?.startsWith('/professor')
    ? 'PROFESSOR'
    : pathname?.startsWith('/registrar')
    ? 'REGISTRAR'
    : role;

  const effectiveUserName = (pathname?.startsWith('/course-approver') || pathname?.startsWith('/content-approver')) && userName.includes('สมชาย')
    ? 'รศ.ดร.อนุมัติ วิชาการ'
    : pathname?.startsWith('/director') && userName.includes('สมชาย')
    ? 'ผอ.ดร.บริหาร วิสัยทัศน์'
    : userName;

  const getNavItems = () => {
    // 1. If on Approver layer or role is Approver: DO NOT show คลังวิชาเรียน or หน้าเรียน
    if (
      pathname?.startsWith('/course-approver') ||
      pathname?.startsWith('/content-approver') ||
      effectiveRole === 'COURSE_CREATOR_APPROVER' ||
      effectiveRole === 'CONTENT_APPROVER' ||
      effectiveRole === 'APPROVER'
    ) {
      return [
        { label: 'ศูนย์อนุมัติ', href: '/course-approver', icon: <ShieldCheck className="w-4 h-4" /> },
      ];
    }

    // 2. If on Registrar layer or role is Registrar: DO NOT show คลังวิชาเรียน or หน้าเรียน
    if (
      pathname?.startsWith('/registrar') ||
      effectiveRole === 'REGISTRAR'
    ) {
      return [
        { label: 'ศูนย์สิทธิ์นายทะเบียน', href: '/registrar/users', icon: <UserCheck className="w-4 h-4" /> },
      ];
    }

    switch (effectiveRole) {
      case 'STUDENT':
        return [
          { label: 'หน้าเรียน', href: '/student', icon: <GraduationCap className="w-4 h-4" /> },
          { label: 'คลังวิชาเรียน', href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'PROFESSOR':
        return [
          { label: 'หน้าอาจารย์', href: '/professor', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'DIRECTOR':
        return [
          { label: 'แดชบอร์ดบริหาร', href: '/director', icon: <Eye className="w-4 h-4" /> },
          { label: 'ภาพรวมรายวิชา', href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'REGISTRAR':
        return [
          { label: 'ศูนย์สิทธิ์นายทะเบียน', href: '/registrar/users', icon: <UserCheck className="w-4 h-4" /> },
        ];
      default:
        return [
          { label: 'หน้าเรียน', href: '/student', icon: <GraduationCap className="w-4 h-4" /> },
          { label: 'คลังวิชาเรียน', href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="sticky top-3 z-40 px-4 sm:px-6 max-w-7xl mx-auto w-full font-sans pointer-events-auto py-1">
      
      {/* Floating Capsule Bar Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        
        {/* 1. Left Pill Capsule: Brand Logo */}
        <Link 
          href="/" 
          className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200/90 flex items-center gap-3 hover:scale-[1.02] transition-all group"
        >
          <img src="/images/logo.png" alt="X Engineering Logo" className="h-7 w-auto object-contain" />
          <span className="text-xs font-black text-slate-900 tracking-tight border-l border-slate-200 pl-2.5 uppercase">
            X-Mechanics LMS
          </span>
        </Link>

        {/* 2. Middle Pill Capsule: Navigation & Search */}
        <div className="hidden lg:flex items-center gap-5 bg-white/95 backdrop-blur-md px-5 py-1.5 rounded-full shadow-lg border border-slate-200/90 flex-1 max-w-2xl justify-between">
          
          {/* Nav Links */}
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-700">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 transition-all px-3 py-1 rounded-full ${
                    isActive 
                      ? 'bg-slate-900 text-[#CEF34B] font-extrabold shadow-xs' 
                      : 'hover:text-black hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Integrated Search Input Capsule */}
          <div className="relative w-44 xl:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารายวิชา..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* 3. Right Pill Capsule: User Profile & Actions */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/90 flex items-center gap-2">
          
          {/* Profile Click Pill */}
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-full transition-all"
            title="คลิกเพื่อดูโปรไฟล์"
          >
            <Badge variant={getRoleBadgeVariant(effectiveRole)} size="sm" className="font-extrabold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0">
              {effectiveRole}
            </Badge>
            
            <div className="w-7 h-7 rounded-full bg-slate-900 text-[#CEF34B] flex items-center justify-center font-black text-xs overflow-hidden border border-slate-300 shadow-xs flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={effectiveUserName} className="w-full h-full object-cover" />
              ) : (
                <span>{effectiveUserName.slice(0, 2)}</span>
              )}
            </div>
            
            <span className="text-xs font-bold text-slate-900 hidden md:inline-block truncate max-w-[120px]">
              {effectiveUserName}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userName={userName}
        userEmail={userEmail}
        role={role}
      />
    </div>
  );
};
