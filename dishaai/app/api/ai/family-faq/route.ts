import { NextRequest, NextResponse } from 'next/server';
import { answerFamilyFAQ } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, careerId } = body;

    if (!question || !careerId) {
      return NextResponse.json({ error: 'Missing question or careerId' }, { status: 400 });
    }

    const career = DEMO_CAREERS.find((c) => c.id === careerId);
    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    const result = await answerFamilyFAQ(question, career);

    return NextResponse.json({
      answer: result.answer,
      provider: result.provider,
      fallback_triggered: result.fallback_triggered,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API/ai/family-faq]', message);

    return NextResponse.json(
      {
        answer: "We don't have complete information for this yet. We recommend speaking to a career counsellor at your nearest ITI or polytechnic.",
        provider: 'fallback',
        fallback_triggered: false,
      },
      { status: 200 },
    );
  }
}
