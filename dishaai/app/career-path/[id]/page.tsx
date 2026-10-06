'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, GitBranch, Clock, DollarSign, Zap, BookOpen,
  ChevronRight, BarChart2, ArrowRight, CheckCircle2, Info
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CareerTimeline } from '@/components/career/CareerTimeline';
import { DEMO_CAREERS, DEMO_CAREER_PATHS } from '@/data/careers';
import { cn } from '@/lib/utils';
import type { OnboardingState, CareerPathway } from '@/types';

const DEMO_PROFILE_NAME = 'Ravi Sharma';

export default function CareerPathPage() {
  const params = useParams();
  const careerId = params.id as string;
  const [profile, setProfile] = useState<{ name: string }>({ name: DEMO_PROFILE_NAME });
  const [activePathway, setActivePathway] = useState(0);
  const [showWhatIf, setShowWhatIf] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setProfile({ name: p.name ?? DEMO_PROFILE_NAME });
      } catch {}
    }
  }, []);

  const career = useMemo(() => DEMO_CAREERS.find((c) => c.id === careerId) ?? DEMO_CAREERS[0], [careerId]);
  const pathways: CareerPathway[] = useMemo(
    () => DEMO_CAREER_PATHS[careerId] ?? DEMO_CAREER_PATHS['c-01'] ?? [],
    [careerId],
  );
  const currentPathway = pathways[activePathway];

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={profile.name} userRole="student" />

      <main className="flex-1 ml-[240px]">
        <div className="max-w-[1040px] mx-auto px-8 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#94a3b8] mb-6">
            <Link href={`/careers/${careerId}`} className="hover:text-[#1a2e5a] flex items-center gap-1">
              <ArrowLeft size={14} /> {career.name}
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#1a2e5a] font-medium">Career Path Simulator</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#e0f2fe] rounded-lg flex items-center justify-center">
                  <GitBranch size={16} className="text-[#0284c7]" />
                </div>
                <span className="text-sm font-semibold text-[#0284c7]">Career Path Simulator</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1a2e5a]">{career.name}</h1>
              <p className="text-[#64748b] mt-1">
                Explore your full journey from education to employment. Click each step to expand.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1.5 bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] rounded-full font-medium">
                Illustrative Pathways
              </span>
              <Button
                variant={showWhatIf ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowWhatIf((v) => !v)}
                icon={<BarChart2 size={14} />}
              >
                {showWhatIf ? 'Hide Comparison' : 'What If? Compare'}
              </Button>
            </div>
          </div>

          <div className={cn('grid gap-6', showWhatIf ? 'grid-cols-5' : 'grid-cols-3')}>

            {/* Timeline col */}
            <div className={showWhatIf ? 'col-span-2' : 'col-span-2'}>

              {/* Pathway selector */}
              {pathways.length > 1 && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {pathways.map((pw, i) => (
                    <button
                      key={pw.id}
                      onClick={() => setActivePathway(i)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                        activePathway === i
                          ? 'bg-[#1a2e5a] text-white shadow-sm'
                          : 'bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#c5d9f0]',
                      )}
                    >
                      {pw.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Stats bar */}
              {currentPathway && (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 mb-5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#94a3b8] mb-0.5">Total Duration</p>
                    <p className="text-sm font-bold text-[#1a2e5a] flex items-center gap-1">
                      <Clock size={13} className="text-[#0284c7]" />
                      {currentPathway.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8] mb-0.5">Training Cost</p>
                    <p className="text-sm font-bold text-[#1a2e5a] flex items-center gap-1">
                      <DollarSign size={13} className="text-[#059669]" />
                      {currentPathway.cost_range}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8] mb-0.5">Practical Exposure</p>
                    <p className="text-sm font-bold text-[#1a2e5a] flex items-center gap-1">
                      <Zap size={13} className="text-[#d97706]" />
                      {currentPathway.practical_exposure}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {currentPathway ? (
                <CareerTimeline
                  steps={currentPathway.steps}
                  pathwayName={currentPathway.name}
                />
              ) : (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center text-[#64748b]">
                  <GitBranch size={32} className="mx-auto mb-3 text-[#e2e8f0]" />
                  <p className="font-medium">Career path steps coming soon.</p>
                  <p className="text-sm mt-1">This career's detailed pathway is being added to the knowledge base.</p>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className={showWhatIf ? 'col-span-3' : 'col-span-1'}>

              {showWhatIf && pathways.length >= 2 ? (
                <PathwayComparison pathways={pathways} />
              ) : (
                <div className="space-y-4">
                  {/* Quick summary */}
                  <Card padding="md">
                    <h3 className="font-semibold text-[#1a2e5a] text-sm mb-3">Career Summary</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[#94a3b8] mb-1">Entry Requirement</p>
                        <p className="text-sm font-medium text-[#1a2e5a]">{career.education_requirement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94a3b8] mb-1">Training Type</p>
                        <div className="flex flex-wrap gap-1.5">
                          {career.training_type.map((t) => (
                            <Badge key={t} variant="info" size="sm">{t.toUpperCase()}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#94a3b8] mb-1">Career Growth</p>
                        <div className="space-y-1">
                          {career.career_progression.map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
                              <span className="text-xs text-[#475569]">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Further education */}
                  <Card padding="md">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={14} className="text-[#0284c7]" />
                      <h3 className="font-semibold text-[#1a2e5a] text-sm">Further Education</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {career.further_education.map((edu) => (
                        <li key={edu} className="flex items-start gap-2 text-xs text-[#475569]">
                          <CheckCircle2 size={12} className="text-[#0284c7] flex-shrink-0 mt-0.5" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* AI Counsellor CTA */}
                  <div className="bg-[#1a2e5a] rounded-2xl p-4 text-white">
                    <p className="font-semibold text-sm mb-1">Questions about this path?</p>
                    <p className="text-xs text-[#8aaee0] mb-3">Ask the AI Career Counsellor anything about this pathway.</p>
                    <Link href="/counsellor">
                      <Button variant="secondary" size="sm" fullWidth>
                        Ask AI Counsellor
                      </Button>
                    </Link>
                  </div>

                  {/* Family mode */}
                  <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4">
                    <p className="font-semibold text-sm text-[#0284c7] mb-1">Share with Parents</p>
                    <p className="text-xs text-[#0369a1] mb-3">
                      Generate a simple report for your family about this career path.
                    </p>
                    <Link href="/family">
                      <Button variant="outline" size="sm" fullWidth>Open Family Mode</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={16} className="text-[#0284c7]" />
        <h3 className="font-bold text-[#1a2e5a]">Pathway Comparison</h3>
        <span className="text-[10px] px-2 py-0.5 bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] rounded-full font-medium">
          Illustrative Data
        </span>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
        {/* Header row */}
        <div
          className="grid gap-0 border-b border-[#e2e8f0]"
          style={{ gridTemplateColumns: `160px repeat(${pathways.length}, 1fr)` }}
        >
          <div className="p-4 bg-[#f8faff]" />
          {pathways.map((pw) => (
            <div key={pw.id} className="p-4 bg-[#f8faff] border-l border-[#e2e8f0]">
              <p className="font-bold text-sm text-[#1a2e5a]">{pw.name}</p>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, ri) => (
          <div
            key={row.key}
            className={cn(
              'grid gap-0',
              ri < rows.length - 1 ? 'border-b border-[#f1f5f9]' : '',
            )}
            style={{ gridTemplateColumns: `160px repeat(${pathways.length}, 1fr)` }}
          >
            <div className="p-4 bg-[#f8faff]">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{row.label}</p>
            </div>
            {pathways.map((pw) => (
              <div key={pw.id} className="p-4 border-l border-[#f1f5f9]">
                <p className="text-sm text-[#1a2e5a] font-medium">{pw[row.key]}</p>
              </div>
            ))}
          </div>
        ))}

        {/* Further education row */}
        <div
          className="grid gap-0 border-t border-[#e2e8f0]"
          style={{ gridTemplateColumns: `160px repeat(${pathways.length}, 1fr)` }}
        >
          <div className="p-4 bg-[#f8faff]">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
              Further Education
            </p>
          </div>
          {pathways.map((pw) => (
            <div key={pw.id} className="p-4 border-l border-[#f1f5f9]">
              <Badge variant={pw.further_education_possible ? 'success' : 'neutral'} size="sm">
                {pw.further_education_possible ? 'Yes — multiple routes' : 'Limited options'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-xl">
        <Info size={14} className="text-[#d97706] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400e]">
          <strong>Illustrative Data:</strong> Cost ranges and duration estimates are indicative only.
          Actual figures vary by institution, state, and year. Please verify with the relevant ITI or polytechnic.
        </p>
      </div>
    </div>
  );
}
