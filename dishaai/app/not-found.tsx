import Link from 'next/link';
import { GraduationCap, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f6efe5] flex items-center justify-center p-6 relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(230, 155, 83, 0.12), transparent 60%)',
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface)] p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-[#1c1712] border border-[rgba(246,239,229,0.14)] rounded-sm flex items-center justify-center mx-auto mb-5 text-[#e69b53]">
          <GraduationCap size={32} />
        </div>
        <p className="eyebrow mb-2 justify-center text-[var(--ui-faint)]">Lost in navigation</p>
        <h1 className="mb-2 font-serif text-6xl text-[var(--ui-text)]">404</h1>
        <h2 className="mb-3 font-serif text-2xl text-[var(--ui-text)]">Page not found</h2>
        <p className="text-[#b2a69a] text-sm mb-7 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or the chapter URL is incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#e69b53] text-[#0a0806] rounded-sm font-semibold hover:bg-[#f5af69] transition-colors text-sm shadow-sm"
          >
            <ArrowLeft size={16} />
            Go Home
          </Link>
          <Link
            href="/careers"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1c1712] border border-[rgba(246,239,229,0.14)] text-[#f6efe5] rounded-sm font-medium hover:bg-[#241c14] hover:border-[#e69b53] transition-colors text-sm"
          >
            <Search size={16} />
            Explore Careers
          </Link>
        </div>
      </div>
    </div>
  );
}
