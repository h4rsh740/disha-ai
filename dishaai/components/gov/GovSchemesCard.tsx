'use client';

import { ShieldCheck, ExternalLink, Sparkles, Building2 } from 'lucide-react';
import { GOV_VERIFIED_SCHEMES, GovScheme } from '@/lib/gov/skill-india';
import { Disclosure } from '@/components/ui/Disclosure';

export function GovSchemesCard({ className = '', collapsible = false }: { className?: string; collapsible?: boolean }) {
  const content = (
    <>
      <div className={`grid gap-3.5 ${collapsible ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {GOV_VERIFIED_SCHEMES.map((scheme: GovScheme) => (
          <div
            key={scheme.id}
            className="p-4 rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] hover:border-[var(--ui-accent)] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-[var(--ui-accent)] bg-[var(--ui-surface-3,#241c14)] px-2 py-0.5 rounded-sm border border-[rgba(230,155,83,0.2)]">
                  {scheme.code}
                </span>
                <span className="text-[10px] text-[var(--ui-success)] bg-[rgba(120,163,109,0.1)] border border-[rgba(120,163,109,0.25)] px-2 py-0.5 rounded-sm">
                  {scheme.verificationBadge}
                </span>
              </div>
              <h4 className="font-medium text-sm text-[var(--ui-text)] mb-1">
                {scheme.name}
              </h4>
              <p className="text-xs text-[var(--ui-muted)] leading-relaxed line-clamp-2 mb-2">
                {scheme.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--ui-border)]">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[var(--ui-faint)] block uppercase tracking-wider">Benefit</span>
                  <span className="font-medium text-[var(--ui-success)]">{scheme.stipendOrSubsidy}</span>
                </div>
                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--ui-accent)] hover:underline text-xs ml-2 flex-shrink-0"
                >
                  Apply <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--ui-border)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ui-muted)]">
        <div className="flex items-center gap-2">
          <Building2 size={13} className="text-[var(--ui-faint)] flex-shrink-0" />
          <span>Locate nearest PM Kaushal Kendra (PMKK) or Govt ITI across 750+ districts</span>
        </div>
        <a
          href="https://www.skillindiadigital.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--ui-accent)] hover:underline flex items-center gap-1"
        >
          Explore Skill India Digital Hub <ExternalLink size={11} />
        </a>
      </div>
    </>
  );

  if (collapsible) {
    return <Disclosure title="Schemes & support" description={`${GOV_VERIFIED_SCHEMES.length} official portal links`} icon={<ShieldCheck size={17} />} className={className}>{content}</Disclosure>;
  }

  return (
    <div className={`paper-panel p-4 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="ui-icon" aria-hidden="true"><ShieldCheck size={18} /></span>
          <div><h3 className="section-title">Schemes & support</h3><p className="ui-note mt-1">Ministry of Skill Development & Entrepreneurship (MSDE) & Skill India Digital Hub</p></div>
        </div>
        <span className="ui-chip text-[var(--ui-success)]"><Sparkles size={12} aria-hidden="true" /> Official portal links</span>
      </div>
      {content}
    </div>
  );
}
