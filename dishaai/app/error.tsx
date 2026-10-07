'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DishaAI Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f6efe5] flex items-center justify-center p-6 relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(224, 109, 83, 0.12), transparent 60%)',
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface)] p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-[rgba(224,109,83,0.14)] border border-[rgba(224,109,83,0.3)] rounded-sm flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-[#e06d53]" />
        </div>
        <h1 className="mb-3 font-serif text-3xl text-[var(--ui-text)]">Something went wrong</h1>
        <p className="text-[#b2a69a] text-sm mb-6 leading-relaxed">
          An unexpected error occurred. Please try refreshing the page.
          {error.digest && (
            <span className="block mt-1 text-xs text-[#8a7e72]">Error ID: {error.digest}</span>
          )}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e69b53] text-[#0a0806] rounded-sm font-semibold hover:bg-[#f5af69] transition-colors text-sm shadow-sm cursor-pointer"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c1712] border border-[rgba(246,239,229,0.14)] text-[#f6efe5] rounded-sm font-medium hover:bg-[#241c14] hover:border-[#e69b53] transition-colors text-sm cursor-pointer"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
