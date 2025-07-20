import { QuestionTemplate } from '../questionTemplates';

export const extendedMathTemplates: QuestionTemplate[] = [
  // =================== GRADE 1 EXTENDED MATH TEMPLATES ===================
  
  // Zahlen kennenlernen
  {
    id: 'math_1_number_recognition_1',
    category: 'Mathematik',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welche Zahl siehst du? {number_word}',
    parameters: [
      { name: 'number_word', type: 'word', values: ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'] }
    ],
    explanation: 'Zahlwörter erkennen',
    difficulty: 'easy',
    topics: ['numbers', 'recognition', 'words']
  },
  
  {
    id: 'math_1_number_comparison',
    category: 'Mathematik',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welche Zahl ist größer: {a} oder {b}?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 10] },
      { name: 'b', type: 'number', range: [1, 10], constraints: (b, params) => b !== params.a }
    ],
    explanation: 'Zahlen vergleichen',
    difficulty: 'easy',
    topics: ['comparison', 'numbers']
  },

  {
    id: 'math_1_counting_objects',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: 'Zähle die Gegenstände: {objects}. Wie viele sind es?',
    parameters: [
      { name: 'objects', type: 'word', values: ['🍎🍎🍎', '⭐⭐⭐⭐', '🌸🌸🌸🌸🌸', '🚗🚗', '📚📚📚📚📚📚'] }
    ],
    explanation: 'Gegenstände zählen',
    difficulty: 'easy',
    topics: ['counting', 'objects', 'visual']
  },

  {
    id: 'math_1_simple_geometry_shapes',
    category: 'Mathematik',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welche Form hat {shape_count} Ecken?',
    parameters: [
      { name: 'shape_count', type: 'number', range: [3, 4] }
    ],
    explanation: 'Einfache geometrische Formen',
    difficulty: 'easy',
    topics: ['geometry', 'shapes', 'corners']
  },

  {
    id: 'math_1_pattern_recognition',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: 'Setze das Muster fort: {pattern_start}. Was kommt als nächstes?',
    parameters: [
      { name: 'pattern_start', type: 'word', values: ['1, 2, 1, 2, 1', '🔴🔵🔴🔵🔴', 'A, B, A, B, A'] }
    ],
    explanation: 'Muster erkennen und fortsetzen',
    difficulty: 'medium',
    topics: ['patterns', 'sequences', 'logic']
  },

  // =================== GRADE 2 EXTENDED MATH TEMPLATES ===================
  
  {
    id: 'math_2_doubling_numbers',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: 'Das Doppelte von {number} ist?',
    parameters: [
      { name: 'number', type: 'number', range: [1, 25] }
    ],
    explanation: 'Zahlen verdoppeln',
    difficulty: 'medium',
    topics: ['doubling', 'multiplication']
  },

  {
    id: 'math_2_halving_numbers',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: 'Die Hälfte von {number} ist?',
    parameters: [
      { name: 'number', type: 'number', range: [2, 20], constraints: (n) => n % 2 === 0 }
    ],
    explanation: 'Zahlen halbieren',
    difficulty: 'medium',
    topics: ['halving', 'division']
  },

  {
    id: 'math_2_time_reading_hours',
    category: 'Mathematik',
    grade: 2,
    type: 'multiple-choice',
    template: 'Wie spät ist es? Der große Zeiger steht auf 12, der kleine auf {hour}.',
    parameters: [
      { name: 'hour', type: 'number', range: [1, 12] }
    ],
    explanation: 'Uhrzeit ablesen (volle Stunden)',
    difficulty: 'medium',
    topics: ['time', 'clock', 'hours']
  },

  {
    id: 'math_2_money_counting_cents',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: 'Wie viel Cent sind {euro_amount} Euro?',
    parameters: [
      { name: 'euro_amount', type: 'number', range: [1, 5] }
    ],
    explanation: 'Euro in Cent umrechnen',
    difficulty: 'medium',
    topics: ['money', 'conversion', 'cents']
  },

  {
    id: 'math_2_measurement_cm_to_m',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{cm} cm sind wie viele Meter? (Antwort als Dezimalzahl)',
    parameters: [
      { name: 'cm', type: 'number', range: [100, 500], constraints: (n) => n % 100 === 0 }
    ],
    explanation: 'Zentimeter in Meter umrechnen',
    difficulty: 'hard',
    topics: ['measurement', 'conversion', 'length']
  },

  // =================== GRADE 3 EXTENDED MATH TEMPLATES ===================
  
  {
    id: 'math_3_multiplication_word_problems',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: 'Anna kauft {groups} Packungen Kekse. Jede Packung hat {items} Kekse. Wie viele Kekse hat sie insgesamt?',
    parameters: [
      { name: 'groups', type: 'number', range: [2, 8] },
      { name: 'items', type: 'number', range: [4, 12] }
    ],
    explanation: 'Multiplikation in Sachaufgaben',
    difficulty: 'medium',
    topics: ['multiplication', 'word_problems', 'real_world']
  },

  {
    id: 'math_3_fraction_introduction',
    category: 'Mathematik',
    grade: 3,
    type: 'multiple-choice',
    template: 'Ein Kuchen wird in {parts} gleiche Teile geteilt. Wie nennt man einen Teil?',
    parameters: [
      { name: 'parts', type: 'number', range: [2, 8] }
    ],
    explanation: 'Einführung in Brüche',
    difficulty: 'medium',
    topics: ['fractions', 'parts', 'introduction']
  },

  {
    id: 'math_3_area_calculation_squares',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: 'Ein Quadrat hat die Seitenlänge {side} cm. Wie groß ist seine Fläche?',
    parameters: [
      { name: 'side', type: 'number', range: [2, 8] }
    ],
    explanation: 'Flächenberechnung Quadrat',
    difficulty: 'medium',
    topics: ['geometry', 'area', 'square']
  },

  {
    id: 'math_3_rounding_to_tens',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: 'Runde {number} auf den nächsten Zehner.',
    parameters: [
      { name: 'number', type: 'number', range: [11, 99] }
    ],
    explanation: 'Runden auf Zehner',
    difficulty: 'medium',
    topics: ['rounding', 'tens', 'estimation']
  },

  {
    id: 'math_3_division_word_problems',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{total} Bonbons sollen gleichmäßig auf {children} Kinder verteilt werden. Wie viele bekommt jedes Kind?',
    parameters: [
      { name: 'total', type: 'number', range: [12, 48] },
      { name: 'children', type: 'number', range: [2, 6], constraints: (children, params) => params.total % children === 0 }
    ],
    explanation: 'Division in Sachaufgaben',
    difficulty: 'medium',
    topics: ['division', 'word_problems', 'distribution']
  },

  // =================== GRADE 4 EXTENDED MATH TEMPLATES ===================
  
  {
    id: 'math_4_decimal_addition',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [11, 99] },
      { name: 'b', type: 'number', range: [11, 99] }
    ],
    explanation: 'Addition mit Dezimalzahlen',
    difficulty: 'medium',
    topics: ['decimals', 'addition']
  },

  {
    id: 'math_4_fraction_comparison',
    category: 'Mathematik',
    grade: 4,
    type: 'multiple-choice',
    template: 'Welcher Bruch ist größer: 1/{a} oder 1/{b}?',
    parameters: [
      { name: 'a', type: 'number', range: [2, 8] },
      { name: 'b', type: 'number', range: [2, 8], constraints: (b, params) => b !== params.a }
    ],
    explanation: 'Brüche vergleichen',
    difficulty: 'hard',
    topics: ['fractions', 'comparison']
  },

  {
    id: 'math_4_coordinate_system',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Im Koordinatensystem ist ein Punkt bei x={x} und y={y}. Schreibe die Koordinaten als Punkt (x,y).',
    parameters: [
      { name: 'x', type: 'number', range: [1, 8] },
      { name: 'y', type: 'number', range: [1, 8] }
    ],
    explanation: 'Koordinatensystem',
    difficulty: 'hard',
    topics: ['coordinates', 'geometry', 'points']
  },

  {
    id: 'math_4_volume_calculation',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Ein Würfel hat die Kantenlänge {edge} cm. Wie groß ist sein Volumen?',
    parameters: [
      { name: 'edge', type: 'number', range: [2, 5] }
    ],
    explanation: 'Volumenberechnung Würfel',
    difficulty: 'hard',
    topics: ['geometry', 'volume', 'cube']
  },

  {
    id: 'math_4_mixed_operations',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{a} + {b} × {c} = ? (Punkt vor Strich beachten!)',
    parameters: [
      { name: 'a', type: 'number', range: [5, 20] },
      { name: 'b', type: 'number', range: [2, 8] },
      { name: 'c', type: 'number', range: [2, 6] }
    ],
    explanation: 'Gemischte Rechenoperationen mit Vorrang',
    difficulty: 'hard',
    topics: ['mixed_operations', 'order_of_operations', 'precedence']
  },

  {
    id: 'math_4_percentage_introduction',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Von 100 Schülern sind {part} Jungen. Wie viel Prozent sind das?',
    parameters: [
      { name: 'part', type: 'number', range: [10, 90], constraints: (n) => n % 10 === 0 }
    ],
    explanation: 'Einführung in Prozentrechnung',
    difficulty: 'hard',
    topics: ['percentage', 'introduction', 'hundred']
  }
];