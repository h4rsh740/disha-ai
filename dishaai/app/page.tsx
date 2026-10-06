import Link from 'next/link';
import {
  ArrowRight, ChevronRight, GraduationCap, GitBranch, Users, BrainCircuit,
  CheckCircle2, Star, TrendingUp, Shield, Zap, MapPin, BookOpen, Target
} from 'lucide-react';
import { TopNav } from '@/components/layout/Sidebar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* ---- HERO ---- */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#f0f4ff] via-[#e8f0fd] to-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* SIH badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2e5a] text-white rounded-full text-sm font-medium mb-8">
              <Star size={14} className="text-[#0ea5e9]" />
              Smart India Hackathon 2026 — Problem SIH26241
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[#1a2e5a] leading-tight mb-6">
              Helping students{' '}
              <span className="text-[#0ea5e9]">choose careers.</span>
              <br />
              Helping families{' '}
              <span className="relative">
                understand them.
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 400 8" fill="none">
                  <path d="M0 6 Q100 2 200 5 Q300 8 400 3" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="text-xl text-[#475569] mb-10 leading-relaxed max-w-2xl mx-auto">
              AI-powered career and family decision intelligence for vocational education.
              Built for the Ministry of Skill Development and Entrepreneurship.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a2e5a] text-white rounded-xl font-semibold text-base hover:bg-[#0f1e3c] transition-all duration-150 shadow-lg hover:shadow-[0_8px_25px_rgba(26,46,90,0.35)] active:scale-[0.98]"
              >
                Discover My Career Path
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1a2e5a] border border-[#e2e8f0] rounded-xl font-semibold text-base hover:border-[#1a2e5a] hover:bg-[#f0f4ff] transition-all duration-150 active:scale-[0.98]"
              >
                Explore Career Paths
                <ChevronRight size={18} />
              </Link>
            </div>

            <p className="mt-5 text-sm text-[#94a3b8]">
              Free • No account required to explore • Ministry of Skill Development
            </p>
          </div>

          {/* Hero flow visual */}
          <div className="mt-20 relative">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { label: 'Student Profile', sub: 'Education & interests', color: '#1a2e5a', icon: GraduationCap },
                { label: 'AI Career Analysis', sub: 'Skill matching', color: '#0284c7', icon: BrainCircuit },
                { label: 'Career Pathways', sub: 'Personalised routes', color: '#059669', icon: GitBranch },
                { label: 'Family Decision Support', sub: 'Reports & guidance', color: '#d97706', icon: Users },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 w-[160px] text-center shadow-sm hover:shadow-md transition-shadow">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon size={20} style={{ color: item.color }} />
                      </div>
                      <p className="font-semibold text-sm text-[#1a2e5a]">{item.label}</p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{item.sub}</p>
                    </div>
                    {i < 3 && (
                      <ArrowRight size={20} className="text-[#c5d9f0] flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-3">How DishaAI Works</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">
              A structured, evidence-based approach to career discovery for vocational education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Complete Assessment',
                desc: 'Share your education level, interests, skills, and career goals in a guided 5-step onboarding.',
                icon: Target,
                color: '#1a2e5a',
              },
              {
                step: '02',
                title: 'AI Analyses Your Profile',
                desc: 'Our recommendation engine scores your profile against 10+ vocational careers with explainable reasoning.',
                icon: BrainCircuit,
                color: '#0284c7',
              },
              {
                step: '03',
                title: 'Explore Career Pathways',
                desc: 'View your Career Twin, top matches, skill gaps, and simulate different training routes side by side.',
                icon: GitBranch,
                color: '#059669',
              },
              {
                step: '04',
                title: 'Family Decision Support',
                desc: 'Generate a family report in simple language. Answer parents\' questions with AI-grounded explanations.',
                icon: Users,
                color: '#d97706',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-md transition-shadow h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon size={20} style={{ color: item.color }} />
                      </div>
                      <span className="text-3xl font-bold text-[#e2e8f0]">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-[#1a2e5a] text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-[#64748b] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- HERO FEATURES ---- */}
      <section className="py-20 bg-[#f0f4ff]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Career Path Simulator */}
            <div className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e0f2fe] text-[#0284c7] rounded-full text-sm font-semibold mb-5">
                <GitBranch size={14} />
                Hero Feature #1
              </div>
              <h2 className="text-2xl font-bold text-[#1a2e5a] mb-3">Career Path Simulator</h2>
              <p className="text-[#475569] mb-6 leading-relaxed">
                Visualise every step of your career journey — from current education to employment
                and beyond. Compare ITI vs Diploma vs other pathways side by side.
              </p>

              {/* Mini timeline preview */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Class 10 → ITI Training', duration: '2 years', color: '#1a2e5a' },
                  { label: 'Apprenticeship', duration: '6–12 months', color: '#0284c7' },
                  { label: 'Solar PV Technician', duration: 'Entry level', color: '#059669' },
                  { label: 'Senior Technician', duration: '2–3 years later', color: '#7c3aed' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-[#1a2e5a] font-medium">{item.label}</span>
                      <span className="text-xs text-[#94a3b8]">{item.duration}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-3 h-3 rounded-full bg-[#d97706]" />
                  <span className="text-sm text-[#1a2e5a]">Entrepreneurship / Specialisation</span>
                </div>
              </div>

              <Link
                href="/career-path/c-01"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors"
              >
                Try the Simulator <ArrowRight size={15} />
              </Link>
            </div>

            {/* Family Decision Mode */}
            <div className="bg-[#1a2e5a] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#0ea5e9]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0ea5e9]/20 text-[#38bdf8] rounded-full text-sm font-semibold mb-5">
                  <Users size={14} />
                  Hero Feature #2
                </div>
                <h2 className="text-2xl font-bold mb-3">Family Decision Mode</h2>
                <p className="text-[#c5d9f0] mb-6 leading-relaxed">
                  Designed for Indian parents. Simple language, no jargon.
                  Understand your child's recommended career, training journey, and future prospects.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    'Is this career stable?',
                    'What training is required?',
                    'Can my child study further?',
                    'Can my child start a business?',
                  ].map((q, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#0ea5e9] flex-shrink-0" />
                      <span className="text-sm text-[#c5d9f0]">{q}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/family"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-semibold hover:bg-[#0284c7] transition-colors"
                >
                  Open Family Mode <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- WHY DISHAAI ---- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1a2e5a] mb-3">Why DishaAI</h2>
            <p className="text-[#475569] max-w-xl mx-auto">
              Addressing the real gap in vocational career guidance for students and families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BrainCircuit,
                title: 'Explainable AI',
                desc: 'Every recommendation comes with reasons — not a black box. Know exactly why a career matches your profile.',
                color: '#0284c7',
              },
              {
                icon: Shield,
                title: 'Grounded & Safe',
                desc: 'AI responses are grounded in our career knowledge base. We do not invent statistics, schemes, or eligibility rules.',
                color: '#059669',
              },
              {
                icon: GitBranch,
                title: 'Multi-Pathway Vision',
                desc: 'See ITI, Diploma, and alternative pathways together. Make informed decisions, not guesses.',
                color: '#7c3aed',
              },
              {
                icon: Users,
                title: 'Family-First Design',
                desc: 'Parents play a key role in career decisions. Family Decision Mode speaks their language.',
                color: '#d97706',
              },
              {
                icon: TrendingUp,
                title: 'Skill Gap Intelligence',
                desc: 'Know exactly what skills you lack and how training can fill them. No guesswork.',
                color: '#e11d48',
              },
              {
                icon: MapPin,
                title: 'Vocational Focus',
                desc: 'Built specifically for vocational education — not generic job boards or college admissions.',
                color: '#1a2e5a',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl border border-[#e2e8f0] hover:border-[#c5d9f0] hover:shadow-md transition-all duration-200 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <h3 className="font-semibold text-[#1a2e5a] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-20 bg-[#1a2e5a]">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start your career journey today
          </h2>
          <p className="text-[#8aaee0] mb-8 text-lg">
            Complete the free assessment and discover your top career matches in minutes.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0ea5e9] text-white rounded-xl font-semibold text-base hover:bg-[#0284c7] transition-all duration-150 shadow-lg hover:shadow-[0_8px_25px_rgba(14,165,233,0.4)]"
          >
            Get Started — It's Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="bg-[#0f1e3c] py-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#1a2e5a] rounded-lg flex items-center justify-center">
                <GraduationCap size={15} className="text-[#0ea5e9]" />
              </div>
              <span className="font-bold text-white">DishaAI</span>
            </div>
            <p className="text-sm text-[#475569] text-center">
              Smart India Hackathon 2026 · Problem SIH26241 · Ministry of Skill Development and Entrepreneurship
            </p>
            <p className="text-xs text-[#475569]">
              Demo data · Not official government statistics
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
