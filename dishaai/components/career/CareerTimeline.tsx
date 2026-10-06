'use client';
import { useState } from 'react';
import {
  CheckCircle2, Clock, Award, Briefcase, TrendingUp, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CareerPathStep } from '@/types';

interface CareerTimelineProps {
  steps: CareerPathStep[];
  pathwayName?: string;
}

const stepTypeConfig = {
  education: { color: '#1a2e5a', bg: '#eef4fb', icon: Award, label: 'Education' },
  training: { color: '#0284c7', bg: '#e0f2fe', icon: Zap, label: 'Training' },
  certification: { color: '#d97706', bg: '#fffbeb', icon: Award, label: 'Certification' },
  work: { color: '#059669', bg: '#ecfdf5', icon: Briefcase, label: 'Work' },
  advancement: { color: '#7c3aed', bg: '#f5f3ff', icon: TrendingUp, label: 'Growth' },
};

interface StepNodeProps {
  step: CareerPathStep;
  isLast: boolean;
  isActive?: boolean;
}

function StepNode({ step, isLast, isActive = false }: StepNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const config = stepTypeConfig[step.step_type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-5 top-10 bottom-0 w-0.5 z-0"
          style={{
            background: 'linear-gradient(180deg, #0ea5e9 0%, #e2e8f0 100%)',
          }}
        />
      )}

      {/* Node dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200',
            isActive ? 'scale-110 shadow-md' : '',
          )}
          style={{
            backgroundColor: config.bg,
            borderColor: config.color,
          }}
        >
          <Icon size={18} style={{ color: config.color }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-8 min-w-0">
        <button
          onClick={() => setExpanded((p) => !p)}
          className={cn(
            'w-full text-left bg-white border rounded-xl p-4 transition-all duration-200 group',
            expanded
              ? 'border-[#0ea5e9] shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
              : 'border-[#e2e8f0] hover:border-[#c5d9f0] hover:shadow-sm',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: config.color, backgroundColor: config.bg }}
                >
                  {config.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <Clock size={11} />
                  {step.duration}
                </span>
              </div>
              <h4 className="font-semibold text-[#1a2e5a] text-sm">{step.title}</h4>
              <p className="text-xs text-[#64748b] mt-0.5 leading-snug">{step.description}</p>
            </div>
            <div className="flex-shrink-0 text-[#94a3b8] group-hover:text-[#1a2e5a] transition-colors">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {/* Expanded content */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-[#f1f5f9] space-y-3">
              {step.skills_gained.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] mb-1.5">Skills gained</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.skills_gained.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-0.5 bg-[#f0f4ff] text-[#1a2e5a] border border-[#c5d9f0] rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.certifications && step.certifications.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] mb-1.5">Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] rounded-full font-medium"
                      >
                        <Award size={10} />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.possible_roles && step.possible_roles.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#475569] mb-1.5">Possible roles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.possible_roles.map((role) => (
                      <span
                        key={role}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] rounded-full font-medium"
                      >
                        <Briefcase size={10} />
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {step.next_step_hint && (
                <div className="flex items-start gap-2 p-3 bg-[#f0f4ff] rounded-lg">
                  <CheckCircle2 size={14} className="text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1a2e5a] leading-snug">
                    <span className="font-semibold">Next: </span>
                    {step.next_step_hint}
                  </p>
                </div>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export function CareerTimeline({ steps, pathwayName }: CareerTimelineProps) {
  return (
    <div>
      {pathwayName && (
        <p className="text-sm font-semibold text-[#475569] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
          {pathwayName}
        </p>
      )}
      <div>
        {steps.map((step, index) => (
          <StepNode
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
