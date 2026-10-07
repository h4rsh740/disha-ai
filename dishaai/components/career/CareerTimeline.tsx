'use client';
import { useId, useState } from 'react';
import {
  CheckCircle2, Clock, Award, Briefcase, TrendingUp, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import type { CareerPathStep } from '@/types';

interface CareerTimelineProps {
  steps: CareerPathStep[];
  pathwayName?: string;
}

const stepTypeConfig = {
  education: { color: 'var(--ui-muted)', icon: Award, label: 'Education' },
  training: { color: 'var(--ui-accent)', icon: Zap, label: 'Training' },
  certification: { color: 'var(--ui-faint)', icon: Award, label: 'Certification' },
  work: { color: 'var(--ui-success)', icon: Briefcase, label: 'Work' },
  advancement: { color: 'var(--ui-success)', icon: TrendingUp, label: 'Growth' },
};

interface StepNodeProps {
  step: CareerPathStep;
  isLast: boolean;
}

function StepNode({ step, isLast }: StepNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const titleId = useId();
  const config = stepTypeConfig[step.step_type];
  const Icon = config.icon;

  return (
    <li className="relative flex gap-3 sm:gap-4">
      {!isLast && (
        <span className="absolute bottom-0 left-[17px] top-12 w-px bg-[var(--ui-border)]" aria-hidden="true" />
      )}

      <div className="ui-icon relative z-10 mt-4" style={{ color: config.color }} aria-hidden="true">
        <Icon size={16} />
      </div>

      <div className="paper-panel mb-3 min-w-0 flex-1 sm:mb-5">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-labelledby={titleId}
          className="group w-full rounded-sm p-3 text-left transition-colors hover:bg-[var(--ui-surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--ui-accent)] focus-visible:outline-offset-2 sm:p-5"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0 flex-1">
              <span className="mb-2 flex flex-wrap items-center gap-2">
                <span className="ui-chip" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--ui-faint)]">
                  <Clock size={11} aria-hidden="true" />
                  {step.duration}
                </span>
              </span>
              <span id={titleId} className="block font-[family-name:var(--ui-serif)] text-xl leading-tight text-[var(--ui-text)] [overflow-wrap:anywhere] sm:text-2xl">{step.title}</span>
              <span className={`mt-2 text-xs leading-relaxed text-[var(--ui-muted)] ${expanded ? 'block' : 'line-clamp-2 sm:line-clamp-none'}`}>{step.description}</span>
            </span>
            <span className="mt-1 shrink-0 text-[var(--ui-faint)] transition-colors group-hover:text-[var(--ui-accent)]" aria-hidden="true">
              {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </span>
          </span>
        </button>

        <div id={detailsId} hidden={!expanded}>
          {expanded && (
            <div className="mx-4 space-y-4 border-t border-[var(--ui-border)] py-4 sm:mx-5 sm:pb-5">
              {step.skills_gained.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--ui-muted)]">Skills gained</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.skills_gained.map((skill) => (
                      <span key={skill} className="ui-chip bg-[var(--ui-surface-2)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.certifications && step.certifications.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--ui-muted)]">Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="ui-chip"
                      >
                        <Award size={11} className="shrink-0 text-[var(--ui-faint)]" aria-hidden="true" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.possible_roles && step.possible_roles.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--ui-muted)]">Possible roles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.possible_roles.map((role) => (
                      <span
                        key={role}
                        className="ui-chip"
                      >
                        <Briefcase size={11} className="shrink-0 text-[var(--ui-success)]" aria-hidden="true" />
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.next_step_hint && (
                <div className="ui-alert flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--ui-success)]" aria-hidden="true" />
                  <p className="ui-note">
                    <span className="font-medium text-[var(--ui-text)]">Next: </span>
                    {step.next_step_hint}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function CareerTimeline({ steps, pathwayName }: CareerTimelineProps) {
  return (
    <div className="min-w-0">
      {pathwayName && (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="section-title">{pathwayName}</h2>
          <p className="ui-note">Open a step to explore</p>
        </div>
      )}
      <ol>
        {steps.map((step, index) => (
          <StepNode
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}
