// Lightweight, explainable prompt-injection screening.
// This is a defense-in-depth signal, not a claim of complete attack
// detection. Callers must still keep untrusted data in explicit delimiters.

export type PromptInjectionRiskLevel = 'low' | 'medium' | 'high';

export type PromptInjectionCategory =
  | 'instruction_override'
  | 'secret_exfiltration'
  | 'tool_manipulation'
  | 'role_confusion'
  | 'invalid_input';

export interface PromptInjectionFinding {
  ruleId: string;
  category: PromptInjectionCategory;
  severity: Exclude<PromptInjectionRiskLevel, 'low'>;
}

export interface PromptInjectionInspection {
  riskLevel: PromptInjectionRiskLevel;
  matchedRuleIds: string[];
  findings: PromptInjectionFinding[];
  normalizedText: string;
  inspected: boolean;
  limitation: string;
}

export interface PromptInjectionPolicyOptions {
  /** Defaults to high: medium signals are retained as delimited data. */
  blockAtRisk?: Exclude<PromptInjectionRiskLevel, 'low'>;
}

export interface PromptInjectionPolicyDecision extends PromptInjectionInspection {
  decision: 'allow' | 'block';
  allowed: boolean;
  protectedText: string;
  reason: 'no_signal' | 'delimited_untrusted_data' | 'high_risk_input';
}

interface DetectionRule {
  id: string;
  category: PromptInjectionCategory;
  severity: Exclude<PromptInjectionRiskLevel, 'low'>;
  pattern: RegExp;
}

