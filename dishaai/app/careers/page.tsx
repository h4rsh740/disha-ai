'use client';
import { useMemo, useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { CareerCard } from '@/components/career/CareerCard';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { DEMO_CAREERS } from '@/data/careers';
import type { RecommendationScore, OnboardingState } from '@/types';

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

export default function CareersPage() {
  const [profile, setProfile] = useState<OnboardingState>(DEMO_PROFILE);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch {}
    }
  }, []);

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

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="flex-1 ml-[240px] min-h-screen">
        <div className="max-w-[1040px] mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2e5a]">Career Recommendations</h1>
            <p className="text-[#64748b] mt-1">
              {recommendations.length} careers matched to your profile · Sorted by compatibility
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search careers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#e2e8f0] rounded-xl text-sm text-[#1a2e5a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9] bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#94a3b8]" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-[#e2e8f0] rounded-xl text-sm text-[#1a2e5a] focus:outline-none focus:border-[#0ea5e9] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[#d97706] bg-[#fffbeb] border border-[#fef3c7] px-2.5 py-1.5 rounded-full font-medium">
              Demo · Illustrative Data
            </span>
          </div>

          {/* Compare bar */}
          {compareList.length > 0 && (
            <div className="bg-[#1a2e5a] text-white rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">
                  Comparing {compareList.length} career{compareList.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-[#8aaee0] mt-0.5">
                  Select up to 3 careers to compare side by side
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCompareList([])}
                  className="text-xs text-[#8aaee0] hover:text-white transition-colors"
                >
                  Clear
                </button>
                {compareList.length >= 2 && (
                  <a
                    href={`/career-path/${compareList[0]}?compare=${compareList.slice(1).join(',')}`}
                    className="px-4 py-2 bg-[#0ea5e9] rounded-xl text-sm font-semibold hover:bg-[#0284c7] transition-colors"
                  >
                    Compare Now →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Career grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((rec) => (
              <CareerCard
                key={rec.career_id}
                recommendation={rec}
                showCompare
                onCompare={toggleCompare}
                isComparing={compareList.includes(rec.career_id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search size={40} className="text-[#e2e8f0] mx-auto mb-4" />
              <p className="text-[#64748b] font-medium">No careers found matching your filters.</p>
              <button
                onClick={() => { setSearch(''); setCategory(''); }}
                className="mt-3 text-sm text-[#0284c7] hover:text-[#0369a1]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
