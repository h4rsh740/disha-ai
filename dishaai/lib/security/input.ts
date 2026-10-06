// Credential-free request validation for server-side AI entry points.
// Keep this module independent of Next.js request objects so it can be used
// from route handlers, jobs, and tests without browser APIs or secrets.

export interface AIHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequestBody {
  question: string;
  history: AIHistoryMessage[];
  language?: string;
  careerId?: string;
}

export interface InputValidationLimits {
  maxBodyBytes: number;
  maxTotalCharacters: number;
  maxQuestionCharacters: number;
  maxQuestionBytes: number;
  maxHistoryMessages: number;
  maxHistoryBytes: number;
  maxHistoryMessageCharacters: number;
  maxHistoryMessageBytes: number;
  maxLanguageCharacters: number;
  maxCareerIdCharacters: number;
}

export const DEFAULT_INPUT_LIMITS: Readonly<InputValidationLimits> = {
  maxBodyBytes: 32_768,
  maxTotalCharacters: 16_000,
  maxQuestionCharacters: 2_000,
  maxQuestionBytes: 8_000,
  maxHistoryMessages: 20,
  maxHistoryBytes: 24_000,
  maxHistoryMessageCharacters: 4_000,
  maxHistoryMessageBytes: 12_000,
  maxLanguageCharacters: 64,
  maxCareerIdCharacters: 128,
};

export type InputValidationErrorCode =
  | 'invalid_json'
  | 'invalid_object'
  | 'invalid_type'
  | 'required'
  | 'empty'
  | 'too_large'
  | 'too_many_items'
  | 'unsupported_value'
  | 'unknown_field';

export interface InputValidationError {
  code: InputValidationErrorCode;
  path: string;
  message: string;
  limit?: number;
}

export type ValidationResult<T> =
  | {
      ok: true;
      value: T;
      errors: [];
    }
  | {
      ok: false;
      errors: InputValidationError[];
    };

export interface InputValidationOptions {
  limits?: Partial<InputValidationLimits>;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getLimits(options?: InputValidationOptions): InputValidationLimits {
  const supplied = options?.limits ?? {};
  const limits = { ...DEFAULT_INPUT_LIMITS };

  for (const key of Object.keys(DEFAULT_INPUT_LIMITS) as Array<keyof InputValidationLimits>) {
    const candidate = supplied[key];
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0) {
      limits[key] = Math.floor(candidate);
    }
  }

  return limits;
}

/** Count UTF-8 bytes without relying on Buffer, which keeps this Edge-safe. */
export function utf8ByteLength(value: string): number {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index);
    if (codePoint === undefined) continue;

    if (codePoint <= 0x7f) bytes += 1;
    else if (codePoint <= 0x7ff) bytes += 2;
    else if (codePoint <= 0xffff) bytes += 3;
    else {
      bytes += 4;
      index += 1;
    }
  }

  return bytes;
}

function characterLength(value: string): number {
  return Array.from(value).length;
}

function hasUnsupportedControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if ((code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) || code === 0x7f) {
      return true;
    }
  }

  return false;
}

function normalizeInputString(value: string): string {
  return value.normalize('NFKC').replace(/\r\n?/g, '\n').trim();
}

function success<T>(value: T): ValidationResult<T> {
  return { ok: true, value, errors: [] };
}

function failure<T = never>(...errors: InputValidationError[]): ValidationResult<T> {
  return { ok: false, errors };
}

function error(
  code: InputValidationErrorCode,
  path: string,
  message: string,
  limit?: number,
): InputValidationError {
  return { code, path, message, ...(limit === undefined ? {} : { limit }) };
}

function validateBoundedString(
  value: unknown,
  path: string,
  limits: { maxCharacters: number; maxBytes?: number },
  required: boolean,
): ValidationResult<string> {
  if (typeof value !== 'string') {
    return failure(error('invalid_type', path, 'Expected a string.'));
  }

  const normalized = normalizeInputString(value);
  if (required && normalized.length === 0) {
    return failure(error('required', path, 'A non-empty value is required.'));
  }

  if (!required && normalized.length === 0) {
    return failure(error('empty', path, 'The value must not be empty when provided.'));
  }

  if (hasUnsupportedControlCharacter(normalized)) {
    return failure(error('unsupported_value', path, 'Control characters are not supported.'));
  }

  const characters = characterLength(normalized);
  if (characters > limits.maxCharacters) {
    return failure(
      error(
        'too_large',
        path,
        `The value exceeds the ${limits.maxCharacters}-character limit.`,
        limits.maxCharacters,
      ),
    );
  }

  if (limits.maxBytes !== undefined) {
    const bytes = utf8ByteLength(normalized);
    if (bytes > limits.maxBytes) {
      return failure(
        error('too_large', path, `The value exceeds the ${limits.maxBytes}-byte limit.`, limits.maxBytes),
      );
    }
  }

  return success(normalized);
}

