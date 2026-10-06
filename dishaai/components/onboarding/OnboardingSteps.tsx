'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  Banknote, Car, Check, ChevronDown, Compass, Cpu, Factory,
  GraduationCap, HardHat, HeartPulse, Hotel, Package, PenTool,
  Settings2, Sprout, Sun, TrendingUp, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CAREER_INTERESTS, DEMO_SKILLS } from '@/data/careers';
import type {
  BudgetRange, CareerGoal, EducationLevel, LearningPreference,
  OnboardingState, StudentSkill, TrainingDuration, WorkEnvironment,
} from '@/types';
import styles from './OnboardingSteps.module.css';

type StepProps = {
  state: OnboardingState;
  setState: Dispatch<SetStateAction<OnboardingState>>;
};

type Choice<T extends string> = { value: T; label: string; sub: string };

const EDUCATION_OPTIONS: Choice<EducationLevel>[] = [
  { value: 'class_8', label: 'Class 8', sub: 'Currently studying' },
  { value: 'class_9', label: 'Class 9', sub: 'Currently studying' },
  { value: 'class_10', label: 'Class 10', sub: 'Completed or studying' },
  { value: 'class_11', label: 'Class 11', sub: 'Currently studying' },
  { value: 'class_12', label: 'Class 12', sub: 'Completed or studying' },
  { value: 'iti', label: 'ITI', sub: 'Completed or enrolled' },
  { value: 'diploma', label: 'Diploma', sub: 'Completed or enrolled' },
  { value: 'graduate', label: 'Graduate', sub: 'Completed or enrolled' },
];

const INTEREST_ICONS: Record<string, LucideIcon> = {
  technology: Cpu,
  electrical: Zap,
  agriculture: Sprout,
  healthcare: HeartPulse,
  automotive: Car,
  design: PenTool,
  construction: HardHat,
  hospitality: Hotel,
  manufacturing: Factory,
  renewable_energy: Sun,
  logistics: Package,
  finance: Banknote,
};

const LEARNING_OPTIONS: Choice<LearningPreference>[] = [
  { value: 'practical', label: 'Practical / Hands-on', sub: 'I prefer doing over reading' },
  { value: 'theoretical', label: 'Theoretical / Classroom', sub: 'I prefer study and concepts' },
  { value: 'mixed', label: 'Mixed / Both', sub: 'I adapt to either' },
];

const WORK_OPTIONS: Choice<WorkEnvironment>[] = [
  { value: 'indoor', label: 'Indoor', sub: 'Factory, office, workshop' },
  { value: 'outdoor', label: 'Outdoor', sub: 'Field, construction site' },
  { value: 'mixed', label: 'Mixed', sub: 'Both indoor and outdoor' },
  { value: 'remote', label: 'Remote / Home-based', sub: 'Work from home possible' },
];

const DURATION_OPTIONS: Choice<TrainingDuration>[] = [
  { value: 'short', label: 'Short (< 6 months)', sub: 'Get into work quickly' },
  { value: 'medium', label: 'Medium (6–18 months)', sub: 'Balanced approach' },
  { value: 'long', label: 'Long (> 18 months)', sub: 'Deep specialisation' },
];

const BUDGET_OPTIONS: Choice<BudgetRange>[] = [
  { value: 'zero', label: 'Government / Free', sub: 'Looking for fully sponsored options' },
  { value: 'low', label: 'Low (< ₹10,000)', sub: 'Minimal self-investment' },
  { value: 'medium', label: 'Medium (₹10k–₹30k)', sub: 'Willing to invest' },
  { value: 'high', label: 'High (> ₹30k)', sub: 'Private institutes fine' },
];

const CAREER_GOAL_OPTIONS: (Choice<CareerGoal> & { icon: LucideIcon })[] = [
  { value: 'quick_job', label: 'Get a job quickly', sub: 'Start earning soon after training', icon: Zap },
  { value: 'long_term', label: 'Build a long-term career', sub: 'Grow over time in a stable field', icon: TrendingUp },
  { value: 'business', label: 'Start a business', sub: 'Use skills to become self-employed', icon: Settings2 },
  { value: 'higher_education', label: 'Continue studying', sub: 'Use vocational as a stepping stone', icon: GraduationCap },
];

