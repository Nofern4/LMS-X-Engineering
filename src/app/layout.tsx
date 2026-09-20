import type { Metadata } from 'next';
import './globals.css';
import { GlobalTranslator } from '@/lib/i18n/usePageTranslator';

export const metadata: Metadata = {
  title: 'Institutional LMS Platform',
  description: 'Enterprise Learning Management System for Higher Education & Institutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased bg-slate-50 text-slate-900 font-sans">
        <GlobalTranslator />
        {children}
      </body>
    </html>
  );
}
