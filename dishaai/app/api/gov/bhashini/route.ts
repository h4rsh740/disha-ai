import { NextRequest, NextResponse } from 'next/server';
import { translateWithBhashini, SUPPORTED_GOV_LANGUAGES } from '@/lib/gov/bhashini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sourceLanguage = 'en', targetLanguage } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text string is required for translation.' },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Target language code is required.' },
        { status: 400 }
      );
    }

    const result = await translateWithBhashini({
      text,
      sourceLanguage,
      targetLanguage,
    });

    return NextResponse.json({
      success: true,
      ...result,
      availableLanguages: SUPPORTED_GOV_LANGUAGES,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Translation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Bhashini National Language Translation Mission',
    ministry: 'MeitY, Government of India',
    status: 'ready',
    supportedLanguages: SUPPORTED_GOV_LANGUAGES,
  });
}
