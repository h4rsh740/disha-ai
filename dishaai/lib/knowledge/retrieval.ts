// Deterministic, credential-free local retrieval over the existing demo
// career data. The Retriever interface is intentionally small so a future
// pgvector or managed index can replace this implementation without changing
// the AI pipeline contract.

import { DEMO_CAREER_PATHS, DEMO_CAREERS } from '@/data/careers';
import type { Career, CareerPathStep, CareerPathway } from '@/types';

export interface KnowledgeChunk {
  sourceId: string;
  title: string;
  content: string;
  citations: string[];
  score: number;
  metadata?: {
    kind: 'career' | 'pathway';
    careerId: string;
    pathwayId?: string;
  };
}

export interface RetrievalOptions {
  limit?: number;
  minScore?: number;
}

export interface RetrievalResult {
  query: string;
  chunks: KnowledgeChunk[];
  totalCandidates: number;
}

export interface Retriever {
  retrieve(query: string, options?: RetrievalOptions): RetrievalResult | Promise<RetrievalResult>;
}

interface IndexedChunk extends KnowledgeChunk {
  titleTokens: string[];
  contentTokens: string[];
  normalizedTitle: string;
  normalizedContent: string;
}

const DEFAULT_RETRIEVAL_LIMIT = 5;
const MAX_RETRIEVAL_LIMIT = 50;
const DEFAULT_MIN_SCORE = 0.03;

const STOP_WORDS = new Set([
  'a',
  'about',
  'after',
  'an',
  'and',
  'are',
  'can',
  'career',
  'do',
  'for',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'tell',
  'the',
  'this',
  'to',
  'what',
  'with',
]);

