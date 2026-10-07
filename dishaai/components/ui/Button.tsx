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
    'bg-[var(--ui-accent,#e69b53)] hover:bg-[var(--ui-accent-hover,#f5af69)] text-[var(--ui-on-accent,#0a0806)] font-semibold shadow-sm active:scale-[0.98]',
  secondary:
    'bg-[var(--ui-surface-2,#1c1712)] hover:bg-[var(--ui-surface-3,#241c14)] text-[var(--ui-text,#f6efe5)] border border-[var(--ui-border,rgba(246,239,229,0.14))] active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-[var(--ui-surface-2,#1c1712)] text-[var(--ui-muted,#b2a69a)] hover:text-[var(--ui-text,#f6efe5)] active:scale-[0.98]',
  outline:
    'bg-transparent border border-[var(--ui-border,rgba(246,239,229,0.14))] hover:border-[var(--ui-accent,#e69b53)] hover:bg-[var(--ui-surface-2,#1c1712)] text-[var(--ui-text,#f6efe5)] active:scale-[0.98]',
  danger:
    'bg-[var(--ui-red,#e06d53)] hover:bg-[var(--ui-red-hover,#ee866f)] text-[var(--ui-on-danger,#0a0806)] shadow-sm active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-sm',
  md: 'px-4 py-2 text-sm gap-2 rounded-sm',
  lg: 'px-6 py-2.5 text-base gap-2.5 rounded-sm',
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
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={cn(
        'disha-button inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'focus-visible:outline-2 focus-visible:outline-[var(--ui-accent,#e69b53)] focus-visible:outline-offset-2',
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
