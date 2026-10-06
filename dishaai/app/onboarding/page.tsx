'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import type { OnboardingState } from '@/types';
import styles from './onboarding.module.css';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Education', 'Interests', 'Skills', 'Preferences', 'Goals'];
const INITIAL_STATE: OnboardingState = {
  step: 1,
  selected_interests: [],
  selected_skills: [],
  career_goals: [],
};

function getStepHelp(state: OnboardingState): string {
  switch (state.step) {
    case 1:
      return 'Add your name and choose your education level to continue.';
    case 2:
      return `${state.selected_interests.length} selected. Choose at least 2 interests to continue.`;
    case 3:
      return `${state.selected_skills.length} selected. Choose at least 1 skill to continue.`;
    case 4:
      return 'Choose how you like to learn and your preferred work environment.';
    case 5:
      return `${state.career_goals.length} selected. Choose at least 1 goal to create your profile.`;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [saveError, setSaveError] = useState<string | null>(null);
  const stepContent = useRef<HTMLDivElement>(null);
  const previousStep = useRef(state.step);

  useEffect(() => {
    if (previousStep.current === state.step) return;
    previousStep.current = state.step;

    const heading = stepContent.current?.querySelector<HTMLElement>('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [state.step]);

  const canProceed = (): boolean => {
    switch (state.step) {
      case 1: return !!state.education_level && !!state.name?.trim();
      case 2: return state.selected_interests.length >= 2;
      case 3: return state.selected_skills.length >= 1;
      case 4: return !!state.learning_preference && !!state.work_environment;
      case 5: return state.career_goals.length >= 1;
      default: return false;
    }
  };

  const next = () => {
    if (!canProceed()) return;
    setSaveError(null);

    if (state.step < TOTAL_STEPS) {
      setState((current) => ({
        ...current,
        step: (current.step + 1) as OnboardingState['step'],
      }));
      return;
    }

    try {
      localStorage.setItem('disha_onboarding', JSON.stringify({
        ...state,
        name: state.name?.trim(),
      }));
    } catch {
      setSaveError(
        'Your browser could not save your profile. Your answers are still here. Allow site storage in your browser settings, then try again.',
      );
      return;
    }

    router.push('/dashboard');
  };

  const back = () => {
    if (state.step <= 1) return;
    setSaveError(null);
    setState((current) => ({
      ...current,
      step: (current.step - 1) as OnboardingState['step'],
    }));
  };

  const ready = canProceed();
  const currentStepLabel = STEP_LABELS[state.step - 1];

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#career-assessment">
        Skip to assessment
      </a>

      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} aria-label="Disha AI home">
          Disha <span>AI</span>
        </Link>
        <Link href="/" className={styles.homeLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to home
        </Link>
      </header>

      <main className={styles.layout}>
        <div className={styles.narrative}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Your next chapter starts here
          </p>
          <h1 className={styles.heroTitle}>
            A little about you.
            <br />
            A world of <em>possibilities.</em>
          </h1>
          <p className={styles.heroDescription}>
            There’s more than one way forward. Let’s find the careers and
            learning paths that feel right for you.
          </p>

          <ul className={styles.benefits}>
            <li>
              <span className={styles.benefitNumber} aria-hidden="true">01</span>
              Discover careers that fit your interests.
            </li>
            <li>
              <span className={styles.benefitNumber} aria-hidden="true">02</span>
              Build on the skills you already have.
            </li>
            <li>
              <span className={styles.benefitNumber} aria-hidden="true">03</span>
              Find a clearer next step, at your own pace.
            </li>
          </ul>

          <div className={styles.trajectory} aria-hidden="true">
            <div className={styles.trajectoryCaption}>
              <span>A direction, uniquely yours</span>
              <span>Explore · Learn · Grow</span>
            </div>
            <svg
              viewBox="0 0 480 230"
              fill="none"
              className={styles.trajectoryDrawing}
              focusable="false"
            >
              <path className={styles.guideLine} d="M20 194H460M20 136H460M20 78H460" />
              <path className={styles.alternativePath} d="M30 196C115 200 137 112 221 134S343 169 450 75" />
              <path className={styles.alternativePath} d="M30 196C135 198 151 162 225 168S363 104 450 124" />
              <path className={styles.mainPath} d="M30 196C109 195 135 162 193 132S297 143 350 92S404 48 450 28" />
              <circle className={styles.startHalo} cx="30" cy="196" r="12" />
              <circle className={styles.pathPoint} cx="30" cy="196" r="4" />
              <circle className={styles.pathPoint} cx="193" cy="132" r="4" />
              <circle className={styles.pathPoint} cx="350" cy="92" r="4" />
              <circle className={styles.endHalo} cx="450" cy="28" r="17" />
              <circle className={styles.pathPoint} cx="450" cy="28" r="5" />
              <path className={styles.star} d="M450 5V13M450 43V51M427 28H435M465 28H473" />
            </svg>
            <p className={styles.trajectoryNote}>
              Every path begins with understanding yourself.
            </p>
          </div>
        </div>

        <section
          id="career-assessment"
          className={styles.assessment}
          aria-label="Your career assessment"
          tabIndex={-1}
        >
          <div className={styles.progressHeader}>
            <p className={styles.currentStep} aria-live="polite" aria-atomic="true">
              <span className={styles.stepEyebrow}>Getting to know you</span>
              <span>{currentStepLabel}</span>
            </p>
            <p className={styles.stepCount}>
              <span className={styles.screenReaderOnly}>Step </span>
              {String(state.step).padStart(2, '0')}
              <span aria-hidden="true"> / </span>
              <span className={styles.screenReaderOnly}> of </span>
              {String(TOTAL_STEPS).padStart(2, '0')}
            </p>
          </div>

          <ol className={styles.progressRail} aria-label="Assessment steps">
            {STEP_LABELS.map((label, index) => {
              const stepNumber = index + 1;
              const complete = state.step > stepNumber;
              const current = state.step === stepNumber;

              return (
                <li
                  key={label}
                  className={styles.railItem}
                  data-status={current ? 'current' : complete ? 'complete' : 'upcoming'}
                  aria-current={current ? 'step' : undefined}
                >
                  <span className={styles.railLine} aria-hidden="true" />
                  <span className={styles.railLabel}>
                    <span className={styles.railNumber} aria-hidden="true">
                      {complete ? <Check size={12} /> : String(stepNumber).padStart(2, '0')}
                    </span>
                    {label}
                    {complete && <span className={styles.screenReaderOnly}> — completed</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className={styles.card}>
            <div className={styles.stepContent} ref={stepContent}>
              <OnboardingSteps state={state} setState={setState} />
            </div>

            <div className={styles.navigation}>
              {saveError && (
                <div className={styles.saveError} role="alert">
                  <p className={styles.errorTitle}>Your profile hasn’t been saved yet.</p>
                  <p>{saveError}</p>
                </div>
              )}
              <p
                id="onboarding-step-help"
                className={styles.stepHelp}
                aria-live="polite"
                aria-atomic="true"
              >
                {ready
                  ? state.step === TOTAL_STEPS
                    ? 'You’re ready. Create your profile to explore your next chapter.'
                    : 'Ready when you are. You can go back to change your answers.'
                  : getStepHelp(state)}
              </p>
              <div className={styles.navigationButtons}>
                <button
                  className={styles.backButton}
                  type="button"
                  onClick={back}
                  disabled={state.step === 1}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back
                </button>
                <button
                  className={styles.nextButton}
                  type="button"
                  onClick={next}
                  disabled={!ready}
                  aria-describedby="onboarding-step-help"
                >
                  {state.step === TOTAL_STEPS ? 'Create my career profile' : 'Continue'}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <p className={styles.assessmentNote}>
            No right or wrong answers. Just a starting point that’s yours.
          </p>
        </section>
      </main>

      <footer className={styles.pageFooter}>
        <span>A little clarity. A new direction.</span>
        <span>Disha AI · Built around you</span>
      </footer>
    </div>
  );
}
