'use client';
import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search, Filter } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { CareerCard } from '@/components/career/CareerCard';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { paginateCareers } from '@/lib/pagination';
import type { OnboardingState } from '@/types';

const DEMO_PROFILE: OnboardingState = {
  step: 5,
  name: 'Ravi Sharma',
  education_level: 'class_10',
  selected_interests: ['electrical', 'renewable_energy', 'technology'],
  selected_skills: [
    { skill_id: 'sk-01', skill_name: 'Basic Electronics', proficiency: 3 },
    { skill_id: 'sk-03', skill_name: 'Problem Solving', proficiency: 3 },
    { skill_id: 'sk-04', skill_name: 'Mathematics', proficiency: 2 },
  ],
  learning_preference: 'practical',
  work_environment: 'mixed',
  training_duration: 'medium',
  budget_range: 'zero',
  career_goals: ['quick_job', 'long_term'],
};

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'electric_vehicles', label: 'Electric Vehicles' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'it_electronics', label: 'IT & Electronics' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
];

function subscribeProfile(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}
const readProfile = () => localStorage.getItem('disha_onboarding') ?? '';
const serverProfile = () => null;

export default function CareersPage() {
  const savedProfile = useSyncExternalStore(subscribeProfile, readProfile, serverProfile);
  const profile = useMemo<OnboardingState>(() => {
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch { /* Keep the demo fallback. */ }
    }
    return DEMO_PROFILE;
  }, [savedProfile]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

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

  const recommendations = useMemo(
    () => generateRecommendations(studentProfile, profile.selected_skills),
    [studentProfile, profile.selected_skills],
  );

  const filtered = useMemo(() => {
    let list = recommendations;
    if (category) list = list.filter((r) => r.career.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.career.name.toLowerCase().includes(q) ||
          r.career.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [recommendations, category, search]);

  const { pageCount, currentPage, start, visible } = paginateCareers(filtered, page);

  const changePage = (next: number) => {
    setPage(Math.max(1, Math.min(next, pageCount)));
    resultsHeading.current?.focus({ preventScroll: true });
    resultsHeading.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  return (
    <div className="app-page">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="app-main">
        <div className="app-content">
          <PageHeader
            chapter="02"
            eyebrow="Career matches"
            title={<>Possibilities, <em>picked for you.</em></>}
            description={`${recommendations.length} careers matched to your profile. Explore what fits, then compare the paths that spark your interest.`}
            actions={<span className="ui-chip">Demo · Illustrative data</span>}
          />

          {/* Filters */}
          <section aria-label="Filter career matches" className="paper-panel mb-4 p-4">
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
              <div className="min-w-0">
                <label htmlFor="career-search" className="eyebrow mb-2 flex items-center gap-1.5 text-[var(--ui-muted)]">
                  <Search size={12} aria-hidden="true" /> Find a possibility
                </label>
                <input
                  id="career-search"
                  type="search"
                  placeholder="Search careers…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="app-input w-full"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="career-category" className="eyebrow mb-2 flex items-center gap-1.5 text-[var(--ui-muted)]">
                  <Filter size={12} aria-hidden="true" /> Field of work
                </label>
                <select
                  id="career-category"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="app-input w-full"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ui-border)] pt-3">
              <p className="text-xs text-[var(--ui-muted)]" aria-live="polite">{filtered.length ? `Showing ${start + 1}–${start + visible.length} of ${filtered.length} matches` : 'No matching careers'}</p>
              <span className="ui-note">Sorted by compatibility</span>
            </div>
          </section>

          {/* Compare bar */}
          {compareList.length > 0 && (
            <section aria-label="Selected careers for comparison" className="dark-panel mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="section-title text-2xl text-[var(--ui-text)]" aria-live="polite">
                  Comparing {compareList.length} career{compareList.length > 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-xs text-[var(--ui-muted)]">
                  Select up to 3 careers to compare side by side
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {compareList.map((id) => <span key={id} className="ui-chip">{recommendations.find((rec) => rec.career_id === id)?.career.name ?? id}</span>)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompareList([])}
                >
                  Clear
                </Button>
                {compareList.length >= 2 && (
                  <Link
                    href={`/career-path/${compareList[0]}?compare=${compareList.slice(1).join(',')}`}
                    className="inline-flex items-center gap-2 rounded-sm border border-[var(--ui-accent)] px-4 py-2 text-sm text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ui-accent)]"
                  >
                    Compare now <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Career grid */}
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--ui-border)] pb-3">
            <h2 ref={resultsHeading} tabIndex={-1} className="section-title scroll-mt-24 text-2xl text-[var(--ui-text)] sm:scroll-mt-20 lg:scroll-mt-4">Your shortlist of possibilities</h2>
            <span className="eyebrow mb-0 text-[var(--ui-faint)]">Explore. Compare. Decide.</span>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((rec) => (
              <CareerCard
                key={rec.career_id}
                recommendation={rec}
                showCompare
                onCompare={toggleCompare}
                isComparing={compareList.includes(rec.career_id)}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <nav aria-label="Career results pages" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ui-border)] pt-3">
              <p className="text-xs text-[var(--ui-muted)]" aria-live="polite">Page {currentPage} of {pageCount}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)} icon={<ArrowLeft size={13} aria-hidden="true" />}>Previous</Button>
                <Button variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)} icon={<ArrowRight size={13} aria-hidden="true" />} iconPosition="right">Next</Button>
              </div>
            </nav>
          )}

          {filtered.length === 0 && (
            <div className="paper-panel px-5 py-8 text-center">
              <Search size={26} className="mx-auto mb-4 text-[var(--ui-faint)]" aria-hidden="true" />
              <h3 className="section-title text-3xl text-[var(--ui-text)]">A different search might open a door.</h3>
              <p className="mb-5 mt-2 text-sm text-[var(--ui-muted)]">No careers found matching your filters.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setCategory(''); setPage(1); }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
