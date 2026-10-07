'use client';
import { cn, scoreColor } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  ariaLabel?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'auto';
  className?: string;
  animated?: boolean;
}

const sizeClasses = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

const colorClasses = {
  primary: 'bg-gradient-to-r from-[#b5712a] to-[#e69b53]',
  success: 'bg-gradient-to-r from-[#5a8052] to-[#78a36d]',
  warning: 'bg-gradient-to-r from-[#c9803a] to-[#e69b53]',
};

function getAutoTone(value: number): 'success' | 'warning' | 'error' {
  return value >= 75
    ? 'success'
    : value >= 55
    ? 'warning'
    : 'error';
}

export function Progress({
  value,
  max = 100,
  label,
  ariaLabel,
  sublabel,
  showValue = false,
  size = 'md',
  color = 'primary',
  className,
  animated = false,
}: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const boundedValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0;
  const pct = (boundedValue / safeMax) * 100;
  const tone = color === 'auto' ? getAutoTone(pct) : color;
  const fillClass = tone === 'error' ? 'bg-gradient-to-r from-[#c9583f] to-[#e06d53]' : colorClasses[tone];

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {label && <span className="text-sm font-medium text-[var(--ui-text,#f6efe5)]">{label}</span>}
          {sublabel && <span className="text-xs text-[var(--ui-faint,#8a7e72)]">{sublabel}</span>}
          {showValue && (
            <span
              className="text-sm font-bold"
              style={{ color: color === 'auto' ? scoreColor(pct) : undefined }}
            >
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-[var(--ui-surface-2,#1c1712)] rounded-full overflow-hidden border border-[var(--ui-border,rgba(246,239,229,0.14))]',
          sizeClasses[size],
        )}
      >
        <div
          data-tone={tone}
          className={cn(
            'disha-progress-fill',
            'h-full rounded-full',
            fillClass,
            animated && 'transition-all duration-700 ease-out',
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-label={ariaLabel ?? label ?? 'Progress'}
          aria-valuenow={boundedValue}
          aria-valuetext={`${Math.round(pct)}%`}
          aria-valuemin={0}
          aria-valuemax={safeMax}
        />
      </div>
    </div>
  );
}

// ---- Score Ring (circular) ----

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 8,
  label,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ui-border, #e2e8f0)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}%</span>
        {label && <span className="text-[10px] text-[var(--ui-faint,#94a3b8)] leading-tight text-center">{label}</span>}
      </div>
    </div>
  );
}
