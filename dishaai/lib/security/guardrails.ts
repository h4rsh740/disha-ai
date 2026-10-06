// Output-side guardrails. Model output is treated as untrusted even when the
// request was safe: normalize it, remove prompt-like wrappers, and refuse
// unsupported sensitive claims or obvious credential material.

export type GuardrailDecision = 'allow' | 'sanitize' | 'fallback';

export type GuardrailReason =
  | 'invalid_output'
  | 'empty_output'
  | 'output_too_large'
  | 'secret_leakage'
  | 'unsupported_government_claim'
  | 'unsupported_salary_claim'
  | 'unsupported_statistic_claim'
  | 'instruction_wrapper_removed';

export interface GuardrailOptions {
  maxCharacters?: number;
  fallbackText?: string;
  /** Trusted tokens from retrieval context, such as source:c-01. */
  contextTokens?: readonly string[] | string;
  /** Citation tokens that may appear in the generated answer. */
  citations?: readonly string[] | string;
  /** Alias for callers that keep citations and context tokens together. */
  citationTokens?: readonly string[] | string;
}

export interface ModelOutputGuardrailResult {
  safe: boolean;
  valid: boolean;
  decision: GuardrailDecision;
  text: string;
  /** Alias useful to provider adapters that call the result an output. */
  output: string;
  normalizedText: string;
  fallbackUsed: boolean;
  reasons: GuardrailReason[];
  matchedRuleIds: string[];
  removedInstructionWrappers: number;
  supportingTokenPresent: boolean;
}

export type ModelOutputValidationResult = ModelOutputGuardrailResult;

const DEFAULT_MAX_OUTPUT_CHARACTERS = 12_000;
const DEFAULT_FALLBACK_TEXT =
  "I don't have verified information for that yet. Please check the available career sources or speak with a qualified career counsellor.";

interface SecretRule {
  id: string;
  pattern: RegExp;
}

