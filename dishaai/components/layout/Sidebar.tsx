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
  ArrowUpRight,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { LanguageSelector } from '@/components/gov/LanguageSelector';
import { FirebaseAuthButton } from '@/components/auth/FirebaseAuthButton';
import { useAuth } from '@/components/auth/AuthProvider';

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
  const { user } = useAuth();
  const activeUserName = user?.displayName || user?.email?.split('@')[0] || userName;
  const mobileNavItems = userRole === 'admin' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <>
    <aside
      className="disha-sidebar"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="sidebar-brand">
        <Link href="/" className="workspace-brand" aria-label="Disha AI — home">
          <span className="workspace-brand__seal" aria-hidden="true">दि</span>
          <span className="workspace-brand__word">DISHA<span className="workspace-brand__ai">AI</span></span>
        </Link>
        <p className="sidebar-caption">A path of your own.</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-caption sidebar-nav__label">Your chapters</p>
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn('workspace-nav-link', isActive && 'is-active')}
                aria-current={isActive ? 'page' : undefined}
                title={label}
              >
                <span className="workspace-nav-link__number" aria-hidden="true">0{index + 1}</span>
                <Icon size={18} className="workspace-nav-link__icon" aria-hidden="true" />
                <span className="workspace-nav-link__label">{label}</span>
                {isActive && <ChevronRight size={14} className="workspace-nav-link__arrow" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>

        {userRole === 'admin' && (
          <div className="mt-6">
            <p className="sidebar-caption sidebar-nav__label">
              Admin
            </p>
            <div className="space-y-1">
              {ADMIN_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn('workspace-nav-link', isActive && 'is-active')}
                    aria-current={isActive ? 'page' : undefined}
                    title={label}
                  >
                    <Icon size={18} className="workspace-nav-link__icon" aria-hidden="true" />
                    <span className="workspace-nav-link__label">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Authentication & Language Controls */}
        <div className="sidebar-controls">
          <div className="flex flex-col gap-1">
            <span className="sidebar-caption">
              Language
            </span>
            <LanguageSelector className="w-full" />
          </div>

          <div className="pt-2">
            <span className="sidebar-caption block mb-2">
              Account
            </span>
            <FirebaseAuthButton className="w-full justify-center" />
          </div>
        </div>

        {/* Demo Notice */}
        <div className="sidebar-note">
          <p className="sidebar-caption mb-2">Made for Bharat</p>
          <p className="text-xs leading-relaxed text-[var(--ui-muted)]">
            Discover your strengths.<br />Build your next chapter.
          </p>
        </div>
      </nav>

      {/* User section */}
      <div className="sidebar-profile">
        <div className="flex items-center gap-3 min-w-0">
          <div className="sidebar-profile__initials">
            {getInitials(activeUserName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--ui-text)] truncate">{activeUserName}</p>
            <p className="text-xs text-[var(--ui-faint)] capitalize">{userRole}</p>
          </div>
          <Link href="/onboarding" className="sidebar-profile__edit" aria-label="Update your career profile" title="Update profile"><ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </aside>
    <header className="workspace-mobile workspace-mobile__header">
      <Link href="/" className="workspace-brand" aria-label="Disha AI — home"><span className="workspace-brand__seal" aria-hidden="true">दि</span><span className="workspace-brand__word">DISHA<span className="workspace-brand__ai">AI</span></span></Link>
      <div className="workspace-mobile__controls"><LanguageSelector /><FirebaseAuthButton /></div>
    </header>
    <nav className="workspace-mobile workspace-mobile__nav" aria-label="Main navigation">
      {mobileNavItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return <Link key={href} href={href} aria-label={label} aria-current={isActive ? 'page' : undefined} className={cn(isActive && 'is-active')}><Icon size={18} aria-hidden="true" /><span>{label === 'Career Matches' ? 'Matches' : label === 'Career Simulator' ? 'Simulator' : label === 'Family Mode' ? 'Family' : label === 'AI Counsellor' ? 'Counsellor' : label === 'Dashboard' ? 'Home' : label}</span></Link>;
      })}
    </nav>
    </>
  );
}

// ---- Top Navigation (for landing / auth pages) ----

export function TopNav() {
  return (
    <header className="workspace-topnav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="workspace-brand__seal">
            <GraduationCap size={18} />
          </div>
          <span className="workspace-brand__word">DISHA<span className="workspace-brand__ai">AI</span></span>
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
              className="text-sm text-[var(--ui-muted)] hover:text-[var(--ui-text)] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <FirebaseAuthButton />
        </div>
      </div>
    </header>
  );
}
