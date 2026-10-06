// ============================================================
// AI Router — Gemini primary, OpenRouter fallback
// Server-side only — never exposed to browser
// ============================================================
import { callGemini } from './gemini';
import { callOpenRouter } from './openrouter';
import type { AIMessage, AIProviderResponse, AILogEntry } from './types';

const PRIMARY_PROVIDER = (process.env.AI_PRIMARY_PROVIDER ?? 'gemini') as 'gemini' | 'openrouter';

// ---- Internal logging (server-side only, no PII) ----

function logAICall(entry: AILogEntry): void {
  const safeEntry = {
    provider: entry.provider,
    model: entry.model,
    status: entry.status,
    latency_ms: entry.latency_ms,
    fallback_triggered: entry.fallback_triggered,
    ...(entry.reason ? { reason: entry.reason } : {}),
    timestamp: entry.timestamp,
  };
  console.log('[DishaAI/AI]', JSON.stringify(safeEntry));
}

function isFallbackError(error?: string): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('rate limit') ||
    lower.includes('timeout') ||
    lower.includes('503') ||
    lower.includes('500') ||
    lower.includes('unavailable') ||
    lower.includes('overloaded')
  );
}

// ---- Main router function ----

export async function routeAIRequest(
  messages: AIMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
  } = {},
): Promise<AIProviderResponse & { fallback_triggered: boolean }> {
  const { temperature = 0.3, maxTokens = 2048, responseFormat = 'text' } = options;
  const timestamp = new Date().toISOString();

  // ---- Primary provider ----
  const primaryCall = PRIMARY_PROVIDER === 'gemini' ? callGemini : callOpenRouter;
  const fallbackCall = PRIMARY_PROVIDER === 'gemini' ? callOpenRouter : callGemini;

  let primaryResult: AIProviderResponse;

  try {
    primaryResult = await primaryCall(messages, temperature, maxTokens, responseFormat);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    primaryResult = {
      content: '',
      provider: PRIMARY_PROVIDER,
      model: 'unknown',
      latency_ms: 0,
      success: false,
      error: errorMsg,
    };
  }

  // Success on primary
  if (primaryResult.success && primaryResult.content) {
    logAICall({
      provider: primaryResult.provider,
      model: primaryResult.model,
      status: 'success',
      latency_ms: primaryResult.latency_ms,
      fallback_triggered: false,
      timestamp,
    });
    return { ...primaryResult, fallback_triggered: false };
  }

  // ---- Fallback ----
  const shouldFallback =
    !primaryResult.success || isFallbackError(primaryResult.error);

  if (shouldFallback) {
    console.warn(
      `[DishaAI/AI] Primary provider (${PRIMARY_PROVIDER}) failed: ${primaryResult.error ?? 'empty response'}. Trying fallback.`,
    );

    let fallbackResult: AIProviderResponse;
    try {
      fallbackResult = await fallbackCall(messages, temperature, maxTokens, responseFormat);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      fallbackResult = {
        content: '',
        provider: PRIMARY_PROVIDER === 'gemini' ? 'openrouter' : 'gemini',
        model: 'unknown',
        latency_ms: 0,
        success: false,
        error: errorMsg,
      };
    }

    logAICall({
      provider: fallbackResult.provider,
      model: fallbackResult.model,
      status: fallbackResult.success ? 'fallback_success' : 'error',
      latency_ms: fallbackResult.latency_ms,
      fallback_triggered: true,
      reason: primaryResult.error ?? 'primary_failed',
      timestamp,
    });

    if (fallbackResult.success && fallbackResult.content) {
      return { ...fallbackResult, fallback_triggered: true };
    }

    // Both failed
    throw new Error(
      `Both AI providers failed. Primary: ${primaryResult.error}. Fallback: ${fallbackResult.error}`,
    );
  }

  throw new Error(`AI request failed: ${primaryResult.error}`);
}
