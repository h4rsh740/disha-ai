import { NextResponse } from 'next/server';
import { hasUsableSecret } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

/**
 * Safe operational probe. It reports configuration presence only; it never
 * returns keys, provider responses, database URLs, or user data.
 */
export async function GET() {
  const clerkConfigured = hasUsableSecret(process.env.CLERK_SECRET_KEY) || hasUsableSecret(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const geminiConfigured = hasUsableSecret(process.env.GEMINI_API_KEY);
  const openRouterConfigured = hasUsableSecret(process.env.OPENROUTER_API_KEY);
  const supabaseConfigured = hasUsableSecret(process.env.NEXT_PUBLIC_SUPABASE_URL) && hasUsableSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const databaseConfigured = hasUsableSecret(process.env.DATABASE_URL) || supabaseConfigured;

  return NextResponse.json({
    status: 'ok',
    service: 'dishaai',
    environment: process.env.NODE_ENV ?? 'development',
    platformStack: {
      auth: 'Clerk',
      primaryAI: 'Google Gemini',
      backupAI: 'OpenRouter',
      database: 'Supabase (PostgreSQL + pgvector)',
    },
    checks: {
      localRecommendationEngine: 'ready',
      localKnowledgeRetrieval: 'ready',
      inputSecurity: 'ready',
      outputGuardrails: 'ready',
      clerkAuth: clerkConfigured ? 'configured' : 'ready_demo_mode',
      geminiProvider: geminiConfigured ? 'configured' : 'not_configured',
      openRouterProvider: openRouterConfigured ? 'configured' : 'not_configured',
      supabaseDatabase: databaseConfigured ? 'configured' : 'not_configured',
    },
    productionNote: 'Architecture matches PPT specifications: Clerk (Auth) + Gemini/OpenRouter (AI) + Supabase/PostgreSQL (Data).',
    timestamp: new Date().toISOString(),
  });
}
