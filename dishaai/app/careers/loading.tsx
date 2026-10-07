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
            chapter="02"
            eyebrow="Career matches"
            title={<>Possibilities, <em>picked for you.</em></>}
            description="Finding the paths that fit your interests and strengths."
          />
          <div role="status" className="paper-panel mb-6 flex items-center gap-3 border p-5">
            <Loader2 size={18} className="shrink-0 text-[var(--ui-accent)] motion-safe:animate-spin" aria-hidden="true" />
            <p className="text-sm text-[var(--ui-muted)]">Loading your career matches…</p>
          </div>
          <div aria-hidden="true" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="paper-panel border p-6">
                <div className="mb-5 h-2 w-28 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                <div className="mb-6 h-8 w-2/3 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                <div className="space-y-3 border-t border-[var(--ui-border)] pt-5">
                  <div className="h-2 w-full rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                  <div className="h-2 w-5/6 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                  <div className="h-2 w-3/4 rounded-sm bg-[var(--ui-surface-2)] motion-safe:animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
