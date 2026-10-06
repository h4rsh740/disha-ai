'use client';

import React from 'react';
import Link from 'next/link';
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from '@clerk/nextjs';
import { LogIn, UserPlus } from 'lucide-react';

export function ClerkAuthButton({ className = '' }: { className?: string }) {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          href="/onboarding"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#1a2e5a] hover:bg-[#f0f4ff] border border-slate-200 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/onboarding"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1a2e5a] text-white hover:bg-[#0f1e3c] transition-colors shadow-sm"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Show when="signed-in">
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-full border border-sky-200',
              },
            }}
          />
        </div>
      </Show>

      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#1a2e5a] hover:bg-[#f0f4ff] border border-slate-200 transition-colors cursor-pointer"
            >
              <LogIn size={13} />
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1a2e5a] text-white hover:bg-[#0f1e3c] transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus size={13} />
              Get Started
            </button>
          </SignUpButton>
        </div>
      </Show>
    </div>
  );
}
