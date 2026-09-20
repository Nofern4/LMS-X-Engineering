'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, GraduationCap, BookOpen, Wrench, ShieldCheck, 
  Eye, UserCheck, LogOut, Plus, ChevronDown, 
  ArrowRight, User, ShieldAlert, ArrowRightLeft, Check
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { UserProfileModal } from '../ui/UserProfileModal';
import { RoleRequestModal } from '../ui/RoleRequestModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { RoleName } from '@/lib/rbac';
import { translate } from '@/lib/i18n/translations';
import { DEFAULT_LANGUAGE } from '@/lib/i18n/languages';
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
  const [isRoleRequestOpen, setIsRoleRequestOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userEmail, setUserEmail] = useState('student@student.x-karchang.ac.th');
  const [userRoles, setUserRoles] = useState<string[]>([role]);
  const [displayName, setDisplayName] = useState<string>(userName);
  const [currentLang, setCurrentLang] = useState<string>(DEFAULT_LANGUAGE);
  const [headerSearch, setHeaderSearch] = useState('');
  const [headerSearchType, setHeaderSearchType] = useState<'course' | 'instructor' | 'code'>('course');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleHeaderSearch = (val: string, type: 'course' | 'instructor' | 'code') => {
    setHeaderSearch(val);
    window.dispatchEvent(new CustomEvent('header_search', { detail: { search: val, searchType: type } }));
  };

  const executeHeaderSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`/courses?search=${encodeURIComponent(headerSearch)}&searchType=${headerSearchType}`);
    window.dispatchEvent(new CustomEvent('header_search', { detail: { search: headerSearch, searchType: headerSearchType } }));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') || DEFAULT_LANGUAGE;
    setCurrentLang(savedLang);

    const handleLangChange = (e: any) => {
      if (e.detail?.lang) setCurrentLang(e.detail.lang);
    };
    window.addEventListener('language_changed', handleLangChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('language_changed', handleLangChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cleanName = (nameStr: string) => {
    return (nameStr || '').replace(/\s*\([A-Za-z0-9\s\.\-]+\)/g, '').trim();
  };

  const loadUserData = () => {
    try {
      const storedSession = localStorage.getItem('user_session');
      let email = localStorage.getItem('demo_user_email') || 'student@student.x-karchang.ac.th';
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.email) email = parsed.email;
        if (parsed.name) setDisplayName(cleanName(parsed.name));
        if (parsed.roles && Array.isArray(parsed.roles)) {
          setUserRoles(parsed.roles);
        }
      }
      setUserEmail(email);

      // Fetch fresh live user profile & roles from backend DB
      fetch(`/api/auth/login?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setDisplayName(cleanName(data.user.name));
            if (data.user.roles) {
              setUserRoles(data.user.roles);
              // Update session storage
              if (storedSession) {
                const parsed = JSON.parse(storedSession);
                parsed.roles = data.user.roles;
                parsed.name = cleanName(data.user.name);
                localStorage.setItem('user_session', JSON.stringify(parsed));
              }
            }
          }
        })
        .catch(() => {});

      const avatar = localStorage.getItem(`user_avatar_${email}`) || localStorage.getItem('user_avatar');
      if (avatar) setAvatarUrl(avatar);
    } catch (e) {}
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener('profile_updated', loadUserData);
    window.addEventListener('role_updated', loadUserData);
    return () => {
      window.removeEventListener('profile_updated', loadUserData);
      window.removeEventListener('role_updated', loadUserData);
    };
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

  const getRoleThaiTitle = (r: string) => {
    switch (r) {
      case 'STUDENT': return 'นักศึกษา';
      case 'COURSE_CREATOR_APPROVER':
      case 'APPROVER': return 'ผู้อนุมัติ';
      case 'PROFESSOR': return 'อาจารย์';
      case 'DIRECTOR': return 'ผู้บริหาร';
      case 'REGISTRAR': return 'นายทะเบียน';
      default: return r;
    }
  };

  // Determine current active effective role
  const isApproverLayer = pathname?.startsWith('/course-approver') || pathname?.startsWith('/content-approver');
  const isStudentLayer = pathname?.startsWith('/student');
  const isProfessorLayer = pathname?.startsWith('/professor');
  const isDirectorLayer = pathname?.startsWith('/director');
  const isRegistrarLayer = pathname?.startsWith('/registrar');

  const effectiveRole: RoleName = isApproverLayer
    ? 'COURSE_CREATOR_APPROVER'
    : isDirectorLayer
    ? 'DIRECTOR'
    : isProfessorLayer
    ? 'PROFESSOR'
    : isRegistrarLayer
    ? 'REGISTRAR'
    : role;

  const hasApproverRole = userRoles.includes('COURSE_CREATOR_APPROVER') || userRoles.includes('APPROVER');
  const hasStudentRole = userRoles.includes('STUDENT');
  const hasProfessorRole = userRoles.includes('PROFESSOR');

  const effectiveUserName = cleanName(displayName || userName);

  const getNavItems = () => {
    if (
      isApproverLayer ||
      effectiveRole === 'COURSE_CREATOR_APPROVER' ||
      effectiveRole === 'CONTENT_APPROVER' ||
      effectiveRole === 'APPROVER'
    ) {
      return [
        { label: translate('ศูนย์อนุมัติ', currentLang), href: '/course-approver', icon: <ShieldCheck className="w-4 h-4" /> },
      ];
    }

    if (
      isRegistrarLayer ||
      effectiveRole === 'REGISTRAR'
    ) {
      return [
        { label: translate('ศูนย์สิทธิ์นายทะเบียน', currentLang), href: '/registrar/users', icon: <UserCheck className="w-4 h-4" /> },
      ];
    }

    switch (effectiveRole) {
      case 'STUDENT':
        return [
          { label: translate('หน้าเรียน', currentLang), href: '/student', icon: <GraduationCap className="w-4 h-4" /> },
          { label: translate('คลังวิชาเรียน', currentLang), href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'PROFESSOR':
        return [
          { label: translate('ระบบจัดการการสอน', currentLang), href: '/professor', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'DIRECTOR':
        return [
          { label: translate('แดชบอร์ดบริหาร', currentLang), href: '/director', icon: <Eye className="w-4 h-4" /> },
          { label: translate('ภาพรวมรายวิชา', currentLang), href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        ];
      default:
        return [
          { label: translate('หน้าเรียน', currentLang), href: '/student', icon: <GraduationCap className="w-4 h-4" /> },
          { label: translate('คลังวิชาเรียน', currentLang), href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="sticky top-3 z-40 px-3 sm:px-4 xl:px-6 max-w-[1536px] mx-auto w-full font-sans pointer-events-auto py-1">
      
      {/* Floating Capsule Bar Header */}
      <header className="flex items-center justify-between gap-2 xl:gap-3 flex-nowrap w-full">
        
        {/* 1. Left Pill Capsule: Brand Logo */}
        <Link 
          href="/" 
          className="bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full shadow-lg border border-slate-200/90 flex items-center gap-2.5 sm:gap-3 hover:scale-[1.02] transition-all group flex-shrink-0"
        >
          <img src="/images/logo.png" alt="X Engineering Logo" className="h-6 sm:h-7 w-auto object-contain flex-shrink-0" />
          <span className="text-xs font-black text-slate-900 tracking-tight border-l border-slate-200 pl-2 sm:pl-2.5 uppercase whitespace-nowrap">
            X-Mechanics LMS
          </span>
        </Link>

        {/* 2. Middle Pill Capsule: Navigation & Search */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-4 bg-white/95 backdrop-blur-md px-3.5 xl:px-5 py-1.5 rounded-full shadow-lg border border-slate-200/90 flex-1 min-w-0 max-w-xl xl:max-w-2xl justify-between flex-shrink">
          
          {/* Nav Links */}
          <nav className="flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-700 flex-shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 transition-all px-2.5 xl:px-3 py-1 rounded-full whitespace-nowrap ${
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

          {/* Clean Integrated Search Bar with Dropdown (Only visible for Student Role) */}
          {effectiveRole === 'STUDENT' && (
            <form onSubmit={executeHeaderSearch} className="flex items-center bg-slate-100/90 hover:bg-white rounded-full border border-slate-200 focus-within:border-slate-900 focus-within:bg-white transition-all overflow-hidden flex-shrink min-w-[250px] xl:min-w-[310px]">
              <select
                value={headerSearchType}
                onChange={(e) => {
                  const newType = e.target.value as 'course' | 'instructor' | 'code';
                  setHeaderSearchType(newType);
                  handleHeaderSearch(headerSearch, newType);
                }}
                className="bg-transparent text-[11px] font-bold text-slate-700 pl-3 pr-1.5 py-1.5 focus:outline-none cursor-pointer border-r border-slate-200 select-none"
              >
                <option value="course">ค้นหารายวิชา</option>
                <option value="instructor">ค้นหาชื่ออาจารย์</option>
                <option value="code">ค้นหารหัสวิชา</option>
              </select>
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => handleHeaderSearch(e.target.value, headerSearchType)}
                  placeholder={
                    headerSearchType === 'instructor'
                      ? 'ค้นหาชื่ออาจารย์...'
                      : headerSearchType === 'code'
                      ? 'ค้นหารหัสวิชา (ตัวเลข เช่น 101, 302)...'
                      : 'ค้นหารายวิชา...'
                  }
                  className="w-full pl-2.5 pr-8 py-1.5 text-xs bg-transparent focus:outline-none text-slate-900 font-medium placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  title="ค้นหา"
                  className="absolute right-2 p-1 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. Action Buttons & Right Pill Capsule */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-nowrap">
          
          {/* Language Switcher Dropdown Capsule */}
          <LanguageSwitcher />

          {/* Role Request / Relinquish Button */}
          <button
            onClick={() => setIsRoleRequestOpen(true)}
            className="bg-white/95 backdrop-blur-md hover:bg-slate-900 hover:text-[#CEF34B] text-slate-800 px-3 sm:px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/90 flex items-center gap-1.5 text-xs font-bold transition-all group cursor-pointer active:scale-95 flex-shrink-0 whitespace-nowrap"
            title="ขอสิทธิ์"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:text-[#CEF34B] transition-colors flex-shrink-0" />
            <span className="hidden sm:inline">ขอสิทธิ์</span>
          </button>

          {/* Right Pill Capsule: User Profile & Dropdown Switcher */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/90 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              
              {/* Profile Pill Trigger */}
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-full transition-all select-none"
                title="คลิกเพื่อดูโปรไฟล์และสลับบทบาท"
              >
                <Badge variant={getRoleBadgeVariant(effectiveRole)} size="sm" className="font-extrabold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0">
                  {translate(getRoleThaiTitle(effectiveRole), currentLang)}
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

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              <div className="h-4 w-px bg-slate-200" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                title={translate('ออกจากระบบ', currentLang)}
                className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Dropdown Menu - Sleek Studio Redesign */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-3.5 space-y-3 z-50 animate-fadeIn font-sans">
                
                {/* User Identity Header */}
                <div className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 border border-slate-200">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={effectiveUserName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{effectiveUserName.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-slate-900 truncate">
                        {effectiveUserName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {translate(getRoleThaiTitle(effectiveRole), currentLang)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Section: บทบาทที่ได้รับอนุญาต */}
                <div className="px-1 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {translate('บทบาทที่ได้รับมอบหมาย', currentLang)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {userRoles.map((r) => {
                      const isActive = (r === 'COURSE_CREATOR_APPROVER' || r === 'APPROVER') ? isApproverLayer :
                                       r === 'STUDENT' ? isStudentLayer :
                                       r === 'PROFESSOR' ? isProfessorLayer :
                                       r === effectiveRole;
                      return (
                        <span 
                          key={r} 
                          className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#CEF34B]' : 'bg-slate-400'}`} />
                          <span>{translate(getRoleThaiTitle(r), currentLang)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Section: สลับโหมดการทำงาน */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  
                  {/* Switch to Approver Tile */}
                  {hasApproverRole && !isApproverLayer && (
                    <div
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/course-approver');
                      }}
                      className="group p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white cursor-pointer hover:from-black hover:to-slate-900 transition-all shadow-sm flex items-center justify-between border border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#CEF34B] transition-colors">
                            {translate('สลับไปโหมดผู้อนุมัติ', currentLang)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {translate('ตรวจสอบและอนุมัติหลักสูตร', currentLang)}
                          </div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#CEF34B] group-hover:text-black flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Switch to Student Tile */}
                  {isApproverLayer && hasStudentRole && (
                    <div
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/student');
                      }}
                      className="group p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white cursor-pointer hover:from-black hover:to-slate-900 transition-all shadow-sm flex items-center justify-between border border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#CEF34B]/20 border border-[#CEF34B]/40 text-[#CEF34B] flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#CEF34B] transition-colors">
                            {translate('สลับกลับสู่โหมดนักศึกษา', currentLang)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {translate('เข้าสู่หน้าเรียนและรายวิชา', currentLang)}
                          </div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#CEF34B] group-hover:text-black flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Switch to Professor Tile */}
                  {hasProfessorRole && !isProfessorLayer && (
                    <div
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/professor');
                      }}
                      className="group p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 cursor-pointer transition-all border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {translate('สลับไประบบจัดการการสอน', currentLang)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {translate('จัดการคอร์สเรียนและบทเรียน', currentLang)}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Dropdown Action Links */}
                <div className="space-y-1 pt-1 border-t border-slate-100 text-xs font-bold">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="w-full p-2.5 rounded-xl text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{translate('ข้อมูลโปรไฟล์ส่วนตัว', currentLang)}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsRoleRequestOpen(true);
                    }}
                    className="w-full p-2.5 rounded-xl text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-bold"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>ขอสิทธิ์</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full p-2.5 rounded-xl text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{translate('ออกจากระบบ', currentLang)}</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userName={effectiveUserName}
        userEmail={userEmail}
        role={role}
        roles={userRoles}
        onOpenRoleRequest={() => setIsRoleRequestOpen(true)}
      />

      {/* Role Request & Relinquish Modal */}
      <RoleRequestModal
        isOpen={isRoleRequestOpen}
        onClose={() => setIsRoleRequestOpen(false)}
        userEmail={userEmail}
        userName={effectiveUserName}
        currentRoles={userRoles}
        onRolesUpdated={(newRoles) => {
          setUserRoles(newRoles);
          loadUserData();
        }}
      />

    </div>
  );
};
