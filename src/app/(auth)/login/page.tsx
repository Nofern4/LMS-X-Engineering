'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between items-center py-6 px-4 font-sans">

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
                <span>อีเมลมหาวิทยาลัย </span>
              </label>
              <input
                type="text"
                required
                placeholder=""
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
                  placeholder=""
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

            {/* Primary Action Button (Lime Green #CEF34B Pill Button with Dark Arrow Circle) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold py-3.5 text-base rounded-full shadow-md transition-all flex items-center justify-between px-6 active:scale-[0.99]"
            >
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <div className="w-7 h-7 rounded-full bg-black text-[#CEF34B] flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </form>

        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 font-medium">
        © 2026 มหาวิทยาลัย Xการช่าง (X-Mechanics LMS). All Rights Reserved.
      </footer>
    </div>
  );
}
