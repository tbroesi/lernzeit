
export interface QuestionTemplate {
  id: string;
  category: string;
  grade: number;
  type: 'text-input' | 'multiple-choice' | 'word-selection' | 'matching' | 'drag-drop';
  template: string;
  parameters: TemplateParameter[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
}

export interface TemplateParameter {
  name: string;
  type: 'number' | 'word' | 'list';
  range?: [number, number];
  values?: string[];
  constraints?: (value: any, params: Record<string, any>) => boolean;
}

export interface GeneratedQuestion {
  id: number;
  questionType: 'text-input' | 'multiple-choice' | 'word-selection' | 'matching' | 'drag-drop';
  question: string;
  answer: string | number;
  type: string;
  explanation?: string;
  options?: string[];
  correctAnswer?: number;
  selectableWords?: Array<{
    word: string;
    isCorrect: boolean;
    index: number;
  }>;
  items?: Array<{
    id: string;
    content: string;
    category: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    acceptsItems: string[];
  }>;
}

// Template definitions for different subjects and grades
export const questionTemplates: QuestionTemplate[] = [
  // Mathematik Grade 1
  {
    id: 'math_1_addition_basic',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 10] },
      { name: 'b', type: 'number', range: [1, 10], constraints: (b, params) => params.a + b <= 20 }
    ],
    explanation: 'Einfache Addition im Zahlenraum bis 20',
    difficulty: 'easy',
    topics: ['addition', 'zahlenraum_20']
  },
  {
    id: 'math_1_subtraction_basic',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: '{a} - {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [5, 20] },
      { name: 'b', type: 'number', range: [1, 10], constraints: (b, params) => b < params.a }
    ],
    explanation: 'Einfache Subtraktion im Zahlenraum bis 20',
    difficulty: 'easy',
    topics: ['subtraction', 'zahlenraum_20']
  },
  {
    id: 'math_1_counting',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele {objects} siehst du? {count} {objects}',
    parameters: [
      { name: 'objects', type: 'word', values: ['Äpfel', 'Bälle', 'Sterne', 'Herzen', 'Blumen'] },
      { name: 'count', type: 'number', range: [1, 10] }
    ],
    explanation: 'Zählen von Objekten',
    difficulty: 'easy',
    topics: ['counting', 'objects']
  },

  // Mathematik Grade 2
  {
    id: 'math_2_addition_advanced',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [10, 50] },
      { name: 'b', type: 'number', range: [10, 50] }
    ],
    explanation: 'Addition zweistelliger Zahlen',
    difficulty: 'medium',
    topics: ['addition', 'zweistellige_zahlen']
  },
  {
    id: 'math_2_multiplication_table',
    category: 'Mathematik',
    grade: 2,
    type: 'multiple-choice',
    template: '{a} × {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 5] },
      { name: 'b', type: 'number', range: [1, 5] }
    ],
    explanation: 'Kleines Einmaleins',
    difficulty: 'medium',
    topics: ['multiplication', 'einmaleins']
  },
  {
    id: 'math_2_place_value',
    category: 'Mathematik',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Zahlen nach Stellenwert:',
    parameters: [
      { name: 'numbers', type: 'list', values: ['23', '47', '15'] }
    ],
    explanation: 'Stellenwert verstehen',
    difficulty: 'medium',
    topics: ['place_value', 'stellenwert']
  },

  // Mathematik Grade 3
  {
    id: 'math_3_division_basic',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{product} ÷ {divisor} = ?',
    parameters: [
      { name: 'divisor', type: 'number', range: [2, 10] },
      { name: 'quotient', type: 'number', range: [2, 10] }
    ],
    explanation: 'Division mit Rest',
    difficulty: 'medium',
    topics: ['division', 'einmaleins']
  },
  {
    id: 'math_3_word_problems',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{name} hat {initial} {objects}. Er/Sie bekommt {additional} dazu. Wie viele {objects} hat {name} jetzt?',
    parameters: [
      { name: 'name', type: 'word', values: ['Anna', 'Max', 'Lisa', 'Tom', 'Emma'] },
      { name: 'objects', type: 'word', values: ['Sticker', 'Murmeln', 'Karten', 'Bücher'] },
      { name: 'initial', type: 'number', range: [10, 30] },
      { name: 'additional', type: 'number', range: [5, 20] }
    ],
    explanation: 'Textaufgaben zur Addition',
    difficulty: 'medium',
    topics: ['word_problems', 'addition', 'sachaufgaben']
  },

  // Deutsch Grade 1
  {
    id: 'german_1_letters',
    category: 'Deutsch',
    grade: 1,
    type: 'word-selection',
    template: 'Finde alle Wörter mit dem Buchstaben "{letter}":',
    parameters: [
      { name: 'letter', type: 'word', values: ['M', 'A', 'L', 'S', 'T'] }
    ],
    explanation: 'Buchstaben erkennen',
    difficulty: 'easy',
    topics: ['letters', 'buchstaben']
  },
  {
    id: 'german_1_syllables',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele Silben hat das Wort "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Katze', 'Hund', 'Schule', 'Auto', 'Blume'] }
    ],
    explanation: 'Silben zählen',
    difficulty: 'easy',
    topics: ['syllables', 'silben']
  },

  // Add more templates for other subjects and grades...
];

// Template generation utilities
export function getTemplatesForCategory(category: string, grade: number): QuestionTemplate[] {
  return questionTemplates.filter(t => t.category === category && t.grade === grade);
}

