'use client';

import { useId, useRef, useState, useSyncExternalStore } from 'react';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_GOV_LANGUAGES, BhashiniLanguage } from '@/lib/gov/bhashini';

interface LanguageSelectorProps {
  onLanguageChange?: (langCode: string) => void;
  className?: string;
}

const LANGUAGE_EVENT = 'disha-language-change';
function subscribeLanguage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(LANGUAGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LANGUAGE_EVENT, onChange);
  };
}
const readLanguage = () => localStorage.getItem('disha_language_pref') || 'en';
const serverLanguage = () => 'en';

export function LanguageSelector({ onLanguageChange, className = '' }: LanguageSelectorProps) {
  const currentLang = useSyncExternalStore(subscribeLanguage, readLanguage, serverLanguage);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelect = (code: string) => {
    localStorage.setItem('disha_language_pref', code);
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
    closeMenu();
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  const selected = SUPPORTED_GOV_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_GOV_LANGUAGES[0];

  return (
    <div className={`language-control relative inline-block text-left ${className}`} onKeyDown={(event) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      }
    }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="language-control__trigger inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-[var(--ui-border,rgba(246,239,229,0.14))] bg-[var(--ui-surface,#15110e)] text-xs font-medium text-[var(--ui-text,#f6efe5)] hover:bg-[var(--ui-surface-2,#1c1712)] transition-colors"
        aria-label={`Language: ${selected.name}. Change language`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
      >
        <Globe size={14} className="text-[var(--ui-accent,#e69b53)]" />
        <span className="language-control__name">{selected.nativeName}</span>
        <span className="language-control__translation text-[var(--ui-faint,#8a7e72)] text-[10px]">({selected.name})</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div id={menuId} role="group" aria-label="Supported languages" className="language-control__menu absolute right-0 mt-2 w-56 rounded-sm bg-[var(--ui-surface-2,#1c1712)] shadow-2xl z-50 py-1.5 max-h-72 overflow-y-auto border border-[var(--ui-border,rgba(246,239,229,0.14))]">
            <div className="px-3 py-2 border-b border-[var(--ui-border,rgba(246,239,229,0.14))] bg-[var(--ui-surface,#15110e)]">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--ui-muted,#b2a69a)]">
                भाषिणी · Bhashini (MeitY)
              </p>
              <p className="text-[10px] text-[var(--ui-faint,#8a7e72)]">22 Official Indian Languages</p>
            </div>
            {SUPPORTED_GOV_LANGUAGES.map((lang: BhashiniLanguage) => {
              const isActive = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[rgba(230,155,83,0.14)] text-[var(--ui-accent,#e69b53)] font-semibold'
                      : 'text-[var(--ui-text,#f6efe5)] hover:bg-[var(--ui-surface-3,#241c14)]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-[var(--ui-faint,#8a7e72)]">{lang.name}</span>
                  </div>
                  {isActive && <Check size={14} className="text-[var(--ui-accent,#e69b53)]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
