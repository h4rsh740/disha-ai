import { NextRequest, NextResponse } from 'next/server';
import { generateCareerExplanation } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { careerId } = body;

    const career = DEMO_CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    const result = await generateCareerExplanation(career);

    return NextResponse.json({
      text: result.text,
      provider: result.provider,
      fallback_triggered: result.fallback_triggered,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API/ai/explain-career]', message);

    // Return graceful fallback — never expose raw error to client
    return NextResponse.json(
      { text: "I don't have a detailed AI explanation ready for this career yet. Please check back soon.", provider: 'fallback', fallback_triggered: false },
      { status: 200 },
    );
  }
}
