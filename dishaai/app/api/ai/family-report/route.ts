import { NextRequest, NextResponse } from 'next/server';
import { generateFamilyReport } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';
import {
  boundedEnum,
  boundedEnumList,
  boundedStringList,
  boundedText,
  readJsonRequest,
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

    const body = bodyResult.value;
    const studentName = boundedText(body.studentName, 120, 'Student');
    const careerId = boundedText(body.careerId, 128);
    const studentProfileValue = body.studentProfile;
    const studentProfile = typeof studentProfileValue === 'object' && studentProfileValue !== null && !Array.isArray(studentProfileValue)
      ? studentProfileValue as Record<string, unknown>
      : {};

    if (!careerId) {
      return NextResponse.json({ error: 'Missing careerId' }, { status: 400 });
    }

    const career = DEMO_CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    // Build minimal student profile for AI context
    const profile = {
      id: 'demo-001',
      user_id: 'demo-user',
       name: studentName,
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

    const studentSkills = boundedStringList(studentProfile.skills, 20, 120).map((s, i) => ({
      skill_id: `sk-${i}`,
      skill_name: s,
      proficiency: 2 as const,
    }));

    const result = await generateFamilyReport(profile, studentSkills, career);

    return NextResponse.json({
      report: result.report,
      provider: result.provider,
      fallback_triggered: result.fallback_triggered,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API/ai/family-report]', message);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 },
    );
  }
}
