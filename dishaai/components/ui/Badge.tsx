import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-[#1a2e5a] text-white',
  success: 'bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]',
  warning: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
  error:   'bg-[#fff1f2] text-[#e11d48] border border-[#ffe4e6]',
  info:    'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]',
  neutral: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full leading-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
