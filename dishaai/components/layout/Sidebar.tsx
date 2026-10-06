'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  GitBranch,
  Users,
  MessageCircle,
  BarChart3,
  ChevronRight,
  GraduationCap,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { LanguageSelector } from '@/components/gov/LanguageSelector';
import { ClerkAuthButton } from '@/components/auth/ClerkAuthButton';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/careers', label: 'Career Matches', icon: Briefcase },
  { href: '/career-path', label: 'Career Simulator', icon: GitBranch },
  { href: '/family', label: 'Family Mode', icon: Users },
  { href: '/counsellor', label: 'AI Counsellor', icon: MessageCircle },
];

const ADMIN_ITEMS = [
  { href: '/admin', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  userName?: string;
  userRole?: 'student' | 'parent' | 'admin';
}

export function Sidebar({ userName = 'Ravi Sharma', userRole = 'student' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="disha-sidebar fixed left-0 top-0 h-full w-[240px] bg-white border-r border-[#e2e8f0] flex flex-col z-40"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#e2e8f0]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#1a2e5a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#0f1e3c] transition-colors">
            <GraduationCap className="w-4.5 h-4.5 text-[#0ea5e9]" size={18} />
          </div>
          <div>
            <span className="font-bold text-[#1a2e5a] text-base leading-none">DishaAI</span>
            <p className="text-[10px] text-[#94a3b8] leading-tight mt-0.5">Career Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#1a2e5a] text-white'
                    : 'text-[#475569] hover:bg-[#f0f4ff] hover:text-[#1a2e5a]',
                )}
              >
                <Icon
                  size={18}
                  className={cn(isActive ? 'text-[#0ea5e9]' : 'text-current')}
                />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </div>

        {userRole === 'admin' && (
          <div className="mt-6">
            <p className="px-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
              Admin
            </p>
            <div className="space-y-1">
              {ADMIN_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#1a2e5a] text-white'
                        : 'text-[#475569] hover:bg-[#f0f4ff] hover:text-[#1a2e5a]',
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(isActive ? 'text-[#0ea5e9]' : 'text-current')}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Authentication & Language Controls */}
        <div className="mt-4 px-2 space-y-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Language
            </span>
            <LanguageSelector className="w-full" />
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account
            </span>
            <ClerkAuthButton className="w-full justify-center" />
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-4 mx-1 p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-xl">
          <p className="text-[11px] font-semibold text-[#d97706] mb-0.5">Disha AI</p>
          <p className="text-[11px] text-[#92400e] leading-snug">
            Career intelligence powered by Gemini & Clerk.
          </p>
        </div>
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-[#e2e8f0]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f0f4ff] transition-colors group cursor-pointer">
          <div className="w-8 h-8 bg-[#1a2e5a] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1a2e5a] truncate">{userName}</p>
            <p className="text-xs text-[#94a3b8] capitalize">{userRole}</p>
          </div>
          <LogOut
            size={15}
            className="text-[#94a3b8] group-hover:text-[#1a2e5a] flex-shrink-0"
          />
        </div>
      </div>
    </aside>
  );
}

// ---- Top Navigation (for landing / auth pages) ----

export function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e2e8f0]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1a2e5a] rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-[#0ea5e9]" />
          </div>
          <span className="font-bold text-[#1a2e5a] text-lg">DishaAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '/careers', label: 'Careers' },
            { href: '/family', label: 'For Families' },
            { href: '/counsellor', label: 'AI Counsellor' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-[#475569] hover:text-[#1a2e5a] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ClerkAuthButton />
        </div>
      </div>
    </header>
  );
}
