'use client';
import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  TrendingUp, BrainCircuit, Target, Star, ArrowRight,
  Zap, User, Briefcase, ChevronRight
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Disclosure } from '@/components/ui/Disclosure';
import { CareerCard } from '@/components/career/CareerCard';
import { GovSchemesCard } from '@/components/gov/GovSchemesCard';
import { generateRecommendations, buildCareerTwin } from '@/lib/recommendation/engine';
import DashboardLoading from './loading';
import type { OnboardingState } from '@/types';

// Demo fallback profile for first-time visitors
const DEMO_PROFILE: OnboardingState = {
  step: 5,
  name: 'Ravi Sharma',
  education_level: 'class_10',
  stream: 'science',
  location: 'Maharashtra',
  selected_interests: ['electrical', 'renewable_energy', 'technology'],
  selected_skills: [
    { skill_id: 'sk-01', skill_name: 'Basic Electronics', proficiency: 3 },
    { skill_id: 'sk-03', skill_name: 'Problem Solving', proficiency: 3 },
    { skill_id: 'sk-04', skill_name: 'Mathematics', proficiency: 2 },
    { skill_id: 'sk-07', skill_name: 'Teamwork', proficiency: 3 },
  ],
  learning_preference: 'practical',
  work_environment: 'mixed',
  training_duration: 'medium',
  budget_range: 'zero',
  career_goals: ['quick_job', 'long_term'],
};

function subscribeProfile(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}
const readProfile = () => localStorage.getItem('disha_onboarding') ?? '';
const serverProfile = () => null;

