'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, Zap, Wrench, Settings2, Target,
  ChevronRight, ChevronLeft, Check, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CAREER_INTERESTS, DEMO_SKILLS } from '@/data/careers';
import { cn } from '@/lib/utils';
import type { OnboardingState, EducationLevel } from '@/types';

const TOTAL_STEPS = 5;

const EDUCATION_OPTIONS: { value: EducationLevel; label: string; sub: string }[] = [
  { value: 'class_8', label: 'Class 8', sub: 'Currently studying' },
  { value: 'class_9', label: 'Class 9', sub: 'Currently studying' },
  { value: 'class_10', label: 'Class 10', sub: 'Completed or studying' },
  { value: 'class_11', label: 'Class 11', sub: 'Currently studying' },
  { value: 'class_12', label: 'Class 12', sub: 'Completed or studying' },
  { value: 'iti', label: 'ITI', sub: 'Completed or enrolled' },
  { value: 'diploma', label: 'Diploma', sub: 'Completed or enrolled' },
  { value: 'graduate', label: 'Graduate', sub: 'Completed or enrolled' },
];

const CAREER_GOAL_OPTIONS = [
  { value: 'quick_job', label: 'Get a job quickly', sub: 'Start earning soon after training', icon: Zap },
  { value: 'long_term', label: 'Build a long-term career', sub: 'Grow over time in a stable field', icon: TrendingUpIcon },
  { value: 'business', label: 'Start a business', sub: 'Use skills to become self-employed', icon: Settings2 },
  { value: 'higher_education', label: 'Continue studying', sub: 'Use vocational as a stepping stone', icon: GraduationCap },
] as const;

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

