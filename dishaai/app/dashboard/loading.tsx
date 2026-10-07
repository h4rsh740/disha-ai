import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';

export default function Loading() {
  return (
    <div className="app-page">
      <Sidebar userRole="student" />
      <main className="app-main">
        <div className="app-content">
          <PageHeader
            chapter="01"
            eyebrow="Your career dashboard"
            title={<>Your next chapter starts <em>here.</em></>}
            description="A little clarity is on its way."
          />
          <div role="status" className="paper-panel mb-6 flex items-center gap-3 border p-5">
            <Loader2 size={18} className="shrink-0 text-[var(--ui-accent)] motion-safe:animate-spin" aria-hidden="true" />
            <p className="text-sm text-[var(--ui-muted)]">Preparing your Career Twin and recommendations…</p>
          </div>
          <div aria-hidden="true" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="paper-panel border p-5">
                <div className="mb-6 h-2 w-24 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                <div className="h-12 w-20 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                <div className="mt-5 border-t border-[var(--ui-border)] pt-3">
                  <div className="h-2 w-28 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
