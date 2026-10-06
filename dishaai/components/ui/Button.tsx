'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses = {
  primary:
    'bg-[#1a2e5a] hover:bg-[#0f1e3c] text-white shadow-sm hover:shadow-[0_4px_14px_rgba(26,46,90,0.3)] active:scale-[0.98]',
  secondary:
    'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm hover:shadow-[0_4px_14px_rgba(14,165,233,0.3)] active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-[#f0f4ff] text-[#1a2e5a] active:scale-[0.98]',
  outline:
    'bg-white border border-[#e2e8f0] hover:border-[#1a2e5a] hover:bg-[#f0f4ff] text-[#1a2e5a] active:scale-[0.98]',
  danger:
    'bg-[#e11d48] hover:bg-[#be123c] text-white shadow-sm active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'focus-visible:outline-2 focus-visible:outline-[#0ea5e9] focus-visible:outline-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        iconPosition === 'left' && icon
      )}
      {children}
      {!loading && iconPosition === 'right' && icon}
    </button>
  );
}
