import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  dark?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = false, dark = false, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-2xl transition-all duration-200 overflow-hidden',
        dark
          ? 'bg-[#1c1c1e] text-white border border-[#2c2c2e] shadow-ios-md'
          : 'bg-white text-[#1c1c1e] border border-[#e5e5ea] shadow-ios-sm',
        hoverEffect && 'hover:shadow-ios-md hover:border-[#c7c7cc] hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('px-5 sm:px-6 py-4 border-b border-[#f2f2f7] flex items-center justify-between', className)}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('p-5 sm:p-6', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('px-5 sm:px-6 py-3.5 bg-[#f2f2f7]/50 border-t border-[#e5e5ea] flex items-center justify-between', className)}>
    {children}
  </div>
);


