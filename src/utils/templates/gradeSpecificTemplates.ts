// Grade-specific template definitions with proper ranges and validation
import { SelectionQuestion } from '@/types/questionTypes';

export interface GradeTemplate {
  id: string;
  category: string;
  grade: number;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'geometry' | 'word_problem' | 'decimals' | 'spelling' | 'grammar' | 'word_recognition';
  questionTemplate: string;
  answerTemplate: string;
  explanationTemplate: string;
  parameters: {
    [key: string]: {
      type: 'number' | 'word' | 'list';
      range?: [number, number];
      values?: string[];
      constraints?: string[];
    };
  };
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: ('text-input' | 'multiple-choice' | 'word-selection')[];
}

// Math templates by grade
export const mathTemplatesByGrade: { [grade: number]: GradeTemplate[] } = {
  1: [
    {
      id: 'math_g1_addition_basic',
      category: 'math',
      grade: 1,
      type: 'addition',
      questionTemplate: '{{a}} + {{b}} = ?',
      answerTemplate: '{{sum}}',
      explanationTemplate: '{{a}} + {{b}} = {{sum}}. Addition bedeutet zusammenzählen.',
      parameters: {
        a: { type: 'number', range: [1, 10] },
        b: { type: 'number', range: [1, 10] },
        sum: { type: 'number', range: [2, 20] }
      },
      difficulty: 'easy',
      questionTypes: ['text-input']
    },
    {
      id: 'math_g1_subtraction_basic',
      category: 'math',
      grade: 1,
      type: 'subtraction',
      questionTemplate: '{{a}} - {{b}} = ?',
      answerTemplate: '{{difference}}',
      explanationTemplate: '{{a}} - {{b}} = {{difference}}. Subtraktion bedeutet abziehen.',
      parameters: {
        a: { type: 'number', range: [5, 20] },
        b: { type: 'number', range: [1, 10] },
        difference: { type: 'number', range: [1, 15] }
      },
      difficulty: 'easy',
      questionTypes: ['text-input']
    }
  ],
  
  2: [
    {
      id: 'math_g2_addition_intermediate',
      category: 'math',
      grade: 2,
      type: 'addition',
      questionTemplate: '{{a}} + {{b}} = ?',
      answerTemplate: '{{sum}}',
      explanationTemplate: '{{a}} + {{b}} = {{sum}}. Das ist zweistellige Addition.',
      parameters: {
        a: { type: 'number', range: [10, 50] },
        b: { type: 'number', range: [5, 30] },
        sum: { type: 'number', range: [15, 80] }
      },
      difficulty: 'medium',
      questionTypes: ['text-input', 'multiple-choice']
    },
    {
      id: 'math_g2_multiplication_tables',
      category: 'math',
      grade: 2,
      type: 'multiplication',
      questionTemplate: '{{table}} × {{factor}} = ?',
      answerTemplate: '{{product}}',
      explanationTemplate: '{{table}} × {{factor}} = {{product}}. Das ist das {{table}}er Einmaleins.',
      parameters: {
        table: { type: 'number', range: [2, 5] },
        factor: { type: 'number', range: [1, 10] },
        product: { type: 'number', range: [2, 50] }
      },
      difficulty: 'medium',
      questionTypes: ['text-input', 'word-selection']
    }
  ],

  3: [
    {
      id: 'math_g3_multiplication_advanced',
      category: 'math',
      grade: 3,
      type: 'multiplication',
      questionTemplate: '{{a}} × {{b}} = ?',
      answerTemplate: '{{product}}',
      explanationTemplate: '{{a}} × {{b}} = {{product}}. Multiplikation mit größeren Zahlen.',
      parameters: {
        a: { type: 'number', range: [10, 99] },
        b: { type: 'number', range: [2, 12] },
        product: { type: 'number', range: [20, 1188] }
      },
      difficulty: 'medium',
      questionTypes: ['text-input', 'multiple-choice']
    },
    {
      id: 'math_g3_geometry_area',
      category: 'math',
      grade: 3,
      type: 'geometry',
      questionTemplate: 'Ein Rechteck ist {{length}} cm lang und {{width}} cm breit. Wie groß ist die Fläche?',
      answerTemplate: '{{area}}',
      explanationTemplate: 'Fläche = Länge × Breite = {{length}} × {{width}} = {{area}} cm²',
      parameters: {
        length: { type: 'number', range: [3, 15] },
        width: { type: 'number', range: [2, 10] },
        area: { type: 'number', range: [6, 150] }
      },
      difficulty: 'medium',
      questionTypes: ['text-input']
    }
  ],

  4: [
    {
      id: 'math_g4_division_advanced',
      category: 'math',
      grade: 4,
      type: 'division',
      questionTemplate: '{{dividend}} ÷ {{divisor}} = ?',
      answerTemplate: '{{quotient}}',
      explanationTemplate: '{{dividend}} ÷ {{divisor}} = {{quotient}}. Division mit größeren Zahlen.',
      parameters: {
        dividend: { type: 'number', range: [50, 500] },
        divisor: { type: 'number', range: [5, 25] },
        quotient: { type: 'number', range: [2, 100] }
      },
      difficulty: 'hard',
      questionTypes: ['text-input', 'multiple-choice']
    },
    {
      id: 'math_g4_decimals_basic',
      category: 'math',
      grade: 4,
      type: 'decimals',
      questionTemplate: '{{num1}} + {{num2}} = ?',
      answerTemplate: '{{sum}}',
      explanationTemplate: '{{num1}} + {{num2}} = {{sum}}. Addition mit Dezimalzahlen.',
      parameters: {
        num1: { type: 'number', range: [1.1, 20.9] },
        num2: { type: 'number', range: [0.5, 15.5] },
        sum: { type: 'number', range: [1.6, 36.4] }
      },
      difficulty: 'hard',
      questionTypes: ['text-input']
    }
  ]
};