function normalize(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function joinValues(values: readonly string[]): string {
  return values.join('; ');
}

function careerContent(career: Career): string {
  const lines = [
    `Career: ${career.name}`,
    `Category: ${career.category}`,
    `Description: ${career.description}`,
    `Education required: ${career.education_requirement}`,
    `Training duration: ${career.training_duration}`,
    `Training types: ${joinValues(career.training_type)}`,
    career.nsqf_level === undefined ? '' : `NSQF level: ${career.nsqf_level}`,
    career.sector_code === undefined ? '' : `Sector code: ${career.sector_code}`,
    `Why choose: ${joinValues(career.why_choose)}`,
    `Required skills: ${joinValues(career.required_skills)}`,
    `Career progression: ${joinValues(career.career_progression)}`,
    `Further education: ${joinValues(career.further_education)}`,
    `Entrepreneurship options: ${joinValues(career.entrepreneurship_options)}`,
    `Job roles: ${joinValues(career.job_roles)}`,
    `Data status: ${career.is_demo_data ? 'illustrative demo data' : 'provided career data'}`,
  ];

  return lines.filter((line) => line.length > 0).join('\n');
}

function stepContent(step: CareerPathStep): string {
  const lines = [
    `Step ${step.step_order}: ${step.title}`,
    `Description: ${step.description}`,
    `Duration: ${step.duration}`,
    `Skills gained: ${joinValues(step.skills_gained)}`,
    step.certifications === undefined ? '' : `Certifications: ${joinValues(step.certifications)}`,
    step.possible_roles === undefined ? '' : `Possible roles: ${joinValues(step.possible_roles)}`,
    step.requirements === undefined ? '' : `Requirements: ${joinValues(step.requirements)}`,
    step.next_step_hint === undefined ? '' : `Next step hint: ${step.next_step_hint}`,
    `Step type: ${step.step_type}`,
  ];
  return lines.filter((line) => line.length > 0).join('\n');
}

function pathwayContent(career: Career, pathway: CareerPathway): string {
  const steps = pathway.steps.map(stepContent).join('\n\n');
  return [
    `Career: ${career.name}`,
    `Pathway: ${pathway.name}`,
    `Duration: ${pathway.duration}`,
    `Cost range: ${pathway.cost_range}`,
    `Practical exposure: ${pathway.practical_exposure}`,
    `Entry requirements: ${pathway.entry_requirements}`,
    `Further education possible: ${pathway.further_education_possible ? 'yes' : 'no'}`,
    'Steps:',
    steps,
  ].join('\n');
}

function createCareerChunk(career: Career): KnowledgeChunk {
  const sourceId = `career:${career.id}`;
  return {
    sourceId,
    title: career.name,
    content: careerContent(career),
    citations: [`[source:${sourceId}]`],
    score: 0,
    metadata: { kind: 'career', careerId: career.id },
  };
}

function createPathwayChunk(career: Career, pathway: CareerPathway): KnowledgeChunk {
  const sourceId = `pathway:${career.id}:${pathway.id}`;
  return {
    sourceId,
    title: `${career.name} — ${pathway.name}`,
    content: pathwayContent(career, pathway),
    citations: [`[source:${sourceId}]`, `[source:career:${career.id}]`],
    score: 0,
    metadata: { kind: 'pathway', careerId: career.id, pathwayId: pathway.id },
  };
}

function buildLocalIndex(): IndexedChunk[] {
  const chunks: KnowledgeChunk[] = [];

  for (const career of DEMO_CAREERS) {
    chunks.push(createCareerChunk(career));
    const pathways = DEMO_CAREER_PATHS[career.id] ?? [];
    for (const pathway of pathways) chunks.push(createPathwayChunk(career, pathway));
  }

  return chunks.map((chunk) => ({
    ...chunk,
    titleTokens: tokenize(chunk.title),
    contentTokens: tokenize(chunk.content),
    normalizedTitle: normalize(chunk.title),
    normalizedContent: normalize(chunk.content),
  }));
}

const LOCAL_INDEX = buildLocalIndex();

function boundedLimit(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_RETRIEVAL_LIMIT;
  return Math.min(MAX_RETRIEVAL_LIMIT, Math.max(1, Math.floor(value)));
}

function boundedMinScore(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_MIN_SCORE;
  return Math.min(1, Math.max(0, value));
}

function countToken(tokens: readonly string[], target: string): number {
  let count = 0;
  for (const token of tokens) if (token === target) count += 1;
  return count;
}

function scoreChunk(chunk: IndexedChunk, query: string, queryTokens: readonly string[]): number {
  if (queryTokens.length === 0) return 0;

  let score = 0;
  for (const token of queryTokens) {
    const titleHit = chunk.titleTokens.includes(token);
    const contentHits = Math.min(2, countToken(chunk.contentTokens, token));
    if (titleHit) score += 3;
    score += contentHits;
  }

  const normalizedQuery = normalize(query);
  if (normalizedQuery.length > 2 && chunk.normalizedTitle.includes(normalizedQuery)) score += 2;
  if (normalizedQuery.length > 2 && chunk.normalizedContent.includes(normalizedQuery)) score += 1;

  const maximum = queryTokens.length * 5 + 3;
  return Math.min(1, score / maximum);
}

function toPublicChunk(chunk: IndexedChunk, score: number): KnowledgeChunk {
  return {
    sourceId: chunk.sourceId,
    title: chunk.title,
    content: chunk.content,
    citations: [...chunk.citations],
    score,
    ...(chunk.metadata === undefined ? {} : { metadata: { ...chunk.metadata } }),
  };
}

/**
 * Search the local index using deterministic lexical overlap. Scores are
 * bounded to 0..1 and ties are resolved by stable source ID ordering.
 */
export function retrieveLocalKnowledge(
  query: string,
  options: RetrievalOptions = {},
): RetrievalResult {
  const safeQuery = typeof query === 'string' ? query.normalize('NFKC').trim() : '';
  const queryTokens = tokenize(safeQuery);
  const limit = boundedLimit(options.limit);
  const minScore = boundedMinScore(options.minScore);

  if (queryTokens.length === 0) {
    return { query: safeQuery, chunks: [], totalCandidates: LOCAL_INDEX.length };
  }

  const ranked = LOCAL_INDEX.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, safeQuery, queryTokens),
  }))
    .filter((item) => item.score >= minScore)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.chunk.sourceId.localeCompare(right.chunk.sourceId);
    });

  return {
    query: safeQuery,
    chunks: ranked.slice(0, limit).map((item) => toPublicChunk(item.chunk, item.score)),
    totalCandidates: LOCAL_INDEX.length,
  };
}

export const retrieveKnowledge = retrieveLocalKnowledge;
export const localLexicalRetrieve = retrieveLocalKnowledge;

export function retrieveLocalKnowledgeChunks(
  query: string,
  options: RetrievalOptions = {},
): KnowledgeChunk[] {
  return retrieveLocalKnowledge(query, options).chunks;
}

export class LocalLexicalRetriever implements Retriever {
  retrieve(query: string, options: RetrievalOptions = {}): RetrievalResult {
    return retrieveLocalKnowledge(query, options);
  }
}

export function createLocalRetriever(): Retriever {
  return new LocalLexicalRetriever();
}
