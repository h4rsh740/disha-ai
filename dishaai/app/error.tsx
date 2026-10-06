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
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#fff1f2] border border-[#fecdd3] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-[#e11d48]" />
        </div>
        <h1 className="text-xl font-bold text-[#1a2e5a] mb-2">Something went wrong</h1>
        <p className="text-[#64748b] text-sm mb-6 leading-relaxed">
          An unexpected error occurred. Please try refreshing the page.
          {error.digest && (
            <span className="block mt-1 text-xs text-[#94a3b8]">Error ID: {error.digest}</span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2e5a] text-white rounded-xl font-medium hover:bg-[#0f1e3c] transition-colors text-sm"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] text-[#1a2e5a] rounded-xl font-medium hover:border-[#1a2e5a] transition-colors text-sm"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
