'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, BrainCircuit, Target, Star, ArrowRight,
  AlertTriangle, Zap, User, Briefcase, BookOpen, ChevronRight
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress, ScoreRing } from '@/components/ui/Progress';
import { CareerCard } from '@/components/career/CareerCard';
import { generateRecommendations, buildCareerTwin } from '@/lib/recommendation/engine';
import { DEMO_CAREERS } from '@/data/careers';
import type { OnboardingState, RecommendationScore } from '@/types';

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

export default function DashboardPage() {
  const [profile, setProfile] = useState<OnboardingState>(DEMO_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        setProfile(DEMO_PROFILE);
      }
    }
    setLoaded(true);
  }, []);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#0ea5e9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748b]">Generating your Career Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={name} userRole="student" />

      {/* Main content */}
      <main className="flex-1 ml-[240px] min-h-screen">
        <div className="max-w-[1040px] mx-auto px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1a2e5a]">
                  {greeting}, {name} 👋
                </h1>
                <p className="text-[#64748b] mt-1">
                  Your Career Twin is ready. Here are your top matches.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1.5 bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] rounded-full font-medium">
                  Demo Mode — Illustrative Data
                </span>
                <Link href="/onboarding">
                  <Button variant="outline" size="sm">
                    Retake Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Score cards */}
          {careerTwin && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Career Readiness', value: careerTwin.readiness_score, icon: Target, color: '#1a2e5a' },
                { label: 'Interest Match', value: careerTwin.interest_match, icon: Star, color: '#0284c7' },
                { label: 'Skill Match', value: careerTwin.skill_match, icon: Zap, color: '#059669' },
                { label: 'Career Clarity', value: careerTwin.career_clarity, icon: TrendingUp, color: '#d97706' },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.label} padding="md" className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <ScoreRing score={metric.value} size={72} strokeWidth={6} />
                    </div>
                    <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
                      {metric.label}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* Left — Career Twin */}
            <div className="col-span-1">
              <Card padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#f0f4ff] rounded-lg flex items-center justify-center">
                    <User size={16} className="text-[#1a2e5a]" />
                  </div>
                  <h2 className="font-bold text-[#1a2e5a]">Your Career Twin</h2>
                </div>

                {careerTwin && (
                  <div className="space-y-4">
                    {careerTwin.interests.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                          Strong Interests
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {careerTwin.interests.map((i) => (
                            <Badge key={i} variant="info" size="sm">
                              {i.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {careerTwin.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                          Your Strengths
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {careerTwin.strengths.map((s) => (
                            <Badge key={s} variant="success" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                        Work Style
                      </p>
                      <p className="text-sm text-[#475569]">{careerTwin.work_style}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                        Education
                      </p>
                      <p className="text-sm text-[#475569]">{careerTwin.education_profile}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                        Career Orientation
                      </p>
                      <p className="text-sm text-[#475569]">{careerTwin.career_orientation}</p>
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-[#f1f5f9]">
                  <Link href="/counsellor">
                    <Button variant="outline" size="sm" fullWidth icon={<BrainCircuit size={14} />}>
                      Ask AI Counsellor
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Right — Career matches */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a2e5a] text-lg">Top Career Matches</h2>
                <Link href="/careers" className="text-sm text-[#0284c7] font-medium flex items-center gap-1 hover:text-[#0369a1]">
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <CareerCard key={rec.career_id} recommendation={rec} showCompare />
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href="/career-path/c-01">
                  <div className="p-4 bg-[#1a2e5a] rounded-2xl text-white hover:bg-[#0f1e3c] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-[#0ea5e9]" />
                      <span className="text-xs font-semibold text-[#8aaee0]">Hero Feature</span>
                    </div>
                    <p className="font-semibold text-sm">Career Path Simulator</p>
                    <p className="text-xs text-[#8aaee0] mt-0.5">
                      Visualise your full journey step by step
                    </p>
                    <ArrowRight size={14} className="text-[#0ea5e9] mt-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link href="/family">
                  <div className="p-4 bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl hover:bg-[#e0f2fe] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={16} className="text-[#0284c7]" />
                      <span className="text-xs font-semibold text-[#0284c7]">For Family</span>
                    </div>
                    <p className="font-semibold text-sm text-[#1a2e5a]">Family Decision Mode</p>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Share with parents in simple language
                    </p>
                    <ArrowRight size={14} className="text-[#0284c7] mt-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
