
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

export type SelectionQuestion = TextInputQuestion | MultipleChoiceQuestion | WordSelectionQuestion | DragDropQuestion;
