import { NextRequest, NextResponse } from 'next/server';
import { answerFamilyFAQ } from '@/lib/ai/provider';
import { DEMO_CAREERS } from '@/data/careers';
import { prepareSafeAIRequest } from '@/lib/ai/pipeline';
import { logSecurityEvent } from '@/lib/security/audit';
import { readJsonRequest, validateAIFields, validationDetails } from '@/lib/security/request';

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

    const { question, careerId, history } = fieldsResult.value;

    if (!question || !careerId) {
      return NextResponse.json({ error: 'Missing question or careerId' }, { status: 400 });
    }

    const security = prepareSafeAIRequest({ question, history });
    logSecurityEvent({
      action: 'family_faq_request',
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
