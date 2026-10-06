'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, LogOut, CheckCircle2 } from 'lucide-react';
import {
  GovCitizenSession,
  DEMO_CITIZEN_SESSION,
  getStoredGovSession,
  saveGovSession,
  clearGovSession,
} from '@/lib/gov/meripehchan';

interface MeriPehchanLoginProps {
  onSessionChange?: (session: GovCitizenSession | null) => void;
  className?: string;
}

export function MeriPehchanLogin({ onSessionChange, className = '' }: MeriPehchanLoginProps) {
  const [session, setSession] = useState<GovCitizenSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const active = getStoredGovSession();
    if (active) {
      setSession(active);
      if (onSessionChange) onSessionChange(active);
    }
  }, [onSessionChange]);

  const handleLogin = (provider: 'MeriPehchan' | 'DigiLocker' | 'APAAR') => {
    setLoading(true);
    setTimeout(() => {
      const newSession: GovCitizenSession = {
        ...DEMO_CITIZEN_SESSION,
        authProvider: provider,
        verifiedAt: new Date().toISOString(),
      };
      saveGovSession(newSession);
      setSession(newSession);
      setLoading(false);
      setIsOpen(false);
      if (onSessionChange) onSessionChange(newSession);
    }, 600);
  };

  const handleLogout = () => {
    clearGovSession();
    setSession(null);
    if (onSessionChange) onSessionChange(null);
  };

  if (session && session.isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <ShieldCheck size={15} className="text-emerald-600 flex-shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-semibold leading-tight flex items-center gap-1">
              {session.name}
              <CheckCircle2 size={12} className="text-emerald-600" />
            </span>
            <span className="text-[10px] text-emerald-600 leading-tight">
              {session.authProvider} · {session.apaarId ? 'APAAR Verified' : 'Citizen SSO'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Sign out from MeriPehchan"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a2e5a] hover:bg-[#0f1e3c] text-white text-xs font-semibold shadow-sm transition-colors ${className}`}
      >
        <ShieldCheck size={14} className="text-sky-400" />
        <span>MeriPehchan / APAAR Sign In</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-900 text-sky-400 flex items-center justify-center font-bold text-xs">
                  MP
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">MeriPehchan (मेरी पहचान)</h3>
                  <p className="text-[11px] text-slate-500">National Single Sign-On (NSSO) · Digital India</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="py-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your official Citizen Identity to automatically import verified educational qualifications (Class 8th/10th/12th/ITI) and enable government scholarship matching.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  disabled={loading}
                  onClick={() => handleLogin('MeriPehchan')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block group-hover:text-sky-900">
                        MeriPehchan (Jan Parichay)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Direct National SSO login for Indian citizens
                      </span>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-slate-300 group-hover:text-sky-600" />
                </button>

                <button
                  disabled={loading}
                  onClick={() => handleLogin('APAAR')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                      ID
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block group-hover:text-emerald-900">
                        APAAR / One Nation One Student ID
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Ministry of Education & Academic Bank of Credits
                      </span>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-slate-300 group-hover:text-emerald-600" />
                </button>

                <button
                  disabled={loading}
                  onClick={() => handleLogin('DigiLocker')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      DL
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block group-hover:text-blue-900">
                        DigiLocker Verified Marksheet
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Verify CBSE / State Board Roll Number
                      </span>
                    </div>
                  </div>
                  <UserCheck size={16} className="text-slate-300 group-hover:text-blue-600" />
                </button>
              </div>

              {loading && (
                <div className="text-center py-2 text-xs text-sky-600 font-medium animate-pulse">
                  Connecting to Digital India Gateway...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">
                Data protected under Digital Personal Data Protection (DPDP) Act, 2023
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
