'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, User, GraduationCap, BookOpen, Building, Mail, 
  ShieldCheck, ArrowRightLeft, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  role: string;
  roles?: string[];
  onOpenRoleRequest?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail = 'student@student.x-karchang.ac.th',
  role,
  roles: propRoles,
  onOpenRoleRequest,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('66010923');
  const [branch, setBranch] = useState<string>('ช่างกลโรงงาน & เครื่องกล');
  const [faculty, setFaculty] = useState<string>('คณะวิศวกรรมศาสตร์และเทคโนโลยีช่าง');
  const [userRoles, setUserRoles] = useState<string[]>(propRoles || [role]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const storedSession = localStorage.getItem('user_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed.studentId) setStudentId(parsed.studentId);
        if (parsed.roles && Array.isArray(parsed.roles)) {
          setUserRoles(parsed.roles);
        }
        if (parsed.department) {
          const parts = parsed.department.split('&');
          if (parts.length > 1) {
            setBranch(parts[0].trim());
            setFaculty(parts[1].trim());
          } else {
            setBranch(parsed.department);
          }
        }
      }

      // Fetch live roles to guarantee freshly assigned roles from registrar
      fetch(`/api/auth/login?email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.roles) {
            setUserRoles(data.user.roles);
            // Update cached session
            if (storedSession) {
              const parsed = JSON.parse(storedSession);
              parsed.roles = data.user.roles;
              localStorage.setItem('user_session', JSON.stringify(parsed));
            }
          }
        })
        .catch(() => {});
      
      const savedAvatar = localStorage.getItem(`user_avatar_${userEmail}`) || localStorage.getItem('user_avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);
    } catch (e) {
      console.error(e);
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        localStorage.setItem(`user_avatar_${userEmail}`, result);
        localStorage.setItem('user_avatar', result);
        window.dispatchEvent(new Event('profile_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const hasApproverRole = userRoles.includes('COURSE_CREATOR_APPROVER') || userRoles.includes('APPROVER');
  const hasProfessorRole = userRoles.includes('PROFESSOR');
  const hasStudentRole = userRoles.includes('STUDENT');
  const hasRegistrarRole = userRoles.includes('REGISTRAR');
  const hasDirectorRole = userRoles.includes('DIRECTOR');

  const isCurrentlyInApprover = pathname?.startsWith('/course-approver') || pathname?.startsWith('/content-approver');
  const isCurrentlyInStudent = pathname?.startsWith('/student');

  const handleSwitchToApprover = () => {
    onClose();
    router.push('/course-approver');
  };

  const handleSwitchToStudent = () => {
    onClose();
    router.push('/student');
  };

  const cleanName = (userName || '').replace(/\s*\([A-Za-z0-9\s\.\-]+\)/g, '').trim();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#CEF34B]" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              ข้อมูลโปรไฟล์ & สลับบทบาท
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Horizontal 2 Column Layout */}
        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            
            {/* Left Column: Avatar & Photo Change */}
            <div className="flex flex-col items-center gap-3 md:w-48 flex-shrink-0 pt-1">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-900 text-[#CEF34B] border-4 border-slate-100 shadow-lg flex items-center justify-center text-2xl font-black">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={cleanName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{cleanName.slice(0, 2)}</span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#CEF34B] text-black shadow-md hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                  title="เปลี่ยนรูปโปรไฟล์"
                >
                  <Camera className="w-4 h-4" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-[#CEF34B] text-black text-xs font-black mb-1 shadow-xs">
                  {role}
                </span>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-slate-700 hover:text-black underline inline-flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    เปลี่ยนรูปโปรไฟล์
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: 5 Clean Read-Only Fields Grid */}
            <div className="flex-1 w-full space-y-3.5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. ชื่อ-นามสกุล */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>ชื่อ-นามสกุล</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={cleanName}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-bold cursor-not-allowed shadow-xs"
                  />
                </div>

                {/* 2. รหัสนักศึกษา */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>รหัสนักศึกษา</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={studentId}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold cursor-not-allowed shadow-xs"
                  />
                </div>

                {/* 3. สาขา */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>สาขา</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={branch}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold cursor-not-allowed shadow-xs truncate"
                  />
                </div>

                {/* 4. คณะ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>คณะ</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={faculty}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold cursor-not-allowed shadow-xs truncate"
                  />
                </div>
              </div>

              {/* 5. อีเมล (Full Width) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>อีเมลประจำตัว (ใช้อีเมลและรหัสเดิมสำหรับทุกบทบาท)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={userEmail}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold cursor-not-allowed shadow-xs"
                />
              </div>

            </div>

          </div>

          {/* Section: บทบาทที่ได้รับมอบหมาย & สลับบทบาท */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3.5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#CEF34B]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  บทบาทที่ได้รับมอบหมาย
                </span>
              </div>
              {onOpenRoleRequest && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRoleRequest();
                  }}
                  className="text-[11px] font-bold text-[#CEF34B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ศูนย์จัดการสิทธิ์และบทบาท</span>
                </button>
              )}
            </div>

            {/* Badges of all assigned roles */}
            <div className="flex flex-wrap gap-2">
              {userRoles.map((r) => {
                const isActive = (r === 'COURSE_CREATOR_APPROVER' || r === 'APPROVER') ? isCurrentlyInApprover :
                                 r === 'STUDENT' ? isCurrentlyInStudent :
                                 r === role;
                return (
                  <span
                    key={r}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border transition-all ${
                      isActive
                        ? 'bg-[#CEF34B] text-black border-[#CEF34B] shadow-xs'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{r}</span>
                    {isActive && <span className="text-[10px] font-bold text-slate-800">(ใช้งานอยู่)</span>}
                  </span>
                );
              })}
            </div>

            {/* One-Click Role Switch Action Buttons */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                สลับโหมดการทำงานได้ทันที โดยใช้บัญชีและรหัสเดิม ไม่ต้องเข้าสู่ระบบใหม่
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* ถ้ามี role อนุมัติ และไม่ได้อยู่ในหน้าอนุมัติ -> แสดงปุ่มสลับไปหน้าคนอนุมัติ */}
                {hasApproverRole && !isCurrentlyInApprover && (
                  <button
                    type="button"
                    onClick={handleSwitchToApprover}
                    className="px-4 py-2 rounded-full bg-[#CEF34B] hover:bg-[#bde53d] text-black text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>สลับไปโหมดผู้อนุมัติ</span>
                  </button>
                )}

                {/* ถ้าอยู่ในหน้าอนุมัติ และมี role นักเรียน -> แสดงปุ่มสลับกลับมาหน้านักเรียน */}
                {isCurrentlyInApprover && hasStudentRole && (
                  <button
                    type="button"
                    onClick={handleSwitchToStudent}
                    className="px-4 py-2 rounded-full bg-[#CEF34B] hover:bg-[#bde53d] text-black text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>สลับกลับสู่โหมดนักศึกษา</span>
                  </button>
                )}

                {/* หากมีบทบาทอาจารย์ และไม่ได้อยู่ในหน้าจัดการการสอน */}
                {hasProfessorRole && !pathname?.startsWith('/professor') && (
                  <button
                    type="button"
                    onClick={() => { onClose(); router.push('/professor'); }}
                    className="px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-[#CEF34B] text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-slate-700"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>สลับไประบบจัดการการสอน</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Close Button */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
