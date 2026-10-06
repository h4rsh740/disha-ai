'use client';

import { ShieldCheck, ExternalLink, Award, Sparkles, Building2 } from 'lucide-react';
import { GOV_VERIFIED_SCHEMES, GovScheme } from '@/lib/gov/skill-india';

export function GovSchemesCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="font-bold text-[#1a2e5a] text-base">
              Verified Government Schemes & Subsidies
            </h3>
            <p className="text-xs text-[#64748b]">
              Ministry of Skill Development & Entrepreneurship (MSDE) & Skill India Digital Hub
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={12} /> Live Govt Portal
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {GOV_VERIFIED_SCHEMES.map((scheme: GovScheme) => (
          <div
            key={scheme.id}
            className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded">
                  {scheme.code}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  {scheme.verificationBadge}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#1a2e5a] mb-1">
                {scheme.name}
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed line-clamp-2 mb-2">
                {scheme.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Benefit</span>
                  <span className="font-semibold text-emerald-700">{scheme.stipendOrSubsidy}</span>
                </div>
                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold text-xs ml-2 flex-shrink-0"
                >
                  Apply <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748b]">
        <div className="flex items-center gap-2">
          <Building2 size={13} className="text-slate-400" />
          <span>Locate nearest PM Kaushal Kendra (PMKK) or Govt ITI across 750+ districts</span>
        </div>
        <a
          href="https://www.skillindiadigital.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline font-semibold flex items-center gap-1"
        >
          Explore Skill India Digital Hub <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
