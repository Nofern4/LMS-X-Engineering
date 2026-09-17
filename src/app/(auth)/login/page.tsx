'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertTriangle, ArrowRight, Lock, Eye, EyeOff, Wrench, ShieldCheck, KeyRound, Mail, GraduationCap, UserCheck, Phone } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('student@student.x-karchang.ac.th');
  const [password, setPassword] = useState('xkarchang2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('demo_user_email', data.user.email);
      localStorage.setItem('user_session', JSON.stringify(data.user));

      const roles: string[] = data.user.roles || [];
      if (roles.includes('REGISTRAR')) {
        router.push('/registrar');
      } else if (roles.includes('DIRECTOR')) {
        router.push('/director');
      } else if (roles.includes('PROFESSOR')) {
        router.push('/professor');
      } else if (roles.includes('COURSE_CREATOR_APPROVER') || roles.includes('CONTENT_APPROVER') || roles.includes('APPROVER')) {
        router.push('/course-approver');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      setError('ไม่สามารถเชื่อมต่อกับระบบ มหาวิทยาลัย Xการช่าง ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('xkarchang2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between items-center py-0 px-0 font-sans">
      
      {/* Top Pop-Up Info Bar (Matching Screenshot) */}
      <div className="w-full bg-black text-white text-xs sm:text-sm py-2.5 px-4 sm:px-8 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-4 text-slate-300 font-medium text-xs">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-[#CEF34B]" />
            +1800-123-3474
          </span>
          <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5 text-[#CEF34B]" />
            support@x-karchang.ac.th
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-300 font-semibold">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Marketplace</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
        </div>

      </div>

      {/* Main Login Card Section */}
      <main className="max-w-md w-full mx-auto my-auto py-10 px-4 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-2">
          <div className="flex justify-center items-center">
            <img src="/images/logo.png" alt="X Engineering Logo" className="h-28 w-auto object-contain drop-shadow-md" />
          </div>
          <p className="text-sm text-slate-600 font-medium">
            ระบบสารสนเทศการเรียนรู้ออนไลน์ (X-Mechanics LMS)
          </p>
          <div className="p-3 rounded-2xl bg-slate-900 text-slate-200 text-xs font-medium text-center leading-relaxed border border-slate-700 shadow-sm">
            🔒 ใช้เข้าสู่ระบบด้วย<strong>อีเมลสถาบัน / รหัสนักศึกษา</strong> และรหัสผ่านแรกเข้าศึกษา (ไม่มีเปิดรับสมัครสมาชิกใหม่)
          </div>
        </div>

        {/* Clean Black, White & Lime Accent (#CEF34B) Minimal Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-9 space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-black" />
                <span>อีเมลมหาวิทยาลัย / รหัสนักศึกษา</span>
              </label>
              <input
                type="text"
                required
                placeholder="student@student.x-karchang.ac.th หรือ รหัสนักศึกษา"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#CEF34B] focus:border-black focus:bg-white transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-black" />
                <span>รหัสผ่าน</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#CEF34B] focus:border-black focus:bg-white transition-all shadow-xs pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button (Lime Green #CEF34B Pill Button with Dark Arrow Circle - Matching Screenshot) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold py-3.5 text-base rounded-full shadow-md transition-all flex items-center justify-between px-6 active:scale-[0.99]"
            >
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'Get Started / เข้าสู่ระบบ'}</span>
              <div className="w-7 h-7 rounded-full bg-black text-[#CEF34B] flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </form>

          {/* Quick Role Select Buttons */}
          <div className="pt-5 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              เลือกบทบาทเพื่อเข้าสู่ระบบทดสอบทันที:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('student@student.x-karchang.ac.th')}
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-[#CEF34B]/30 border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-black" /> 1. นักเรียน / นักศึกษา (Student)
                </span>
                <span className="text-xs text-slate-500 font-mono">student@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('professor@x-karchang.ac.th')}
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-[#CEF34B]/30 border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-black" /> 2. อาจารย์ / ครูผู้สอน (Professor)
                </span>
                <span className="text-xs text-slate-500 font-mono">professor@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('course.approver@x-karchang.ac.th')}
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-[#CEF34B]/30 border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-black" /> 3. คนอนุมัติคอร์ส (Approver)
                </span>
                <span className="text-xs text-slate-500 font-mono">approver@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('director@x-karchang.ac.th')}
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-[#CEF34B]/30 border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <Eye className="w-5 h-5 text-black" /> 4. ผู้อำนวยการ (Director)
                </span>
                <span className="text-xs text-slate-500 font-mono">director@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('registrar@x-karchang.ac.th')}
                className="w-full p-3.5 rounded-xl bg-[#CEF34B]/20 hover:bg-[#CEF34B]/40 border border-[#CEF34B] text-black font-extrabold text-sm flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-black" /> 5. นายทะเบียน (Registrar)
                </span>
                <span className="text-xs text-slate-700 font-mono">registrar@...</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 font-medium">
        © 2026 มหาวิทยาลัย Xการช่าง (X-Mechanics LMS). All Rights Reserved.
      </footer>
    </div>
  );
}
