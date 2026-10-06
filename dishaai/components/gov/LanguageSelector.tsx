'use client';

import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_GOV_LANGUAGES, BhashiniLanguage } from '@/lib/gov/bhashini';

interface LanguageSelectorProps {
  onLanguageChange?: (langCode: string) => void;
  className?: string;
}

export function LanguageSelector({ onLanguageChange, className = '' }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('disha_language_pref');
    if (saved) {
      setCurrentLang(saved);
    }
  }, []);

  const handleSelect = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('disha_language_pref', code);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  const selected = SUPPORTED_GOV_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_GOV_LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        aria-label="Select language via Bhashini"
      >
        <Globe size={14} className="text-sky-600" />
        <span className="font-semibold text-slate-900">{selected.nativeName}</span>
        <span className="text-slate-400 text-[10px]">({selected.name})</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50 py-1.5 max-h-72 overflow-y-auto border border-slate-100">
            <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                भाषिणी · Bhashini (MeitY)
              </p>
              <p className="text-[10px] text-slate-400">22 Official Indian Languages</p>
            </div>
            {SUPPORTED_GOV_LANGUAGES.map((lang: BhashiniLanguage) => {
              const isActive = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </div>
                  {isActive && <Check size={14} className="text-sky-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
