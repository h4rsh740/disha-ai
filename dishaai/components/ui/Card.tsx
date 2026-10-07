'use client';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ children, className, hover = false, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'disha-card bg-[var(--ui-surface,#15110e)] border border-[var(--ui-border,rgba(246,239,229,0.14))] text-[var(--ui-text,#f6efe5)] rounded-md shadow-sm',
        hover && 'disha-card--hover transition-all duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] hover:border-[var(--ui-accent,#e69b53)] hover:-translate-y-0.5 cursor-pointer',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="ui-icon w-9 h-9 bg-[var(--ui-surface-2,#1c1712)] rounded flex items-center justify-center text-[var(--ui-accent,#e69b53)]">
            {icon}
          </div>
        )}
        <div>
          <h3 className="section-title text-[var(--ui-text,#f6efe5)] text-base leading-tight">{title}</h3>
          {subtitle && <p className="text-[var(--ui-muted,#b2a69a)] text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