function serializedByteLength(value: unknown): number | 'unsupported' {
  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? 'unsupported' : utf8ByteLength(serialized);
  } catch {
    return 'unsupported';
  }
}

/**
 * Validate a user question before it can become a prompt value.
 * This helper accepts unknown input deliberately so malformed JSON values are
 * converted into safe errors instead of throwing from a route handler.
 */
export function validateQuestion(
  value: unknown,
  options?: InputValidationOptions,
): ValidationResult<string> {
  const limits = getLimits(options);
  return validateBoundedString(
    value,
    'question',
    { maxCharacters: limits.maxQuestionCharacters, maxBytes: limits.maxQuestionBytes },
    true,
  );
}

/**
 * Validate bounded conversation history. An omitted history is treated as an
 * empty history by design; null and other explicit unsupported values fail.
 */
export function validateHistory(
  value: unknown = [],
  options?: InputValidationOptions,
): ValidationResult<AIHistoryMessage[]> {
  const limits = getLimits(options);

  if (value === undefined) return success([]);
  if (!Array.isArray(value)) {
    return failure(error('invalid_type', 'history', 'History must be an array.'));
  }

  if (value.length > limits.maxHistoryMessages) {
    return failure(
      error(
        'too_many_items',
        'history',
        `History may contain at most ${limits.maxHistoryMessages} messages.`,
        limits.maxHistoryMessages,
      ),
    );
  }

  const messages: AIHistoryMessage[] = [];
  const errors: InputValidationError[] = [];
  let historyBytes = 0;

  value.forEach((candidate, index) => {
    const path = `history[${index}]`;
    if (!isRecord(candidate)) {
      errors.push(error('invalid_object', path, 'Each history item must be an object.'));
      return;
    }

    const keys = Object.keys(candidate);
    for (const key of keys) {
      if (key !== 'role' && key !== 'content') {
        errors.push(error('unknown_field', `${path}.${key}`, 'This history field is not supported.'));
      }
    }

    const role = candidate.role;
    if (role !== 'user' && role !== 'assistant') {
      errors.push(error('unsupported_value', `${path}.role`, 'Role must be user or assistant.'));
    }

    const contentResult = validateBoundedString(
      candidate.content,
      `${path}.content`,
      {
        maxCharacters: limits.maxHistoryMessageCharacters,
        maxBytes: limits.maxHistoryMessageBytes,
      },
      true,
    );

    if (!contentResult.ok) {
      errors.push(...contentResult.errors);
      return;
    }

    if (role !== 'user' && role !== 'assistant') return;

    const contentBytes = utf8ByteLength(contentResult.value);
    historyBytes += contentBytes;
    messages.push({ role, content: contentResult.value });
  });

  if (historyBytes > limits.maxHistoryBytes) {
    errors.push(
      error(
        'too_large',
        'history',
        'The combined history exceeds the supported byte budget.',
        limits.maxHistoryBytes,
      ),
    );
  }

  return errors.length > 0 ? failure(...errors) : success(messages);
}

function parseBody(value: unknown, maxBodyBytes: number):
  | { ok: true; value: UnknownRecord; serializedBytes: number }
  | { ok: false; errors: InputValidationError[] } {
  if (typeof value === 'string') {
    const serializedBytes = utf8ByteLength(value);
    if (serializedBytes > maxBodyBytes) {
      return {
        ok: false,
        errors: [error('too_large', 'body', `The request body exceeds the ${maxBodyBytes}-byte limit.`, maxBodyBytes)],
      };
    }
    try {
      const parsed: unknown = JSON.parse(value);
      if (!isRecord(parsed)) {
        return { ok: false, errors: [error('invalid_object', 'body', 'The JSON body must be an object.')] };
      }
      return { ok: true, value: parsed, serializedBytes };
    } catch {
      return { ok: false, errors: [error('invalid_json', 'body', 'The request body is not valid JSON.')] };
    }
  }

  if (!isRecord(value)) {
    return { ok: false, errors: [error('invalid_object', 'body', 'The request body must be an object.')] };
  }

  const serializedBytes = serializedByteLength(value);
  if (serializedBytes === 'unsupported') {
    return {
      ok: false,
      errors: [error('unsupported_value', 'body', 'The body contains a value that cannot be processed safely.')],
    };
  }

  return { ok: true, value, serializedBytes };
}

