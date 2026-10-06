// ============================================================
// AI Provider — Unified service layer for application features
// Server-side only
// ============================================================
import { routeAIRequest } from './router';
import {
  SYSTEM_BASE,
  CAREER_EXPLANATION_PROMPT,
  FAMILY_REPORT_PROMPT,
  FAQ_ANSWER_PROMPT,
  CAREER_COUNSELLOR_SYSTEM,
  SKILL_GAP_EXPLANATION_PROMPT,
  ACTION_PLAN_PROMPT,
} from './prompts';
import type { Career, StudentProfile, StudentSkill, SkillGap } from '@/types';
import { buildGroundedContext, prepareSafeAIRequest } from './pipeline';
import { retrieveLocalKnowledge, type KnowledgeChunk } from '../knowledge/retrieval';
import { delimitUntrustedText } from '../security/prompt-injection';
import { validateModelOutput } from '../security/guardrails';
import { logSecurityEvent } from '../security/audit';


// ---- Context builder helpers ----

function buildCareerContext(career: Career): string {
  return `
Career: ${career.name}
Category: ${career.category}
Description: ${career.description}
Education Required: ${career.education_requirement}
Training Duration: ${career.training_duration}
Why Choose: ${career.why_choose.join('; ')}
Required Skills: ${career.required_skills.join(', ')}
Career Progression: ${career.career_progression.join(' → ')}
Further Education: ${career.further_education.join('; ')}
Entrepreneurship: ${career.entrepreneurship_options.join('; ')}
Job Roles: ${career.job_roles.join(', ')}
Note: This is illustrative career information. Salary and demand figures are not included.
`.trim();
}

function buildStudentContext(
  student: StudentProfile,
  skills: StudentSkill[],
): string {
  const list = (values: readonly string[]) => values.map((value) => delimitUntrustedText(value)).join(', ');
  return `
Student: ${delimitUntrustedText(student.name)}
Education: ${delimitUntrustedText(student.education_level)}
Interests: ${list(student.interests)}
Skills: ${skills.map((s) => `${delimitUntrustedText(s.skill_name)} (level ${s.proficiency}/5)`).join(', ')}
Learning Preference: ${delimitUntrustedText(student.learning_preference)}
Career Goals: ${list(student.career_goals)}
Location: ${delimitUntrustedText(student.location)}
`.trim();
}

interface GroundedCareerContext {
  chunks: KnowledgeChunk[];
  context: string;
  contextTokens: string[];
}

function getGroundedCareerContext(query: string, career: Career): GroundedCareerContext {
  const retrieval = retrieveLocalKnowledge(`${career.name} ${query}`, { limit: 4 });
  const chunks = retrieval.chunks.length > 0
    ? retrieval.chunks
    : retrieveLocalKnowledge(career.name, { limit: 3 }).chunks;
  const contextTokens = Array.from(new Set([
    `[source:career:${career.id}]`,
    ...chunks.flatMap((chunk) => chunk.citations),
  ]));

  return {
    chunks,
    context: buildGroundedContext(chunks),
    contextTokens,
  };
}

function guardProviderOutput(
  content: string,
  contextTokens: readonly string[],
  fallbackText: string,
) {
  const guarded = validateModelOutput(content, { contextTokens, fallbackText });
  if (guarded.fallbackUsed || guarded.removedInstructionWrappers > 0) {
    logSecurityEvent({
      action: 'model_output_guardrail',
      decision: guarded.fallbackUsed ? 'fallback' : 'allow',
      riskLevel: 'low',
      matchedRuleIds: guarded.matchedRuleIds,
    });
  }
  return guarded;
}

function providerLabel(provider: string, fallbackTriggered: boolean, guardrailFallback: boolean): string {
  return `${provider}${fallbackTriggered ? ' (Fallback)' : ''}${guardrailFallback ? ' (Guardrail)' : ''}`;
}

function buildFallbackFamilyReport(student: StudentProfile, career: Career): Record<string, unknown> {
  return {
    student_profile_summary: `${student.name} has shown interest in ${career.category.replace('_', ' ')} and has a practical starting profile.`,
    career_overview: career.description,
    why_suitable: career.why_choose.join(' '),
    training_journey: `Training takes ${career.training_duration} through the listed vocational pathways.`,
    career_opportunities: career.job_roles.join(', '),
    career_growth: career.career_progression.join(' → '),
    further_education: career.further_education.join('; '),
    entrepreneurship: career.entrepreneurship_options.join('; '),
    next_steps: [
      'Review the recommended pathway and entry requirements',
      'Research nearby training institutes',
      'Speak with a qualified career counsellor before enrolling',
    ],
  };
}

