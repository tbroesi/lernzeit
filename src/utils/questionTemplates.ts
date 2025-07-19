
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

// Comprehensive template definitions for all subjects and grades
export const questionTemplates: QuestionTemplate[] = [
  // =================== MATHEMATIK ===================
  
  // Grade 1 Math Templates
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
    id: 'math_1_counting_objects',
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
  {
    id: 'math_1_number_comparison',
    category: 'Mathematik',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welche Zahl ist größer: {a} oder {b}?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 20] },
      { name: 'b', type: 'number', range: [1, 20], constraints: (b, params) => b !== params.a }
    ],
    explanation: 'Zahlen vergleichen',
    difficulty: 'easy',
    topics: ['comparison', 'numbers']
  },

  // Grade 2 Math Templates
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
    id: 'math_2_word_problems_money',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{name} hat {amount1} Euro. Er/Sie bekommt {amount2} Euro dazu. Wie viel Euro hat {name} jetzt?',
    parameters: [
      { name: 'name', type: 'word', values: ['Anna', 'Max', 'Lisa', 'Tom', 'Emma'] },
      { name: 'amount1', type: 'number', range: [5, 20] },
      { name: 'amount2', type: 'number', range: [3, 15] }
    ],
    explanation: 'Sachaufgaben mit Geld',
    difficulty: 'medium',
    topics: ['word_problems', 'money', 'addition']
  },

  // Grade 3 Math Templates
  {
    id: 'math_3_division_basic',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{dividend} ÷ {divisor} = ?',
    parameters: [
      { name: 'divisor', type: 'number', range: [2, 9] },
      { name: 'quotient', type: 'number', range: [2, 12] }
    ],
    explanation: 'Division ohne Rest',
    difficulty: 'medium',
    topics: ['division', 'einmaleins']
  },
  {
    id: 'math_3_fractions_basic',
    category: 'Mathematik',
    grade: 3,
    type: 'multiple-choice',
    template: 'Welcher Bruch ist größer: {frac1} oder {frac2}?',
    parameters: [
      { name: 'frac1', type: 'word', values: ['1/2', '1/3', '1/4', '2/3', '3/4'] },
      { name: 'frac2', type: 'word', values: ['1/2', '1/3', '1/4', '2/3', '3/4'] }
    ],
    explanation: 'Brüche vergleichen',
    difficulty: 'hard',
    topics: ['fractions', 'comparison']
  },

  // Grade 4 Math Templates
  {
    id: 'math_4_area_rectangle',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Ein Rechteck hat die Länge {length} cm und die Breite {width} cm. Wie groß ist die Fläche?',
    parameters: [
      { name: 'length', type: 'number', range: [3, 12] },
      { name: 'width', type: 'number', range: [2, 10] }
    ],
    explanation: 'Flächenberechnung Rechteck',
    difficulty: 'medium',
    topics: ['geometry', 'area', 'rectangle']
  },
  {
    id: 'math_4_decimal_addition',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{a},{decimal1} + {b},{decimal2} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 9] },
      { name: 'b', type: 'number', range: [1, 9] },
      { name: 'decimal1', type: 'number', range: [1, 9] },
      { name: 'decimal2', type: 'number', range: [1, 9] }
    ],
    explanation: 'Addition mit Dezimalzahlen',
    difficulty: 'hard',
    topics: ['decimals', 'addition']
  },

  // =================== DEUTSCH ===================
  
  // Grade 1 German Templates
  {
    id: 'german_1_letters_recognition',
    category: 'Deutsch',
    grade: 1,
    type: 'word-selection',
    template: 'Finde alle Wörter mit dem Buchstaben "{letter}":',
    parameters: [
      { name: 'letter', type: 'word', values: ['M', 'A', 'L', 'S', 'T', 'N', 'R'] }
    ],
    explanation: 'Buchstaben in Wörtern erkennen',
    difficulty: 'easy',
    topics: ['letters', 'recognition']
  },
  {
    id: 'german_1_syllables_count',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele Silben hat das Wort "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Katze', 'Hund', 'Schule', 'Auto', 'Blume', 'Baum', 'Haus'] }
    ],
    explanation: 'Silben zählen',
    difficulty: 'easy',
    topics: ['syllables', 'phonetics']
  },
  {
    id: 'german_1_rhyming_words',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welches Wort reimt sich auf "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Haus', 'Ball', 'Buch', 'Stern', 'Hand'] }
    ],
    explanation: 'Reimwörter finden',
    difficulty: 'medium',
    topics: ['rhyming', 'phonetics']
  },

  // Grade 2 German Templates
  {
    id: 'german_2_sentence_building',
    category: 'Deutsch',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Wörter zu einem Satz:',
    parameters: [
      { name: 'sentence_parts', type: 'list', values: ['Der Hund', 'bellt', 'laut'] }
    ],
    explanation: 'Sätze bilden',
    difficulty: 'medium',
    topics: ['sentence_structure', 'grammar']
  },
  {
    id: 'german_2_word_categories',
    category: 'Deutsch',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Wörter den richtigen Kategorien zu:',
    parameters: [
      { name: 'words', type: 'list', values: ['Apfel', 'Auto', 'Katze', 'Buch'] }
    ],
    explanation: 'Wörter kategorisieren',
    difficulty: 'medium',
    topics: ['categorization', 'vocabulary']
  },

  // Grade 3 German Templates
  {
    id: 'german_3_past_tense',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Setze das Verb "{verb}" in die Vergangenheit: "Gestern {blank} ich..."',
    parameters: [
      { name: 'verb', type: 'word', values: ['gehen', 'essen', 'spielen', 'lesen', 'schreiben'] }
    ],
    explanation: 'Vergangenheitsform bilden',
    difficulty: 'medium',
    topics: ['grammar', 'past_tense', 'verbs']
  },
  {
    id: 'german_3_adjective_comparison',
    category: 'Deutsch',
    grade: 3,
    type: 'multiple-choice',
    template: 'Wie lautet die Steigerung von "{adjective}"?',
    parameters: [
      { name: 'adjective', type: 'word', values: ['groß', 'klein', 'schnell', 'schön', 'alt'] }
    ],
    explanation: 'Adjektive steigern',
    difficulty: 'hard',
    topics: ['grammar', 'adjectives', 'comparison']
  },

  // =================== ENGLISCH ===================
  
  // Grade 1 English Templates
  {
    id: 'english_1_colors',
    category: 'Englisch',
    grade: 1,
    type: 'multiple-choice',
    template: 'What color is this? (Ein {object} ist normalerweise...)',
    parameters: [
      { name: 'object', type: 'word', values: ['Apfel', 'Gras', 'Sonne', 'Himmel', 'Schnee'] }
    ],
    explanation: 'Farben auf Englisch',
    difficulty: 'easy',
    topics: ['colors', 'vocabulary']
  },
  {
    id: 'english_1_numbers',
    category: 'Englisch',
    grade: 1,
    type: 'text-input',
    template: 'Wie heißt die Zahl {number} auf Englisch?',
    parameters: [
      { name: 'number', type: 'number', range: [1, 10] }
    ],
    explanation: 'Zahlen auf Englisch',
    difficulty: 'easy',
    topics: ['numbers', 'vocabulary']
  },

  // Grade 2 English Templates
  {
    id: 'english_2_animals',
    category: 'Englisch',
    grade: 2,
    type: 'matching',
    template: 'Verbinde die deutschen Tiernamen mit den englischen:',
    parameters: [
      { name: 'animals', type: 'list', values: ['Hund-Dog', 'Katze-Cat', 'Vogel-Bird'] }
    ],
    explanation: 'Tiernamen auf Englisch',
    difficulty: 'medium',
    topics: ['animals', 'vocabulary']
  },
  {
    id: 'english_2_simple_sentences',
    category: 'Englisch',
    grade: 2,
    type: 'word-selection',
    template: 'Wähle die richtigen Wörter für den Satz: "I {verb} a {noun}."',
    parameters: [
      { name: 'verb', type: 'word', values: ['have', 'like', 'see'] },
      { name: 'noun', type: 'word', values: ['cat', 'book', 'apple'] }
    ],
    explanation: 'Einfache englische Sätze',
    difficulty: 'medium',
    topics: ['sentence_structure', 'vocabulary']
  },

  // Grade 3 English Templates
  {
    id: 'english_3_present_tense',
    category: 'Englisch',
    grade: 3,
    type: 'multiple-choice',
    template: 'Fill in the blank: "She {blank} to school every day."',
    parameters: [
      { name: 'verb', type: 'word', values: ['go', 'walk', 'run', 'drive'] }
    ],
    explanation: 'Present tense in English',
    difficulty: 'medium',
    topics: ['grammar', 'present_tense', 'verbs']
  },

  // =================== GEOGRAPHIE ===================
  
  // Grade 2 Geography Templates
  {
    id: 'geography_2_german_states',
    category: 'Geographie',
    grade: 2,
    type: 'multiple-choice',
    template: 'In welchem Bundesland liegt die Stadt {city}?',
    parameters: [
      { name: 'city', type: 'word', values: ['München', 'Hamburg', 'Berlin', 'Köln', 'Dresden'] }
    ],
    explanation: 'Deutsche Bundesländer und Städte',
    difficulty: 'medium',
    topics: ['germany', 'states', 'cities']
  },
  {
    id: 'geography_2_continents',
    category: 'Geographie',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Länder den richtigen Kontinenten zu:',
    parameters: [
      { name: 'countries', type: 'list', values: ['Deutschland', 'China', 'Brasilien', 'Australien'] }
    ],
    explanation: 'Kontinente und Länder',
    difficulty: 'medium',
    topics: ['continents', 'countries']
  },

  // Grade 3 Geography Templates
  {
    id: 'geography_3_capitals',
    category: 'Geographie',
    grade: 3,
    type: 'text-input',
    template: 'Wie heißt die Hauptstadt von {country}?',
    parameters: [
      { name: 'country', type: 'word', values: ['Frankreich', 'Italien', 'Spanien', 'Polen', 'Österreich'] }
    ],
    explanation: 'Hauptstädte europäischer Länder',
    difficulty: 'hard',
    topics: ['capitals', 'europe']
  },
  {
    id: 'geography_3_rivers',
    category: 'Geographie',
    grade: 3,
    type: 'multiple-choice',
    template: 'Welcher Fluss fließt durch {city}?',
    parameters: [
      { name: 'city', type: 'word', values: ['Hamburg', 'Köln', 'Dresden', 'Frankfurt'] }
    ],
    explanation: 'Deutsche Flüsse und Städte',
    difficulty: 'medium',
    topics: ['rivers', 'germany', 'cities']
  },

  // =================== GESCHICHTE ===================
  
  // Grade 2 History Templates
  {
    id: 'history_2_time_periods',
    category: 'Geschichte',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Gegenstände der richtigen Zeit zu:',
    parameters: [
      { name: 'items', type: 'list', values: ['Schwert', 'Auto', 'Computer', 'Dampflok'] }
    ],
    explanation: 'Zeitliche Einordnung von Gegenständen',
    difficulty: 'easy',
    topics: ['timeline', 'objects', 'chronology']
  },

  // Grade 3 History Templates
  {
    id: 'history_3_ancient_civilizations',
    category: 'Geschichte',
    grade: 3,
    type: 'multiple-choice',
    template: 'Welches Volk baute die {monument}?',
    parameters: [
      { name: 'monument', type: 'word', values: ['Pyramiden', 'Akropolis', 'Kolosseum', 'Stonehenge'] }
    ],
    explanation: 'Antike Völker und ihre Bauwerke',
    difficulty: 'medium',
    topics: ['ancient_civilizations', 'monuments']
  },

  // =================== NATURWISSENSCHAFTEN ===================
  
  // Grade 2 Science Templates
  {
    id: 'science_2_animals_habitats',
    category: 'Naturwissenschaften',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Tiere ihren Lebensräumen zu:',
    parameters: [
      { name: 'animals', type: 'list', values: ['Fisch', 'Vogel', 'Bär', 'Kamel'] }
    ],
    explanation: 'Tiere und ihre Lebensräume',
    difficulty: 'easy',
    topics: ['animals', 'habitats', 'biology']
  },
  {
    id: 'science_2_plant_parts',
    category: 'Naturwissenschaften',
    grade: 2,
    type: 'word-selection',
    template: 'Welche Teile gehören zu einer Pflanze?',
    parameters: [
      { name: 'plant_parts', type: 'list', values: ['Wurzel', 'Stamm', 'Blätter', 'Blüte'] }
    ],
    explanation: 'Teile einer Pflanze',
    difficulty: 'easy',
    topics: ['plants', 'biology', 'parts']
  },

  // Grade 3 Science Templates
  {
    id: 'science_3_states_of_matter',
    category: 'Naturwissenschaften',
    grade: 3,
    type: 'multiple-choice',
    template: 'In welchem Zustand ist Wasser bei {temperature}°C?',
    parameters: [
      { name: 'temperature', type: 'number', range: [-10, 110] }
    ],
    explanation: 'Aggregatzustände von Wasser',
    difficulty: 'medium',
    topics: ['physics', 'states_of_matter', 'water']
  },

  // Grade 4 Science Templates
  {
    id: 'science_4_solar_system',
    category: 'Naturwissenschaften',
    grade: 4,
    type: 'text-input',
    template: 'Welcher Planet ist der {position}. Planet von der Sonne?',
    parameters: [
      { name: 'position', type: 'word', values: ['erste', 'zweite', 'dritte', 'vierte', 'fünfte'] }
    ],
    explanation: 'Reihenfolge der Planeten',
    difficulty: 'hard',
    topics: ['astronomy', 'solar_system', 'planets']
  },

  // =================== LATEIN ===================
  
  // Grade 3 Latin Templates
  {
    id: 'latin_3_basic_vocabulary',
    category: 'Latein',
    grade: 3,
    type: 'text-input',
    template: 'Was bedeutet das lateinische Wort "{latin_word}" auf Deutsch?',
    parameters: [
      { name: 'latin_word', type: 'word', values: ['aqua', 'terra', 'vita', 'amor', 'pax'] }
    ],
    explanation: 'Grundvokabular Latein',
    difficulty: 'medium',
    topics: ['vocabulary', 'translation']
  },
  {
    id: 'latin_3_numbers',
    category: 'Latein',
    grade: 3,
    type: 'multiple-choice',
    template: 'Wie heißt die Zahl {number} auf Lateinisch?',
    parameters: [
      { name: 'number', type: 'number', range: [1, 10] }
    ],
    explanation: 'Lateinische Zahlen',
    difficulty: 'medium',
    topics: ['numbers', 'latin_numerals']
  }
];

