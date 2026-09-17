import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'luxury' | 'bronze' | 'ios';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-extrabold transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none whitespace-nowrap';

  const shapeClass = pill ? 'rounded-full' : 'rounded-xl';

  const variants = {
    primary: 'bg-[#CEF34B] hover:bg-[#bce038] text-black shadow-sm font-extrabold',
    ios: 'bg-black hover:bg-slate-900 text-white shadow-sm font-extrabold',
    luxury: 'bg-black hover:bg-slate-900 text-[#CEF34B] border border-black shadow-sm font-extrabold',
    bronze: 'bg-black hover:bg-slate-900 text-white font-bold',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 font-bold',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs',
    ghost: 'text-slate-700 hover:bg-slate-100 font-bold',
    success: 'bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold shadow-sm',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs font-bold gap-2',
    lg: 'px-5 py-2.5 text-sm font-bold gap-2',
  };

  return (
    <button
      className={clsx(baseStyles, shapeClass, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

