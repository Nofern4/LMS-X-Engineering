'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col justify-center items-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">ไม่มีระบบสมัครสมาชิกใหม่</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          บัญชีผู้ใช้งานถูกจัดสร้างให้อัตโนมัติเมื่อแรกเข้าศึกษา กรุณาเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย หรือ รหัสนักศึกษา
        </p>
        <Link href="/login" className="inline-block bg-[#CEF34B] text-black font-extrabold px-6 py-3 rounded-full text-sm">
          ไปหน้าเข้าสู่ระบบ (Login)
        </Link>
      </div>
    </div>
  );
}
