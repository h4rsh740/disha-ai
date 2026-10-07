'use client';
import { useId, useState, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Clock, TrendingUp, BookOpen, Building,
  ChevronDown, ChevronUp, ArrowRight, Shield, Briefcase, GraduationCap,
  FileText, HelpCircle
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { Button } from '@/components/ui/Button';
import { DEMO_CAREERS, DEMO_CAREER_PATHS, FAMILY_FAQ } from '@/data/careers';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { cn } from '@/lib/utils';
import type { OnboardingState, Career } from '@/types';

const DEMO_PROFILE: OnboardingState = {
  step: 5, name: 'Ravi Sharma', education_level: 'class_10',
  selected_interests: ['electrical', 'renewable_energy', 'technology'],
  selected_skills: [
    { skill_id: 'sk-01', skill_name: 'Basic Electronics', proficiency: 3 },
    { skill_id: 'sk-03', skill_name: 'Problem Solving', proficiency: 3 },
  ],
  learning_preference: 'practical', work_environment: 'mixed',
  training_duration: 'medium', budget_range: 'zero', career_goals: ['quick_job'],
};

function subscribeToProfile(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function readStoredProfile() {
  return localStorage.getItem('disha_onboarding') ?? '';
}

function readServerProfile() {
  return null;
}

interface FAQCardProps {
  question: string;
  career: Career;
}

function FAQCard({ question, career }: FAQCardProps) {
  const answerId = useId();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (answer || loading) { setOpen((v) => !v); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/family-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, careerId: career.id }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? 'Information not available. Please speak to a career counsellor.');
    } catch {
      setAnswer('Unable to load answer right now. Please speak to a career counsellor.');
    } finally {
      setLoading(false);
    }
  };

  const iconMap: Record<string, React.ElementType> = {
    'Is this career stable?': Shield,
    'What training is required?': GraduationCap,
    'How long will it take?': Clock,
    'What can my child do after training?': Briefcase,
    'Can my child study further?': BookOpen,
    'Can my child start a business?': TrendingUp,
  };
  const Icon = iconMap[question] ?? HelpCircle;

  return (
    <div className="paper-panel">
      <button
        type="button"
        onClick={load}
        aria-expanded={open}
        aria-controls={answerId}
        className={cn(
          'group w-full min-h-11 rounded-sm px-4 py-3 text-left transition-colors hover:bg-[var(--ui-surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--ui-accent)] focus-visible:outline-offset-2',
          open && 'bg-[var(--ui-surface-2)]',
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-3">
            <span className="ui-icon" aria-hidden="true"><Icon size={16} /></span>
            <span className="text-sm font-medium text-[var(--ui-text)]">{question}</span>
          </span>
          <span className="shrink-0 text-[var(--ui-faint)] group-hover:text-[var(--ui-accent)]" aria-hidden="true">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </span>
      </button>

      <div id={answerId} hidden={!open}>
        {open && (
          <div className="mx-4 border-t border-[var(--ui-border)] py-3">
            {loading ? (
              <div className="flex items-center gap-2" role="status">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ui-accent)] border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                <span className="text-sm text-[var(--ui-muted)]">Getting answer...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{answer}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const savedProfile = useSyncExternalStore(subscribeToProfile, readStoredProfile, readServerProfile);
  const profile = useMemo<OnboardingState>(() => {
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch {}
    }
    return DEMO_PROFILE;
  }, [savedProfile]);
  const loaded = savedProfile !== null;

  const studentProfile = useMemo(() => ({
    id: 'demo-001', user_id: 'demo-user',
    name: profile.name ?? 'Your Child',
    education_level: profile.education_level ?? 'class_10',
    interests: profile.selected_interests,
    learning_preference: profile.learning_preference ?? 'practical',
    work_environment: profile.work_environment ?? 'mixed',
    location: profile.location ?? 'India',
    training_duration: profile.training_duration ?? 'medium',
    budget_range: profile.budget_range ?? 'zero',
    career_goals: profile.career_goals,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }), [profile]);

  const topCareer = useMemo(() => {
    if (!loaded) return DEMO_CAREERS[0];
    const recs = generateRecommendations(studentProfile, profile.selected_skills);
    return recs[0]?.career ?? DEMO_CAREERS[0];
  }, [loaded, studentProfile, profile.selected_skills]);

  const pathways = DEMO_CAREER_PATHS[topCareer.id] ?? DEMO_CAREER_PATHS['c-01'] ?? [];
  const primaryPathway = pathways[0];

  return (
    <div className="app-page">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="app-main">
        <div className="app-content">
          <PageHeader
            chapter="04"
            eyebrow="Family decision mode"
            title={<>A future to understand, <em>together.</em></>}
            description="Simple, clear guidance for parents and families. Understand your child's career path and make room for a good conversation."
            actions={<Link href="/family/report" data-variant="primary" className="disha-button inline-flex items-center justify-center gap-2 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2"><FileText size={14} aria-hidden="true" /> Family report <ArrowRight size={14} aria-hidden="true" /></Link>}
          />

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
            <div className="min-w-0 space-y-3 lg:col-span-8">
              <section className="dark-panel p-4 sm:p-5" aria-labelledby="family-recommended-career">
                <p className="eyebrow">Recommended career for {profile.name ?? 'your child'}</p>
                <h2 id="family-recommended-career" className="mb-2 font-[family-name:var(--ui-serif)] text-3xl leading-tight text-[var(--ui-text)]">{topCareer.name}</h2>
                <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{topCareer.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--ui-border)] pt-3">
                  <span className="ui-chip">
                    <Clock size={13} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                    {topCareer.training_duration} training
                  </span>
                  <span className="ui-chip">
                    <GraduationCap size={14} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                    {topCareer.education_requirement}
                  </span>
                </div>
              </section>

              <Disclosure title={`Why this career suits ${profile.name ?? 'your child'}`} description={`${topCareer.why_choose.length} reasons to discuss together`} icon={<CheckCircle2 size={17} />}>
                <ul className="divide-y divide-[var(--ui-border)]">
                  {topCareer.why_choose.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <CheckCircle2 size={14} className="mt-1 shrink-0 text-[var(--ui-success)]" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{reason}</p>
                    </li>
                  ))}
                </ul>
              </Disclosure>

              {primaryPathway && (
                <Disclosure title="The training journey" description={`${primaryPathway.steps.length} steps · ${primaryPathway.duration}`} icon={<TrendingUp size={17} />}>
                  <ol>
                    {primaryPathway.steps.map((step, i) => (
                      <li key={step.id} className="relative flex items-start gap-3 pb-5 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-xs font-medium text-[var(--ui-accent)]">
                            {i + 1}
                          </span>
                        </div>
                        {i < primaryPathway.steps.length - 1 && <span className="absolute bottom-0 left-[13px] top-7 w-px bg-[var(--ui-border)]" aria-hidden="true" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--ui-text)]">{step.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--ui-muted)]">{step.description}</p>
                          <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[var(--ui-faint)]"><Clock size={11} aria-hidden="true" />{step.duration}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Disclosure>
              )}

              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                <Disclosure title="Career opportunities" description={`${topCareer.job_roles.length} job roles`} icon={<Briefcase size={16} />}>
                  <ul className="space-y-2">
                    {topCareer.job_roles.map((role) => (
                      <li key={role} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--ui-muted)]">
                        <span className="mt-2 h-1 w-1 shrink-0 bg-[var(--ui-accent)]" aria-hidden="true" />
                        {role}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
                <Disclosure title="Further studies" description={`${topCareer.further_education.length} education options`} icon={<BookOpen size={16} />}>
                  <ul className="space-y-2">
                    {topCareer.further_education.map((edu) => (
                      <li key={edu} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--ui-muted)]">
                        <span className="mt-2 h-1 w-1 shrink-0 bg-[var(--ui-success)]" aria-hidden="true" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              </div>

              <section aria-labelledby="family-faq-title" className="pt-2">
                <h2 id="family-faq-title" className="section-title mb-3 flex items-center gap-2">
                  <HelpCircle size={18} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                  Questions families ask
                </h2>
                <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                  {FAMILY_FAQ.map((faq) => (
                    <FAQCard key={`${topCareer.id}-${faq.id}`} question={faq.question} career={topCareer} />
                  ))}
                </div>
              </section>
            </div>

            <aside className="min-w-0 space-y-3 lg:col-span-4" aria-label="Family resources">
              <div className="dark-panel p-4">
                <h2 className="section-title mb-2 flex items-center gap-2"><FileText size={18} aria-hidden="true" /> Family career report</h2>
                <p className="ui-note mb-3">
                  A personalised, printable career report to discuss around the table.
                </p>
                <Link href="/family/report" className="block">
                  <Button variant="primary" size="md" fullWidth icon={<ArrowRight size={15} aria-hidden="true" />} iconPosition="right">
                    Generate Report
                  </Button>
                </Link>
              </div>

              <Disclosure title="Business opportunities" description={`${topCareer.entrepreneurship_options.length} ideas for the future`} icon={<Building size={16} />}>
                <p className="ui-note mb-3">
                  After gaining experience, your child could start their own business:
                </p>
                <ul className="space-y-2">
                  {topCareer.entrepreneurship_options.map((opt) => (
                    <li key={opt} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--ui-muted)]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--ui-faint)]" aria-hidden="true" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </Disclosure>

              <div className="ui-alert">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-[var(--ui-accent)]">Demo mode</p>
                <p className="ui-note">
                  This is illustrative career information. AI answers are grounded in our career knowledge base only — not official statistics.
                </p>
              </div>

              <Card padding="md">
                <h2 className="section-title mb-2">See the full career path.</h2>
                <p className="ui-note mb-3">View the step-by-step training journey in detail.</p>
                <Link href={`/career-path/${topCareer.id}`} className="block">
                  <Button variant="outline" size="sm" fullWidth>Open Career Simulator</Button>
                </Link>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
