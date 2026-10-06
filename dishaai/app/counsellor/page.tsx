'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  BrainCircuit, Send, RotateCcw, ChevronRight, User, Zap,
  AlertTriangle, Info, Sparkles, MessageCircle
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/gov/LanguageSelector';
import { DEMO_CAREERS } from '@/data/careers';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { cn } from '@/lib/utils';
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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  timestamp: Date;
}

const STARTER_QUESTIONS = [
  'What exactly does a Solar PV Technician do day-to-day?',
  'What skill gaps do I need to fill?',
  'How can I get into an ITI near my area?',
  'What is the job market like for this career?',
  'Can I start my own business after training?',
  'How long will it take to complete training?',
];

export default function CounsellorPage() {
  const [profile, setProfile] = useState<OnboardingState>(DEMO_PROFILE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('disha_onboarding');
    if (saved) { try { setProfile(JSON.parse(saved)); } catch {} }
    const savedLang = localStorage.getItem('disha_language_pref');
    if (savedLang) setSelectedLanguage(savedLang);
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

  const topSkillGaps = useMemo(() => {
    const recs = generateRecommendations(studentProfile, profile.selected_skills, [topCareer]);
    return recs[0]?.skill_gaps ?? [];
  }, [studentProfile, profile.selected_skills, topCareer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const question = text ?? input.trim();
    if (!question || loading) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/counsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history,
          careerId: topCareer.id,
          studentProfile: {
            name: profile.name,
            education_level: profile.education_level,
            interests: profile.selected_interests,
            skills: profile.selected_skills.map((s) => `${s.skill_name} (${s.proficiency}/5)`),
            learning_preference: profile.learning_preference,
            career_goals: profile.career_goals,
          },
          skillGaps: topSkillGaps.map((g) => g.skill_name),
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      const answer = data.answer ?? "I'm sorry, I couldn't get an answer right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: answer,
          provider: data.provider,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm unable to connect right now. Please check your internet connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className="flex-1 ml-[240px] flex flex-col h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex-shrink-0">
          <div className="max-w-[900px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a2e5a] rounded-xl flex items-center justify-center">
                <BrainCircuit size={20} className="text-[#0ea5e9]" />
              </div>
              <div>
                <h1 className="font-bold text-[#1a2e5a] text-base">AI Career Counsellor</h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <p className="text-xs text-[#64748b]">
                    Context: {topCareer.name} · Gemini + OpenRouter
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector
                onLanguageChange={(code) => setSelectedLanguage(code)}
              />
              <span className="text-xs px-2.5 py-1.5 bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] rounded-full font-medium hidden sm:inline">
                MSDE & Bhashini Grounded
              </span>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={clearChat}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto px-8 py-6">

            {/* Empty state */}
            {messages.length === 0 && (
              <div>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-[#1a2e5a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-[#0ea5e9]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1a2e5a] mb-2">
                    Ask me anything about your career
                  </h2>
                  <p className="text-[#64748b] text-sm max-w-md mx-auto">
                    I'm your AI career counsellor. I know your profile and can help you understand your
                    recommended career path, skill gaps, and next steps.
                  </p>
                </div>

                {/* Context card */}
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 mb-8">
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">My Context</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-[#f0f4ff] text-[#1a2e5a] rounded-full text-xs font-medium border border-[#c5d9f0]">
                      👤 {profile.name ?? 'Student'}
                    </span>
                    <span className="px-2.5 py-1 bg-[#e0f2fe] text-[#0284c7] rounded-full text-xs font-medium">
                      🎯 {topCareer.name}
                    </span>
                    {profile.selected_interests.slice(0, 2).map((i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#f1f5f9] text-[#64748b] rounded-full text-xs font-medium">
                        {i.replace('_', ' ')}
                      </span>
                    ))}
                    {topSkillGaps.slice(0, 2).map((g) => (
                      <span key={g.skill_name} className="px-2.5 py-1 bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] rounded-full text-xs font-medium">
                        Gap: {g.skill_name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Starter questions */}
                <div>
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                    Try asking
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {STARTER_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-left px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#475569] hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0284c7] transition-all duration-150 flex items-center gap-2 group"
                      >
                        <ChevronRight size={13} className="text-[#94a3b8] group-hover:text-[#0ea5e9] flex-shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'mb-5 flex gap-3',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.role === 'user' ? 'bg-[#1a2e5a]' : 'bg-[#f0f9ff] border border-[#bae6fd]',
                  )}
                >
                  {msg.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <BrainCircuit size={16} className="text-[#0284c7]" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-[#1a2e5a] text-white rounded-tr-sm'
                      : 'bg-white border border-[#e2e8f0] text-[#1a2e5a] rounded-tl-sm shadow-sm',
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className={cn(
                    'flex items-center gap-2 mt-1.5',
                    msg.role === 'user' ? 'justify-end' : 'justify-between',
                  )}>
                    <span className={cn(
                      'text-[10px]',
                      msg.role === 'user' ? 'text-[#8aaee0]' : 'text-[#94a3b8]',
                    )}>
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.provider && msg.role === 'assistant' && (
                      <span className="text-[10px] text-[#94a3b8]">via {msg.provider}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-center flex-shrink-0">
                  <BrainCircuit size={16} className="text-[#0284c7]" />
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* AI disclaimer */}
        <div className="bg-[#fffbeb] border-t border-[#fef3c7] px-8 py-2 flex-shrink-0">
          <div className="max-w-[900px] mx-auto flex items-center gap-2">
            <AlertTriangle size={12} className="text-[#d97706] flex-shrink-0" />
            <p className="text-[10px] text-[#92400e]">
              AI answers are grounded in our career knowledge base only. Do not treat responses as official government or legal advice.
            </p>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-[#e2e8f0] px-8 py-4 flex-shrink-0">
          <div className="max-w-[900px] mx-auto flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your career path..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-[#e2e8f0] rounded-xl text-sm text-[#1a2e5a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/15 resize-none bg-white"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              loading={loading}
              icon={<Send size={16} />}
            >
              Send
            </Button>
          </div>
          <p className="text-center text-[10px] text-[#94a3b8] mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}
