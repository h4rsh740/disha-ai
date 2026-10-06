'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  FileText, Download, Share2, Printer, GraduationCap,
  CheckCircle2, TrendingUp, BookOpen, Building, ArrowRight,
  Briefcase, Clock, AlertTriangle, User, Loader2
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  const [profile, setProfile] = useState<OnboardingState>(DEMO_PROFILE);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) { try { setProfile(JSON.parse(saved)); } catch {} }
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
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="flex-1 ml-[240px]">
        <div className="max-w-[900px] mx-auto px-8 py-8">

          {/* Control bar */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2e5a]">Family Career Report</h1>
              <p className="text-[#64748b] mt-1">
                Official-looking report for family discussion — generated by DishaAI
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!generated ? (
                <Button
                  variant="primary"
                  size="md"
                  loading={loading}
                  onClick={generateReport}
                  icon={loading ? undefined : <FileText size={15} />}
                >
                  {loading ? 'Generating Report...' : 'Generate Report'}
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={printReport}>
                    Print
                  </Button>
                  <Button variant="outline" size="sm" icon={<Share2 size={14} />}>
                    Share
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Pre-generate state */}
          {!generated && !loading && (
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-12 text-center">
              <FileText size={48} className="text-[#c5d9f0] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#1a2e5a] mb-2">Ready to generate the report</h2>
              <p className="text-[#64748b] mb-6 max-w-md mx-auto">
                Click "Generate Report" to create a personalised Family Career Report for{' '}
                <strong>{profile.name ?? 'the student'}</strong>'s recommended career.
              </p>
              <Button variant="primary" size="lg" onClick={generateReport} icon={<ArrowRight size={16} />} iconPosition="right">
                Generate Family Report
              </Button>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-12 text-center">
              <Loader2 size={40} className="text-[#0ea5e9] mx-auto mb-4 animate-spin" />
              <p className="text-[#1a2e5a] font-semibold">Generating your Family Career Report...</p>
              <p className="text-[#64748b] text-sm mt-1">Our AI is crafting a personalised report. This takes a few seconds.</p>
            </div>
          )}

          {/* Report */}
          {generated && report && (
            <div className="bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm print:shadow-none print:border-0" id="family-report">

              {/* Report header */}
              <div className="bg-[#1a2e5a] px-8 py-6 text-white print:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0ea5e9]/20 rounded-xl flex items-center justify-center">
                      <GraduationCap size={22} className="text-[#0ea5e9]" />
                    </div>
                    <div>
                      <p className="text-[#8aaee0] text-xs font-medium">DishaAI — Career Intelligence Platform</p>
                      <h2 className="font-bold text-lg">Official Career Assessment & Pathway Dossier</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8aaee0]">Report ID: DSHA-{Date.now().toString().slice(-6)}</p>
                    <p className="text-xs text-[#8aaee0]">Generated: {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Badge variant="info" size="sm">MSDE Hackathon Demo</Badge>
                  <Badge variant="warning" size="sm">Illustrative Data</Badge>
                  {provider && <span className="text-xs text-[#8aaee0]">AI: {provider}</span>}
                </div>
              </div>

              {/* Report body */}
              <div className="p-8 space-y-6">

                {/* Section: Student Profile */}
                <ReportSection icon={User} title="01. Student Profile" color="#1a2e5a">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.student_profile_summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-[#f0f4ff] text-[#1a2e5a] rounded-full text-xs font-medium border border-[#c5d9f0]">
                      {profile.education_level?.replace('_', ' ')}
                    </span>
                    {profile.selected_interests.map((i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#e0f2fe] text-[#0284c7] rounded-full text-xs font-medium">
                        {i.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </ReportSection>

                {/* Section: Recommended Career */}
                <ReportSection icon={Briefcase} title="02. Recommended Career" color="#0284c7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a2e5a] mb-1">{topCareer.name}</h3>
                      <p className="text-sm text-[#475569] leading-relaxed">{report.career_overview}</p>
                    </div>
                    {topRec && (
                      <div className="text-center px-4 py-2 bg-[#ecfdf5] rounded-xl border border-[#d1fae5] flex-shrink-0">
                        <span className="text-2xl font-bold text-[#059669] block">{topRec.total_score}%</span>
                        <span className="text-xs text-[#059669] font-medium">Match Score</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#f8faff] rounded-xl">
                      <p className="text-xs text-[#94a3b8] mb-0.5">Training Duration</p>
                      <p className="text-sm font-semibold text-[#1a2e5a]">{topCareer.training_duration}</p>
                    </div>
                    <div className="p-3 bg-[#f8faff] rounded-xl">
                      <p className="text-xs text-[#94a3b8] mb-0.5">Education Required</p>
                      <p className="text-sm font-semibold text-[#1a2e5a]">{topCareer.education_requirement}</p>
                    </div>
                  </div>
                </ReportSection>

                {/* Section: Why Suitable */}
                <ReportSection icon={CheckCircle2} title="03. Why This Career" color="#059669">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.why_suitable}</p>
                </ReportSection>

                {/* Section: Training Path */}
                <ReportSection icon={TrendingUp} title="04. Training Path" color="#7c3aed">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.training_journey}</p>
                </ReportSection>

                {/* Section: Career Opportunities */}
                <ReportSection icon={Briefcase} title="05. Career Opportunities" color="#d97706">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.career_opportunities}</p>
                </ReportSection>

                {/* Section: Career Growth */}
                <ReportSection icon={TrendingUp} title="06. Career Progression" color="#0284c7">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.career_growth}</p>
                </ReportSection>

                {/* Section: Further Education */}
                <ReportSection icon={BookOpen} title="07. Further Education Options" color="#059669">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.further_education}</p>
                </ReportSection>

                {/* Section: Entrepreneurship */}
                <ReportSection icon={Building} title="08. Entrepreneurship Opportunities" color="#d97706">
                  <p className="text-sm text-[#475569] leading-relaxed">{report.entrepreneurship}</p>
                </ReportSection>

                {/* Section: Next Steps */}
                <ReportSection icon={ArrowRight} title="09. Recommended Next Steps" color="#1a2e5a">
                  <ol className="space-y-2">
                    {report.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#1a2e5a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-[#475569]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </ReportSection>

                {/* Disclaimer */}
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-[#d97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#92400e] mb-1">Disclaimer — Demo / Illustrative Data</p>
                    <p className="text-xs text-[#92400e] leading-relaxed">
                      This report is generated by DishaAI for the Smart India Hackathon 2026 demonstration.
                      Career information is illustrative only. Do not treat this as an official government document.
                      Verify all details with the relevant ITI, polytechnic, NSDC, or State Skill Development Mission.
                    </p>
                  </div>
                </div>
              </div>

              {/* Report footer */}
              <div className="bg-[#f8faff] border-t border-[#e2e8f0] px-8 py-4">
                <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                  <span>DishaAI · Smart India Hackathon 2026 · Problem SIH26241</span>
                  <span>Ministry of Skill Development and Entrepreneurship</span>
                </div>
              </div>
            </div>
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
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#f1f5f9] pb-6 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
        <h3 className="font-bold text-[#1a2e5a] text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
