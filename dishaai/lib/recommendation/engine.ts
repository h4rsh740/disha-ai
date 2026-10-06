// ============================================================
// Recommendation Engine — Deterministic, explainable scoring
// ============================================================
import { DEMO_CAREERS, DEMO_SKILLS } from '@/data/careers';
import type {
  Career,
  StudentProfile,
  StudentSkill,
  RecommendationScore,
  SkillGap,
} from '@/types';

// --------------- Weight Configuration ---------------
// Configurable weights must sum to 100

const WEIGHTS = {
  interest: 35,
  skill: 25,
  market: 20,
  education: 10,
  financial: 10,
} as const;

// --------------- Interest Mapping ---------------

const INTEREST_TO_CATEGORY: Record<string, string[]> = {
  technology: ['it_electronics'],
  electrical: ['electrical', 'renewable_energy'],
  agriculture: ['agriculture'],
  healthcare: ['healthcare'],
  automotive: ['automotive', 'electric_vehicles'],
  design: ['design'],
  construction: ['construction'],
  hospitality: ['hospitality'],
  manufacturing: ['manufacturing'],
  renewable_energy: ['renewable_energy'],
  logistics: ['logistics'],
  finance: [],
};

// --------------- Education Mapping ---------------

const EDUCATION_RANK: Record<string, number> = {
  class_8: 1,
  class_9: 2,
  class_10: 3,
  class_11: 4,
  class_12: 5,
  iti: 4,
  diploma: 6,
  graduate: 7,
};

const CAREER_EDUCATION_REQUIREMENT_RANK: Record<string, number> = {
  'Class 8–10 pass': 1,
  'Class 8-10 pass': 1,
  'Class 10 pass': 3,
  'Class 10 pass (Science preferred)': 3,
  'Class 10 pass (Science & Math preferred)': 3,
  'Class 10 pass (PCM preferred)': 3,
  'Class 10 pass (Math & Science)': 3,
  'Class 12 (Science preferred)': 5,
};

// --------------- Market Signal (Demo) ---------------
// These are illustrative relative demand indicators — not official statistics

const MARKET_DEMAND: Record<string, number> = {
  'c-01': 90, // Solar PV — high demand
  'c-02': 85, // EV Technician — growing
  'c-03': 80, // Electrician — stable high
  'c-04': 70, // CNC — manufacturing demand
  'c-05': 75, // Healthcare — growing
  'c-06': 85, // Welder — high universal demand
  'c-07': 80, // Plumber — strong infra demand
  'c-08': 75, // HVAC — growing urban
  'c-09': 65, // Agri Equipment — rural demand
  'c-10': 72, // Computer Hardware — digital India
};

// --------------- Scoring Functions ---------------

function scoreInterest(
  studentInterests: string[],
  career: Career,
): { score: number; matching: string[] } {
  if (!studentInterests.length) return { score: 50, matching: [] };

  const matching: string[] = [];

  for (const interest of studentInterests) {
    const mappedCategories = INTEREST_TO_CATEGORY[interest] ?? [];
    if (mappedCategories.includes(career.category)) {
      matching.push(interest);
    }
  }

  // Also check keyword match in career name / description
  for (const interest of studentInterests) {
    const interestLower = interest.toLowerCase();
    if (
      career.name.toLowerCase().includes(interestLower) ||
      career.description.toLowerCase().includes(interestLower)
    ) {
      if (!matching.includes(interest)) matching.push(interest);
    }
  }

  const score = matching.length === 0
    ? 20
    : Math.min(100, 40 + matching.length * 30);

  return { score, matching };
}

function scoreSkill(
  studentSkills: StudentSkill[],
  career: Career,
): { score: number; matching: string[]; gaps: SkillGap[] } {
  const requiredSkills = career.required_skills;
  const studentSkillNames = studentSkills.map((s) => s.skill_name.toLowerCase());

  const matching: string[] = [];
  const gaps: SkillGap[] = [];

  for (let i = 0; i < requiredSkills.length; i++) {
    const reqSkill = requiredSkills[i];
    const reqLower = reqSkill.toLowerCase();
    const hasSkill = studentSkillNames.some(
      (s) => s.includes(reqLower) || reqLower.includes(s),
    );

    if (hasSkill) {
      matching.push(reqSkill);
    } else {
      gaps.push({
        skill_id: `gap-${i}`,
        skill_name: reqSkill,
        importance: i < 3 ? 'critical' : i < 6 ? 'important' : 'nice_to_have',
        how_to_acquire: 'Covered in ITI / certification training',
      });
    }
  }

  const matchRatio = requiredSkills.length > 0
    ? matching.length / requiredSkills.length
    : 0;

  const score = Math.round(matchRatio * 100);

  return { score, matching, gaps };
}

function scoreEducation(
  student: StudentProfile,
  career: Career,
): number {
  const studentRank = EDUCATION_RANK[student.education_level] ?? 3;
  const careerReqRank = CAREER_EDUCATION_REQUIREMENT_RANK[career.education_requirement] ?? 3;

  if (studentRank >= careerReqRank) return 100;
  if (studentRank === careerReqRank - 1) return 70;
  return 40;
}

function scoreFinancial(
  student: StudentProfile,
  career: Career,
): number {
  const budget = student.budget_range;
  const trainingType = career.training_type;

  if (budget === 'zero') {
    // Check if government-sponsored option exists
    if (trainingType.includes('iti') || trainingType.includes('apprenticeship')) return 90;
    return 50;
  }

  if (budget === 'low') return 85;
  if (budget === 'medium') return 90;
  return 100;
}

