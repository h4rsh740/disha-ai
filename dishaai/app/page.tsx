'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { KiboriLandingPage } from '@/src/shaders/kibori-landing-page/KiboriLandingPage';

export default function LandingPage() {
  return (
    <main className="disha-kibori-shell" suppressHydrationWarning>
      <div className="shader-frame" suppressHydrationWarning>
        <KiboriLandingPage />
      </div>

      <div className="disha-kibori-cta" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <p><Sparkles size={14} /> Your next chapter starts here</p>
          <strong>Find a path that feels like yours.</strong>
        </div>
        <Link href="/onboarding" className="disha-kibori-cta__button">
          Begin your journey <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
