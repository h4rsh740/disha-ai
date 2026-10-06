import {
  DEFAULT_INPUT_LIMITS,
  validateAIRequestBody,
  utf8ByteLength,
  type AIRequestBody,
  type InputValidationError,
  type ValidationResult,
} from './input';

type JsonRecord = Record<string, unknown>;

export type JsonRequestResult =
  | { ok: true; value: JsonRecord }
  | { ok: false; errors: InputValidationError[] };

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function error(code: InputValidationError['code'], path: string, message: string, limit?: number): InputValidationError {
  return { code, path, message, ...(limit === undefined ? {} : { limit }) };
}

/**
 * Read JSON once, enforce the request-size budget, and turn malformed input
 * into a structured error instead of leaking a parser exception from a route.
 */
export async function readJsonRequest(
  request: Request,
  maxBodyBytes = DEFAULT_INPUT_LIMITS.maxBodyBytes,
): Promise<JsonRequestResult> {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return {
      ok: false,
      errors: [error('invalid_json', 'body', 'The request body could not be read safely.')],
    };
  }

  if (utf8ByteLength(raw) > maxBodyBytes) {
    return {
      ok: false,
      errors: [error('too_large', 'body', `The request body exceeds the ${maxBodyBytes}-byte limit.`, maxBodyBytes)],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      errors: [error('invalid_json', 'body', 'The request body is not valid JSON.')],
    };
  }

  if (!isRecord(parsed)) {
    return {
      ok: false,
      errors: [error('invalid_object', 'body', 'The JSON body must be an object.')],
    };
  }

  return { ok: true, value: parsed };
}

/**
 * Validate only the common AI fields from a larger route payload. Routes may
 * carry a bounded profile alongside these fields, so the common validator is
 * intentionally applied to a narrow projection rather than the whole body.
 */
export function validateAIFields(body: JsonRecord): ValidationResult<AIRequestBody> {
  const candidate: Record<string, unknown> = {
    question: body.question,
    history: body.history,
  };

  if ('language' in body) candidate.language = body.language;
  else if ('languagePreference' in body) candidate.languagePreference = body.languagePreference;
  if ('careerId' in body) candidate.careerId = body.careerId;

  return validateAIRequestBody(candidate);
}

export function validationDetails(errors: readonly InputValidationError[]) {
  return errors.map(({ path, code, message, limit }) => ({
    path,
    code,
    message,
    ...(limit === undefined ? {} : { limit }),
  }));
}

/** Keep client-supplied display/profile values bounded before they enter a prompt. */
export function boundedText(value: unknown, maxCharacters: number, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.normalize('NFKC').replace(/[\r\n]+/g, ' ').trim().slice(0, maxCharacters);
}

export function boundedStringList(value: unknown, maxItems: number, maxCharacters: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item) => boundedText(item, maxCharacters))
    .filter(Boolean);
}

export function boundedEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const normalized = boundedText(value, 80);
  return allowed.includes(normalized as T) ? normalized as T : fallback;
}

export function boundedEnumList<T extends string>(
  value: unknown,
  allowed: readonly T[],
  maxItems: number,
  maxCharacters: number,
): T[] {
  const allowedSet = new Set(allowed);
  return boundedStringList(value, maxItems, maxCharacters)
    .filter((item): item is T => allowedSet.has(item as T));
}
