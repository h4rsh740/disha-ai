// ============================================================
// DishaAI — Core Type Definitions
// ============================================================

// --------------- Users & Auth ---------------

export type UserRole = 'student' | 'parent' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

// --------------- Student Profile ---------------

export type EducationLevel =
  | 'class_8'
  | 'class_9'
  | 'class_10'
  | 'class_11'
  | 'class_12'
  | 'iti'
  | 'diploma'
  | 'graduate';

export type LearningPreference = 'practical' | 'theoretical' | 'mixed';
export type WorkEnvironment = 'indoor' | 'outdoor' | 'mixed' | 'remote';
export type TrainingDuration = 'short' | 'medium' | 'long'; // <6m, 6-18m, >18m
export type BudgetRange = 'zero' | 'low' | 'medium' | 'high'; // 0, <10k, <30k, >30k
export type CareerGoal = 'quick_job' | 'long_term' | 'business' | 'higher_education';

export interface StudentProfile {
  id: string;
  user_id: string;
  name: string;
  education_level: EducationLevel;
  stream?: string;
  class_year?: string;
  interests: string[];
  learning_preference: LearningPreference;
  work_environment: WorkEnvironment;
  location: string;
  training_duration: TrainingDuration;
  budget_range: BudgetRange;
  career_goals: CareerGoal[];
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentSkill {
  skill_id: string;
  skill_name: string;
  proficiency: 1 | 2 | 3 | 4 | 5; // 1=beginner, 5=expert
}

// --------------- Skills ---------------

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

// --------------- Careers ---------------

export type CareerCategory =
  | 'renewable_energy'
  | 'electric_vehicles'
  | 'electrical'
  | 'it_electronics'
  | 'healthcare'
  | 'manufacturing'
  | 'construction'
  | 'agriculture'
  | 'automotive'
  | 'hospitality'
  | 'design'
  | 'logistics';

export type TrainingType = 'iti' | 'diploma' | 'certification' | 'apprenticeship' | 'short_course';

export interface Career {
  id: string;
  name: string;
  category: CareerCategory;
  description: string;
  education_requirement: string;
  training_duration: string; // e.g., "1-2 years"
  training_type: TrainingType[];
  nsqf_level?: string;
  sector_code?: string;
  why_choose: string[];
  required_skills: string[];
  career_progression: string[];
  further_education: string[];
  entrepreneurship_options: string[];
  job_roles: string[];
  is_demo_data: boolean;
  created_at: string;
}

export interface CareerSkill {
  career_id: string;
  skill_id: string;
  skill_name: string;
  importance: 'required' | 'preferred' | 'bonus';
}

// --------------- Career Path Steps ---------------

export interface CareerPathStep {
  id: string;
  career_id: string;
  step_order: number;
  title: string;
  description: string;
  duration: string;
  skills_gained: string[];
  certifications?: string[];
  possible_roles?: string[];
  requirements?: string[];
  next_step_hint?: string;
  step_type: 'education' | 'training' | 'certification' | 'work' | 'advancement';
}

export interface CareerPathway {
  id: string;
  career_id: string;
  name: string; // e.g., "ITI Route", "Diploma Route"
  duration: string;
  cost_range: string;
  practical_exposure: string; // e.g., "60%"
  entry_requirements: string;
  further_education_possible: boolean;
  steps: CareerPathStep[];
}

// --------------- Recommendations ---------------

export interface RecommendationScore {
  career_id: string;
  career: Career;
  total_score: number; // 0-100
  interest_score: number;
  skill_score: number;
  market_score: number;
  education_score: number;
  financial_score: number;
  matching_interests: string[];
  matching_skills: string[];
  skill_gaps: SkillGap[];
  explanation: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface SkillGap {
  skill_id: string;
  skill_name: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  how_to_acquire?: string;
}

// --------------- AI ---------------

export type AIProvider = 'gemini' | 'openrouter';

export interface AIRequestContext {
  student_profile?: StudentProfile;
  student_skills?: StudentSkill[];
  career?: Career;
  career_path_steps?: CareerPathStep[];
  skill_gaps?: SkillGap[];
  recommendation?: RecommendationScore;
  user_question?: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  latency_ms: number;
  fallback_triggered: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

export interface StructuredAIResponse {
  answer: string;
  reasoning_summary?: string;
  skill_gaps?: string[];
  recommended_actions?: string[];
  confidence: 'high' | 'medium' | 'low';
  source_ids?: string[];
  provider: AIProvider;
  fallback_triggered: boolean;
}

// --------------- Family Report ---------------

export interface FamilyReport {
  id: string;
  student_profile_id: string;
  career_id: string;
  generated_at: string;
  student_profile_summary: string;
  career_overview: string;
  why_suitable: string;
  training_journey: string;
  career_opportunities: string;
  career_growth: string;
  further_education: string;
  entrepreneurship: string;
  next_steps: string[];
  faq_answers: FAQAnswer[];
  ai_provider: AIProvider;
}

export interface FAQAnswer {
  question: string;
  answer: string;
}

// --------------- Chat ---------------

export interface ChatSession {
  id: string;
  student_profile_id: string;
  career_id?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: AIProvider;
  created_at: string;
}

// --------------- Admin Analytics ---------------

export interface AdminAnalytics {
  total_students: number;
  total_assessments: number;
  careers_explored: number;
  top_career_interests: Array<{ career: string; count: number }>;
  top_skill_gaps: Array<{ skill: string; count: number }>;
  career_category_distribution: Array<{ category: string; count: number }>;
  regional_distribution: Array<{ region: string; count: number }>;
  is_demo: boolean;
}

// --------------- Onboarding State ---------------

export interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5;
  education_level?: EducationLevel;
  stream?: string;
  class_year?: string;
  selected_interests: string[];
  selected_skills: StudentSkill[];
  learning_preference?: LearningPreference;
  work_environment?: WorkEnvironment;
  location?: string;
  training_duration?: TrainingDuration;
  budget_range?: BudgetRange;
  career_goals: CareerGoal[];
  name?: string;
}

// --------------- Dashboard ---------------

export interface CareerTwin {
  interests: string[];
  strengths: string[];
  work_style: string;
  education_profile: string;
  career_orientation: string;
  readiness_score: number;
  interest_match: number;
  skill_match: number;
  career_clarity: number;
}