/**
 * Validate an AI request body from either a parsed value or a raw JSON string.
 * No branch intentionally lets JSON.parse, stringify, or malformed fields
 * escape as an exception.
 */
export function validateAIRequestBody(
  value: unknown,
  options?: InputValidationOptions,
): ValidationResult<AIRequestBody> {
  const limits = getLimits(options);
  const parsed = parseBody(value, limits.maxBodyBytes);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  if (parsed.serializedBytes > limits.maxBodyBytes) {
    return failure(
      error('too_large', 'body', `The request body exceeds the ${limits.maxBodyBytes}-byte limit.`, limits.maxBodyBytes),
    );
  }

  const allowedFields = new Set(['question', 'history', 'language', 'languagePreference', 'careerId']);
  const errors: InputValidationError[] = [];
  for (const key of Object.keys(parsed.value)) {
    if (!allowedFields.has(key)) {
      errors.push(error('unknown_field', `body.${key}`, 'This request field is not supported.'));
    }
  }
  if (errors.length > 0) return failure(...errors);

  const questionResult = validateQuestion(parsed.value.question, options);
  if (!questionResult.ok) errors.push(...questionResult.errors);

  const historyResult = validateHistory(parsed.value.history, options);
  if (!historyResult.ok) errors.push(...historyResult.errors);

  const hasLanguage = 'language' in parsed.value;
  const hasLanguagePreference = 'languagePreference' in parsed.value;
  if (hasLanguagePreference && !hasLanguage && parsed.value.languagePreference === null) {
    errors.push(error('invalid_type', 'languagePreference', 'Language preference must be a string when provided.'));
  }

  const languageValue = hasLanguage && parsed.value.language !== undefined
    ? parsed.value.language
    : parsed.value.languagePreference;
  let language: string | undefined;
  if (languageValue !== undefined) {
    const languageResult = validateBoundedString(
      languageValue,
      'language',
      { maxCharacters: limits.maxLanguageCharacters },
      false,
    );
    if (!languageResult.ok) errors.push(...languageResult.errors);
    else language = languageResult.value;
  }

  let careerId: string | undefined;
  if (parsed.value.careerId !== undefined) {
    const careerIdResult = validateBoundedString(
      parsed.value.careerId,
      'careerId',
      { maxCharacters: limits.maxCareerIdCharacters },
      false,
    );
    if (!careerIdResult.ok) errors.push(...careerIdResult.errors);
    else careerId = careerIdResult.value;
  }

  if (hasLanguage && hasLanguagePreference) {
    const directLanguage = parsed.value.language;
    const preferenceLanguage = parsed.value.languagePreference;
    if (typeof directLanguage === 'string' && typeof preferenceLanguage === 'string') {
      if (normalizeInputString(directLanguage) !== normalizeInputString(preferenceLanguage)) {
        errors.push(
          error('unsupported_value', 'language', 'Provide only one consistent language preference.'),
        );
      }
    }
  }

  const question = questionResult.ok ? questionResult.value : undefined;
  const history = historyResult.ok ? historyResult.value : undefined;
  const totalCharacters = [question, language, careerId, ...(history ?? []).map((message) => message.content)]
    .filter((item): item is string => typeof item === 'string')
    .reduce((total, item) => total + characterLength(item), 0);

  if (totalCharacters > limits.maxTotalCharacters) {
    errors.push(
      error(
        'too_large',
        'body',
        `The combined text exceeds the ${limits.maxTotalCharacters}-character limit.`,
        limits.maxTotalCharacters,
      ),
    );
  }

  if (errors.length > 0 || question === undefined || history === undefined) {
    return failure(...errors);
  }

  return success({
    question,
    history,
    ...(language === undefined ? {} : { language }),
    ...(careerId === undefined ? {} : { careerId }),
  });
}
