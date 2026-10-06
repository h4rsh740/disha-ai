'use client';

import { ShieldCheck, Sparkles } from 'lucide-react';

export function GovBanner() {
  return (
    <header className="w-full bg-[#0a192f] text-white border-b border-[#1e293b] text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 font-semibold text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff9933] inline-block" title="Saffron" />
          <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" title="White" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#138808] inline-block" title="Green" />
          <span className="ml-1 tracking-wide">भारत सरकार | Government of India</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-300 hidden sm:inline font-medium">
          Ministry of Skill Development & Entrepreneurship (MSDE)
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="flex items-center gap-1 text-sky-400 font-medium">
          <ShieldCheck size={13} className="text-sky-400" />
          MeriPehchan / APAAR
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <Sparkles size={13} className="text-emerald-400" />
          Bhashini AI (22 Langs)
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-amber-400 font-medium">
          Skill India Digital Hub
        </span>
      </div>
    </header>
  );
}
