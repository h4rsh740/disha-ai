'use client';

import { Sparkles, Award } from 'lucide-react';

export function GovBanner() {
  return (
    <header className="w-full bg-[#0e0a07] text-[#f6efe5] border-b border-[rgba(246,239,229,0.1)] text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 font-semibold text-[#f6efe5]">
          <span className="w-2 h-2 rounded-full bg-[#ff9933] inline-block" title="Saffron" />
          <span className="w-2 h-2 rounded-full bg-white inline-block" title="White" />
          <span className="w-2 h-2 rounded-full bg-[#138808] inline-block" title="Green" />
          <span className="ml-1 tracking-wide">भारत सरकार | Government of India</span>
        </div>
        <span className="text-[#8a7e72] hidden sm:inline">|</span>
        <span className="text-[#b2a69a] hidden sm:inline font-medium">
          Ministry of Skill Development & Entrepreneurship (MSDE)
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="flex items-center gap-1 text-[#e69b53] font-medium">
          <Award size={13} className="text-[#e69b53]" />
          Skill India Digital Hub
        </span>
        <span className="text-[#8a7e72]">·</span>
        <span className="flex items-center gap-1 text-[#78a36d] font-medium">
          <Sparkles size={13} className="text-[#78a36d]" />
          Bhashini AI (22 Langs)
        </span>
      </div>
    </header>
  );
}