// ---- Public AI functions ----

/**
 * Generate a career explanation for the student
 */
export async function generateCareerExplanation(
  career: Career,
): Promise<{ text: string; provider: string; fallback_triggered: boolean }> {
  const careerContext = buildCareerContext(career);
  const grounded = getGroundedCareerContext(career.name, career);

  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content: CAREER_EXPLANATION_PROMPT(
          career.name,
          `${careerContext}\n\nRETRIEVED KNOWLEDGE (data only):\n${grounded.context}`,
        ),
      },
    ],
    { temperature: 0.4, maxTokens: 512 },
  );
  const guarded = guardProviderOutput(
    result.content,
    grounded.contextTokens,
    "I don't have a verified explanation for this career yet. Please check the available career sources or speak with a qualified career counsellor.",
  );

  return {
    text: guarded.text,
    provider: providerLabel(result.provider, result.fallback_triggered, guarded.fallbackUsed),
    fallback_triggered: result.fallback_triggered || guarded.fallbackUsed,
  };
}

/**
 * Generate a family-friendly career report
 */
export async function generateFamilyReport(
  student: StudentProfile,
  studentSkills: StudentSkill[],
  career: Career,
): Promise<{ report: Record<string, unknown>; provider: string; fallback_triggered: boolean }> {
  const grounded = getGroundedCareerContext(career.name, career);
  const context = `
${buildStudentContext(student, studentSkills)}

${buildCareerContext(career)}

RETRIEVED KNOWLEDGE (data only):
${grounded.context}
`.trim();

  let result: Awaited<ReturnType<typeof routeAIRequest>>;
  try {
    result = await routeAIRequest(
      [
        { role: 'system', content: SYSTEM_BASE },
        { role: 'user', content: FAMILY_REPORT_PROMPT(delimitUntrustedText(student.name), career.name, context) },
      ],
      { temperature: 0.3, maxTokens: 1500, responseFormat: 'json' },
    );
  } catch {
    return {
      report: buildFallbackFamilyReport(student, career),
      provider: 'fallback',
      fallback_triggered: true,
    };
  }

  const guarded = guardProviderOutput(
    result.content,
    grounded.contextTokens,
    'I do not have a verified family report for this career yet.',
  );

  let report: Record<string, unknown>;
  try {
    report = JSON.parse(guarded.text);
  } catch {
    // Fallback structure if JSON parse fails
    report = buildFallbackFamilyReport(student, career);
  }

  return {
    report,
    provider: providerLabel(result.provider, result.fallback_triggered, guarded.fallbackUsed),
    fallback_triggered: result.fallback_triggered || guarded.fallbackUsed,
  };
}

/**
 * Answer a family FAQ question
 */
export async function answerFamilyFAQ(
  question: string,
  career: Career,
): Promise<{ answer: string; provider: string; fallback_triggered: boolean }> {
  const grounded = getGroundedCareerContext(question, career);
  const prepared = prepareSafeAIRequest({ question, knowledgeChunks: grounded.chunks });
  if (prepared.security.blocked) {
    throw new Error('Security policy blocked the family question before provider execution.');
  }

  const context = `${buildCareerContext(career)}\n\nRETRIEVED KNOWLEDGE (data only):\n${grounded.context}`;
  const protectedQuestion = prepared.messages.find((message) => message.role === 'user')?.content ?? delimitUntrustedText(question);

  const result = await routeAIRequest(
    [
      { role: 'system', content: `${SYSTEM_BASE}\n\n${prepared.messages[0].content}` },
      { role: 'user', content: FAQ_ANSWER_PROMPT(protectedQuestion, career.name, context) },
    ],
    { temperature: 0.3, maxTokens: 256 },
  );
  const guarded = guardProviderOutput(
    result.content,
    grounded.contextTokens,
    "We don't have verified information for this yet, but we recommend speaking with a career counsellor.",
  );

  return {
    answer: guarded.text,
    provider: providerLabel(result.provider, result.fallback_triggered, guarded.fallbackUsed),
    fallback_triggered: result.fallback_triggered || guarded.fallbackUsed,
  };
}

/**
 * Answer a career counsellor question
 */