// Template selection and generation utilities
export function getTemplatesForCategory(category: string, grade: number): QuestionTemplate[] {
  return questionTemplates.filter(t => t.category === category && t.grade === grade);
}

export function getTemplatesByDifficulty(category: string, grade: number, difficulty: 'easy' | 'medium' | 'hard'): QuestionTemplate[] {
  return questionTemplates.filter(t => 
    t.category === category && 
    t.grade === grade && 
    t.difficulty === difficulty
  );
}

export function selectTemplateIntelligently(
  availableTemplates: QuestionTemplate[], 
  usedTemplates: Map<string, number>,
  preferredDifficulty?: 'easy' | 'medium' | 'hard'
): QuestionTemplate | null {
  if (availableTemplates.length === 0) return null;

  // Filter by difficulty if specified
  let candidateTemplates = preferredDifficulty 
    ? availableTemplates.filter(t => t.difficulty === preferredDifficulty)
    : availableTemplates;

  // If no templates match the preferred difficulty, use all available
  if (candidateTemplates.length === 0) {
    candidateTemplates = availableTemplates;
  }

  // Sort by usage count (least used first) and then by variety
  const sortedTemplates = candidateTemplates.sort((a, b) => {
    const usageA = usedTemplates.get(a.id) || 0;
    const usageB = usedTemplates.get(b.id) || 0;
    
    if (usageA !== usageB) {
      return usageA - usageB; // Prefer less used templates
    }
    
    // If usage is equal, prefer different question types for variety
    if (a.type !== b.type) {
      return Math.random() - 0.5;
    }
    
    return Math.random() - 0.5; // Random if everything else is equal
  });

  return sortedTemplates[0];
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
      const options = generateMultipleChoiceOptions(correctAnswer, template, params);
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
  // Math calculations
  if (template.id.includes('addition')) {
    return params.a + params.b;
  } else if (template.id.includes('subtraction')) {
    return params.a - params.b;
  } else if (template.id.includes('multiplication')) {
    return params.a * params.b;
  } else if (template.id.includes('division')) {
    const dividend = params.divisor * params.quotient;
    params.dividend = dividend; // Set for template rendering
    return params.quotient;
  } else if (template.id.includes('counting')) {
    return params.count;
  } else if (template.id.includes('area_rectangle')) {
    return params.length * params.width;
  } else if (template.id.includes('decimal_addition')) {
    const num1 = parseFloat(`${params.a}.${params.decimal1}`);
    const num2 = parseFloat(`${params.b}.${params.decimal2}`);
    return Math.round((num1 + num2) * 100) / 100;
  }
  
  // Language/content calculations
  else if (template.id.includes('syllables')) {
    return countSyllables(params.word);
  } else if (template.id.includes('word_problems')) {
    if (template.id.includes('money')) {
      return params.amount1 + params.amount2;
    }
    return params.initial + params.additional;
  } else if (template.id.includes('numbers_english')) {
    const numberNames = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    return numberNames[params.number] || params.number.toString();
  } else if (template.id.includes('capitals')) {
    const capitals: Record<string, string> = {
      'Frankreich': 'Paris',
      'Italien': 'Rom',
      'Spanien': 'Madrid',
      'Polen': 'Warschau',
      'Österreich': 'Wien'
    };
    return capitals[params.country] || '';
  } else if (template.id.includes('latin_vocabulary')) {
    const translations: Record<string, string> = {
      'aqua': 'Wasser',
      'terra': 'Erde',
      'vita': 'Leben',
      'amor': 'Liebe',
      'pax': 'Frieden'
    };
    return translations[params.latin_word] || '';
  } else if (template.id.includes('states_of_matter')) {
    if (params.temperature <= 0) return 'fest (Eis)';
    if (params.temperature >= 100) return 'gasförmig (Wasserdampf)';
    return 'flüssig';
  } else if (template.id.includes('solar_system')) {
    const planets = ['Merkur', 'Venus', 'Erde', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptun'];
    const positions = ['erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte'];
    const index = positions.indexOf(params.position);
    return planets[index] || '';
  }
  
  return '';
}

function generateMultipleChoiceOptions(correctAnswer: string | number, template: QuestionTemplate, params: Record<string, any>): string[] {
  const options = [correctAnswer.toString()];
  const answerNum = typeof correctAnswer === 'number' ? correctAnswer : parseInt(correctAnswer.toString()) || 0;
  
  // Generate context-appropriate wrong answers
  if (template.id.includes('comparison') || template.id.includes('number_comparison')) {
    // For number comparison, include the other number as an option
    if (params.a && params.b) {
      const otherNumber = params.a === Math.max(params.a, params.b) ? params.b : params.a;
      if (!options.includes(otherNumber.toString())) {
        options.push(otherNumber.toString());
      }
    }
  } else if (template.id.includes('german_states')) {
    const stateOptions = ['Bayern', 'Nordrhein-Westfalen', 'Berlin', 'Hamburg', 'Sachsen'];
    stateOptions.forEach(state => {
      if (options.length < 4 && !options.includes(state)) {
        options.push(state);
      }
    });
  } else if (template.id.includes('colors')) {
    const colorOptions = ['red', 'green', 'blue', 'yellow', 'black', 'white'];
    colorOptions.forEach(color => {
      if (options.length < 4 && !options.includes(color)) {
        options.push(color);
      }
    });
  } else if (template.id.includes('capitals')) {
    const capitalOptions = ['Berlin', 'London', 'Paris', 'Rom', 'Madrid', 'Wien'];
    capitalOptions.forEach(capital => {
      if (options.length < 4 && !options.includes(capital) && capital !== correctAnswer.toString()) {
        options.push(capital);
      }
    });
  }
  
  // Fill remaining slots with generic variations for math problems
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
  if (template.id.includes('letters_recognition')) {
    const words = ['Maus', 'Auto', 'Haus', 'Baum', 'Mond', 'Sonne', 'Katze', 'Hund', 'Lampe', 'Tisch'];
    const targetLetter = params.letter;
    
    return words.map((word, index) => ({
      word,
      isCorrect: word.toUpperCase().includes(targetLetter.toUpperCase()),
      index
    }));
  } else if (template.id.includes('plant_parts')) {
    const allWords = ['Wurzel', 'Stamm', 'Blätter', 'Blüte', 'Motor', 'Rad', 'Fenster', 'Tisch'];
    const correctWords = ['Wurzel', 'Stamm', 'Blätter', 'Blüte'];
    
    return allWords.map((word, index) => ({
      word,
      isCorrect: correctWords.includes(word),
      index
    }));
  }
  
  // Default word selection
  const words = ['Wort1', 'Wort2', 'Wort3', 'Wort4', 'Wort5', 'Wort6'];
  return words.map((word, index) => ({
    word,
    isCorrect: index < 2, // First two words are correct by default
    index
  }));
}

function generateMatchingQuestion(template: QuestionTemplate, params: Record<string, any>) {
  if (template.id.includes('sentence_building')) {
    const parts = params.sentence_parts || ['Der Hund', 'bellt', 'laut'];
    const items = parts.map((part: string, index: number) => ({
      id: `part_${index}`,
      content: part,
      category: index === 0 ? 'subject' : index === 1 ? 'verb' : 'adjective'
    }));
    
    const categories = [
      { id: 'subject', name: 'Subjekt', acceptsItems: items.filter(i => i.category === 'subject').map(i => i.id) },
      { id: 'verb', name: 'Verb', acceptsItems: items.filter(i => i.category === 'verb').map(i => i.id) },
      { id: 'adjective', name: 'Adjektiv', acceptsItems: items.filter(i => i.category === 'adjective').map(i => i.id) }
    ];
    
    return { items, categories };
  } else if (template.id.includes('animals_habitats')) {
    const animalHabitats = [
      { animal: 'Fisch', habitat: 'Wasser' },
      { animal: 'Vogel', habitat: 'Luft' },
      { animal: 'Bär', habitat: 'Wald' },
      { animal: 'Kamel', habitat: 'Wüste' }
    ];
    
    const items = animalHabitats.map((pair, index) => ({
      id: `animal_${index}`,
      content: pair.animal,
      category: pair.habitat.toLowerCase()
    }));
    
    const categories = [
      { id: 'wasser', name: 'Wasser', acceptsItems: items.filter(i => i.category === 'wasser').map(i => i.id) },
      { id: 'luft', name: 'Luft', acceptsItems: items.filter(i => i.category === 'luft').map(i => i.id) },
      { id: 'wald', name: 'Wald', acceptsItems: items.filter(i => i.category === 'wald').map(i => i.id) },
      { id: 'wüste', name: 'Wüste', acceptsItems: items.filter(i => i.category === 'wüste').map(i => i.id) }
    ];
    
    return { items, categories };
  }
  
  // Default matching structure
  const items = [
    { id: 'item1', content: 'Item 1', category: 'category1' },
    { id: 'item2', content: 'Item 2', category: 'category2' }
  ];
  
  const categories = [
    { id: 'category1', name: 'Kategorie 1', acceptsItems: ['item1'] },
    { id: 'category2', name: 'Kategorie 2', acceptsItems: ['item2'] }
  ];
  
  return { items, categories };
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

// Quality assurance function
export function validateTemplate(template: QuestionTemplate): boolean {
  // Check required fields
  if (!template.id || !template.category || !template.grade || !template.type) {
    return false;
  }
  
  // Check parameters
  for (const param of template.parameters) {
    if (!param.name || !param.type) {
      return false;
    }
    
    if (param.type === 'number' && !param.range) {
      return false;
    }
    
    if ((param.type === 'word' || param.type === 'list') && (!param.values || param.values.length === 0)) {
      return false;
    }
  }
  
  return true;
}

// Get template statistics
export function getTemplateStats() {
  const stats = {
    total: questionTemplates.length,
    byCategory: {} as Record<string, number>,
    byGrade: {} as Record<number, number>,
    byDifficulty: {} as Record<string, number>,
    byType: {} as Record<string, number>
  };
  
  questionTemplates.forEach(template => {
    // By category
    stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;
    
    // By grade
    stats.byGrade[template.grade] = (stats.byGrade[template.grade] || 0) + 1;
    
    // By difficulty
    stats.byDifficulty[template.difficulty] = (stats.byDifficulty[template.difficulty] || 0) + 1;
    
    // By type
    stats.byType[template.type] = (stats.byType[template.type] || 0) + 1;
  });
  
  return stats;
}
