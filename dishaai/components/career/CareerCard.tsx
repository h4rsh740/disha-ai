'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn, scoreColor, scoreBg, formatScore } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import type { RecommendationScore } from '@/types';

interface CareerCardProps {
  recommendation: RecommendationScore;
  compact?: boolean;
  showCompare?: boolean;
  onCompare?: (id: string) => void;
  isComparing?: boolean;
}

export function CareerCard({
  recommendation,
  compact = false,
  showCompare = false,
  onCompare,
  isComparing = false,
}: CareerCardProps) {
  const router = useRouter();
  const { career, total_score, matching_skills, skill_gaps, explanation, confidence } = recommendation;

  const scoreCol = scoreColor(total_score);
  const scoreBgCol = scoreBg(total_score);

  return (
    <div
      className={cn(
        'bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden transition-all duration-200',
        'hover:shadow-[0_4px_20px_rgba(26,46,90,0.12)] hover:border-[#c5d9f0] hover:-translate-y-0.5',
        compact ? 'p-4' : 'p-5',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge
              variant={career.category === 'renewable_energy' ? 'info' : 'neutral'}
              size="sm"
            >
              {career.category.replace('_', ' ')}
            </Badge>
            {career.is_demo_data && (
              <span className="text-[10px] text-[#d97706] bg-[#fffbeb] border border-[#fef3c7] rounded-full px-2 py-0.5">
                Demo Data
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#1a2e5a] text-base leading-tight">
            {career.name}
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">{career.training_duration} training</p>
        </div>

        {/* Score */}
        <div
          className="flex-shrink-0 text-center px-3 py-2 rounded-xl"
          style={{ backgroundColor: scoreBgCol }}
        >
          <span className="text-2xl font-bold leading-none block" style={{ color: scoreCol }}>
            {total_score}%
          </span>
          <span className="text-[10px] font-medium" style={{ color: scoreCol }}>
            Match
          </span>
        </div>
      </div>

      {/* Match bar */}
      <Progress value={total_score} color="auto" size="sm" animated className="mb-4" />

      {!compact && (
        <>
          {/* Why it matches */}
          {explanation.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                Why this matches you
              </p>
              <ul className="space-y-1">
                {explanation.slice(0, 3).map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={13} className="text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-[#475569] leading-snug">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills you have */}
          {matching_skills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-[#10b981] mb-1.5">Skills you have</p>
              <div className="flex flex-wrap gap-1.5">
                {matching_skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] rounded-full text-[11px] font-medium"
                  >
                    <Check size={10} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skill gaps */}
          {skill_gaps.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#d97706] mb-1.5">Skill gaps</p>
              <div className="flex flex-wrap gap-1.5">
                {skill_gaps.slice(0, 4).map((gap) => (
                  <span
                    key={gap.skill_name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] rounded-full text-[11px] font-medium"
                  >
                    <AlertTriangle size={10} />
                    {gap.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          icon={<ChevronRight size={14} />}
          iconPosition="right"
          onClick={() => router.push(`/careers/${career.id}`)}
        >
          View Career
        </Button>
        {showCompare && (
          <Button
            variant={isComparing ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onCompare?.(career.id)}
          >
            {isComparing ? 'Comparing' : 'Compare'}
          </Button>
        )}
      </div>
    </div>
  );
}
