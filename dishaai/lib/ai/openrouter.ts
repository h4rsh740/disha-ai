// ============================================================
// OpenRouter Provider — Server-side only
// ============================================================
import type { AIMessage, AIProviderResponse } from './types';
import { hasUsableSecret } from './config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL   = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: { content: string; role: string };
    finish_reason: string;
  }>;
  error?: { message: string; code: number };
  model?: string;
}

export async function callOpenRouter(
  messages: AIMessage[],
  temperature = 0.3,
  maxTokens = 2048,
  responseFormat: 'text' | 'json' = 'text',
): Promise<AIProviderResponse> {
  if (!hasUsableSecret(OPENROUTER_API_KEY)) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const start = Date.now();

  const orMessages: OpenRouterMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body: Record<string, unknown> = {
    model: OPENROUTER_MODEL,
    messages: orMessages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat === 'json') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://dishaai.gov.in',
      // HTTP header values must stay ASCII-compatible for the Fetch API.
      'X-Title': 'DishaAI - Career Counselling Platform',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  const data: OpenRouterResponse = await response.json();
  const latency_ms = Date.now() - start;

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message ?? `HTTP ${response.status}`;
    return {
      content: '',
      provider: 'openrouter',
      model: OPENROUTER_MODEL,
      latency_ms,
      success: false,
      error: errorMsg,
    };
  }

  const content = data.choices?.[0]?.message?.content ?? '';
  return {
    content,
    provider: 'openrouter',
    model: data.model ?? OPENROUTER_MODEL,
    latency_ms,
    success: true,
  };
}