// German templates by grade
export const germanTemplatesByGrade: { [grade: number]: GradeTemplate[] } = {
  1: [
    {
      id: 'german_g1_spelling_basic',
      category: 'german',
      grade: 1,
      type: 'spelling',
      questionTemplate: 'Welches Wort ist richtig geschrieben?',
      answerTemplate: '{{correct_word}}',
      explanationTemplate: 'Das Wort "{{correct_word}}" ist richtig geschrieben.',
      parameters: {
        correct_word: { type: 'word', values: ['Hund', 'Katze', 'Haus', 'Auto', 'Ball'] },
        wrong_options: { type: 'list', values: ['Hunt', 'Kaze', 'Hous', 'Aoto', 'Bal'] }
      },
      difficulty: 'easy',
      questionTypes: ['multiple-choice']
    }
  ],

  2: [
    {
      id: 'german_g2_word_recognition',
      category: 'german',
      grade: 2,
      type: 'word_recognition',
      questionTemplate: 'Welches Wort gehört zu "{{category}}"?',
      answerTemplate: '{{correct_word}}',
      explanationTemplate: '"{{correct_word}}" gehört zur Kategorie "{{category}}".',
      parameters: {
        category: { type: 'word', values: ['Tiere', 'Farben', 'Essen', 'Spielzeug'] },
        correct_word: { type: 'word', values: ['Hund', 'rot', 'Brot', 'Ball'] },
        wrong_options: { type: 'list', values: ['blau', 'Katze', 'Auto', 'Stuhl'] }
      },
      difficulty: 'easy',
      questionTypes: ['multiple-choice']
    }
  ],

  3: [
    {
      id: 'german_g3_grammar_wordtypes',
      category: 'german',
      grade: 3,
      type: 'grammar',
      questionTemplate: 'Welche Wortart ist "{{word}}"?',
      answerTemplate: '{{word_type}}',
      explanationTemplate: '"{{word}}" ist ein {{word_type}} ({{description}}).',
      parameters: {
        word: { type: 'word', values: ['schnell', 'laufen', 'Haus', 'der'] },
        word_type: { type: 'word', values: ['Adjektiv', 'Verb', 'Nomen', 'Artikel'] },
        description: { type: 'word', values: ['Eigenschaftswort', 'Tunwort', 'Hauptwort', 'Begleitwort'] }
      },
      difficulty: 'medium',
      questionTypes: ['multiple-choice']
    }
  ]
};

// Word problem templates with contextual scenarios
export const wordProblemTemplates: GradeTemplate[] = [
  {
    id: 'math_word_shopping',
    category: 'math',
    grade: 2,
    type: 'word_problem',
    questionTemplate: '{{name}} kauft {{items}} {{object}} für je {{price}} Euro. Wie viel kostet das insgesamt?',
    answerTemplate: '{{total}}',
    explanationTemplate: '{{items}} × {{price}} = {{total}} Euro. Anzahl mal Preis pro Stück.',
    parameters: {
      name: { type: 'word', values: ['Anna', 'Tom', 'Lisa', 'Max', 'Emma'] },
      items: { type: 'number', range: [2, 8] },
      object: { type: 'word', values: ['Äpfel', 'Brötchen', 'Stifte', 'Hefte', 'Bonbons'] },
      price: { type: 'number', range: [1, 5] },
      total: { type: 'number', range: [2, 40] }
    },
    difficulty: 'medium',
    questionTypes: ['text-input']
  },
  {
    id: 'math_word_animals',
    category: 'math',
    grade: 3,
    type: 'word_problem',
    questionTemplate: 'Im Zoo gibt es {{groups}} Gehege mit je {{animals_per_group}} {{animal_type}}. Wie viele {{animal_type}} sind das insgesamt?',
    answerTemplate: '{{total_animals}}',
    explanationTemplate: '{{groups}} × {{animals_per_group}} = {{total_animals}} {{animal_type}}. Anzahl Gehege mal Tiere pro Gehege.',
    parameters: {
      groups: { type: 'number', range: [2, 6] },
      animals_per_group: { type: 'number', range: [3, 8] },
      animal_type: { type: 'word', values: ['Löwen', 'Affen', 'Vögel', 'Zebras', 'Elefanten'] },
      total_animals: { type: 'number', range: [6, 48] }
    },
    difficulty: 'medium',
    questionTypes: ['text-input']
  }
];

// Template validation functions
export function validateTemplate(template: GradeTemplate): boolean {
  if (!template.id || !template.category || !template.grade || !template.type) {
    return false;
  }
  
  if (!template.questionTemplate || !template.answerTemplate || !template.explanationTemplate) {
    return false;
  }
  
  if (!template.parameters || Object.keys(template.parameters).length === 0) {
    return false;
  }
  
  return true;
}

export function getTemplatesForGradeAndCategory(grade: number, category: string): GradeTemplate[] {
  if (category === 'math') {
    return mathTemplatesByGrade[grade] || [];
  } else if (category === 'german') {
    return germanTemplatesByGrade[grade] || [];
  }
  
  return [];
}

export function getAllWordProblemTemplates(): GradeTemplate[] {
  return wordProblemTemplates;
}