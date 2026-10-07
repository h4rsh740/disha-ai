import { NextResponse } from 'next/server';
import { hasUsableSecret } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

/**
 * Safe operational probe. It reports configuration presence only; it never
 * returns keys, provider responses, database URLs, or user data.
 */
export async function GET() {
  const firebaseConfigured =
    hasUsableSecret(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
    hasUsableSecret(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const geminiConfigured = hasUsableSecret(process.env.GEMINI_API_KEY);
  const openRouterConfigured = hasUsableSecret(process.env.OPENROUTER_API_KEY);
  const supabaseConfigured =
    hasUsableSecret(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    hasUsableSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const databaseConfigured = hasUsableSecret(process.env.DATABASE_URL) || supabaseConfigured;

  const dataGovInConfigured = hasUsableSecret(process.env.DATA_GOV_IN_API_KEY);

  return NextResponse.json({
    status: 'ok',
    service: 'dishaai',
    environment: process.env.NODE_ENV ?? 'development',
    platformStack: {
      auth: 'Firebase Authentication',
      primaryAI: 'Google Gemini',
      backupAI: 'OpenRouter',
      database: 'Supabase (PostgreSQL + pgvector)',
      openGovData: 'data.gov.in (NIC / MeitY)',
    },
    checks: {
      localRecommendationEngine: 'ready',
      localKnowledgeRetrieval: 'ready',
      inputSecurity: 'ready',
      outputGuardrails: 'ready',
      firebaseAuth: firebaseConfigured ? 'configured' : 'ready_demo_mode',
      openGovData: dataGovInConfigured ? 'configured' : 'ready_demo_mode',
      geminiProvider: geminiConfigured ? 'configured' : 'not_configured',
      openRouterProvider: openRouterConfigured ? 'configured' : 'not_configured',
      supabaseDatabase: databaseConfigured ? 'configured' : 'not_configured',
    },
    productionNote:
      'Architecture stack: Firebase (Auth) + Gemini/OpenRouter (AI) + Supabase/PostgreSQL (Data) + data.gov.in (Gov Data).',
    timestamp: new Date().toISOString(),
  });
}