const SECRET_RULES: readonly SecretRule[] = [
  { id: 'OUT-SECRET-OPENAI', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: 'OUT-SECRET-OPENROUTER', pattern: /\bsk-or-v1-[A-Za-z0-9_-]{16,}\b/i },
  { id: 'OUT-SECRET-GOOGLE', pattern: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { id: 'OUT-SECRET-GITHUB', pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/i },
  { id: 'OUT-SECRET-AWS', pattern: /\bAKIA[0-9A-Z]{16}\b|\bASIA[0-9A-Z]{16}\b/ },
  { id: 'OUT-SECRET-JWT', pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  { id: 'OUT-SECRET-PRIVATE-KEY', pattern: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/i },
  { id: 'OUT-SECRET-BEARER', pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i },
  { id: 'OUT-SECRET-ASSIGNMENT', pattern: /\b(?:api[_ -]?key|access[_ -]?token|secret|password|credential|token)\s*[:=]\s*[^\s,;]{8,}/i },
  { id: 'OUT-SECRET-SLACK', pattern: /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/i },
];

interface ClaimRule {
  id: string;
  reason: Exclude<GuardrailReason, 'invalid_output' | 'empty_output' | 'output_too_large' | 'secret_leakage' | 'instruction_wrapper_removed'>;
  pattern: RegExp;
}

const CLAIM_RULES: readonly ClaimRule[] = [
  {
    id: 'OUT-CLAIM-GOVERNMENT',
    reason: 'unsupported_government_claim',
    pattern: /\b(?:government|govt|ministry|official|scheme|mission|nsdc|msde|skill\s+india|subsid(?:y|ies)|naps|license|licence|pm\s+[a-z][a-z -]{2,})\b/i,
  },
  {
    id: 'OUT-CLAIM-SALARY',
    reason: 'unsupported_salary_claim',
    pattern: /(?:₹|\b(?:rs\.?|inr|salary|salaries|wage|wages|income|earnings|pay|paid|lpa|lakhs?)\b|\bper\s+(?:month|year|day)\b)/i,
  },
  {
    id: 'OUT-CLAIM-STATISTIC',
    reason: 'unsupported_statistic_claim',
    pattern: /\b\d+(?:[,.]\d+)?\s*%\b|\b\d[\d,]*(?:\.\d+)?\s+(?:jobs?|people|students?|workers?|households?|years?)\b|\b(?:fastest[- ]growing|high\s+demand|strong\s+demand|job\s+security|stable\s+career|employment\s+prospects?|massive\s+employment|growth\s+rate)\b/i,
  },
];

function normalizeModelText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function asTokenList(value: readonly string[] | string | undefined): string[] {
  const values =
    value === undefined
      ? []
      : typeof value === 'string'
        ? [value]
        : Array.isArray(value)
          ? value
          : [];
  return values
    .filter((token): token is string => typeof token === 'string')
    .map((token) => normalizeModelText(token))
    .filter((token) => token.length > 0 && token.length <= 256);
}

function hasSupportingToken(text: string, options: GuardrailOptions): boolean {
  const contextTokens = asTokenList(options.contextTokens);
  const citationTokens = [
    ...asTokenList(options.citations),
    ...asTokenList(options.citationTokens),
  ];
  const lowerText = text.toLocaleLowerCase();

  // A context token means the caller supplied grounded evidence. A citation
  // token is useful even when the provider emits it directly in the answer.
  return (
    contextTokens.some((token) => lowerText.includes(token.toLocaleLowerCase())) ||
    citationTokens.some((token) => lowerText.includes(token.toLocaleLowerCase())) ||
    contextTokens.length > 0
  );
}

function removeInstructionWrappers(value: string): { text: string; removed: number } {
  let removed = 0;
  let text = value;

  const wrapperPatterns: readonly RegExp[] = [
    /<\/?(?:system|developer|assistant|user|instructions?|prompt)(?:\s[^>]*)?>/gi,
    /^\s*(?:system|developer|assistant|user)\s*(?:prompt|message)?\s*:\s*/gim,
    /^\s*(?:begin|end)\s+(?:system|developer|assistant|user|hidden)\s+(?:message|prompt|instructions?)\s*$/gim,
    /\[\s*(?:system|developer|assistant|user|instructions?|prompt)\s*\]/gi,
  ];

  for (const pattern of wrapperPatterns) {
    text = text.replace(pattern, () => {
      removed += 1;
      return '';
    });
  }

  return { text: normalizeModelText(text), removed };
}

function fallbackText(options: GuardrailOptions): string {
  const candidate = options.fallbackText;
  if (typeof candidate !== 'string') return DEFAULT_FALLBACK_TEXT;
  const normalized = normalizeModelText(candidate);
  return normalized.length > 0 && normalized.length <= DEFAULT_MAX_OUTPUT_CHARACTERS
    ? normalized
    : DEFAULT_FALLBACK_TEXT;
}

function baseResult(
  text: string,
  decision: GuardrailDecision,
  reasons: GuardrailReason[],
  matchedRuleIds: string[],
  fallbackUsed: boolean,
  removedInstructionWrappers: number,
  supportingTokenPresent: boolean,
): ModelOutputGuardrailResult {
  const safe = decision !== 'fallback';
  return {
    safe,
    valid: safe,
    decision,
    text,
    output: text,
    normalizedText: text,
    fallbackUsed,
    reasons,
    matchedRuleIds,
    removedInstructionWrappers,
    supportingTokenPresent,
  };
}

function inspectNormalizedOutput(
  value: unknown,
  options: GuardrailOptions,
): {
  normalizedText: string;
  reasons: GuardrailReason[];
  matchedRuleIds: string[];
  removedInstructionWrappers: number;
  supportingTokenPresent: boolean;
} {
  if (typeof value !== 'string') {
    return {
      normalizedText: '',
      reasons: ['invalid_output'],
      matchedRuleIds: ['OUT-INPUT-INVALID'],
      removedInstructionWrappers: 0,
      supportingTokenPresent: false,
    };
  }

  const normalized = removeInstructionWrappers(value);
  const reasons: GuardrailReason[] = [];
  const matchedRuleIds: string[] = [];

  if (normalized.removed > 0) reasons.push('instruction_wrapper_removed');
  if (normalized.text.length === 0) reasons.push('empty_output');

  const maxCharacters =
    typeof options.maxCharacters === 'number' && Number.isFinite(options.maxCharacters) && options.maxCharacters > 0
      ? Math.floor(options.maxCharacters)
      : DEFAULT_MAX_OUTPUT_CHARACTERS;
  if (normalized.text.length > maxCharacters) {
    reasons.push('output_too_large');
    matchedRuleIds.push('OUT-LENGTH-001');
  }

  for (const rule of SECRET_RULES) {
    if (rule.pattern.test(normalized.text)) matchedRuleIds.push(rule.id);
  }
  if (SECRET_RULES.some((rule) => rule.pattern.test(normalized.text))) reasons.push('secret_leakage');

  const supportingTokenPresent = hasSupportingToken(normalized.text, options);
  if (!supportingTokenPresent) {
    for (const rule of CLAIM_RULES) {
      if (rule.pattern.test(normalized.text)) {
        reasons.push(rule.reason);
        matchedRuleIds.push(rule.id);
      }
    }
  }

  return {
    normalizedText: normalized.text,
    reasons: Array.from(new Set(reasons)),
    matchedRuleIds: Array.from(new Set(matchedRuleIds)),
    removedInstructionWrappers: normalized.removed,
    supportingTokenPresent,
  };
}

/**
 * Validate model output without exposing the raw output in error metadata.
 * Government, salary, and statistical assertions require caller-provided
 * grounding tokens; this function does not claim to fact-check general text.
 */
export function validateModelOutput(
  value: unknown,
  options: GuardrailOptions = {},
): ModelOutputValidationResult {
  const inspected = inspectNormalizedOutput(value, options);
  const rejectingReasons = inspected.reasons.filter((reason) => reason !== 'instruction_wrapper_removed');
  const rejected = rejectingReasons.length > 0;
  const decision: GuardrailDecision = rejected
    ? 'fallback'
    : inspected.removedInstructionWrappers > 0
      ? 'sanitize'
      : 'allow';

  const text = rejected ? fallbackText(options) : inspected.normalizedText;
  return baseResult(
    text,
    decision,
    inspected.reasons,
    inspected.matchedRuleIds,
    rejected,
    inspected.removedInstructionWrappers,
    inspected.supportingTokenPresent,
  );
}

/** Sanitize output and return safe fallback plus decision metadata when needed. */
export function sanitizeModelOutput(
  value: unknown,
  options: GuardrailOptions = {},
): ModelOutputGuardrailResult {
  return validateModelOutput(value, options);
}

export const DEFAULT_MODEL_OUTPUT_FALLBACK = DEFAULT_FALLBACK_TEXT;
