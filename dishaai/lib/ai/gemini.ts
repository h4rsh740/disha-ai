// ============================================================
// Gemini Provider — Server-side only
// ============================================================
import type { AIMessage, AIProviderResponse } from './types';
import { hasUsableSecret } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }>; role: string };
    finishReason: string;
  }>;
  error?: { message: string; code: number };
}

function toGeminiMessages(messages: AIMessage[]): {
  systemInstruction?: { parts: Array<{ text: string }> };
  contents: GeminiContent[];
} {
  const system = messages.find((m) => m.role === 'system');
  const conversation = messages.filter((m) => m.role !== 'system');

  const contents: GeminiContent[] = conversation.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    systemInstruction: system
      ? { parts: [{ text: system.content }] }
      : undefined,
    contents,
  };
}

export async function callGemini(
  messages: AIMessage[],
  temperature = 0.3,
  maxTokens = 2048,
  responseFormat: 'text' | 'json' = 'text',
): Promise<AIProviderResponse> {
  if (!hasUsableSecret(GEMINI_API_KEY)) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const start = Date.now();
  const { systemInstruction, contents } = toGeminiMessages(messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
    },
  };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  const data: GeminiResponse = await response.json();
  const latency_ms = Date.now() - start;

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message ?? `HTTP ${response.status}`;
    return {
      content: '',
      provider: 'gemini',
      model: GEMINI_MODEL,
      latency_ms,
      success: false,
      error: errorMsg,
    };
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return {
    content,
    provider: 'gemini',
    model: GEMINI_MODEL,
    latency_ms,
    success: true,
  };
}
