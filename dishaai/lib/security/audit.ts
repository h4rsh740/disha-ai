import type { PromptInjectionRiskLevel } from './prompt-injection';

export interface SecurityAuditEvent {
  action: string;
  decision: 'allow' | 'block' | 'fallback';
  riskLevel: PromptInjectionRiskLevel;
  matchedRuleIds?: readonly string[];
  blockedFields?: readonly string[];
  acceptedSourceIds?: readonly string[];
}

/**
 * Redacted local audit hook. It accepts controlled metadata only; callers must
 * never pass questions, prompts, tokens, or names. A database sink can replace
 * this function when audit_events is connected.
 */
export function logSecurityEvent(event: SecurityAuditEvent): void {
  const safeEvent = {
    action: event.action,
    decision: event.decision,
    riskLevel: event.riskLevel,
    matchedRuleIds: [...new Set(event.matchedRuleIds ?? [])].slice(0, 20),
    blockedFields: [...new Set(event.blockedFields ?? [])].slice(0, 20),
    acceptedSourceIds: [...new Set(event.acceptedSourceIds ?? [])].slice(0, 20),
    timestamp: new Date().toISOString(),
  };

  const method = event.decision === 'block' || event.decision === 'fallback' ? console.warn : console.info;
  method('[DishaAI/Security]', JSON.stringify(safeEvent));
}