const PROFICIENCY_LEVELS = [1, 2, 3, 4, 5] as const;
const proficiencyLabels = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export function OnboardingSteps({ state, setState }: StepProps) {
  switch (state.step) {
    case 1: return <EducationStep state={state} setState={setState} />;
    case 2: return <InterestsStep state={state} setState={setState} />;
    case 3: return <SkillsStep state={state} setState={setState} />;
    case 4: return <PreferencesStep state={state} setState={setState} />;
    case 5: return <GoalsStep state={state} setState={setState} />;
    default: return null;
  }
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.heading}>
      <h2 id="onboarding-step-title" tabIndex={-1} className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

function Requirement({ required = false }: { required?: boolean }) {
  return (
    <span className={required ? styles.requiredBadge : styles.optionalBadge}>
      {required ? 'Required' : 'Optional'}
    </span>
  );
}

function SelectionCount({ count, minimum, noun }: { count: number; minimum: number; noun: string }) {
  return (
    <p className={styles.selectionCount} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.countNumber}>{count}</span> {count === 1 ? noun.slice(0, -1) : noun} selected
      <span className={styles.countDivider} aria-hidden="true">·</span>
      {count < minimum ? `Choose at least ${minimum}` : 'You can continue'}
    </p>
  );
}

function RadioCard<T extends string>({
  name, option, selected, required = false, onChange,
}: {
  name: string;
  option: Choice<T>;
  selected: boolean;
  required?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <label className={`${styles.radioCard} ${selected ? styles.selected : ''}`}>
      <span className={styles.radioTopline}>
        <span className={styles.optionTitle}>{option.label}</span>
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={selected}
          required={required}
          onChange={() => onChange(option.value)}
          className={styles.nativeRadio}
        />
      </span>
      <span className={styles.optionDescription}>{option.sub}</span>
    </label>
  );
}

