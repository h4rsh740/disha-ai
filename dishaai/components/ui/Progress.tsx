'use client';
import { cn, scoreColor } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'auto';
  className?: string;
  animated?: boolean;
}

const sizeClasses = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

const colorClasses = {
  primary: 'bg-gradient-to-r from-[#1a2e5a] to-[#0ea5e9]',
  success: 'bg-gradient-to-r from-[#10b981] to-[#34d399]',
  warning: 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]',
};

function getAutoColor(value: number): string {
  return value >= 75
    ? colorClasses.success
    : value >= 50
    ? colorClasses.warning
    : 'bg-gradient-to-r from-[#e11d48] to-[#f43f5e]';
}

export function Progress({
  value,
  max = 100,
  label,
  sublabel,
  showValue = false,
  size = 'md',
  color = 'primary',
  className,
  animated = false,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillClass = color === 'auto' ? getAutoColor(pct) : colorClasses[color];

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-[#1a2e5a]">{label}</span>}
          {sublabel && <span className="text-xs text-[#94a3b8]">{sublabel}</span>}
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
          'w-full bg-[#e2e8f0] rounded-full overflow-hidden',
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            fillClass,
            animated && 'transition-all duration-700 ease-out',
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
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
          stroke="#e2e8f0"
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
        {label && <span className="text-[10px] text-[#94a3b8] leading-tight text-center">{label}</span>}
      </div>
    </div>
  );
}
