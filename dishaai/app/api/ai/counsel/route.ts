import { NextRequest, NextResponse } from 'next/server';
import { answerCareerQuestion } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, history, careerId, studentProfile, skillGaps } = body;

    if (!question || !careerId) {
      return NextResponse.json({ error: 'Missing question or careerId' }, { status: 400 });
    }

    const career = DEMO_CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    const profile = {
      id: 'demo-001', user_id: 'demo-user',
      name: studentProfile?.name ?? 'Student',
      education_level: studentProfile?.education_level ?? 'class_10',
      interests: studentProfile?.interests ?? [],
      learning_preference: studentProfile?.learning_preference ?? 'practical',
      work_environment: 'mixed' as const,
      location: 'India',
      training_duration: 'medium' as const,
      budget_range: 'zero' as const,
      career_goals: studentProfile?.career_goals ?? [],
      onboarding_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const skills = (studentProfile?.skills ?? []).map((s: string, i: number) => ({
      skill_id: `sk-${i}`, skill_name: s, proficiency: 2 as const,
    }));

    const gaps = (skillGaps ?? []).map((s: string, i: number) => ({
      skill_id: `gap-${i}`,
      skill_name: s,
      importance: 'important' as const,
    }));

    const result = await answerCareerQuestion(
      question,
      history ?? [],
      profile,
      skills,
      career,
      gaps,
    );

    return NextResponse.json({
      answer: result.answer,
      provider: result.provider,
      fallback_triggered: result.fallback_triggered,
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