function EducationStep({ state, setState }: StepProps) {
  return (
    <section className={styles.step} aria-labelledby="onboarding-step-title">
      <StepHeading
        title="Tell us about yourself"
        description="Start with where you are today. Your education helps shape the paths you explore."
      />

      <div className={styles.field}>
        <label htmlFor="name" className={styles.fieldLabel}>
          Your name <Requirement required />
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="e.g. Ravi Sharma"
          value={state.name ?? ''}
          onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
          className={styles.textInput}
        />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Current education level <Requirement required /></legend>
        <div className={styles.educationGrid}>
          {EDUCATION_OPTIONS.map((option) => (
            <RadioCard
              key={option.value}
              name="education_level"
              option={option}
              required
              selected={state.education_level === option.value}
              onChange={(education_level) => setState((current) => ({ ...current, education_level }))}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.detailsGrid}>
        <div className={styles.field}>
          <label htmlFor="stream" className={styles.fieldLabel}>Stream <Requirement /></label>
          <div className={styles.selectWrapper}>
            <select
              id="stream"
              name="stream"
              value={state.stream ?? ''}
              onChange={(event) => setState((current) => ({ ...current, stream: event.target.value }))}
              className={styles.selectInput}
            >
              <option value="">Select stream</option>
              <option value="science">Science (PCM)</option>
              <option value="science_bio">Science (PCB)</option>
              <option value="commerce">Commerce</option>
              <option value="arts">Arts / Humanities</option>
              <option value="vocational">Vocational</option>
            </select>
            <ChevronDown size={17} className={styles.selectChevron} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="location" className={styles.fieldLabel}>Location (state) <Requirement /></label>
          <input
            id="location"
            name="location"
            type="text"
            autoComplete="address-level1"
            placeholder="e.g. Maharashtra"
            value={state.location ?? ''}
            onChange={(event) => setState((current) => ({ ...current, location: event.target.value }))}
            className={styles.textInput}
          />
        </div>
      </div>
    </section>
  );
}

function InterestsStep({ state, setState }: StepProps) {
  const toggleInterest = (id: string) => {
    setState((current) => ({
      ...current,
      selected_interests: current.selected_interests.includes(id)
        ? current.selected_interests.filter((interest) => interest !== id)
        : [...current.selected_interests, id],
    }));
  };

  return (
    <section className={styles.step} aria-labelledby="onboarding-step-title">
      <StepHeading
        title="What interests you?"
        description="Choose at least two areas you’re curious about. You don’t need experience to be interested."
      />
      <fieldset className={styles.fieldset} aria-describedby="interest-selection-help">
        <legend className={styles.legend}>Areas of interest <Requirement required /></legend>
        <div id="interest-selection-help" className={styles.groupStatus}>
          <SelectionCount count={state.selected_interests.length} minimum={2} noun="areas" />
        </div>
        <div className={styles.interestGrid}>
          {CAREER_INTERESTS.map((interest) => {
            const selected = state.selected_interests.includes(interest.id);
            const Icon = INTEREST_ICONS[interest.id] ?? Compass;
            return (
              <button
                key={interest.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(interest.id)}
                className={`${styles.interestCard} ${selected ? styles.selected : ''}`}
              >
                <span className={styles.cardTopline}>
                  <span className={styles.iconWell}><Icon size={20} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className={styles.selectionMark} aria-hidden="true">{selected && <Check size={13} />}</span>
                </span>
                <span className={styles.optionTitle}>{interest.label}</span>
                <span className={styles.optionDescription}>{interest.description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

function SkillsStep({ state, setState }: StepProps) {
  const toggleSkill = (skillId: string, skillName: string) => {
    setState((current) => {
      const exists = current.selected_skills.some((skill) => skill.skill_id === skillId);
      return {
        ...current,
        selected_skills: exists
          ? current.selected_skills.filter((skill) => skill.skill_id !== skillId)
          : [...current.selected_skills, { skill_id: skillId, skill_name: skillName, proficiency: 2 }],
      };
    });
  };

  const updateProficiency = (skillId: string, proficiency: StudentSkill['proficiency']) => {
    setState((current) => ({
      ...current,
      selected_skills: current.selected_skills.map((skill) =>
        skill.skill_id === skillId ? { ...skill, proficiency } : skill,
      ),
    }));
  };

  return (
    <section className={styles.step} aria-labelledby="onboarding-step-title">
      <StepHeading
        title="What skills do you have?"
        description="Select at least one skill, then rate your current level. Everyday experience counts; training can help with the gaps."
      />
      <fieldset className={styles.fieldset} aria-describedby="skill-selection-help skill-rating-help">
        <legend className={styles.legend}>Your existing skills <Requirement required /></legend>
        <div id="skill-selection-help" className={styles.groupStatus}>
          <SelectionCount count={state.selected_skills.length} minimum={1} noun="skills" />
        </div>
        <p id="skill-rating-help" className={styles.ratingHelp}>Rate from 1 (Beginner) to 5 (Expert). New selections start at 2 (Basic).</p>
        <div className={styles.skillList}>
          {DEMO_SKILLS.map((skill) => {
            const selected = state.selected_skills.find((entry) => entry.skill_id === skill.id);
            return (
              <div key={skill.id} className={`${styles.skillRow} ${selected ? styles.selected : ''}`}>
                <label htmlFor={`skill-${skill.id}`} className={styles.skillToggle}>
                  <input
                    id={`skill-${skill.id}`}
                    type="checkbox"
                    name="selected_skills"
                    value={skill.id}
                    checked={Boolean(selected)}
                    onChange={() => toggleSkill(skill.id, skill.name)}
                    className={styles.nativeCheckbox}
                  />
                  <span className={styles.skillText}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillCategory}>{skill.category}</span>
                  </span>
                </label>
                {selected && (
                  <fieldset className={styles.proficiencyControl}>
                    <legend className={styles.visuallyHidden}>{skill.name}: proficiency</legend>
                    <div className={styles.ratingButtons}>
                      {PROFICIENCY_LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          aria-label={`${skill.name}: ${level} — ${proficiencyLabels[level]}`}
                          aria-pressed={selected.proficiency === level}
                          onClick={() => updateProficiency(skill.id, level)}
                          className={`${styles.ratingButton} ${selected.proficiency === level ? styles.ratingSelected : ''}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <span className={styles.proficiencyValue} aria-live="polite" aria-atomic="true">
                      {selected.proficiency} — {proficiencyLabels[selected.proficiency]}
                    </span>
                  </fieldset>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

function OptionGroup<T extends string>({
  name, label, value, onChange, options, required = false,
}: {
  name: string;
  label: string;
  value?: T;
  onChange: (value: T) => void;
  options: Choice<T>[];
  required?: boolean;
}) {
  return (
    <fieldset className={styles.fieldset} aria-describedby={`${name}-help`}>
      <legend className={styles.legend}>{label} <Requirement required={required} /></legend>
      <p id={`${name}-help`} className={styles.groupHelp}>
        {required ? 'Choose one that feels right for you.' : 'Choose one, or leave this open for now.'}
      </p>
      <div className={`${styles.preferenceGrid} ${options.length === 3 ? styles.preferenceThree : styles.preferenceFour}`}>
        {options.map((option) => (
          <RadioCard
            key={option.value}
            name={name}
            option={option}
            required={required}
            selected={value === option.value}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

function PreferencesStep({ state, setState }: StepProps) {
  const requiredCount = Number(Boolean(state.learning_preference)) + Number(Boolean(state.work_environment));

  return (
    <section className={styles.step} aria-labelledby="onboarding-step-title">
      <StepHeading
        title="Your preferences"
        description="Make room for the way you learn and work. Duration and budget are optional if you’re still deciding."
      />
      <p className={styles.selectionCount} role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.countNumber}>{requiredCount} of 2</span> required preferences selected
      </p>
      <OptionGroup
        name="learning_preference"
        label="Learning preference"
        value={state.learning_preference}
        required
        options={LEARNING_OPTIONS}
        onChange={(learning_preference) => setState((current) => ({ ...current, learning_preference }))}
      />
      <OptionGroup
        name="work_environment"
        label="Preferred work environment"
        value={state.work_environment}
        required
        options={WORK_OPTIONS}
        onChange={(work_environment) => setState((current) => ({ ...current, work_environment }))}
      />
      <OptionGroup
        name="training_duration"
        label="Training duration preference"
        value={state.training_duration}
        options={DURATION_OPTIONS}
        onChange={(training_duration) => setState((current) => ({ ...current, training_duration }))}
      />
      <OptionGroup
        name="budget_range"
        label="Training budget"
        value={state.budget_range}
        options={BUDGET_OPTIONS}
        onChange={(budget_range) => setState((current) => ({ ...current, budget_range }))}
      />
    </section>
  );
}

function GoalsStep({ state, setState }: StepProps) {
  const toggleGoal = (goal: CareerGoal) => {
    setState((current) => ({
      ...current,
      career_goals: current.career_goals.includes(goal)
        ? current.career_goals.filter((value) => value !== goal)
        : [...current.career_goals, goal],
    }));
  };

  return (
    <section className={styles.step} aria-labelledby="onboarding-step-title">
      <StepHeading
        title="What are your career goals?"
        description="Choose at least one direction that matters to you. You can want more than one thing from your future."
      />
      <fieldset className={styles.fieldset} aria-describedby="goal-selection-help">
        <legend className={styles.legend}>Your next chapter <Requirement required /></legend>
        <div id="goal-selection-help" className={styles.groupStatus}>
          <SelectionCount count={state.career_goals.length} minimum={1} noun="goals" />
        </div>
        <div className={styles.goalGrid}>
          {CAREER_GOAL_OPTIONS.map((goal) => {
            const selected = state.career_goals.includes(goal.value);
            const Icon = goal.icon;
            return (
              <button
                key={goal.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleGoal(goal.value)}
                className={`${styles.goalCard} ${selected ? styles.selected : ''}`}
              >
                <span className={styles.iconWell}><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span>
                <span className={styles.goalText}>
                  <span className={styles.optionTitle}>{goal.label}</span>
                  <span className={styles.optionDescription}>{goal.sub}</span>
                </span>
                <span className={styles.selectionMark} aria-hidden="true">{selected && <Check size={13} />}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <aside className={styles.careerNote}>
        <Compass size={19} strokeWidth={1.6} className={styles.noteIcon} aria-hidden="true" />
        <div>
          <p className={styles.noteTitle}>A starting point for your Career Twin</p>
          <p className={styles.noteBody}>
            Your answers form a profile to help you explore career paths. Guidance uses illustrative demo data;
            it is a starting point for decisions, not a guarantee of admission or employment.
          </p>
        </div>
      </aside>
    </section>
  );
}