function buildExplanation(
  career: Career,
  matchingInterests: string[],
  matchingSkills: string[],
  skillGaps: SkillGap[],
  educationScore: number,
): string[] {
  const reasons: string[] = [];

  if (matchingInterests.length > 0) {
    reasons.push(
      `Your interest in ${matchingInterests.slice(0, 2).join(' and ')} aligns well with this career`,
    );
  }

  if (matchingSkills.length > 0) {
    reasons.push(
      `You already have ${matchingSkills.slice(0, 3).join(', ')} — key skills for this field`,
    );
  }

  if (educationScore >= 90) {
    reasons.push('Your education level meets the entry requirements');
  }

  if (career.why_choose.length > 0) {
    reasons.push(career.why_choose[0]);
  }

  if (skillGaps.length <= 2) {
    reasons.push('You have a strong skills foundation with only minor gaps to fill');
  } else if (skillGaps.length <= 4) {
    reasons.push('The skill gaps can be addressed through the standard training program');
  }

  return reasons.slice(0, 4);
}

// --------------- Main Recommendation Engine ---------------

export function generateRecommendations(
  student: StudentProfile,
  studentSkills: StudentSkill[],
  careers: Career[] = DEMO_CAREERS,
): RecommendationScore[] {
  const results: RecommendationScore[] = [];

  for (const career of careers) {
    const interestResult = scoreInterest(student.interests, career);
    const skillResult = scoreSkill(studentSkills, career);
    const marketScore = MARKET_DEMAND[career.id] ?? 60;
    const educationScore = scoreEducation(student, career);
    const financialScore = scoreFinancial(student, career);

    const totalScore = Math.round(
      (interestResult.score * WEIGHTS.interest +
        skillResult.score * WEIGHTS.skill +
        marketScore * WEIGHTS.market +
        educationScore * WEIGHTS.education +
        financialScore * WEIGHTS.financial) /
        100,
    );

    const explanation = buildExplanation(
      career,
      interestResult.matching,
      skillResult.matching,
      skillResult.gaps,
      educationScore,
    );

    const confidence: 'high' | 'medium' | 'low' =
      totalScore >= 75 ? 'high' : totalScore >= 55 ? 'medium' : 'low';

    results.push({
      career_id: career.id,
      career,
      total_score: Math.min(99, totalScore), // Cap at 99 to avoid claiming 100%
      interest_score: interestResult.score,
      skill_score: skillResult.score,
      market_score: marketScore,
      education_score: educationScore,
      financial_score: financialScore,
      matching_interests: interestResult.matching,
      matching_skills: skillResult.matching,
      skill_gaps: skillResult.gaps,
      explanation,
      confidence,
    });
  }

  // Sort by total score descending
  return results.sort((a, b) => b.total_score - a.total_score);
}

// --------------- Career Twin Builder ---------------

export function buildCareerTwin(
  student: StudentProfile,
  studentSkills: StudentSkill[],
  topRecommendation?: RecommendationScore,
): {
  readiness_score: number;
  interest_match: number;
  skill_match: number;
  career_clarity: number;
  interests: string[];
  strengths: string[];
  work_style: string;
  education_profile: string;
  career_orientation: string;
} {
  const avgSkillLevel =
    studentSkills.length > 0
      ? studentSkills.reduce((sum, s) => sum + s.proficiency, 0) / studentSkills.length
      : 2;

  const skill_match = topRecommendation
    ? topRecommendation.skill_score
    : Math.round(avgSkillLevel * 20);

  const interest_match = topRecommendation
    ? topRecommendation.interest_score
    : student.interests.length > 0 ? 70 : 40;

  const career_clarity =
    student.career_goals.length > 1 ? 75 : student.career_goals.length > 0 ? 65 : 50;

  const readiness_score = Math.round(
    (skill_match * 0.4 + interest_match * 0.35 + career_clarity * 0.25),
  );

  const strengthMap: Record<number, string> = {
    1: 'Beginner — ready to learn',
    2: 'Basic foundation skills',
    3: 'Intermediate practical skills',
    4: 'Advanced technical skills',
    5: 'Expert-level proficiency',
  };

  const workStyleMap: Record<string, string> = {
    practical: 'Hands-on, practical learner',
    theoretical: 'Analytical, study-oriented learner',
    mixed: 'Balanced — adapts to both classroom and hands-on training',
  };

  const educationMap: Record<string, string> = {
    class_8: 'Class 8 — ready for basic vocational training',
    class_9: 'Class 9 — preparing for vocational entry',
    class_10: 'Class 10 — eligible for most ITI trades',
    class_11: 'Class 11 — building academic foundation',
    class_12: 'Class 12 — wide range of vocational options available',
    iti: 'ITI graduate — qualified for employment or advanced training',
    diploma: 'Diploma holder — Junior Engineer level entry',
    graduate: 'Graduate — career transition or specialization',
  };

  return {
    readiness_score: Math.min(95, readiness_score),
    interest_match: Math.min(99, interest_match),
    skill_match: Math.min(99, skill_match),
    career_clarity: Math.min(95, career_clarity),
    interests: student.interests.slice(0, 4),
    strengths: studentSkills
      .filter((s) => s.proficiency >= 3)
      .map((s) => s.skill_name)
      .slice(0, 5),
    work_style: workStyleMap[student.learning_preference] ?? 'Adaptable learner',
    education_profile: educationMap[student.education_level] ?? 'Student',
    career_orientation: student.career_goals.includes('quick_job')
      ? 'Immediate employment focused'
      : student.career_goals.includes('business')
      ? 'Entrepreneurship oriented'
      : student.career_goals.includes('higher_education')
      ? 'Academic advancement oriented'
      : 'Long-term career builder',
  };
}