const DETECTION_RULES: readonly DetectionRule[] = [
  {
    id: 'PI-OVERRIDE-01',
    category: 'instruction_override',
    severity: 'high',
    pattern: /\b(?:ignore|disregard|forget|bypass|override)\b.{0,100}\b(?:previous|prior|above|earlier|system|developer|all)\b.{0,50}\b(?:instruction|rule|prompt|message)s?\b/i,
  },
  {
    id: 'PI-OVERRIDE-02',
    category: 'instruction_override',
    severity: 'high',
    pattern: /\b(?:new|updated|replacement|real)\s+(?:system\s+)?instructions?\b|\bfrom\s+now\s+on\b.{0,80}\b(?:follow|obey|do)\b/i,
  },
  {
    id: 'PI-OVERRIDE-03',
    category: 'instruction_override',
    severity: 'medium',
    pattern: /\b(?:do\s+not|don't|never)\s+(?:follow|obey|use)\b.{0,80}\b(?:policy|rules?|instructions?|context)\b/i,
  },
  {
    id: 'PI-EXFIL-01',
    category: 'secret_exfiltration',
    severity: 'high',
    pattern: /\b(?:reveal|show|print|dump|repeat|output|quote|provide|give|leak|exfiltrate)\b.{0,80}\b(?:system|developer|hidden|internal)\s+(?:prompt|instructions?|message)\b/i,
  },
  {
    id: 'PI-EXFIL-02',
    category: 'secret_exfiltration',
    severity: 'high',
    pattern: /\b(?:reveal|show|print|dump|send|share|exfiltrate|leak|provide|give)\b.{0,80}\b(?:api\s*keys?|access\s+tokens?|credentials?|passwords?|secrets?|environment\s+variables?)\b|\b(?:api\s*keys?|access\s+tokens?|credentials?|passwords?|secrets?)\b.{0,80}\b(?:reveal|show|print|send|share|exfiltrate|leak)\b/i,
  },
  {
    id: 'PI-EXFIL-03',
    category: 'secret_exfiltration',
    severity: 'medium',
    pattern: /\b(?:encode|base64|hex|obfuscate)\b.{0,70}\b(?:prompt|secret|token|key|credential|instructions?)\b/i,
  },
  {
    id: 'PI-TOOL-01',
    category: 'tool_manipulation',
    severity: 'high',
    pattern: /\b(?:call|invoke|use|execute|run|trigger)\b.{0,60}\b(?:tool|function|command|shell|terminal|browser|api|plugin)\b/i,
  },
  {
    id: 'PI-TOOL-02',
    category: 'tool_manipulation',
    severity: 'high',
    pattern: /(?:\bcurl\b|\bwget\b|\brm\s+-rf\b|\bsudo\b|\bpowerShell\b|\bfetch\s*\(|\bexec(?:ute)?\s*\()/i,
  },
  {
    id: 'PI-TOOL-03',
    category: 'tool_manipulation',
    severity: 'medium',
    pattern: /\b(?:do\s+not|don't)\s+(?:ask|request|wait)\b.{0,60}\b(?:permission|confirmation|approval)\b/i,
  },
  {
    id: 'PI-ROLE-01',
    category: 'role_confusion',
    severity: 'high',
    pattern: /\b(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be|role[- ]?play\s+as|switch\s+to)\b.{0,70}\b(?:system|developer|admin|administrator|root|unrestricted|jailbreak|assistant)\b/i,
  },
  {
    id: 'PI-ROLE-02',
    category: 'role_confusion',
    severity: 'medium',
    pattern: /\b(?:system|developer|admin|administrator)\s+(?:message|role|prompt)\s*[:=]/i,
  },
  {
    id: 'PI-DELIM-01',
    category: 'role_confusion',
    severity: 'medium',
    pattern: /\b(?:begin|end)\s+(?:system|developer|assistant|user|hidden)\s+(?:message|prompt|instructions?)\b/i,
  },
];

const RISK_ORDER: Record<PromptInjectionRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export const PROMPT_INJECTION_LIMITATION =
  'Heuristics cover common override, exfiltration, tool, and role-confusion patterns; they do not detect every attack or obfuscation.';

function normalizeForInspection(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function severityForFindings(findings: readonly PromptInjectionFinding[]): PromptInjectionRiskLevel {
  let risk: PromptInjectionRiskLevel = 'low';
  for (const finding of findings) {
    if (RISK_ORDER[finding.severity] > RISK_ORDER[risk]) risk = finding.severity;
  }
  return risk;
}

/**
 * Inspect text without returning matched snippets. Avoiding snippets keeps
 * logs and audit records from accidentally retaining sensitive user content.
 */
export function inspectUntrustedText(value: unknown): PromptInjectionInspection {
  if (typeof value !== 'string') {
    const finding: PromptInjectionFinding = {
      ruleId: 'PI-INPUT-01',
      category: 'invalid_input',
      severity: 'high',
    };
    return {
      riskLevel: 'high',
      matchedRuleIds: [finding.ruleId],
      findings: [finding],
      normalizedText: '',
      inspected: false,
      limitation: PROMPT_INJECTION_LIMITATION,
    };
  }

  const normalizedText = normalizeForInspection(value);
  const findings: PromptInjectionFinding[] = [];

  for (const rule of DETECTION_RULES) {
    if (rule.pattern.test(normalizedText)) {
      findings.push({ ruleId: rule.id, category: rule.category, severity: rule.severity });
    }
  }

  return {
    riskLevel: severityForFindings(findings),
    matchedRuleIds: findings.map((finding) => finding.ruleId),
    findings,
    normalizedText,
    inspected: true,
    limitation: PROMPT_INJECTION_LIMITATION,
  };
}

function escapeDelimiterText(value: string): string {
  return value.replace(
    /\[\/END_UNTRUSTED(?:_DATA|_KNOWLEDGE_DATA)\]/gi,
    '[ESCAPED_END_UNTRUSTED_DATA]',
  );
}

/** Wrap data so a downstream model can distinguish it from trusted policy. */
export function delimitUntrustedText(value: string): string {
  const normalized = normalizeForInspection(value);
  return `[BEGIN_UNTRUSTED_DATA]\n${escapeDelimiterText(normalized)}\n[/END_UNTRUSTED_DATA]`;
}

/**
 * Apply the default policy: block high-risk text, while preserving low and
 * medium signals as explicitly delimited data for a grounded model call.
 */
export function enforcePromptInjectionPolicy(
  value: unknown,
  options: PromptInjectionPolicyOptions = {},
): PromptInjectionPolicyDecision {
  const inspection = inspectUntrustedText(value);
  const blockAtRisk = options.blockAtRisk ?? 'high';
  const blocked = RISK_ORDER[inspection.riskLevel] >= RISK_ORDER[blockAtRisk];

  if (blocked) {
    return {
      ...inspection,
      decision: 'block',
      allowed: false,
      protectedText: '',
      reason: 'high_risk_input',
    };
  }

  return {
    ...inspection,
    decision: 'allow',
    allowed: true,
    protectedText: delimitUntrustedText(inspection.normalizedText),
    reason: inspection.riskLevel === 'low' ? 'no_signal' : 'delimited_untrusted_data',
  };
}

// Descriptive aliases make the policy helper easy to discover without
// creating separate policy implementations.
export const applyPromptInjectionPolicy = enforcePromptInjectionPolicy;
export const enforceUntrustedTextPolicy = enforcePromptInjectionPolicy;
export const enforcePromptInjection = enforcePromptInjectionPolicy;
