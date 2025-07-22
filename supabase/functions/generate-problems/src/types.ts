import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Request Types
export interface ProblemRequest {
  category: string;
  grade: number;
  count: number;
  excludeQuestions?: string[];
  sessionId?: string;
  globalQuestionCount?: number;
  requestId?: string;
}

// Base Question Interface
export interface BaseQuestion {
  id: number;
  question: string;
  type: string;
  explanation: string;
}

// Question Type Interfaces
export interface TextInputQuestion extends BaseQuestion {
  questionType: 'text-input';
  answer: string | number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  questionType: 'multiple-choice';
  options: string[];
  correctAnswer: number;
}

export interface WordSelectionQuestion extends BaseQuestion {
  questionType: 'word-selection';
  sentence: string;
  selectableWords: Array<{
    word: string;
    isCorrect: boolean;
    index: number;
  }>;
}

export interface MatchingQuestion extends BaseQuestion {
  questionType: 'matching';
  items: Array<{
    id: string;
    content: string;
    category: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    acceptsItems: string[];
  }>;
}

export type SelectionQuestion = TextInputQuestion | MultipleChoiceQuestion | WordSelectionQuestion | MatchingQuestion;

// Template Storage Types
export interface GeneratedTemplate {
  id: string;
  content: string;
  category: string;
  grade: number;
  question_type: string;
  quality_score: number;
  usage_count: number;
  is_active: boolean;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

// Quality Metrics
export interface QualityMetrics {
  curriculum_alignment: number;
  difficulty_appropriateness: number;
  uniqueness_score: number;
  engagement_potential: number;
  overall_score: number;
}

// Generation Config
export interface GenerationConfig {
  temperature: number;
  top_p: number;
  top_k: number;
  candidate_count: number;
  max_output_tokens: number;
  seed: number;
}

// Zod Schemas for Validation
export const ProblemRequestSchema = z.object({
  category: z.string().min(1),
  grade: z.number().int().min(1).max(12),
  count: z.number().int().min(1).max(10).default(5),
  excludeQuestions: z.array(z.string()).optional().default([]),
  sessionId: z.string().optional(),
  globalQuestionCount: z.number().int().optional().default(0),
  requestId: z.string().optional()
});

export const TextInputQuestionSchema = z.object({
  questionType: z.literal('text-input'),
  question: z.string().min(1),
  answer: z.union([z.string(), z.number()]),
  explanation: z.string().optional()
});

export const MultipleChoiceQuestionSchema = z.object({
  questionType: z.literal('multiple-choice'),
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional()
});

export const WordSelectionQuestionSchema = z.object({
  questionType: z.literal('word-selection'),
  question: z.string().min(1),
  sentence: z.string().min(1),
  selectableWords: z.array(z.object({
    word: z.string(),
    isCorrect: z.boolean(),
    index: z.number().int()
  })),
  explanation: z.string().optional()
});

export const MatchingQuestionSchema = z.object({
  questionType: z.literal('matching'),
  question: z.string().min(1),
  items: z.array(z.object({
    id: z.string(),
    content: z.string(),
    category: z.string()
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    acceptsItems: z.array(z.string())
  })),
  explanation: z.string().optional()
});

export const QuestionSchema = z.union([
  TextInputQuestionSchema,
  MultipleChoiceQuestionSchema,
  WordSelectionQuestionSchema,
  MatchingQuestionSchema
]);

export const GeneratedProblemsSchema = z.object({
  problems: z.array(QuestionSchema)
});

// Error Types
export class ValidationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TemplateGenerationError extends Error {
  constructor(message: string, public category?: string, public grade?: number) {
    super(message);
    this.name = 'TemplateGenerationError';
  }
}

export class QualityControlError extends Error {
  constructor(message: string, public score?: number) {
    super(message);
    this.name = 'QualityControlError';
  }
}