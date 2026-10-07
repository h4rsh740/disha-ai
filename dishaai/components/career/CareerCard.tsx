'use client';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const { career, total_score, matching_skills, skill_gaps, explanation } = recommendation;
  const hasDetails = explanation.length > 0 || matching_skills.length > 0 || skill_gaps.length > 0;

  if (compact) {
    return (
      <article data-career-card={career.id} data-comparing={isComparing || undefined} className="paper-panel min-w-0 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--ui-faint)]">{career.category.replace(/_/g, ' ')}</p>
            <h3 className="font-serif text-xl leading-tight text-[var(--ui-text)] [overflow-wrap:anywhere]">{career.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ui-muted)]">{career.training_duration} · {career.education_requirement}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="block font-serif text-3xl leading-none text-[var(--ui-accent)]">{total_score}<span className="text-base">%</span></span>
            <span className="mt-1 block text-[10px] text-[var(--ui-faint)]">Match</span>
          </div>
          <div className="flex basis-full items-center gap-2 sm:basis-auto sm:shrink-0">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" aria-label={`View ${career.name}`} icon={<ChevronRight size={13} aria-hidden="true" />} iconPosition="right" onClick={() => router.push(`/careers/${career.id}`)}>
              View career
            </Button>
            {showCompare && onCompare && (
              <Button variant={isComparing ? 'primary' : 'outline'} size="sm" aria-pressed={isComparing} aria-label={`${isComparing ? 'Remove' : 'Add'} ${career.name} ${isComparing ? 'from' : 'to'} comparison`} onClick={() => onCompare(career.id)}>
                {isComparing ? 'Comparing' : 'Compare'}
              </Button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      data-career-card={career.id}
      data-comparing={isComparing || undefined}
      className={cn(
        'paper-panel flex min-w-0 flex-col overflow-hidden border transition-colors motion-reduce:transition-none hover:border-[var(--ui-accent)]',
        isComparing && 'border-[var(--ui-accent)]',
        'p-4',
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--ui-faint)]">
              {career.category.replace(/_/g, ' ')}
            </span>
            {career.is_demo_data && (
              <span className="text-[10px] text-[var(--ui-faint)]">
                Illustrative
              </span>
            )}
          </div>
          <h3 className="font-serif text-xl leading-tight text-[var(--ui-text)] [overflow-wrap:anywhere] sm:text-2xl">
            {career.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--ui-muted)]">{career.training_duration} training</p>
        </div>

        {/* Score */}
        <div className="shrink-0 border-l border-[var(--ui-border)] pl-3 text-right">
          <span className="block font-serif text-3xl font-normal leading-none text-[var(--ui-accent)]">
            {total_score}<span className="text-base">%</span>
          </span>
          <span className="mt-1 block text-[10px] text-[var(--ui-faint)]">
            Match
          </span>
        </div>
      </div>

      {/* Match bar */}
      <Progress value={total_score} ariaLabel={`${career.name} compatibility`} color="primary" size="sm" className="mb-3" />

      {explanation[0] && <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--ui-muted)]">{explanation[0]}</p>}
      <p className="mb-3 text-xs text-[var(--ui-muted)]">
        <span className="text-[var(--ui-success)]">{matching_skills.length} skill{matching_skills.length === 1 ? '' : 's'} match</span>
        {' · '}{skill_gaps.length} to build
      </p>
      {hasDetails && (
        <div className="mb-3">
          <button type="button" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen} aria-controls={detailsId} className="flex min-h-9 items-center gap-1.5 text-xs text-[var(--ui-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ui-accent)] focus-visible:outline-offset-2">
            {detailsOpen ? 'Hide match details' : 'Why this matches'}
            <ChevronDown size={13} aria-hidden="true" className={detailsOpen ? 'rotate-180' : undefined} />
          </button>
          <div id={detailsId} hidden={!detailsOpen} className="ui-disclosure-content mt-2 border-t border-[var(--ui-border)] pt-3">
          {/* Why it matches */}
          {explanation.length > 0 && (
            <div className="mb-4">
              <p className="eyebrow mb-3 text-[var(--ui-muted)]">
                Why this matches you
              </p>
              <ul className="space-y-2">
                {explanation.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={13} className="mt-0.5 shrink-0 text-[var(--ui-success)]" />
                    <span className="text-sm leading-relaxed text-[var(--ui-muted)]">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills you have */}
          {matching_skills.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 text-xs font-medium text-[var(--ui-success)]">Skills you have</p>
              <div className="flex flex-wrap gap-1.5">
                {matching_skills.map((skill) => (
                  <span
                    key={skill}
                    className="ui-chip inline-flex items-center gap-1 text-[var(--ui-success)]"
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
              <p className="mb-2 text-xs font-medium text-[var(--ui-accent)]">Skills to build</p>
              <div className="flex flex-wrap gap-1.5">
                {skill_gaps.map((gap) => (
                  <span
                    key={gap.skill_name}
                    className="ui-chip inline-flex items-center gap-1 text-[var(--ui-accent)]"
                  >
                    <AlertTriangle size={10} />
                    {gap.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--ui-border)] pt-3">
        <Button
          variant="primary"
          size="sm"
          className="min-w-0 flex-1"
          icon={<ChevronRight size={14} />}
          iconPosition="right"
          onClick={() => router.push(`/careers/${career.id}`)}
        >
          View Career
        </Button>
        {showCompare && onCompare && (
          <Button
            variant={isComparing ? 'primary' : 'outline'}
            size="sm"
            aria-pressed={isComparing}
            aria-label={`${isComparing ? 'Remove' : 'Add'} ${career.name} ${isComparing ? 'from' : 'to'} comparison`}
            onClick={() => onCompare(career.id)}
          >
            {isComparing ? 'Comparing' : 'Compare'}
          </Button>
        )}
      </div>
    </article>
  );
}
