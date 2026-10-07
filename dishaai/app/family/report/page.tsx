'use client';
import { useState, useMemo, useSyncExternalStore } from 'react';
import {
  FileText, Printer, GraduationCap,
  CheckCircle2, TrendingUp, BookOpen, Building, ArrowRight,
  Briefcase, AlertTriangle, User, Loader2
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Disclosure } from '@/components/ui/Disclosure';
import { DEMO_CAREERS } from '@/data/careers';
import { generateRecommendations } from '@/lib/recommendation/engine';
import type { OnboardingState } from '@/types';

const DEMO_PROFILE: OnboardingState = {
  step: 5, name: 'Ravi Sharma', education_level: 'class_10',
  selected_interests: ['electrical', 'renewable_energy'],
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

type ReportData = {
  student_profile_summary: string;
  career_overview: string;
  why_suitable: string;
  training_journey: string;
  career_opportunities: string;
  career_growth: string;
  further_education: string;
  entrepreneurship: string;
  next_steps: string[];
};

export default function FamilyReportPage() {
  const savedProfile = useSyncExternalStore(subscribeToProfile, readStoredProfile, readServerProfile);
  const profile = useMemo<OnboardingState>(() => {
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch {}
    }
    return DEMO_PROFILE;
  }, [savedProfile]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');
  const [generated, setGenerated] = useState(false);
  const [reportMeta, setReportMeta] = useState({ id: '', date: '' });

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

  const topCareer = useMemo(() => {
    const recs = generateRecommendations(studentProfile, profile.selected_skills);
    return recs[0]?.career ?? DEMO_CAREERS[0];
  }, [studentProfile, profile.selected_skills]);

  const topRec = useMemo(() => {
    const recs = generateRecommendations(studentProfile, profile.selected_skills, [topCareer]);
    return recs[0];
  }, [studentProfile, profile.selected_skills, topCareer]);

  const generateReport = async () => {
    setLoading(true);
    const generatedAt = new Date();
    setReportMeta({
      id: `DSHA-${generatedAt.getTime().toString().slice(-6)}`,
      date: generatedAt.toLocaleDateString('en-IN'),
    });
    try {
      const res = await fetch('/api/ai/family-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: profile.name ?? 'Student',
          careerId: topCareer.id,
          studentProfile: {
            education_level: profile.education_level,
            interests: profile.selected_interests,
            skills: profile.selected_skills.map((s) => s.skill_name),
            learning_preference: profile.learning_preference,
            career_goals: profile.career_goals,
          },
        }),
      });
      const data = await res.json();
      setReport(data.report);
      setProvider(data.provider ?? '');
      setGenerated(true);
    } catch {
      // Fallback report
      setReport({
        student_profile_summary: `${profile.name ?? 'Your child'} has shown strong practical learning abilities and a keen interest in electrical and renewable energy fields. Their problem-solving skills and hands-on learning preference make them well-suited for technical vocational careers.`,
        career_overview: topCareer.description,
        why_suitable: topCareer.why_choose.join(' '),
        training_journey: `The training typically takes ${topCareer.training_duration} through an ITI or affiliated certification program. The program combines classroom learning with hands-on practical sessions.`,
        career_opportunities: `After completing training, ${profile.name ?? 'your child'} can work as: ${topCareer.job_roles.join(', ')}.`,
        career_growth: `Starting as a trainee, they can progress to: ${topCareer.career_progression.join(' → ')}.`,
        further_education: topCareer.further_education.join('; '),
        entrepreneurship: topCareer.entrepreneurship_options.join('; '),
        next_steps: [
          'Research nearby ITI / training institutes offering this trade',
          'Check eligibility and admission process',
          'Visit the Skill India portal for more information',
        ],
      });
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => window.print();

  return (
    <div className="app-page">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="app-main">
        <div className="app-content">
          <div className="print:hidden">
            <PageHeader
              chapter="04"
              eyebrow="For the family"
              title="Family career report."
              description="A personalised career assessment for a clearer family conversation — generated by DishaAI."
              actions={!generated ? (
                <Button
                  variant="primary"
                  size="md"
                  loading={loading}
                  onClick={generateReport}
                  icon={loading ? undefined : <FileText size={15} aria-hidden="true" />}
                >
                  {loading ? 'Generating report...' : 'Generate Report'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" icon={<Printer size={14} aria-hidden="true" />} onClick={printReport}>
                  Print report
                </Button>
              )}
            />
          </div>

          {!generated && !loading && (
            <div className="paper-panel px-5 py-8 text-center sm:p-8">
              <span className="ui-icon mb-3" aria-hidden="true"><FileText size={20} /></span>
              <h2 className="section-title mb-3">Ready for a clearer picture?</h2>
              <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-[var(--ui-muted)]">
                Generate a personalised Family Career Report for <strong className="font-medium text-[var(--ui-text)]">{profile.name ?? 'the student'}</strong>&apos;s
                recommended career, <span className="text-[var(--ui-text)]">{topCareer.name}</span>.
              </p>
              <Button variant="primary" size="lg" onClick={generateReport} icon={<ArrowRight size={16} aria-hidden="true" />} iconPosition="right">
                Generate Family Report
              </Button>
            </div>
          )}

          {loading && (
            <div className="paper-panel px-5 py-8 text-center sm:p-8" role="status">
              <Loader2 size={30} className="mx-auto mb-5 animate-spin text-[var(--ui-accent)] motion-reduce:animate-none" aria-hidden="true" />
              <p className="section-title">Preparing your family career report...</p>
              <p className="ui-note mt-3">Our AI is crafting a personalised report. This takes a few seconds.</p>
            </div>
          )}

          {generated && report && (
            <article className="paper-panel overflow-hidden print:overflow-visible print:rounded-none! print:border-0!" id="family-report" aria-label="Family career assessment report">
              <header className="border-b border-t-2 border-b-[var(--ui-border)] border-t-[var(--ui-accent)] bg-[var(--ui-surface-2)] px-4 py-4 sm:px-5 print:bg-transparent">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="ui-icon" aria-hidden="true"><GraduationCap size={19} /></span>
                    <div className="min-w-0">
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-[var(--ui-faint)]">DishaAI — Career Intelligence Platform</p>
                      <h2 className="font-[family-name:var(--ui-serif)] text-2xl leading-tight text-[var(--ui-text)]">Career assessment &amp; pathway dossier</h2>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-[var(--ui-border)] pt-3 text-xs leading-relaxed text-[var(--ui-muted)] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-right">
                    <p>Report ID: {reportMeta.id}</p>
                    <p>Generated: {reportMeta.date}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="info" size="sm">MSDE Hackathon Demo</Badge>
                  <Badge variant="warning" size="sm">Illustrative Data</Badge>
                  {provider && <span className="text-xs text-[var(--ui-muted)]">AI: {provider}</span>}
                </div>
              </header>

              <p className="ui-note px-4 pt-3 sm:px-5 print:hidden">Open sections for details. Printing includes the complete report, even when sections are closed.</p>
              <div className="space-y-1 p-4 sm:p-5 print:space-y-3">
                <ReportSection icon={User} title="01. Student profile" color="var(--ui-faint)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.student_profile_summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="ui-chip">
                      {profile.education_level?.replace('_', ' ')}
                    </span>
                    {profile.selected_interests.map((i) => (
                      <span key={i} className="ui-chip">
                        {i.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </ReportSection>

                <ReportSection icon={Briefcase} title="02. Recommended career" color="var(--ui-accent)" defaultOpen>
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <h4 className="mb-2 text-base font-medium text-[var(--ui-text)]">{topCareer.name}</h4>
                      <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.career_overview}</p>
                    </div>
                    {topRec && (
                      <div className="shrink-0 rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] px-4 py-3 sm:text-center">
                        <span className="block font-[family-name:var(--ui-serif)] text-3xl leading-none text-[var(--ui-success)]">{topRec.total_score}%</span>
                        <span className="mt-1 block text-[11px] text-[var(--ui-success)]">Match score</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-sm bg-[var(--ui-surface-2)] p-3">
                      <p className="mb-1 text-xs text-[var(--ui-faint)]">Training duration</p>
                      <p className="text-sm font-medium text-[var(--ui-text)]">{topCareer.training_duration}</p>
                    </div>
                    <div className="rounded-sm bg-[var(--ui-surface-2)] p-3">
                      <p className="mb-1 text-xs text-[var(--ui-faint)]">Education required</p>
                      <p className="text-sm font-medium text-[var(--ui-text)]">{topCareer.education_requirement}</p>
                    </div>
                  </div>
                </ReportSection>

                <ReportSection icon={CheckCircle2} title="03. Why this career" color="var(--ui-success)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.why_suitable}</p>
                </ReportSection>

                <ReportSection icon={TrendingUp} title="04. Training path" color="var(--ui-accent)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.training_journey}</p>
                </ReportSection>

                <ReportSection icon={Briefcase} title="05. Career opportunities" color="var(--ui-faint)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.career_opportunities}</p>
                </ReportSection>

                <ReportSection icon={TrendingUp} title="06. Career progression" color="var(--ui-success)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.career_growth}</p>
                </ReportSection>

                <ReportSection icon={BookOpen} title="07. Further education options" color="var(--ui-success)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.further_education}</p>
                </ReportSection>

                <ReportSection icon={Building} title="08. Entrepreneurship opportunities" color="var(--ui-faint)">
                  <p className="text-sm leading-relaxed text-[var(--ui-muted)]">{report.entrepreneurship}</p>
                </ReportSection>

                <ReportSection icon={ArrowRight} title="09. Recommended next steps" color="var(--ui-accent)" defaultOpen>
                  <ol className="space-y-2">
                    {report.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] text-xs font-medium text-[var(--ui-accent)]">
                          {i + 1}
                        </span>
                        <span className="text-sm leading-relaxed text-[var(--ui-muted)]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </ReportSection>

                <div className="ui-alert flex break-inside-avoid items-start gap-3">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--ui-accent)]" aria-hidden="true" />
                  <div>
                    <p className="mb-2 text-xs font-medium text-[var(--ui-text)]">Demo / illustrative data</p>
                    <p className="ui-note">
                      This report is generated by DishaAI for the Smart India Hackathon 2026 demonstration.
                      Career information is illustrative only. Do not treat this as an official government document.
                      Verify all details with the relevant ITI, polytechnic, NSDC, or State Skill Development Mission.
                    </p>
                  </div>
                </div>
              </div>

              <footer className="border-t border-[var(--ui-border)] bg-[var(--ui-surface-2)] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] leading-relaxed text-[var(--ui-faint)]">
                  <span>DishaAI · Smart India Hackathon 2026 · Problem SIH26241</span>
                  <span>Ministry of Skill Development and Entrepreneurship</span>
                </div>
              </footer>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}

function ReportSection({
  icon: Icon,
  title,
  color,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Disclosure
      title={title}
      headingLevel={3}
      icon={<Icon size={15} style={{ color }} />}
      defaultOpen={defaultOpen}
      className="break-inside-avoid rounded-none border-0 border-b shadow-none [background:none] last:border-0"
    >
      {children}
    </Disclosure>
  );
}
