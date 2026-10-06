'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Check, AlertTriangle, Clock, GraduationCap,
  TrendingUp, BookOpen, Briefcase, Zap, ChevronRight,
  Lightbulb, Building, ArrowRight, Star
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { DEMO_CAREERS } from '@/data/careers';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { cn, scoreColor, scoreBg } from '@/lib/utils';
import type { Career, OnboardingState, RecommendationScore } from '@/types';

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

export default function CareerDetailPage() {
  const params = useParams();
  const careerId = params.id as string;
  const [profile, setProfile] = useState<OnboardingState>(DEMO_PROFILE);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) { try { setProfile(JSON.parse(saved)); } catch {} }
  }, []);

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
      <div className="min-h-screen bg-[#f0f4ff] flex">
        <Sidebar userName={profile.name ?? 'Student'} />
        <main className="flex-1 ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#64748b] font-medium">Career not found.</p>
            <Link href="/careers" className="mt-3 text-[#0284c7] text-sm hover:underline">← Back to careers</Link>
          </div>
        </main>
      </div>
    );
  }

  const score = recommendation?.total_score ?? 0;
  const gaps = recommendation?.skill_gaps ?? [];
  const matchingSkills = recommendation?.matching_skills ?? [];

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={profile.name ?? 'Student'} />

      <main className="flex-1 ml-[240px]">
        <div className="max-w-[1040px] mx-auto px-8 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#94a3b8] mb-6">
            <Link href="/careers" className="hover:text-[#1a2e5a] flex items-center gap-1">
              <ArrowLeft size={14} /> Career Matches
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#1a2e5a] font-medium">{career.name}</span>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main content */}
            <div className="col-span-2 space-y-5">

              {/* Hero card */}
              <Card padding="lg">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="info" size="sm">{career.category.replace(/_/g, ' ')}</Badge>
                      {career.nsqf_level && <Badge variant="neutral" size="sm">NSQF {career.nsqf_level}</Badge>}
                      {career.is_demo_data && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] rounded-full font-medium">
                          Illustrative Data
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-[#1a2e5a]">{career.name}</h1>
                    <p className="text-[#64748b] mt-1 leading-relaxed">{career.description}</p>
                  </div>
                  {recommendation && (
                    <div
                      className="flex-shrink-0 text-center px-4 py-3 rounded-2xl"
                      style={{ backgroundColor: scoreBg(score) }}
                    >
                      <span className="text-3xl font-bold block" style={{ color: scoreColor(score) }}>
                        {score}%
                      </span>
                      <span className="text-xs font-semibold" style={{ color: scoreColor(score) }}>
                        Match
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-[#f8faff] rounded-xl">
                  <div className="text-center">
                    <Clock size={18} className="text-[#0284c7] mx-auto mb-1" />
                    <p className="text-xs text-[#94a3b8]">Training Duration</p>
                    <p className="text-sm font-semibold text-[#1a2e5a]">{career.training_duration}</p>
                  </div>
                  <div className="text-center">
                    <GraduationCap size={18} className="text-[#059669] mx-auto mb-1" />
                    <p className="text-xs text-[#94a3b8]">Education Required</p>
                    <p className="text-sm font-semibold text-[#1a2e5a]">{career.education_requirement}</p>
                  </div>
                  <div className="text-center">
                    <Briefcase size={18} className="text-[#d97706] mx-auto mb-1" />
                    <p className="text-xs text-[#94a3b8]">Training Type</p>
                    <p className="text-sm font-semibold text-[#1a2e5a] capitalize">
                      {career.training_type.join(', ')}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Why it matches */}
              {recommendation && recommendation.explanation.length > 0 && (
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={16} className="text-[#0ea5e9]" />
                    <h2 className="font-bold text-[#1a2e5a]">Why this career matches you</h2>
                  </div>
                  <ul className="space-y-2.5">
                    {recommendation.explanation.map((r, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#ecfdf5] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={11} className="text-[#059669]" />
                        </div>
                        <span className="text-sm text-[#475569]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* AI Insight */}
              <div className="bg-gradient-to-r from-[#f0f4ff] to-[#e0f2fe] border border-[#bae6fd] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-[#0284c7]" />
                  <h3 className="font-semibold text-[#1a2e5a] text-sm">AI Career Explanation</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-[#1a2e5a] text-white rounded-full">Powered by Gemini</span>
                </div>
                {aiExplanation ? (
                  <p className="text-sm text-[#475569] leading-relaxed">{aiExplanation}</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-[#64748b]">
                      Get a personalised AI explanation of why this career suits your profile.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={aiLoading}
                      onClick={loadAIExplanation}
                      className="flex-shrink-0"
                    >
                      {aiLoading ? 'Loading...' : 'Explain This'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Skills */}
              <Card padding="md">
                <h2 className="font-bold text-[#1a2e5a] mb-4">Skills Analysis</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-[#059669] mb-3 flex items-center gap-1.5">
                      <Check size={14} /> Skills you have ({matchingSkills.length})
                    </p>
                    <div className="space-y-2">
                      {career.required_skills.map((skill) => {
                        const has = matchingSkills.includes(skill);
                        return (
                          <div key={skill} className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                            has ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#f1f5f9] text-[#94a3b8]',
                          )}>
                            {has ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-[#cbd5e1]" />}
                            {skill}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#d97706] mb-3 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Skill gaps ({gaps.length})
                    </p>
                    {gaps.length === 0 ? (
                      <p className="text-sm text-[#059669] bg-[#ecfdf5] p-3 rounded-lg">
                        🎉 No critical skill gaps! You're well-prepared for this career.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {gaps.map((gap) => (
                          <div key={gap.skill_name} className="px-3 py-2 bg-[#fffbeb] border border-[#fef3c7] rounded-lg">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-[#92400e]">{gap.skill_name}</span>
                              <Badge
                                variant={gap.importance === 'critical' ? 'error' : gap.importance === 'important' ? 'warning' : 'neutral'}
                                size="sm"
                              >
                                {gap.importance}
                              </Badge>
                            </div>
                            {gap.how_to_acquire && (
                              <p className="text-[11px] text-[#92400e] mt-0.5 opacity-75">{gap.how_to_acquire}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Career Progression */}
              <Card padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-[#7c3aed]" />
                  <h2 className="font-bold text-[#1a2e5a]">Career Progression</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {career.career_progression.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-[#f5f3ff] border border-[#e9d5ff] rounded-full text-xs font-medium text-[#7c3aed]">
                        {step}
                      </div>
                      {i < career.career_progression.length - 1 && (
                        <ArrowRight size={14} className="text-[#c4b5fd]" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Further Education */}
              <div className="grid grid-cols-2 gap-5">
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={16} className="text-[#0284c7]" />
                    <h3 className="font-semibold text-[#1a2e5a] text-sm">Further Education</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {career.further_education.map((edu) => (
                      <li key={edu} className="flex items-start gap-2 text-sm text-[#475569]">
                        <ChevronRight size={14} className="text-[#0284c7] flex-shrink-0 mt-0.5" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-3">
                    <Building size={16} className="text-[#059669]" />
                    <h3 className="font-semibold text-[#1a2e5a] text-sm">Entrepreneurship</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {career.entrepreneurship_options.map((opt) => (
                      <li key={opt} className="flex items-start gap-2 text-sm text-[#475569]">
                        <ChevronRight size={14} className="text-[#059669] flex-shrink-0 mt-0.5" />
                        {opt}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>

            {/* Sidebar panel */}
            <div className="col-span-1 space-y-4">
              {/* CTA */}
              <div className="bg-[#1a2e5a] rounded-2xl p-5 text-white">
                <Zap size={20} className="text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-base mb-2">Simulate This Career</h3>
                <p className="text-sm text-[#8aaee0] mb-4 leading-snug">
                  See the full step-by-step journey from where you are to employment and beyond.
                </p>
                <Link href={`/career-path/${career.id}`}>
                  <Button variant="secondary" size="md" fullWidth icon={<ArrowRight size={15} />} iconPosition="right">
                    Open Career Simulator
                  </Button>
                </Link>
              </div>

              {/* Job roles */}
              <Card padding="md">
                <h3 className="font-semibold text-[#1a2e5a] text-sm mb-3">Job Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {career.job_roles.map((role) => (
                    <span key={role} className="px-2.5 py-1 bg-[#f0f4ff] text-[#1a2e5a] border border-[#c5d9f0] rounded-full text-xs font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Score breakdown */}
              {recommendation && (
                <Card padding="md">
                  <h3 className="font-semibold text-[#1a2e5a] text-sm mb-4">Match Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Interest Match', value: recommendation.interest_score },
                      { label: 'Skill Match', value: recommendation.skill_score },
                      { label: 'Market Demand', value: recommendation.market_score },
                      { label: 'Education Fit', value: recommendation.education_score },
                      { label: 'Financial Fit', value: recommendation.financial_score },
                    ].map(({ label, value }) => (
                      <Progress key={label} label={label} value={value} showValue color="auto" size="sm" animated />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#94a3b8] mt-3">
                    Illustrative scores based on your profile assessment.
                  </p>
                </Card>
              )}

              {/* Family mode */}
              <Card padding="md" className="bg-[#f0f9ff] border-[#bae6fd]">
                <h3 className="font-semibold text-[#0284c7] text-sm mb-2">Share with Family</h3>
                <p className="text-xs text-[#0369a1] mb-3 leading-snug">
                  Generate a simple, parent-friendly report about this career.
                </p>
                <Link href="/family">
                  <Button variant="outline" size="sm" fullWidth>Open Family Mode</Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
