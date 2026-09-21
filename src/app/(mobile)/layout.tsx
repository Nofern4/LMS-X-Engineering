'use client';

import React from 'react';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      {/* Fixed top bar */}
      <MobileTopBar />

      {/* Scrollable content area */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>

      {/* Fixed bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
