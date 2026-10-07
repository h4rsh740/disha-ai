'use client';
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  ArrowUp, ArrowDown, ArrowUpRight, BookOpen, Check, ChevronDown,
  Compass, Copy, Lightbulb, Plus, Sparkles, Square, UserRound, X,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MessageContent } from '@/components/counsellor/MessageContent';
import { LanguageSelector } from '@/components/gov/LanguageSelector';
import { DEMO_CAREERS } from '@/data/careers';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { cn } from '@/lib/utils';
import { chatViewport } from '@/lib/chat-viewport';
import type { OnboardingState } from '@/types';
import styles from './counsellor.module.css';

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
  error?: boolean;
  timestamp: Date;
}

function subscribePreferences(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener('disha-language-change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('disha-language-change', onChange);
  };
}

const readSavedProfile = () => localStorage.getItem('disha_onboarding');
const serverProfile = () => null;
const readLanguage = () => localStorage.getItem('disha_language_pref') || 'en';
const serverLanguage = () => 'en';

export default function CounsellorPage() {
  const savedProfile = useSyncExternalStore(subscribePreferences, readSavedProfile, serverProfile);
  const selectedLanguage = useSyncExternalStore(subscribePreferences, readLanguage, serverLanguage);
  const profile = useMemo<OnboardingState>(() => {
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch { /* Fall back to the demo profile. */ }
    }
    return DEMO_PROFILE;
  }, [savedProfile]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const contextToggleRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followReplyRef = useRef(true);
  const contextId = useId();

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

  const hasConversation = messages.length > 0;
  const starters = [
    { label: 'Explore my career', hint: 'What the work is really like', icon: Compass, question: `What does a ${topCareer.name} do day-to-day?` },
    { label: 'Build my skills', hint: 'Find a good place to start', icon: Lightbulb, question: 'What skill gaps do I need to fill, and how should I start?' },
    { label: 'Find training', hint: 'Courses, eligibility & routes', icon: BookOpen, question: 'How can I get into an ITI near my area, and how long will training take?' },
    { label: 'Plan my next step', hint: 'Turn possibilities into a plan', icon: ArrowUpRight, question: `What are three practical next steps I can take toward becoming a ${topCareer.name}?` },
  ];

  useEffect(() => {
    const chat = scrollRef.current;
    if (!chat) return;
    if (messages.length === 0 && !loading) {
      chat.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    if (followReplyRef.current) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      chat.scrollTo({ top: chat.scrollHeight, behavior: reducedMotion ? 'instant' : 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const touch = window.matchMedia('(pointer: coarse)');
    let referenceHeight = window.innerHeight;
    let lastWidth = window.innerWidth;
    let frame = 0;

    const update = () => {
      const page = pageRef.current;
      if (!page) return;
      const focused = document.activeElement === inputRef.current;
      if (!focused || lastWidth !== window.innerWidth) {
        referenceHeight = window.innerHeight;
        lastWidth = window.innerWidth;
      }
      const state = chatViewport({
        layoutHeight: window.innerHeight, visualHeight: viewport.height,
        referenceHeight, scale: viewport.scale, touch: touch.matches, focused,
      });
      if (state.height !== null) page.style.setProperty('--chat-viewport-height', `${state.height}px`);
      page.dataset.keyboardOpen = String(state.keyboardOpen);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    viewport.addEventListener('resize', schedule);
    viewport.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    touch.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', schedule);
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      touch.removeEventListener('change', schedule);
    };
  }, []);

  useEffect(() => {
    if (!contextOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!contextRef.current?.contains(event.target as Node)) setContextOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [contextOpen]);

  useEffect(() => () => {
    requestRef.current?.abort();
    requestRef.current = null;
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    followReplyRef.current = true;
    setShowScrollButton(false);
    setNotice('');
    setInput('');

    const userMsg: Message = {
      id: crypto.randomUUID(),
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
        signal: controller.signal,
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
      if (controller.signal.aborted || requestRef.current !== controller) return;
      const answer = !res.ok
        ? 'That question couldn’t be answered. Try another career question or try again in a moment.'
        : typeof data.answer === 'string' && data.answer.trim()
          ? data.answer
          : "I'm sorry, I couldn't get an answer right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: answer,
          provider: res.ok && typeof data.provider === 'string' ? data.provider : undefined,
          error: !res.ok,
          timestamp: new Date(),
        },
      ]);
    } catch {
      if (controller.signal.aborted || requestRef.current !== controller) return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I'm unable to connect right now. Please check your internet connection and try again.",
          error: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const stopReply = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setNotice('Reply stopped. You can send another question.');
  };

  const clearChat = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setMessages([]);
    setInput('');
    setNotice('');
    setContextOpen(false);
    setCopiedId(null);
    setShowScrollButton(false);
    followReplyRef.current = true;
    inputRef.current?.focus({ preventScroll: true });
  };

  const copyReply = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      setNotice('Reply copied.');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setNotice('Copy isn’t available in this browser. You can select the reply text instead.');
    }
  };

  const scrollToLatest = () => {
    followReplyRef.current = true;
    setShowScrollButton(false);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'instant' });
  };

  return (
    <div ref={pageRef} className={cn('app-page', styles.page)}>
      <Sidebar userName={profile.name ?? 'Student'} userRole="student" />

      <main className={cn('app-main', styles.main)}>
        <div className={cn('app-content', styles.content)}>
          <header className={styles.topBar}>
            <div className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true">दि</span>
              <h1 className={styles.title} aria-label="Disha career counsellor"><span className={styles.titleName}>Disha</span><span className={styles.titleHint}>Counsellor</span></h1>
            </div>
            <div className={styles.headerActions}>
              <div ref={contextRef} className={styles.contextControl} onKeyDown={(event) => {
                if (event.key === 'Escape' && contextOpen) {
                  event.preventDefault();
                  setContextOpen(false);
                  contextToggleRef.current?.focus();
                }
              }}>
                <button ref={contextToggleRef} type="button" className={styles.quietButton} onClick={() => setContextOpen((open) => !open)} aria-expanded={contextOpen} aria-controls={contextId} aria-label="Your profile context">
                  <UserRound size={15} aria-hidden="true" /><span className={styles.contextLabel}>Your context</span><ChevronDown size={12} aria-hidden="true" />
                </button>
                <div id={contextId} hidden={!contextOpen} className={styles.contextPanel} role="region" aria-label="Profile used for this conversation">
                  <div className={styles.contextHeading}>
                    <h2>A starting point, not a label.</h2>
                    <button type="button" className={styles.iconButton} aria-label="Close profile context" onClick={() => { setContextOpen(false); contextToggleRef.current?.focus(); }}><X size={16} aria-hidden="true" /></button>
                  </div>
                  <p className={styles.contextNote}>Disha uses your assessment to make guidance relevant to you.</p>
                  <p className={styles.profileName}>{profile.name ?? 'Student'} <span>· {profile.education_level?.replace(/_/g, ' ')}</span></p>
                  <Link href={`/careers/${topCareer.id}`} className={styles.careerContext}>{topCareer.name}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                  <h3>Your interests</h3>
                  <div className={styles.contextChips}>{profile.selected_interests.map((interest) => <span key={interest}>{interest.replace(/_/g, ' ')}</span>)}</div>
                  <h3>Skills you bring</h3>
                  <div className={styles.contextChips}>{profile.selected_skills.map((skill) => <span key={skill.skill_id}>{skill.skill_name} · {skill.proficiency}/5</span>)}</div>
                  {topSkillGaps.length > 0 && <><h3>Skills to build</h3><div className={styles.contextChips}>{topSkillGaps.map((gap) => <span key={gap.skill_id}>{gap.skill_name}</span>)}</div></>}
                  <Link href="/onboarding" className={styles.updateProfile}>Update your assessment <ArrowUpRight size={13} aria-hidden="true" /></Link>
                </div>
              </div>
              <button type="button" className={styles.newChatButton} onClick={clearChat} disabled={!hasConversation && !input} aria-label="Start a new conversation">
                <Plus size={16} aria-hidden="true" /><span>New chat</span>
              </button>
            </div>
          </header>

          <section className={cn(styles.conversation, !hasConversation && styles.emptyConversation)} data-chat-state={hasConversation ? 'active' : 'empty'} aria-label="Career counselling chat">
            <div className={styles.transcriptViewport}>
            <div ref={scrollRef} className={styles.scrollArea} onScroll={(event) => {
              const chat = event.currentTarget;
              const nearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100;
              followReplyRef.current = nearBottom;
              setShowScrollButton(!nearBottom);
            }}>
              {/* Empty state */}
              {messages.length === 0 && (
                <div className={styles.welcome}>
                  <span className={styles.welcomeMark} aria-hidden="true"><Sparkles size={25} strokeWidth={1.4} /></span>
                  <p className={styles.welcomeEyebrow}>A path of your own</p>
                  <h2>Let&apos;s find your <em>next chapter.</em></h2>
                  <p className={styles.welcomeDescription}>A little guidance for the big decisions.<br />Ask a question. Explore a possibility. Take the next step.</p>
                </div>
              )}

              {/* Messages */}
              <div className={styles.messageList} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" aria-busy={loading}>
                {messages.map((msg) => (
                  <article
                    key={msg.id}
                    aria-label={msg.role === 'user' ? 'Your question' : 'Counsellor reply'}
                    className={cn(styles.message, msg.role === 'user' ? styles.userMessage : styles.assistantMessage)}
                    data-message-role={msg.role}
                  >
                    {msg.role === 'user' ? (
                      <div className={styles.userBubble}><p>{msg.content}</p></div>
                    ) : (
                      <>
                        <div className={styles.assistantIdentity}><span className={styles.replyMark} aria-hidden="true"><Sparkles size={16} /></span><span>Disha</span><span className={styles.identityHint}>Career counsellor</span></div>
                        {msg.error ? <p className={styles.errorReply}>{msg.content}</p> : <MessageContent content={msg.content} className={styles.replyContent} />}
                        <div className={styles.messageActions}>
                          <button type="button" className={styles.copyButton} onClick={() => void copyReply(msg)} aria-label={copiedId === msg.id ? 'Reply copied' : 'Copy counsellor reply'}>
                            {copiedId === msg.id ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}<span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          {msg.provider && <span className={styles.provider}>via {msg.provider}</span>}
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className={styles.thinking} aria-hidden="true">
                  <span className={styles.thinkingMark}><Sparkles size={17} /></span>
                  <span>Thinking through your next step<span className={styles.thinkingDots}>…</span></span>
                </div>
              )}
            </div>
            {showScrollButton && hasConversation && <button type="button" className={styles.scrollButton} onClick={scrollToLatest} aria-label="Scroll to latest reply"><ArrowDown size={17} aria-hidden="true" /></button>}
            </div>

            <p role="status" aria-live="polite" className="sr-only">
              {loading ? 'The counsellor is preparing your reply.' : notice}
            </p>

            <div className={styles.composerRegion}>
              <form className={styles.composer} aria-label="Message the career counsellor" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
                <label htmlFor="counsellor-question" className="sr-only">Your question</label>
                <textarea
                  ref={inputRef}
                  id="counsellor-question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasConversation ? 'Ask a follow-up…' : 'Ask Disha about your next step…'}
                  rows={2}
                  aria-describedby="counsellor-keyboard-hint counsellor-disclaimer"
                  className={styles.textarea}
                />
                <div className={styles.composerToolbar}>
                  <div className={styles.composerOptions}>
                    <span className={styles.guidanceLabel}><Sparkles size={13} aria-hidden="true" />Career guidance</span>
                    <LanguageSelector className={styles.language} />
                  </div>
                  {loading ? (
                    <button type="button" className={styles.sendButton} onClick={stopReply} aria-label="Stop waiting for reply" title="Stop reply"><Square size={15} fill="currentColor" aria-hidden="true" /></button>
                  ) : (
                    <button type="submit" className={styles.sendButton} disabled={!input.trim()} aria-label="Send message" title="Send message"><ArrowUp size={19} strokeWidth={2.3} aria-hidden="true" /></button>
                  )}
                </div>
              </form>
              <p id="counsellor-keyboard-hint" className="sr-only">Press Enter to send. Shift+Enter adds a new line.</p>
              {!hasConversation && (
                <div className={styles.starters} aria-label="Suggested questions">
                  {starters.map(({ label, hint, icon: Icon, question }) => (
                    <button key={label} type="button" data-chat-starter className={styles.starter} onClick={() => void sendMessage(question)} disabled={loading} aria-label={question}>
                      <span className={styles.starterLabel}><Icon size={15} aria-hidden="true" />{label}</span><span className={styles.starterHint}>{hint}</span>
                    </button>
                  ))}
                </div>
              )}
              {notice && notice !== 'Reply copied.' && <p className={styles.notice}>{notice}</p>}
              <p id="counsellor-disclaimer" className={styles.disclaimer}>Disha can make mistakes. Verify important details with a counsellor or training institute.<span> Demo guidance · Not official advice.</span></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
