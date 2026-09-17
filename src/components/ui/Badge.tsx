import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'bronze' | 'luxury';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  const base = 'inline-flex items-center font-extrabold rounded-full tracking-tight transition-colors';

  const variants = {
    primary: 'bg-[#CEF34B] text-black border border-black/20',
    bronze: 'bg-black text-white border border-black',
    luxury: 'bg-black text-[#CEF34B] border border-[#CEF34B]/40',
    success: 'bg-[#CEF34B] text-black border border-black/20',
    warning: 'bg-black text-[#CEF34B] border border-slate-800',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-slate-100 text-slate-900 border border-slate-300',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};



