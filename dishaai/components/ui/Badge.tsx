import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-[var(--ui-accent,#e69b53)] text-[var(--ui-on-accent,#0a0806)] font-semibold border border-[var(--ui-accent,#e69b53)]',
  success: 'bg-[var(--ui-success-soft,rgba(120,163,109,0.12))] text-[var(--ui-success,#78a36d)] border border-[var(--ui-border,rgba(246,239,229,0.14))]',
  warning: 'bg-[var(--ui-accent-soft,rgba(230,155,83,0.12))] text-[var(--ui-accent,#e69b53)] border border-[var(--ui-border,rgba(246,239,229,0.14))]',
  error: 'bg-[var(--ui-red-soft,rgba(224,109,83,0.12))] text-[var(--ui-red,#e06d53)] border border-[var(--ui-border,rgba(246,239,229,0.14))]',
  info: 'bg-[var(--ui-accent-soft,rgba(230,155,83,0.12))] text-[var(--ui-accent,#e69b53)] border border-[var(--ui-border,rgba(246,239,229,0.14))]',
  neutral: 'bg-[var(--ui-surface-2,#1c1712)] text-[var(--ui-muted,#b2a69a)] border border-[var(--ui-border,rgba(246,239,229,0.14))]',
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
      data-variant={variant}
      className={cn(
        'disha-badge inline-flex items-center gap-1 font-medium rounded-sm leading-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
