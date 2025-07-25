
export interface BaseQuestion {
  id: number;
  question: string;
  type: 'math' | 'german' | 'english' | 'geography' | 'history' | 'physics' | 'biology' | 'chemistry' | 'latin';
  explanation?: string;
}

export interface TextInputQuestion extends BaseQuestion {
  questionType: 'text-input';
  answer: string | number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  questionType: 'multiple-choice';
  options: string[];
  correctAnswer: number; // index of correct option
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

export interface DragDropQuestion extends BaseQuestion {
  questionType: 'drag-drop';
  items: Array<{
    id: string;
    content: string;
    category: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    acceptsItems: string[]; // item ids that belong in this category
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
    acceptsItems: string[]; // item ids that belong in this category
  }>;
}

export type SelectionQuestion = TextInputQuestion | MultipleChoiceQuestion | WordSelectionQuestion | DragDropQuestion | MatchingQuestion;

// =====================================================
// ENHANCED CURRICULUM TYPES - EXTENSION
// =====================================================

// Import enhanced types from the new hook
import type { 
  ExtendedSubject, 
  EnhancedQuestionMetadata 
} from '@/hooks/useEnhancedCurriculumGeneration';

// Extend existing SelectionQuestion interface
declare module '@/types/questionTypes' {
  interface SelectionQuestion {
    // Enhanced metadata for curriculum system
    metadata?: EnhancedQuestionMetadata;
  }
}

// Export enhanced types for easy access
export type { ExtendedSubject, EnhancedQuestionMetadata };