const INITIAL_STATE: OnboardingState = {
  step: 1,
  selected_interests: [],
  selected_skills: [],
  career_goals: [],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const next = () => {
    if (state.step < TOTAL_STEPS) {
      setState((s) => ({ ...s, step: (s.step + 1) as OnboardingState['step'] }));
    } else {
      // Save to localStorage for demo
      localStorage.setItem('disha_onboarding', JSON.stringify(state));
      router.push('/dashboard');
    }
  };

  const back = () => {
    if (state.step > 1) {
      setState((s) => ({ ...s, step: (s.step - 1) as OnboardingState['step'] }));
    }
  };

  const canProceed = (): boolean => {
    switch (state.step) {
      case 1: return !!state.education_level && !!state.name;
      case 2: return state.selected_interests.length >= 2;
      case 3: return state.selected_skills.length >= 1;
      case 4: return !!state.learning_preference && !!state.work_environment;
      case 5: return state.career_goals.length >= 1;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a2e5a] rounded-lg flex items-center justify-center">
              <GraduationCap size={17} className="text-[#0ea5e9]" />
            </div>
            <span className="font-bold text-[#1a2e5a]">DishaAI</span>
          </div>
          <div className="text-sm text-[#94a3b8]">
            Step {state.step} of {TOTAL_STEPS}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="h-1 bg-[#e2e8f0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1a2e5a] to-[#0ea5e9] transition-all duration-500"
              style={{ width: `${(state.step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="flex items-center gap-2">
            {[
              { label: 'Education', icon: GraduationCap },
              { label: 'Interests', icon: Zap },
              { label: 'Skills', icon: Wrench },
              { label: 'Preferences', icon: Settings2 },
              { label: 'Goals', icon: Target },
            ].map((step, i) => {
              const stepNum = i + 1;
              const isComplete = state.step > stepNum;
              const isCurrent = state.step === stepNum;
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0',
                      isCurrent
                        ? 'bg-[#1a2e5a] text-white'
                        : isComplete
                        ? 'bg-[#ecfdf5] text-[#059669]'
                        : 'bg-[#f1f5f9] text-[#94a3b8]',
                    )}
                  >
                    {isComplete ? (
                      <Check size={11} />
                    ) : (
                      <Icon size={11} />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                  {i < 4 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 rounded-full transition-all duration-500',
                        isComplete ? 'bg-[#0ea5e9]' : 'bg-[#e2e8f0]',
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-10">
        <div className="max-w-[800px] mx-auto px-6">
          {state.step === 1 && <Step1 state={state} setState={setState} />}
          {state.step === 2 && <Step2 state={state} setState={setState} />}
          {state.step === 3 && <Step3 state={state} setState={setState} />}
          {state.step === 4 && <Step4 state={state} setState={setState} />}
          {state.step === 5 && <Step5 state={state} setState={setState} />}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-[#e2e8f0] px-6 py-4 sticky bottom-0">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={state.step === 1}
            icon={<ChevronLeft size={16} />}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={next}
            disabled={!canProceed()}
            icon={state.step === TOTAL_STEPS ? <ArrowRight size={16} /> : <ChevronRight size={16} />}
            iconPosition="right"
            size="lg"
          >
            {state.step === TOTAL_STEPS ? 'Generate My Career Profile' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Step 1: Education ----
function Step1({
  state,
  setState,
}: {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">Tell us about yourself</h2>
      <p className="text-[#64748b] mb-8">We'll use this to personalise your career recommendations.</p>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#1a2e5a] mb-2" htmlFor="name">
          Your Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Ravi Sharma"
          value={state.name ?? ''}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#1a2e5a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all text-base bg-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#1a2e5a] mb-3">
          Current Education Level
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EDUCATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setState((s) => ({ ...s, education_level: opt.value }))}
              className={cn(
                'p-3 rounded-xl border text-left transition-all duration-150',
                state.education_level === opt.value
                  ? 'border-[#1a2e5a] bg-[#f0f4ff] ring-2 ring-[#1a2e5a]/10'
                  : 'border-[#e2e8f0] bg-white hover:border-[#c5d9f0]',
              )}
            >
              <div className="font-semibold text-sm text-[#1a2e5a]">{opt.label}</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">{opt.sub}</div>
              {state.education_level === opt.value && (
                <Check size={12} className="text-[#1a2e5a] mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1a2e5a] mb-2" htmlFor="stream">
            Stream (optional)
          </label>
          <select
            id="stream"
            value={state.stream ?? ''}
            onChange={(e) => setState((s) => ({ ...s, stream: e.target.value }))}
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#1a2e5a] focus:outline-none focus:border-[#0ea5e9] bg-white text-sm"
          >
            <option value="">Select stream</option>
            <option value="science">Science (PCM)</option>
            <option value="science_bio">Science (PCB)</option>
            <option value="commerce">Commerce</option>
            <option value="arts">Arts / Humanities</option>
            <option value="vocational">Vocational</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1a2e5a] mb-2" htmlFor="location">
            Location (State)
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Maharashtra"
            value={state.location ?? ''}
            onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#1a2e5a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9] bg-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// ---- Step 2: Interests ----
function Step2({
  state,
  setState,
}: {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}) {
  const toggle = (id: string) => {
    setState((s) => ({
      ...s,
      selected_interests: s.selected_interests.includes(id)
        ? s.selected_interests.filter((i) => i !== id)
        : [...s.selected_interests, id],
    }));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">What interests you?</h2>
      <p className="text-[#64748b] mb-2">Select at least 2 areas that interest you most.</p>
      <p className="text-xs text-[#94a3b8] mb-8">
        {state.selected_interests.length} selected {state.selected_interests.length < 2 && '(select at least 2)'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {CAREER_INTERESTS.map((interest) => {
          const selected = state.selected_interests.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all duration-150 group',
                selected
                  ? 'border-[#1a2e5a] bg-[#f0f4ff] ring-2 ring-[#1a2e5a]/10'
                  : 'border-[#e2e8f0] bg-white hover:border-[#c5d9f0] hover:bg-[#f8faff]',
              )}
            >
              <div className="text-2xl mb-2">{interest.icon}</div>
              <div className="font-semibold text-sm text-[#1a2e5a]">{interest.label}</div>
              <div className="text-xs text-[#94a3b8] mt-0.5 leading-snug">{interest.description}</div>
              {selected && (
                <div className="mt-2 flex items-center gap-1 text-[#1a2e5a]">
                  <Check size={12} />
                  <span className="text-xs font-medium">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 3: Skills ----
function Step3({
  state,
  setState,
}: {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}) {
  const toggleSkill = (skillId: string, skillName: string) => {
    setState((s) => {
      const exists = s.selected_skills.find((sk) => sk.skill_id === skillId);
      if (exists) {
        return { ...s, selected_skills: s.selected_skills.filter((sk) => sk.skill_id !== skillId) };
      }
      return { ...s, selected_skills: [...s.selected_skills, { skill_id: skillId, skill_name: skillName, proficiency: 2 }] };
    });
  };

  const updateProficiency = (skillId: string, proficiency: number) => {
    setState((s) => ({
      ...s,
      selected_skills: s.selected_skills.map((sk) =>
        sk.skill_id === skillId ? { ...sk, proficiency: proficiency as 1 | 2 | 3 | 4 | 5 } : sk,
      ),
    }));
  };

  const proficiencyLabels = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">What skills do you have?</h2>
      <p className="text-[#64748b] mb-8">
        Select skills you already have and rate your level. Don't worry about gaps — that's what training is for!
      </p>

      <div className="space-y-3">
        {DEMO_SKILLS.map((skill) => {
          const selected = state.selected_skills.find((s) => s.skill_id === skill.id);
          return (
            <div
              key={skill.id}
              className={cn(
                'p-4 rounded-xl border transition-all duration-150',
                selected
                  ? 'border-[#0ea5e9] bg-[#f0f9ff]'
                  : 'border-[#e2e8f0] bg-white hover:border-[#c5d9f0]',
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleSkill(skill.id, skill.name)}
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all',
                    selected
                      ? 'bg-[#0ea5e9] border-[#0ea5e9]'
                      : 'border-[#cbd5e1] bg-white hover:border-[#0ea5e9]',
                  )}
                >
                  {selected && <Check size={12} className="text-white" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[#1a2e5a]">{skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded-full">{skill.category}</span>
                  </div>
                </div>
                {selected && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateProficiency(skill.id, level)}
                        className={cn(
                          'w-6 h-6 rounded-md text-xs font-bold transition-all',
                          selected.proficiency >= level
                            ? 'bg-[#0ea5e9] text-white'
                            : 'bg-[#e2e8f0] text-[#94a3b8] hover:bg-[#bae6fd]',
                        )}
                        title={proficiencyLabels[level]}
                      >
                        {level}
                      </button>
                    ))}
                    <span className="text-xs text-[#64748b] ml-1 hidden sm:block">
                      {proficiencyLabels[selected.proficiency]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 4: Preferences ----
function Step4({
  state,
  setState,
}: {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}) {
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">Your preferences</h2>
        <p className="text-[#64748b]">Help us understand how you learn and work best.</p>
      </div>

      <OptionGroup
        label="Learning preference"
        value={state.learning_preference}
        onChange={(v) => setState((s) => ({ ...s, learning_preference: v as typeof state.learning_preference }))}
        options={[
          { value: 'practical', label: 'Practical / Hands-on', sub: 'I prefer doing over reading' },
          { value: 'theoretical', label: 'Theoretical / Classroom', sub: 'I prefer study and concepts' },
          { value: 'mixed', label: 'Mixed / Both', sub: 'I adapt to either' },
        ]}
      />

      <OptionGroup
        label="Preferred work environment"
        value={state.work_environment}
        onChange={(v) => setState((s) => ({ ...s, work_environment: v as typeof state.work_environment }))}
        options={[
          { value: 'indoor', label: 'Indoor', sub: 'Factory, office, workshop' },
          { value: 'outdoor', label: 'Outdoor', sub: 'Field, construction site' },
          { value: 'mixed', label: 'Mixed', sub: 'Both indoor and outdoor' },
          { value: 'remote', label: 'Remote / Home-based', sub: 'Work from home possible' },
        ]}
      />

      <OptionGroup
        label="Training duration preference"
        value={state.training_duration}
        onChange={(v) => setState((s) => ({ ...s, training_duration: v as typeof state.training_duration }))}
        options={[
          { value: 'short', label: 'Short (< 6 months)', sub: 'Get into work quickly' },
          { value: 'medium', label: 'Medium (6–18 months)', sub: 'Balanced approach' },
          { value: 'long', label: 'Long (> 18 months)', sub: 'Deep specialisation' },
        ]}
      />

      <OptionGroup
        label="Training budget"
        value={state.budget_range}
        onChange={(v) => setState((s) => ({ ...s, budget_range: v as typeof state.budget_range }))}
        options={[
          { value: 'zero', label: 'Government / Free', sub: 'Looking for fully sponsored options' },
          { value: 'low', label: 'Low (< ₹10,000)', sub: 'Minimal self-investment' },
          { value: 'medium', label: 'Medium (₹10k–₹30k)', sub: 'Willing to invest' },
          { value: 'high', label: 'High (> ₹30k)', sub: 'Private institutes fine' },
        ]}
      />
    </div>
  );
}

function OptionGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; sub: string }>;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1a2e5a] mb-3">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'p-3 rounded-xl border text-left transition-all duration-150',
              value === opt.value
                ? 'border-[#1a2e5a] bg-[#f0f4ff] ring-2 ring-[#1a2e5a]/10'
                : 'border-[#e2e8f0] bg-white hover:border-[#c5d9f0]',
            )}
          >
            <div className="font-semibold text-sm text-[#1a2e5a]">{opt.label}</div>
            <div className="text-xs text-[#94a3b8] mt-0.5 leading-snug">{opt.sub}</div>
            {value === opt.value && <Check size={12} className="text-[#1a2e5a] mt-1" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Step 5: Career Goals ----
function Step5({
  state,
  setState,
}: {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}) {
  const toggle = (goal: typeof CAREER_GOAL_OPTIONS[number]['value']) => {
    setState((s) => ({
      ...s,
      career_goals: s.career_goals.includes(goal)
        ? s.career_goals.filter((g) => g !== goal)
        : [...s.career_goals, goal],
    }));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#1a2e5a] mb-2">What are your career goals?</h2>
      <p className="text-[#64748b] mb-8">Select all that apply. This helps us weight your recommendations.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAREER_GOAL_OPTIONS.map((goal) => {
          const selected = state.career_goals.includes(goal.value);
          const Icon = goal.icon;
          return (
            <button
              key={goal.value}
              onClick={() => toggle(goal.value)}
              className={cn(
                'p-5 rounded-2xl border text-left transition-all duration-150 group',
                selected
                  ? 'border-[#1a2e5a] bg-[#f0f4ff] ring-2 ring-[#1a2e5a]/10'
                  : 'border-[#e2e8f0] bg-white hover:border-[#c5d9f0] hover:bg-[#f8faff]',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                    selected ? 'bg-[#1a2e5a]' : 'bg-[#f1f5f9]',
                  )}
                >
                  <Icon
                    className={cn('w-5 h-5', selected ? 'text-[#0ea5e9]' : 'text-[#64748b]')}
                  />
                </div>
                <div>
                  <div className="font-semibold text-[#1a2e5a] mb-0.5">{goal.label}</div>
                  <div className="text-sm text-[#64748b]">{goal.sub}</div>
                </div>
                {selected && (
                  <Check size={16} className="text-[#1a2e5a] ml-auto flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl">
        <p className="text-sm text-[#0369a1] font-medium">
          🎯 Ready to generate your Career Profile!
        </p>
        <p className="text-xs text-[#0284c7] mt-1">
          Our AI will analyse your answers and create your Career Twin with personalised recommendations.
        </p>
      </div>
    </div>
  );
}