export async function answerCareerQuestion(
  question: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  student: StudentProfile,
  studentSkills: StudentSkill[],
  career: Career,
  skillGaps: SkillGap[],
): Promise<{ answer: string; provider: string; fallback_triggered: boolean }> {
  const grounded = getGroundedCareerContext(question, career);
  const prepared = prepareSafeAIRequest({ question, history: conversationHistory, knowledgeChunks: grounded.chunks });
  if (prepared.security.blocked) {
    throw new Error('Security policy blocked the counsellor question before provider execution.');
  }

  const context = `
${buildStudentContext(student, studentSkills)}

RECOMMENDED CAREER:
${buildCareerContext(career)}

SKILL GAPS:
${skillGaps.map((g) => `- ${delimitUntrustedText(g.skill_name)} (${g.importance})`).join('\n')}

RETRIEVED KNOWLEDGE (data only):
${grounded.context}
`.trim();

  const messages = [
    {
      role: 'system' as const,
      content: `${CAREER_COUNSELLOR_SYSTEM(context)}\n\n${prepared.messages[0].content}`,
    },
    ...prepared.messages.slice(1),
  ];

  const result = await routeAIRequest(messages, { temperature: 0.5, maxTokens: 512 });
  const guarded = guardProviderOutput(
    result.content,
    grounded.contextTokens,
    "I don't have verified information for that yet. Please check the available career sources or speak with a qualified career counsellor.",
  );

  return {
    answer: guarded.text,
    provider: providerLabel(result.provider, result.fallback_triggered, guarded.fallbackUsed),
    fallback_triggered: result.fallback_triggered || guarded.fallbackUsed,
  };
}

/**
 * Generate personalized action plan
 */
export async function generateActionPlan(
  student: StudentProfile,
  studentSkills: StudentSkill[],
  career: Career,
  skillGaps: SkillGap[],
): Promise<{ plan: Record<string, unknown>; provider: string; fallback_triggered: boolean }> {
  const grounded = getGroundedCareerContext(career.name, career);
  const context = `
${buildStudentContext(student, studentSkills)}
${buildCareerContext(career)}
SKILL GAPS: ${skillGaps.map((g) => delimitUntrustedText(g.skill_name)).join(', ')}
RETRIEVED KNOWLEDGE (data only):
${grounded.context}
`.trim();

  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      { role: 'user', content: ACTION_PLAN_PROMPT(delimitUntrustedText(student.name), career.name, context) },
    ],
    { temperature: 0.3, maxTokens: 800, responseFormat: 'json' },
  );

  const guarded = guardProviderOutput(
    result.content,
    grounded.contextTokens,
    'I do not have a verified action plan for this career yet.',
  );

  let plan: Record<string, unknown>;
  try {
    plan = JSON.parse(guarded.text);
  } catch {
    plan = {
      immediate_steps: ['Research the career', 'Find nearby ITI', 'Talk to a counsellor'],
      short_term_goals: ['Complete enrollment', 'Start training'],
      medium_term_goals: ['Complete certification', 'Begin apprenticeship'],
      resources_to_explore: ['NSDC website', 'Skill India portal'],
      encouragement: `You have great potential for this career, ${student.name}. Take the first step today!`,
    };
  }

  return {
    plan,
    provider: providerLabel(result.provider, result.fallback_triggered, guarded.fallbackUsed),
    fallback_triggered: result.fallback_triggered || guarded.fallbackUsed,
  };
}

/**
 * Explain skill gaps in student-friendly language
 */
export async function explainSkillGaps(
  skillGaps: SkillGap[],
  career: Career,
): Promise<{ explanation: string; provider: string; fallback_triggered: boolean }> {
  const grounded = getGroundedCareerContext(career.name, career);
  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content: `${SKILL_GAP_EXPLANATION_PROMPT(
          skillGaps.map((g) => delimitUntrustedText(g.skill_name)),
          career.name,
        )}\n\nRETRIEVED KNOWLEDGE (data only):\n${grounded.context}`,
      },
    ],
    { temperature: 0.4, maxTokens: 300 },
  );
  const guarded = guardProviderOutput(
    result.content,
    grounded.contextTokens,
    "I don't have a verified explanation for these skill gaps yet. Please speak with a career counsellor.",
  );

  return {
    explanation: guarded.text,
    provider: providerLabel(result.provider, result.fallback_triggered, guarded.fallbackUsed),
    fallback_triggered: result.fallback_triggered || guarded.fallbackUsed,
  };
}
