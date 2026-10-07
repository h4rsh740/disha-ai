'use client';
import { useState, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, GitBranch, Clock, DollarSign, Zap, BookOpen,
  ChevronRight, BarChart2, CheckCircle2, Info
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CareerTimeline } from '@/components/career/CareerTimeline';
import { DEMO_CAREERS, DEMO_CAREER_PATHS } from '@/data/careers';
import { cn } from '@/lib/utils';
import type { CareerPathway } from '@/types';

const DEMO_PROFILE_NAME = 'Ravi Sharma';

function subscribeToProfile(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function readStoredProfile() {
  return localStorage.getItem('disha_onboarding');
}

function readServerProfile() {
  return null;
}

export default function CareerPathPage() {
  const params = useParams();
  const careerId = params.id as string;
  const savedProfile = useSyncExternalStore(subscribeToProfile, readStoredProfile, readServerProfile);
  const profile = useMemo(() => {
    if (savedProfile) {
      try {
        const saved = JSON.parse(savedProfile);
        return { name: saved.name ?? DEMO_PROFILE_NAME };
      } catch {}
    }
    return { name: DEMO_PROFILE_NAME };
  }, [savedProfile]);
  const [activePathway, setActivePathway] = useState(0);
  const [showWhatIf, setShowWhatIf] = useState(false);

  const career = useMemo(() => DEMO_CAREERS.find((c) => c.id === careerId) ?? DEMO_CAREERS[0], [careerId]);
  const pathways: CareerPathway[] = useMemo(
    () => DEMO_CAREER_PATHS[careerId] ?? DEMO_CAREER_PATHS['c-01'] ?? [],
    [careerId],
  );
  const currentPathway = pathways[activePathway];

  return (
    <div className="app-page">
      <Sidebar userName={profile.name} userRole="student" />

      <main className="app-main">
        <div className="app-content">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--ui-faint)]">
            <Link href={`/careers/${careerId}`} className="flex items-center gap-1.5 hover:text-[var(--ui-text)]">
              <ArrowLeft size={13} aria-hidden="true" /> {career.name}
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span aria-current="page" className="text-[var(--ui-muted)]">Career simulator</span>
          </nav>

          <PageHeader
            chapter="03"
            eyebrow="Career path simulator"
            title={career.name}
            description="Explore the journey from education to employment. Open each step to see the skills, qualifications, and opportunities along the way."
            actions={
              <>
                <Badge variant="warning" size="sm">Illustrative pathways</Badge>
                <Button
                  variant={showWhatIf ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowWhatIf((v) => !v)}
                  aria-expanded={showWhatIf}
                  aria-controls="pathway-details"
                  icon={<BarChart2 size={14} aria-hidden="true" />}
                >
                  {showWhatIf ? 'Hide comparison' : 'What if? Compare'}
                </Button>
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section aria-label="Training pathway" className={cn('min-w-0', showWhatIf ? 'lg:col-span-5' : 'lg:col-span-8')}>
              {pathways.length > 1 && (
                <div className="mb-5">
                  <p className="eyebrow">Choose your route</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Select a pathway">
                    {pathways.map((pw, i) => (
                      <button
                        key={pw.id}
                        type="button"
                        onClick={() => setActivePathway(i)}
                        aria-pressed={activePathway === i}
                        aria-controls="career-timeline"
                        className={cn(
                          'min-h-11 rounded-sm border px-4 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ui-accent)] focus-visible:outline-offset-2',
                          activePathway === i
                            ? 'border-[var(--ui-accent)] bg-[var(--ui-surface-2)] text-[var(--ui-text)]'
                            : 'border-[var(--ui-border)] text-[var(--ui-muted)] hover:border-[var(--ui-accent)] hover:text-[var(--ui-text)]',
                        )}
                      >
                        {pw.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentPathway && (
                <Card padding="md" className="mb-5">
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="ui-note mb-1">Total duration</dt>
                      <dd className="flex items-start gap-1.5 text-sm font-semibold text-[var(--ui-text)]">
                        <Clock size={14} className="mt-0.5 shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                        {currentPathway.duration}
                      </dd>
                    </div>
                    <div>
                      <dt className="ui-note mb-1">Training cost</dt>
                      <dd className="flex items-start gap-1.5 text-sm font-semibold text-[var(--ui-text)]">
                        <DollarSign size={14} className="mt-0.5 shrink-0 text-[var(--ui-success)]" aria-hidden="true" />
                        {currentPathway.cost_range}
                      </dd>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <dt className="ui-note mb-1">Practical exposure</dt>
                      <dd className="flex items-start gap-1.5 text-sm font-semibold text-[var(--ui-text)]">
                        <Zap size={14} className="mt-0.5 shrink-0 text-[var(--ui-faint)]" aria-hidden="true" />
                        {currentPathway.practical_exposure}
                      </dd>
                    </div>
                  </dl>
                </Card>
              )}

              <div id="career-timeline">
                {currentPathway ? (
                  <CareerTimeline steps={currentPathway.steps} pathwayName={currentPathway.name} />
                ) : (
                  <div className="paper-panel p-6 text-center">
                    <GitBranch size={28} className="mx-auto mb-3 text-[var(--ui-faint)]" aria-hidden="true" />
                    <p className="section-title">Career path steps coming soon.</p>
                    <p className="ui-note mt-2">This career&apos;s detailed pathway is being added to the knowledge base.</p>
                  </div>
                )}
              </div>
            </section>

            <aside id="pathway-details" aria-label={showWhatIf && pathways.length >= 2 ? 'Pathway comparison' : 'Career details'} className={cn('min-w-0', showWhatIf ? 'lg:col-span-7' : 'lg:col-span-4')}>
              {showWhatIf && pathways.length >= 2 ? (
                <PathwayComparison pathways={pathways} />
              ) : (
                <div className="space-y-4">
                  <Card padding="md">
                    <h2 className="section-title mb-4">Career summary</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="ui-note mb-1">Entry requirement</p>
                        <p className="text-sm font-medium text-[var(--ui-text)]">{career.education_requirement}</p>
                      </div>
                      <div>
                        <p className="ui-note mb-1.5">Training type</p>
                        <div className="flex flex-wrap gap-1.5">
                          {career.training_type.map((t) => (
                            <Badge key={t} variant="neutral" size="sm">{t.toUpperCase()}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="ui-note mb-1.5">Career growth</p>
                        <ol className="space-y-2">
                          {career.career_progression.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--ui-success)]" aria-hidden="true" />
                              <span className="text-xs text-[var(--ui-muted)]">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </Card>

                  <Card padding="md">
                    <div className="mb-4 flex items-center gap-2">
                      <BookOpen size={16} className="shrink-0 text-[var(--ui-success)]" aria-hidden="true" />
                      <h2 className="section-title">Further education</h2>
                    </div>
                    <ul className="space-y-2">
                      {career.further_education.map((edu) => (
                        <li key={edu} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--ui-muted)]">
                          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[var(--ui-success)]" aria-hidden="true" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <div className="dark-panel p-5">
                    <p className="eyebrow">A little guidance</p>
                    <h2 className="section-title mb-2">Questions about this path?</h2>
                    <p className="ui-note mb-4">Ask the AI Career Counsellor anything about this pathway.</p>
                    <Link href="/counsellor" className="block">
                      <Button variant="primary" size="sm" fullWidth>
                        Ask AI Counsellor
                      </Button>
                    </Link>
                  </div>

                  <Card padding="md">
                    <h2 className="section-title mb-2">Bring your family along.</h2>
                    <p className="ui-note mb-4">Explore clear guidance and a printable report together.</p>
                    <Link href="/family" className="block">
                      <Button variant="outline" size="sm" fullWidth>Open Family Mode</Button>
                    </Link>
                  </Card>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---- Pathway Comparison Component ----
function PathwayComparison({ pathways }: { pathways: CareerPathway[] }) {
  const rows = [
    { label: 'Duration', key: 'duration' as const },
    { label: 'Cost Range', key: 'cost_range' as const },
    { label: 'Practical Exposure', key: 'practical_exposure' as const },
    { label: 'Entry Requirements', key: 'entry_requirements' as const },
  ];

  return (
    <section className="min-w-0" aria-labelledby="pathway-comparison-title">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <BarChart2 size={17} className="text-[var(--ui-accent)]" aria-hidden="true" />
        <h2 id="pathway-comparison-title" className="section-title">Pathway comparison</h2>
        <span className="ui-chip">Illustrative data</span>
      </div>

      <div className="paper-panel min-w-0 overflow-hidden">
        <div
          className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-[var(--ui-accent)] focus-visible:outline-offset-[-2px]"
          role="region"
          aria-label="Pathway comparison table; scroll to see all routes"
          tabIndex={0}
        >
          <table className="w-full border-collapse text-left" style={{ minWidth: 150 + pathways.length * 180 }}>
            <caption className="sr-only">Compare duration, training costs, exposure, and entry requirements for each route.</caption>
            <thead>
              <tr className="border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)]">
                <th scope="col" className="w-[150px] p-4 text-xs font-medium text-[var(--ui-muted)]">At a glance</th>
                {pathways.map((pw) => (
                  <th key={pw.id} scope="col" className="border-l border-[var(--ui-border)] p-4 text-sm font-semibold text-[var(--ui-text)]">{pw.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-[var(--ui-border)]">
                  <th scope="row" className="bg-[var(--ui-surface-2)] p-4 align-top text-[11px] font-medium tracking-wide text-[var(--ui-muted)]">{row.label}</th>
                  {pathways.map((pw) => (
                    <td key={pw.id} className="border-l border-[var(--ui-border)] p-4 align-top text-sm text-[var(--ui-text)]">{pw[row.key]}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="bg-[var(--ui-surface-2)] p-4 align-top text-[11px] font-medium tracking-wide text-[var(--ui-muted)]">Further education</th>
                {pathways.map((pw) => (
                  <td key={pw.id} className="border-l border-[var(--ui-border)] p-4 align-top">
                    <Badge variant={pw.further_education_possible ? 'success' : 'neutral'} size="sm">
                      {pw.further_education_possible ? 'Yes — multiple routes' : 'Limited options'}
                    </Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="ui-alert mt-4 flex items-start gap-2">
        <Info size={15} className="mt-0.5 shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
        <p className="ui-note">
          <strong className="font-medium text-[var(--ui-text)]">Illustrative data:</strong> Cost ranges and duration estimates are indicative only.
          Actual figures vary by institution, state, and year. Please verify with the relevant ITI or polytechnic.
        </p>
      </div>
    </section>
  );
}
