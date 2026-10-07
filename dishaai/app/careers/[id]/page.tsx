'use client';
import { useState, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Check, AlertTriangle, Clock, GraduationCap,
  TrendingUp, BookOpen, Briefcase, Zap, ChevronRight,
  Lightbulb, Building, ArrowRight, Star
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { DEMO_CAREERS } from '@/data/careers';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { cn } from '@/lib/utils';
import type { OnboardingState } from '@/types';

const DEMO_PROFILE: OnboardingState = {
  step: 5, name: 'Ravi Sharma', education_level: 'class_10',
  selected_interests: ['electrical', 'renewable_energy', 'technology'],
  selected_skills: [
    { skill_id: 'sk-01', skill_name: 'Basic Electronics', proficiency: 3 },
    { skill_id: 'sk-03', skill_name: 'Problem Solving', proficiency: 3 },
    { skill_id: 'sk-04', skill_name: 'Mathematics', proficiency: 2 },
  ],
  learning_preference: 'practical', work_environment: 'mixed',
  training_duration: 'medium', budget_range: 'zero', career_goals: ['quick_job'],
};

function subscribeProfile(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}
const readProfile = () => localStorage.getItem('disha_onboarding') ?? '';
const serverProfile = () => null;

export default function CareerDetailPage() {
  const params = useParams();
  const careerId = params.id as string;
  const savedProfile = useSyncExternalStore(subscribeProfile, readProfile, serverProfile);
  const profile = useMemo<OnboardingState>(() => {
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch { /* Keep the demo fallback. */ }
    }
    return DEMO_PROFILE;
  }, [savedProfile]);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const career = useMemo(() => DEMO_CAREERS.find((c) => c.id === careerId), [careerId]);

  const studentProfile = useMemo(() => ({
    id: 'demo-001', user_id: 'demo-user',
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
  }), [profile]);

  const recommendation = useMemo(() => {
    if (!career) return null;
    const recs = generateRecommendations(studentProfile, profile.selected_skills, [career]);
    return recs[0] ?? null;
  }, [career, studentProfile, profile.selected_skills]);

  const loadAIExplanation = async () => {
    if (!career || aiLoading || aiExplanation) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/explain-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId: career.id }),
      });
      const data = await res.json();
      setAiExplanation(data.text ?? '');
    } catch {
      setAiExplanation('Unable to load AI explanation right now. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!career) {
    return (
      <div className="app-page">
        <Sidebar userName={profile.name ?? 'Student'} />
        <main className="app-main">
          <div className="app-content">
            <PageHeader
              chapter="02"
              eyebrow="Career matches"
              title="This path is still unwritten."
              description="We couldn’t find the career you were looking for."
            />
            <div className="paper-panel border p-6">
              <p className="mb-4 text-sm text-[var(--ui-muted)]">Career not found. Explore your matches to choose another direction.</p>
              <Link href="/careers" className="inline-flex items-center gap-2 text-sm text-[var(--ui-accent)] hover:underline underline-offset-4">
                <ArrowLeft size={14} /> Back to careers
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const score = recommendation?.total_score ?? 0;
  const gaps = recommendation?.skill_gaps ?? [];
  const matchingSkills = recommendation?.matching_skills ?? [];

  return (
    <div className="app-page">
      <Sidebar userName={profile.name ?? 'Student'} />

      <main className="app-main">
        <div className="app-content">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--ui-faint)]">
            <Link href="/careers" className="inline-flex items-center gap-1 hover:text-[var(--ui-text)]">
              <ArrowLeft size={14} /> Career Matches
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-[var(--ui-muted)]" aria-current="page">{career.name}</span>
          </nav>

          <PageHeader
            chapter="02"
            eyebrow="Career matches / A closer look"
            title={career.name}
            description={career.description}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <span className="ui-chip">{career.category.replace(/_/g, ' ')}</span>
                {career.nsqf_level && <span className="ui-chip">NSQF {career.nsqf_level}</span>}
                {career.is_demo_data && <span className="ui-chip">Illustrative data</span>}
                <Link href={`/career-path/${career.id}`} data-variant="primary" className="disha-button inline-flex items-center justify-center gap-2 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2">
                  Open simulator <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            }
          />

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            {/* Main content */}
            <div className="min-w-0 space-y-3 lg:col-span-2">

              {/* Hero card */}
              <Card padding="md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ui-border)] pb-3">
                  <div>
                    <p className="eyebrow mb-2 text-[var(--ui-faint)]">Before you begin</p>
                    <h2 className="section-title text-2xl text-[var(--ui-text)]">The essentials</h2>
                  </div>
                  {recommendation && (
                    <div className="shrink-0 border-l border-[var(--ui-border)] pl-5 text-right">
                      <span className="block font-[family-name:var(--ui-serif)] text-3xl font-normal leading-none text-[var(--ui-accent)]">{score}<span className="text-base">%</span></span>
                      <span className="eyebrow mt-2 block text-[var(--ui-muted)]">Your match</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="eyebrow mb-1 gap-1.5 text-[var(--ui-faint)]"><Clock size={13} aria-hidden="true" /> Training</p>
                    <p className="text-xs font-medium text-[var(--ui-text)]">{career.training_duration}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1 gap-1.5 text-[var(--ui-faint)]"><GraduationCap size={13} aria-hidden="true" /> Education</p>
                    <p className="text-xs font-medium text-[var(--ui-text)]">{career.education_requirement}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1 gap-1.5 text-[var(--ui-faint)]"><Briefcase size={13} aria-hidden="true" /> Format</p>
                    <p className="text-xs font-medium capitalize text-[var(--ui-text)]">
                      {career.training_type.join(', ').replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Why it matches */}
              {recommendation && recommendation.explanation.length > 0 && (
                <Disclosure title="Why it fits you" description={`${recommendation.explanation.length} reasons based on your profile`} icon={<Star size={17} />}>
                  <ul className="space-y-3">
                    {recommendation.explanation.map((r, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check size={14} className="mt-1 shrink-0 text-[var(--ui-success)]" />
                        <span className="text-sm leading-relaxed text-[var(--ui-muted)]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              )}

              {/* AI Insight */}
              <Disclosure title="A counsellor’s perspective" description="Personalised AI explanation · Powered by Gemini" icon={<Lightbulb size={17} />}>
                {aiExplanation ? (
                  <p role="status" className="text-sm leading-relaxed text-[var(--ui-muted)]">{aiExplanation}</p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="max-w-md text-sm leading-relaxed text-[var(--ui-muted)]">
                      Get a personalised AI explanation of why this career suits your profile.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={aiLoading}
                      onClick={loadAIExplanation}
                      className="shrink-0"
                    >
                      {aiLoading ? 'Loading...' : 'Explain This'}
                    </Button>
                  </div>
                )}
              </Disclosure>

              {/* Skills */}
              <Disclosure title="Your skills, and the next steps" description={`${matchingSkills.length} matched · ${gaps.length} to build`} icon={<GraduationCap size={17} />}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[var(--ui-success)]">
                      <Check size={14} /> Skills you have ({matchingSkills.length})
                    </p>
                    <div className="space-y-2">
                      {career.required_skills.map((skill) => {
                        const has = matchingSkills.includes(skill);
                        return (
                          <div key={skill} className={cn(
                            'flex items-center gap-2 rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] px-3 py-2 text-xs font-medium',
                            has ? 'text-[var(--ui-success)]' : 'text-[var(--ui-muted)]',
                          )}>
                            {has ? <Check size={12} className="shrink-0" /> : <span className="h-3 w-3 shrink-0 rounded-sm border border-[var(--ui-border)]" />}
                            {skill}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[var(--ui-accent)]">
                      <AlertTriangle size={14} /> Skill gaps ({gaps.length})
                    </p>
                    {gaps.length === 0 ? (
                      <p className="rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] p-3 text-sm leading-relaxed text-[var(--ui-success)]">
                        No critical skill gaps. You&apos;re well-prepared for this career.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {gaps.map((gap) => (
                          <div key={gap.skill_name} className="rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] px-3 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-medium text-[var(--ui-text)]">{gap.skill_name}</span>
                              <Badge
                                variant={gap.importance === 'critical' ? 'error' : gap.importance === 'important' ? 'warning' : 'neutral'}
                                size="sm"
                              >
                                {gap.importance.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            {gap.how_to_acquire && (
                              <p className="mt-2 text-xs leading-relaxed text-[var(--ui-muted)]">{gap.how_to_acquire}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Disclosure>

              {/* Career Progression */}
              <Disclosure title="Room to grow" description={`${career.career_progression.length} progression steps`} icon={<TrendingUp size={17} />}>
                <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {career.career_progression.map((step, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] p-3">
                      <span className="section-title shrink-0 text-2xl text-[var(--ui-accent)]">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-[var(--ui-text)]">{step}</span>
                    </li>
                  ))}
                </ol>
              </Disclosure>

              {/* Further Education */}
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                <Disclosure title="Further education" description={`${career.further_education.length} study options`} icon={<BookOpen size={16} />}>
                  <ul className="space-y-1.5">
                    {career.further_education.map((edu) => (
                      <li key={edu} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--ui-muted)]">
                        <ChevronRight size={14} className="mt-1 shrink-0 text-[var(--ui-accent)]" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
                <Disclosure title="Entrepreneurship" description={`${career.entrepreneurship_options.length} business ideas`} icon={<Building size={16} />}>
                  <ul className="space-y-1.5">
                    {career.entrepreneurship_options.map((opt) => (
                      <li key={opt} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--ui-muted)]">
                        <ChevronRight size={14} className="mt-1 shrink-0 text-[var(--ui-accent)]" />
                        {opt}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              </div>
            </div>

            {/* Sidebar panel */}
            <aside className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
              {/* CTA */}
              <div className="dark-panel p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="eyebrow mb-0 text-[var(--ui-faint)]">Your next move</p>
                  <Zap size={19} className="text-[var(--ui-accent)]" />
                </div>
                <h2 className="section-title mb-2 text-2xl text-[var(--ui-text)]">See the path ahead.</h2>
                <p className="ui-note mb-3">
                  See the full step-by-step journey from where you are to employment and beyond.
                </p>
                <Link href={`/career-path/${career.id}`} className="flex min-h-11 items-center justify-between gap-3 border-t border-[var(--ui-border)] pt-3 text-xs font-medium text-[var(--ui-text)] hover:text-[var(--ui-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ui-accent)]">
                  Open Career Simulator <ArrowRight size={17} className="shrink-0 text-[var(--ui-accent)]" />
                </Link>
              </div>

              {/* Job roles */}
              <Disclosure title="Job roles" description={`${career.job_roles.length} career opportunities`} icon={<Briefcase size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {career.job_roles.map((role) => (
                    <span key={role} className="ui-chip">
                      {role}
                    </span>
                  ))}
                </div>
              </Disclosure>

              {/* Score breakdown */}
              {recommendation && (
                <Disclosure title="The match, explained" description="Interest, skills, demand, education, and budget" icon={<Star size={16} />}>
                  <div className="space-y-3">
                    {[
                      { label: 'Interest Match', value: recommendation.interest_score },
                      { label: 'Skill Match', value: recommendation.skill_score },
                      { label: 'Market Demand', value: recommendation.market_score },
                      { label: 'Education Fit', value: recommendation.education_score },
                      { label: 'Financial Fit', value: recommendation.financial_score },
                    ].map(({ label, value }) => (
                      <Progress key={label} label={label} value={value} showValue color="primary" size="sm" />
                    ))}
                  </div>
                  <p className="ui-note mt-4 border-t border-[var(--ui-border)] pt-3">
                    Illustrative scores based on your profile assessment.
                  </p>
                </Disclosure>
              )}

              {/* Family mode */}
              <Card padding="md">
                <p className="eyebrow mb-2 text-[var(--ui-faint)]">A shared decision</p>
                <h2 className="section-title mb-2 text-2xl text-[var(--ui-text)]">Share with family</h2>
                <p className="ui-note mb-3">
                  Generate a simple, parent-friendly report about this career.
                </p>
                <Link href="/family" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ui-accent)] hover:underline underline-offset-4">
                  Open Family Mode <ArrowRight size={14} />
                </Link>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
