import { NextRequest, NextResponse } from 'next/server';
import { answerCareerQuestion } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';
import { prepareSafeAIRequest } from '@/lib/ai/pipeline';
import { logSecurityEvent } from '@/lib/security/audit';
import {
  boundedEnum,
  boundedEnumList,
  boundedStringList,
  boundedText,
  readJsonRequest,
  validateAIFields,
  validationDetails,
} from '@/lib/security/request';
import type { CareerGoal, EducationLevel, LearningPreference } from '@/types';

const EDUCATION_LEVELS: readonly EducationLevel[] = [
  'class_8', 'class_9', 'class_10', 'class_11', 'class_12', 'iti', 'diploma', 'graduate',
];
const LEARNING_PREFERENCES: readonly LearningPreference[] = ['practical', 'theoretical', 'mixed'];
const CAREER_GOALS: readonly CareerGoal[] = ['quick_job', 'long_term', 'business', 'higher_education'];

export async function POST(request: NextRequest) {
  try {
    const bodyResult = await readJsonRequest(request);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: 'Invalid request body.', details: validationDetails(bodyResult.errors) },
        { status: 400 },
      );
    }

    const fieldsResult = validateAIFields(bodyResult.value);
    if (!fieldsResult.ok) {
      return NextResponse.json(
        { error: 'Invalid AI request fields.', details: validationDetails(fieldsResult.errors) },
        { status: 400 },
      );
    }

    const { question, history, careerId } = fieldsResult.value;
    const studentProfileValue = bodyResult.value.studentProfile;
    const studentProfile = typeof studentProfileValue === 'object' && studentProfileValue !== null && !Array.isArray(studentProfileValue)
      ? studentProfileValue as Record<string, unknown>
      : {};
    const skillGaps = boundedStringList(bodyResult.value.skillGaps, 20, 120);

    if (!question || !careerId) {
      return NextResponse.json({ error: 'Missing question or careerId' }, { status: 400 });
    }

    const security = prepareSafeAIRequest({ question, history });
    logSecurityEvent({
      action: 'counsel_request',
      decision: security.security.decision,
      riskLevel: security.security.riskLevel,
      matchedRuleIds: security.security.matchedRuleIds,
      blockedFields: security.security.blockedFields,
      acceptedSourceIds: security.security.acceptedSourceIds,
    });
    if (security.security.blocked) {
      return NextResponse.json(
        {
          error: 'Request blocked by the security policy.',
          security: {
            riskLevel: security.security.riskLevel,
            matchedRuleIds: security.security.matchedRuleIds,
          },
        },
        { status: 422 },
      );
    }

    const career = DEMO_CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    const profile = {
      id: 'demo-001', user_id: 'demo-user',
      name: boundedText(studentProfile.name, 120, 'Student'),
      education_level: boundedEnum(studentProfile.education_level, EDUCATION_LEVELS, 'class_10'),
      interests: boundedStringList(studentProfile.interests, 12, 80),
      learning_preference: boundedEnum(studentProfile.learning_preference, LEARNING_PREFERENCES, 'practical'),
      work_environment: 'mixed' as const,
      location: 'India',
      training_duration: 'medium' as const,
      budget_range: 'zero' as const,
      career_goals: boundedEnumList(studentProfile.career_goals, CAREER_GOALS, 8, 80),
      onboarding_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const skills = boundedStringList(studentProfile.skills, 20, 120).map((s, i) => ({
      skill_id: `sk-${i}`, skill_name: s, proficiency: 2 as const,
    }));

    const gaps = skillGaps.map((s, i) => ({
      skill_id: `gap-${i}`,
      skill_name: s,
      importance: 'important' as const,
    }));

    const rawLanguage = bodyResult.value.language || 'en';
    const targetLanguage = typeof rawLanguage === 'string' ? rawLanguage : 'en';

    let workingQuestion = question;
    // Step 1: Translate non-English student question to English via Bhashini for grounded RAG
    if (targetLanguage !== 'en') {
      try {
        const { translateWithBhashini } = await import('@/lib/gov/bhashini');
        const translatedIn = await translateWithBhashini({
          text: question,
          sourceLanguage: targetLanguage,
          targetLanguage: 'en',
        });
        if (translatedIn.translatedText) {
          workingQuestion = translatedIn.translatedText;
        }
      } catch (err) {
        console.warn('[Bhashini Translation Inbound Error]', err);
      }
    }

    const result = await answerCareerQuestion(
      workingQuestion,
      history,
      profile,
      skills,
      career,
      gaps,
    );

    let finalAnswer = result.answer;
    let finalProvider = result.provider;

    // Step 2: Translate AI answer back into student's chosen Indian mother tongue via Bhashini
    if (targetLanguage !== 'en') {
      try {
        const { translateWithBhashini } = await import('@/lib/gov/bhashini');
        const translatedOut = await translateWithBhashini({
          text: result.answer,
          sourceLanguage: 'en',
          targetLanguage,
        });
        if (translatedOut.translatedText) {
          finalAnswer = translatedOut.translatedText;
          finalProvider = `${result.provider} + Bhashini (${translatedOut.provider})`;
        }
      } catch (err) {
        console.warn('[Bhashini Translation Outbound Error]', err);
      }
    }

    return NextResponse.json({
      answer: finalAnswer,
      provider: finalProvider,
      fallback_triggered: result.fallback_triggered,
      language: targetLanguage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API/ai/counsel]', message);

    return NextResponse.json(
      {
        answer: "I'm having trouble connecting right now. Please try again in a moment.",
        provider: 'fallback',
        fallback_triggered: false,
      },
      { status: 200 },
    );
  }
}
