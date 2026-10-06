'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, CheckCircle2, Clock, TrendingUp, BookOpen, Building,
  ChevronDown, ChevronUp, ArrowRight, Shield, Briefcase, GraduationCap,
  FileText, Share2, HelpCircle
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
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

interface FAQCardProps {
  question: string;
  career: Career;
}

function FAQCard({ question, career }: FAQCardProps) {
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
    <button
      onClick={load}
      className={cn(
        'w-full text-left bg-white border rounded-2xl p-5 transition-all duration-200 group',
        open ? 'border-[#0ea5e9] shadow-[0_0_0_2px_rgba(14,165,233,0.1)]' : 'border-[#e2e8f0] hover:border-[#c5d9f0] hover:shadow-sm',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            open ? 'bg-[#0ea5e9]' : 'bg-[#f0f4ff]',
          )}>
            <Icon size={17} className={open ? 'text-white' : 'text-[#1a2e5a]'} />
          </div>
          <span className="font-semibold text-[#1a2e5a] text-sm">{question}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[#94a3b8]" /> : <ChevronDown size={16} className="text-[#94a3b8]" />}
      </div>

      {open && (
        <div className="mt-4 ml-12">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#64748b]">Getting answer...</span>
            </div>
          ) : (
            <p className="text-sm text-[#475569] leading-relaxed">{answer}</p>
          )}
        </div>
      )}
    </button>
  );
}

export default function FamilyPage() {
  const [profile, setProfile] = useState<OnboardingState>(DEMO_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) { try { setProfile(JSON.parse(saved)); } catch {} }
    setLoaded(true);
  }, []);

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
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="flex-1 ml-[240px]">
        <div className="max-w-[1040px] mx-auto px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#1a2e5a] rounded-lg flex items-center justify-center">
                <Users size={16} className="text-[#0ea5e9]" />
              </div>
              <span className="text-sm font-semibold text-[#0284c7]">Family Decision Mode</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1a2e5a]">
              Understand Your Child's Career Path
            </h1>
            <p className="text-[#64748b] mt-1">
              Simple, clear guidance designed for parents and families — no technical jargon.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main content */}
            <div className="col-span-2 space-y-5">

              {/* Recommended career */}
              <div className="bg-[#1a2e5a] rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#0ea5e9]/10 rounded-full -translate-y-1/4 translate-x-1/4" />
                <div className="relative z-10">
                  <p className="text-[#8aaee0] text-sm mb-2">Recommended career for {profile.name ?? 'your child'}</p>
                  <h2 className="text-2xl font-bold mb-2">{topCareer.name}</h2>
                  <p className="text-[#c5d9f0] leading-relaxed text-sm mb-4">
                    {topCareer.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                      <Clock size={14} className="text-[#0ea5e9]" />
                      <span className="text-sm">{topCareer.training_duration} training</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                      <GraduationCap size={14} className="text-[#0ea5e9]" />
                      <span className="text-sm">{topCareer.education_requirement}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why it suits */}
              <Card padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-[#059669]" />
                  <h2 className="font-bold text-[#1a2e5a]">
                    Why this career suits {profile.name ?? 'your child'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {topCareer.why_choose.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#f8faff] rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-[#ecfdf5] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={11} className="text-[#059669]" />
                      </div>
                      <p className="text-sm text-[#475569] leading-relaxed">{reason}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Training journey */}
              {primaryPathway && (
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-[#7c3aed]" />
                    <h2 className="font-bold text-[#1a2e5a]">The Training Journey</h2>
                    <span className="text-xs px-2 py-0.5 bg-[#f5f3ff] text-[#7c3aed] rounded-full font-medium">
                      Step by step
                    </span>
                  </div>
                  <div className="space-y-3">
                    {primaryPathway.steps.slice(0, 5).map((step, i) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-[#1a2e5a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </div>
                          {i < 4 && <div className="w-0.5 h-4 bg-[#e2e8f0] mt-1" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="font-semibold text-sm text-[#1a2e5a]">{step.title}</p>
                          <p className="text-xs text-[#64748b] mt-0.5">{step.description}</p>
                          <span className="text-[11px] text-[#0284c7] mt-1 inline-block">⏱ {step.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Career opportunities */}
              <div className="grid grid-cols-2 gap-4">
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase size={15} className="text-[#0284c7]" />
                    <h3 className="font-semibold text-[#1a2e5a] text-sm">Career Opportunities</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {topCareer.job_roles.slice(0, 4).map((role) => (
                      <li key={role} className="flex items-center gap-2 text-sm text-[#475569]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0284c7] flex-shrink-0" />
                        {role}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card padding="md">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={15} className="text-[#059669]" />
                    <h3 className="font-semibold text-[#1a2e5a] text-sm">Further Studies</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {topCareer.further_education.slice(0, 3).map((edu) => (
                      <li key={edu} className="flex items-center gap-2 text-sm text-[#475569]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="font-bold text-[#1a2e5a] text-lg mb-4 flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#0284c7]" />
                  Questions Families Ask
                </h2>
                <div className="space-y-3">
                  {FAMILY_FAQ.map((faq) => (
                    <FAQCard key={faq.id} question={faq.question} career={topCareer} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="col-span-1 space-y-4">

              {/* Generate report CTA */}
              <div className="bg-[#1a2e5a] rounded-2xl p-5 text-white">
                <FileText size={20} className="text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-base mb-2">Official Career Report</h3>
                <p className="text-sm text-[#8aaee0] mb-4 leading-snug">
                  Generate a complete, printable career report to discuss with your family.
                </p>
                <Link href="/family/report">
                  <Button variant="secondary" size="md" fullWidth icon={<ArrowRight size={15} />} iconPosition="right">
                    Generate Report
                  </Button>
                </Link>
              </div>

              {/* Entrepreneur potential */}
              <Card padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <Building size={15} className="text-[#d97706]" />
                  <h3 className="font-semibold text-[#1a2e5a] text-sm">Business Opportunities</h3>
                </div>
                <p className="text-xs text-[#64748b] mb-3">
                  After gaining experience, your child could start their own business:
                </p>
                <ul className="space-y-1.5">
                  {topCareer.entrepreneurship_options.slice(0, 3).map((opt) => (
                    <li key={opt} className="flex items-start gap-2 text-xs text-[#475569]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#d97706] flex-shrink-0 mt-1.5" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Demo notice */}
              <div className="p-4 bg-[#fffbeb] border border-[#fef3c7] rounded-2xl">
                <p className="text-xs font-semibold text-[#d97706] mb-1">Demo Mode</p>
                <p className="text-xs text-[#92400e] leading-relaxed">
                  This is illustrative career information. AI answers are grounded in our career knowledge base only — not official statistics.
                </p>
              </div>

              {/* Career simulator link */}
              <Card padding="md" className="bg-[#f0f4ff] border-[#c5d9f0]">
                <h3 className="font-semibold text-[#1a2e5a] text-sm mb-2">See Full Career Path</h3>
                <p className="text-xs text-[#64748b] mb-3">View the step-by-step training journey in detail.</p>
                <Link href={`/career-path/${topCareer.id}`}>
                  <Button variant="outline" size="sm" fullWidth>Open Career Simulator</Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
