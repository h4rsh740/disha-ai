import Link from 'next/link';
import { GraduationCap, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#1a2e5a] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={36} className="text-[#0ea5e9]" />
        </div>
        <h1 className="text-6xl font-bold text-[#1a2e5a] mb-3">404</h1>
        <h2 className="text-xl font-semibold text-[#1a2e5a] mb-3">Page not found</h2>
        <p className="text-[#64748b] mb-8">
          The page you're looking for doesn't exist. It may have been moved or the URL is incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a2e5a] text-white rounded-xl font-medium hover:bg-[#0f1e3c] transition-colors"
          >
            <ArrowLeft size={16} />
            Go Home
          </Link>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e2e8f0] text-[#1a2e5a] rounded-xl font-medium hover:border-[#1a2e5a] transition-colors"
          >
            <Search size={16} />
            Explore Careers
          </Link>
        </div>
      </div>
    </div>
  );
}
