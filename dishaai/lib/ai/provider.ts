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
  return `
Student: ${student.name}
Education: ${student.education_level}
Interests: ${student.interests.join(', ')}
Skills: ${skills.map((s) => `${s.skill_name} (level ${s.proficiency}/5)`).join(', ')}
Learning Preference: ${student.learning_preference}
Career Goals: ${student.career_goals.join(', ')}
Location: ${student.location}
`.trim();
}

// ---- Public AI functions ----

/**
 * Generate a career explanation for the student
 */
export async function generateCareerExplanation(
  career: Career,
): Promise<{ text: string; provider: string; fallback_triggered: boolean }> {
  const careerContext = buildCareerContext(career);

  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      { role: 'user', content: CAREER_EXPLANATION_PROMPT(career.name, careerContext) },
    ],
    { temperature: 0.4, maxTokens: 512 },
  );

  return {
    text: result.content,
    provider: `${result.provider}${result.fallback_triggered ? ' (Fallback)' : ''}`,
    fallback_triggered: result.fallback_triggered,
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
  const context = `
${buildStudentContext(student, studentSkills)}

${buildCareerContext(career)}
`.trim();

  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      { role: 'user', content: FAMILY_REPORT_PROMPT(student.name, career.name, context) },
    ],
    { temperature: 0.3, maxTokens: 1500, responseFormat: 'json' },
  );

  let report: Record<string, unknown>;
  try {
    report = JSON.parse(result.content);
  } catch {
    // Fallback structure if JSON parse fails
    report = {
      student_profile_summary: `${student.name} has shown strong interest in ${career.category.replace('_', ' ')} and has practical learning preferences.`,
      career_overview: career.description,
      why_suitable: career.why_choose.join(' '),
      training_journey: `Training takes ${career.training_duration} through ITI or certification programs.`,
      career_opportunities: career.job_roles.join(', '),
      career_growth: career.career_progression.join(' → '),
      further_education: career.further_education.join('; '),
      entrepreneurship: career.entrepreneurship_options.join('; '),
      next_steps: [
        'Research nearby ITI / training institutes',
        'Complete the skills assessment',
        'Contact a career counsellor for guidance',
      ],
    };
  }

  return {
    report,
    provider: `${result.provider}${result.fallback_triggered ? ' (Fallback)' : ''}`,
    fallback_triggered: result.fallback_triggered,
  };
}

/**
 * Answer a family FAQ question
 */
export async function answerFamilyFAQ(
  question: string,
  career: Career,
): Promise<{ answer: string; provider: string; fallback_triggered: boolean }> {
  const context = buildCareerContext(career);

  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      { role: 'user', content: FAQ_ANSWER_PROMPT(question, career.name, context) },
    ],
    { temperature: 0.3, maxTokens: 256 },
  );

  return {
    answer: result.content,
    provider: `${result.provider}${result.fallback_triggered ? ' (Fallback)' : ''}`,
    fallback_triggered: result.fallback_triggered,
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
  const context = `
${buildStudentContext(student, studentSkills)}

RECOMMENDED CAREER:
${buildCareerContext(career)}

SKILL GAPS:
${skillGaps.map((g) => `- ${g.skill_name} (${g.importance})`).join('\n')}
`.trim();

  const messages = [
    { role: 'system' as const, content: CAREER_COUNSELLOR_SYSTEM(context) },
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: question },
  ];

  const result = await routeAIRequest(messages, { temperature: 0.5, maxTokens: 512 });

  return {
    answer: result.content,
    provider: `${result.provider}${result.fallback_triggered ? ' (Fallback)' : ''}`,
    fallback_triggered: result.fallback_triggered,
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
  const context = `
${buildStudentContext(student, studentSkills)}
${buildCareerContext(career)}
SKILL GAPS: ${skillGaps.map((g) => g.skill_name).join(', ')}
`.trim();

  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      { role: 'user', content: ACTION_PLAN_PROMPT(student.name, career.name, context) },
    ],
    { temperature: 0.3, maxTokens: 800, responseFormat: 'json' },
  );

  let plan: Record<string, unknown>;
  try {
    plan = JSON.parse(result.content);
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
    provider: `${result.provider}${result.fallback_triggered ? ' (Fallback)' : ''}`,
    fallback_triggered: result.fallback_triggered,
  };
}

/**
 * Explain skill gaps in student-friendly language
 */
export async function explainSkillGaps(
  skillGaps: SkillGap[],
  career: Career,
): Promise<{ explanation: string; provider: string; fallback_triggered: boolean }> {
  const result = await routeAIRequest(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content: SKILL_GAP_EXPLANATION_PROMPT(
          skillGaps.map((g) => g.skill_name),
          career.name,
        ),
      },
    ],
    { temperature: 0.4, maxTokens: 300 },
  );

  return {
    explanation: result.content,
    provider: `${result.provider}${result.fallback_triggered ? ' (Fallback)' : ''}`,
    fallback_triggered: result.fallback_triggered,
  };
}