export default function DashboardPage() {
  const savedProfile = useSyncExternalStore(subscribeProfile, readProfile, serverProfile);
  const profile = useMemo<OnboardingState>(() => {
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch { /* Keep the demo fallback. */ }
    }
    return DEMO_PROFILE;
  }, [savedProfile]);
  const loaded = savedProfile !== null;

  const recommendations = useMemo(() => {
    if (!loaded) return [];
    const studentProfile = {
      id: 'demo-001',
      user_id: 'demo-user',
      name: profile.name ?? 'Student',
      education_level: profile.education_level ?? 'class_10',
      stream: profile.stream,
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
    };
    return generateRecommendations(studentProfile, profile.selected_skills);
  }, [loaded, profile]);

  const careerTwin = useMemo(() => {
    if (!loaded || !recommendations.length) return null;
    const studentProfile = {
      id: 'demo-001',
      user_id: 'demo-user',
      name: profile.name ?? 'Student',
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
    };
    return buildCareerTwin(studentProfile, profile.selected_skills, recommendations[0]);
  }, [loaded, recommendations, profile]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = profile.name ?? 'Student';

  if (!loaded) {
    return <DashboardLoading />;
  }

  return (
    <div className="app-page">
      <Sidebar userName={name} userRole="student" />

      <main className="app-main">
        <div className="app-content">
          <PageHeader
            chapter="01"
            eyebrow="Your career dashboard"
            title={<>Your next chapter starts <em>here.</em></>}
            description={<>{greeting}, {name}. Your Career Twin is ready. Let&apos;s find a direction that feels like you.</>}
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <span className="ui-chip">Demo · Illustrative data</span>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-sm border border-[var(--ui-border)] px-3 py-2 text-xs text-[var(--ui-text)] transition-colors hover:border-[var(--ui-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ui-accent)]"
                >
                  Retake assessment <ArrowRight size={13} />
                </Link>
              </div>
            }
          />

          {/* Score cards */}
          {careerTwin && (
            <section aria-label="Your career profile scores" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Career Readiness', value: careerTwin.readiness_score, icon: Target, note: 'Your starting point' },
                { label: 'Interest Match', value: careerTwin.interest_match, icon: Star, note: 'What draws you in' },
                { label: 'Skill Match', value: careerTwin.skill_match, icon: Zap, note: 'What you bring today' },
                { label: 'Career Clarity', value: careerTwin.career_clarity, icon: TrendingUp, note: 'A direction to explore' },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.label} padding="md">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="eyebrow mb-0 text-[var(--ui-muted)]">{metric.label}</p>
                      <Icon size={15} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                    </div>
                    <p className="font-serif text-3xl font-normal tabular-nums text-[var(--ui-text)] sm:text-4xl">
                      {metric.value}<span className="ml-1 text-base text-[var(--ui-faint)]">%</span>
                    </p>
                    <Progress value={metric.value} ariaLabel={metric.label} color="auto" size="sm" className="mt-2" />
                    <p className="mt-2 border-t border-[var(--ui-border)] pt-2 text-xs text-[var(--ui-muted)]">{metric.note}</p>
                  </Card>
                );
              })}
            </section>
          )}

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            {/* Left — Career Twin */}
            <aside className="order-2 min-w-0 space-y-3 lg:order-1 lg:col-span-1">
              <Disclosure title="Your Career Twin" description="Interests, strengths, and work style" icon={<User size={17} />}>
                {careerTwin && (
                  <div className="space-y-4">
                    {careerTwin.interests.length > 0 && (
                      <div>
                        <p className="eyebrow mb-2 text-[var(--ui-faint)]">
                          Strong Interests
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {careerTwin.interests.map((i) => (
                            <span key={i} className="ui-chip">{i.replace(/_/g, ' ')}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {careerTwin.strengths.length > 0 && (
                      <div>
                        <p className="eyebrow mb-2 text-[var(--ui-faint)]">
                          Your Strengths
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {careerTwin.strengths.map((s) => (
                            <span key={s} className="ui-chip text-[var(--ui-success)]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="eyebrow mb-2 text-[var(--ui-faint)]">
                        Work Style
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{careerTwin.work_style}</p>
                    </div>

                    <div>
                      <p className="eyebrow mb-2 text-[var(--ui-faint)]">
                        Education
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{careerTwin.education_profile}</p>
                    </div>

                    <div>
                      <p className="eyebrow mb-2 text-[var(--ui-faint)]">
                        Career Orientation
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{careerTwin.career_orientation}</p>
                    </div>
                  </div>
                )}

              </Disclosure>
              <Link href="/counsellor" className="dark-panel flex items-center gap-3 p-4 text-sm text-[var(--ui-text)] hover:border-[var(--ui-accent)]">
                <BrainCircuit size={17} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                <span className="flex-1">Ask AI Counsellor</span><ArrowRight size={14} aria-hidden="true" />
              </Link>
              <GovSchemesCard collapsible />
            </aside>

            {/* Right — Career matches */}
            <section className="order-1 min-w-0 lg:order-2 lg:col-span-2" aria-labelledby="top-matches-title">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--ui-border)] pb-3">
                <div>
                  <p className="eyebrow mb-2 text-[var(--ui-faint)]">Chosen for your profile</p>
                  <h2 id="top-matches-title" className="section-title text-2xl text-[var(--ui-text)]">Top career matches</h2>
                </div>
                <Link href="/careers" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ui-accent)] hover:underline underline-offset-4">
                  Explore all matches <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <CareerCard key={rec.career_id} recommendation={rec} compact />
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/career-path/c-01" className="dark-panel group flex min-w-0 items-center gap-3 p-4 transition-colors hover:border-[var(--ui-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ui-accent)]">
                  <TrendingUp size={18} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                  <div className="min-w-0 flex-1"><h3 className="font-serif text-xl text-[var(--ui-text)]">Career Simulator</h3><p className="ui-note mt-1">Plan your next steps.</p></div>
                  <ArrowRight size={15} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                </Link>
                <Link href="/family" className="paper-panel group flex min-w-0 items-center gap-3 p-4 transition-colors hover:border-[var(--ui-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ui-accent)]">
                  <Briefcase size={18} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                  <div className="min-w-0 flex-1"><h3 className="font-serif text-xl text-[var(--ui-text)]">Family Mode</h3><p className="ui-note mt-1">Discuss the path together.</p></div>
                  <ArrowRight size={15} className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
