'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, LogOut, UserPlus, User as UserIcon, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Image from 'next/image';
import { useAuth } from './AuthProvider';
import { getInitials } from '@/lib/utils';

export function FirebaseAuthButton({ className = '' }: { className?: string }) {
  const { user, isSignedIn, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-[#1c1712] border border-[rgba(246,239,229,0.14)] animate-pulse" />
      </div>
    );
  }

  if (isSignedIn && user) {
    const displayName = user.displayName || 'Disha Student';
    const email = user.email || '';
    const initials = getInitials(displayName);

    return (
      <div className={`auth-controls flex items-center gap-2.5 ${className}`}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="auth-controls__profile flex items-center justify-center gap-2 p-1 rounded-full border border-[rgba(230,155,83,0.4)] hover:border-[#e69b53] bg-[#15110e] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e69b53]"
              aria-label={`Account menu for ${displayName}`}
              title={displayName}
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={displayName}
                  width={28}
                  height={28}
                  unoptimized
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#963c2f] text-[#f6efe5] flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 w-[min(280px,calc(100vw_-_32px))] min-w-0 bg-[#15110e] border border-[rgba(246,239,229,0.14)] rounded-md p-1.5 shadow-2xl text-[#f6efe5] text-xs animate-in fade-in-80 duration-150"
              sideOffset={5}
              collisionPadding={16}
              align="end"
            >
              {/* User summary */}
              <div className="px-2 py-1.5 border-b border-[rgba(246,239,229,0.1)] mb-1">
                <p className="font-semibold text-sm truncate text-[#f6efe5]">{displayName}</p>
                {email && <p className="text-[11px] text-[#b2a69a] truncate">{email}</p>}
                {'isDemo' in user && user.isDemo && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-[#e69b53]/20 text-[#e69b53] border border-[#e69b53]/30">
                    Local Demo Session
                  </span>
                )}
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  href="/dashboard"
                  className="flex min-h-11 items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[#f6efe5] hover:bg-[#1c1712] hover:text-[#e69b53] outline-none transition-colors"
                >
                  <UserIcon size={14} />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/onboarding"
                  className="flex min-h-11 items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[#f6efe5] hover:bg-[#1c1712] hover:text-[#e69b53] outline-none transition-colors"
                >
                  <Settings size={14} />
                  <span>Career Profile</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-[rgba(246,239,229,0.1)] my-1" />

              <DropdownMenu.Item
                onSelect={() => signOut()}
                className="flex min-h-11 items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[#e06c53] hover:bg-[#963c2f]/20 outline-none transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    );
  }

  return (
    <div className={`auth-controls flex items-center gap-2 ${className}`}>
      <Link
        href="/sign-in"
        className="auth-controls__signin flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs text-[var(--ui-text,#f6efe5)] hover:bg-[var(--ui-surface-2,#1c1712)] border border-[var(--ui-border,rgba(246,239,229,0.14))] transition-colors"
      >
        <LogIn size={13} />
        <span>Sign In</span>
      </Link>
      <Link
        href="/sign-up"
        className="auth-controls__signup flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs bg-[#e69b53] text-[#0a0806] font-semibold hover:bg-[#f5af69] transition-colors shadow-sm"
      >
        <UserPlus size={13} />
        <span>Get Started</span>
      </Link>
    </div>
  );
}

// Re-export as alias to ensure any legacy imports continue working smoothly
export { FirebaseAuthButton as ClerkAuthButton };
