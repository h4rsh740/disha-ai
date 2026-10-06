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
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className, hover = false, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-[#e2e8f0] rounded-2xl shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-[0_4px_20px_rgba(26,46,90,0.12)] hover:border-[#c5d9f0] hover:-translate-y-0.5 cursor-pointer',
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
          <div className="w-9 h-9 bg-[#f0f4ff] rounded-xl flex items-center justify-center text-[#1a2e5a]">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[#1a2e5a] text-base leading-tight">{title}</h3>
          {subtitle && <p className="text-[#64748b] text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