export function generateQuestionFromTemplate(template: QuestionTemplate, usedCombinations: Set<string>): GeneratedQuestion | null {
  const maxAttempts = 50;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    
    // Generate parameter values
    const params: Record<string, any> = {};
    let valid = true;

    for (const param of template.parameters) {
      if (param.type === 'number' && param.range) {
        const [min, max] = param.range;
        params[param.name] = Math.floor(Math.random() * (max - min + 1)) + min;
      } else if (param.type === 'word' && param.values) {
        params[param.name] = param.values[Math.floor(Math.random() * param.values.length)];
      } else if (param.type === 'list' && param.values) {
        params[param.name] = [...param.values];
      }

      // Check constraints
      if (param.constraints && !param.constraints(params[param.name], params)) {
        valid = false;
        break;
      }
    }

    if (!valid) continue;

    // Create combination key to check for duplicates
    const combinationKey = `${template.id}_${JSON.stringify(params)}`;
    if (usedCombinations.has(combinationKey)) {
      continue;
    }

    // Generate the question
    const question = generateQuestionFromParams(template, params);
    if (question) {
      usedCombinations.add(combinationKey);
      return question;
    }
  }

  return null;
}

function generateQuestionFromParams(template: QuestionTemplate, params: Record<string, any>): GeneratedQuestion | null {
  try {
    let questionText = template.template;
    let answer: string | number = '';

    // Replace parameters in template
    for (const [key, value] of Object.entries(params)) {
      questionText = questionText.replace(new RegExp(`{${key}}`, 'g'), value.toString());
    }

    // Calculate answer based on template type
    if (template.type === 'text-input') {
      answer = calculateAnswer(template, params);
    }

    const baseQuestion: GeneratedQuestion = {
      id: Math.floor(Math.random() * 1000000),
      questionType: template.type,
      question: questionText,
      answer: answer,
      type: template.category.toLowerCase(),
      explanation: template.explanation
    };

    // Add type-specific properties
    if (template.type === 'multiple-choice') {
      const correctAnswer = calculateAnswer(template, params);
      const options = generateMultipleChoiceOptions(correctAnswer, template);
      baseQuestion.options = options;
      baseQuestion.correctAnswer = options.indexOf(correctAnswer.toString());
    } else if (template.type === 'word-selection') {
      baseQuestion.selectableWords = generateWordSelection(template, params);
    } else if (template.type === 'matching') {
      const { items, categories } = generateMatchingQuestion(template, params);
      baseQuestion.items = items;
      baseQuestion.categories = categories;
    }

    return baseQuestion;
  } catch (error) {
    console.error('Error generating question from template:', error);
    return null;
  }
}

function calculateAnswer(template: QuestionTemplate, params: Record<string, any>): string | number {
  if (template.id.includes('addition')) {
    return params.a + params.b;
  } else if (template.id.includes('subtraction')) {
    return params.a - params.b;
  } else if (template.id.includes('multiplication')) {
    return params.a * params.b;
  } else if (template.id.includes('division')) {
    return params.quotient;
  } else if (template.id.includes('counting')) {
    return params.count;
  } else if (template.id.includes('syllables')) {
    return countSyllables(params.word);
  } else if (template.id.includes('word_problems')) {
    return params.initial + params.additional;
  }
  
  return '';
}

function generateMultipleChoiceOptions(correctAnswer: string | number, template: QuestionTemplate): string[] {
  const options = [correctAnswer.toString()];
  const answerNum = typeof correctAnswer === 'number' ? correctAnswer : parseInt(correctAnswer.toString());
  
  // Generate wrong answers
  while (options.length < 4) {
    let wrongAnswer;
    if (typeof correctAnswer === 'number') {
      const variation = Math.floor(Math.random() * 10) - 5;
      wrongAnswer = Math.max(0, answerNum + variation);
    } else {
      wrongAnswer = (Math.floor(Math.random() * 20) + 1).toString();
    }
    
    if (!options.includes(wrongAnswer.toString())) {
      options.push(wrongAnswer.toString());
    }
  }
  
  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
}

function generateWordSelection(template: QuestionTemplate, params: Record<string, any>): Array<{word: string; isCorrect: boolean; index: number}> {
  const words = ['Maus', 'Auto', 'Haus', 'Baum', 'Mond', 'Sonne', 'Katze', 'Hund'];
  const targetLetter = params.letter;
  
  return words.map((word, index) => ({
    word,
    isCorrect: word.includes(targetLetter),
    index
  }));
}

function generateMatchingQuestion(template: QuestionTemplate, params: Record<string, any>) {
  const numbers = params.numbers || ['23', '47', '15'];
  
  const items = numbers.map((num: string, index: number) => ({
    id: `item_${index}`,
    content: num,
    category: getNumberCategory(parseInt(num))
  }));
  
  const categories = [
    { id: 'small', name: 'Kleine Zahlen (1-30)', acceptsItems: items.filter(item => parseInt(item.content) <= 30).map(item => item.id) },
    { id: 'medium', name: 'Mittlere Zahlen (31-60)', acceptsItems: items.filter(item => parseInt(item.content) > 30 && parseInt(item.content) <= 60).map(item => item.id) },
    { id: 'large', name: 'Große Zahlen (61+)', acceptsItems: items.filter(item => parseInt(item.content) > 60).map(item => item.id) }
  ];
  
  return { items, categories };
}

function getNumberCategory(num: number): string {
  if (num <= 30) return 'small';
  if (num <= 60) return 'medium';
  return 'large';
}

function countSyllables(word: string): number {
  const vowels = 'aeiouäöü';
  let count = 0;
  let previousWasVowel = false;
  
  for (const char of word.toLowerCase()) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  return Math.max(1, count);
}
