// ============================================================
// AI Provider Types
// ============================================================

export type AIProvider = 'gemini' | 'openrouter';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AIProviderResponse {
  content: string;
  provider: AIProvider;
  model: string;
  latency_ms: number;
  success: boolean;
  error?: string;
}

export interface AILogEntry {
  provider: AIProvider;
  model: string;
  status: 'success' | 'fallback_success' | 'error';
  latency_ms: number;
  fallback_triggered: boolean;
  reason?: string;
  timestamp: string;
}
