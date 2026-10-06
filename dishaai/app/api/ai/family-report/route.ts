import { NextRequest, NextResponse } from 'next/server';
import { generateFamilyReport } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, careerId, studentProfile } = body;

    const career = DEMO_CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    // Build minimal student profile for AI context
    const profile = {
      id: 'demo-001',
      user_id: 'demo-user',
      name: studentName ?? 'Student',
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

    const studentSkills = (studentProfile?.skills ?? []).map((s: string, i: number) => ({
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
