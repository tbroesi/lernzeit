// Phase 3: Advanced math template categories for Grade 4
import { QuestionTemplate } from '../questionTemplates';

export const advancedMathTemplates: QuestionTemplate[] = [
  // =================== DECIMALS & FRACTIONS ===================
  {
    id: 'math_4_decimals_addition',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [12, 99] },
      { name: 'b', type: 'number', range: [13, 88] }
    ],
    explanation: 'Addition mit Dezimalzahlen',
    difficulty: 'medium',
    topics: ['decimals', 'addition']
  },
  
  {
    id: 'math_4_fraction_halfs',
    category: 'Mathematik',
    grade: 4,
    type: 'multiple-choice',
    template: 'Was ist die Hälfte von {number}?',
    parameters: [
      { name: 'number', type: 'number', range: [10, 40], constraints: (n) => n % 2 === 0 }
    ],
    explanation: 'Bruchrechnung: Hälfte bestimmen',
    difficulty: 'medium',
    topics: ['fractions', 'halves']
  },

  {
    id: 'math_4_fraction_quarters',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Ein Kuchen wird in 4 gleiche Teile geteilt. Wie viel ist 1/4 von {total} Stücken?',
    parameters: [
      { name: 'total', type: 'number', range: [8, 20], constraints: (n) => n % 4 === 0 }
    ],
    explanation: 'Bruchrechnung: Viertel berechnen',
    difficulty: 'medium',
    topics: ['fractions', 'quarters', 'word_problem']
  },

  // =================== TIME & MONEY ===================
  {
    id: 'math_4_time_hours_minutes',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Wie viele Minuten sind {hours} Stunden und {minutes} Minuten?',
    parameters: [
      { name: 'hours', type: 'number', range: [1, 5] },
      { name: 'minutes', type: 'number', range: [10, 50] }
    ],
    explanation: 'Zeit umrechnen: Stunden und Minuten in Minuten',
    difficulty: 'medium',
    topics: ['time', 'conversion', 'minutes']
  },

  {
    id: 'math_4_money_change',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Du kaufst etwas für {price} Euro und bezahlst mit {payment} Euro. Wie viel Wechselgeld bekommst du?',
    parameters: [
      { name: 'price', type: 'number', range: [12, 45] },
      { name: 'payment', type: 'number', range: [50, 100], constraints: (p, params) => p > params.price }
    ],
    explanation: 'Wechselgeld berechnen',
    difficulty: 'medium',
    topics: ['money', 'subtraction', 'word_problem']
  },

  // =================== ROMAN NUMERALS ===================
  {
    id: 'math_4_roman_numerals_basic',
    category: 'Mathematik',
    grade: 4,
    type: 'multiple-choice',
    template: 'Welche römische Zahl entspricht {number}?',
    parameters: [
      { name: 'number', type: 'number', range: [1, 10] }
    ],
    explanation: 'Römische Zahlen erkennen',
    difficulty: 'medium',
    topics: ['roman_numerals', 'number_systems']
  },

  {
    id: 'math_4_roman_to_arabic',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Welche Zahl stellt {roman} dar?',
    parameters: [
      { name: 'roman', type: 'word', values: ['IV', 'VI', 'VII', 'IX', 'XI', 'XII', 'XIV', 'XV'] }
    ],
    explanation: 'Römische Zahlen in arabische Zahlen umwandeln',
    difficulty: 'hard',
    topics: ['roman_numerals', 'conversion']
  },

  // =================== COORDINATE SYSTEMS ===================
  {
    id: 'math_4_coordinates_point',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Im Koordinatensystem ist ein Punkt bei x={x} und y={y}. Schreibe die Koordinaten als Punkt (x,y).',
    parameters: [
      { name: 'x', type: 'number', range: [1, 8] },
      { name: 'y', type: 'number', range: [1, 8] }
    ],
    explanation: 'Koordinaten im Koordinatensystem bestimmen',
    difficulty: 'hard',
    topics: ['coordinates', 'geometry', 'points']
  },

  {
    id: 'math_4_coordinates_distance',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Wie weit ist der Punkt (0,0) vom Punkt ({x},{y}) entfernt? (nur gerade Linien)',
    parameters: [
      { name: 'x', type: 'number', range: [3, 6] },
      { name: 'y', type: 'number', range: [3, 6] }
    ],
    explanation: 'Entfernung im Koordinatensystem messen',
    difficulty: 'hard',
    topics: ['coordinates', 'distance', 'geometry']
  },

  // =================== ADVANCED GEOMETRY ===================
  {
    id: 'math_4_triangle_perimeter',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Ein Dreieck hat die Seiten {a} cm, {b} cm und {c} cm. Wie groß ist der Umfang?',
    parameters: [
      { name: 'a', type: 'number', range: [3, 8] },
      { name: 'b', type: 'number', range: [4, 9] },
      { name: 'c', type: 'number', range: [3, 8] }
    ],
    explanation: 'Umfang eines Dreiecks berechnen',
    difficulty: 'medium',
    topics: ['geometry', 'triangle', 'perimeter']
  },

  {
    id: 'math_4_circle_diameter',
    category: 'Mathematik',
    grade: 4,
    type: 'multiple-choice',
    template: 'Ein Kreis hat den Radius {radius} cm. Wie groß ist der Durchmesser?',
    parameters: [
      { name: 'radius', type: 'number', range: [2, 8] }
    ],
    explanation: 'Durchmesser = 2 × Radius',
    difficulty: 'medium',
    topics: ['geometry', 'circle', 'diameter', 'radius']
  },

  // =================== WORD PROBLEMS ===================
  {
    id: 'math_4_word_problem_groups',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'In einer Schule sind {classes} Klassen mit je {students} Schülern. Wie viele Schüler gibt es insgesamt?',
    parameters: [
      { name: 'classes', type: 'number', range: [4, 8] },
      { name: 'students', type: 'number', range: [20, 30] }
    ],
    explanation: 'Multiplikation in Sachaufgaben',
    difficulty: 'medium',
    topics: ['multiplication', 'word_problem', 'groups']
  },

  {
    id: 'math_4_word_problem_sharing',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{total} Kekse sollen gleichmäßig auf {people} Personen verteilt werden. Wie viele bekommt jede Person?',
    parameters: [
      { name: 'total', type: 'number', range: [24, 96] },
      { name: 'people', type: 'number', range: [3, 8], constraints: (p, params) => params.total % p === 0 }
    ],
    explanation: 'Division in Sachaufgaben',
    difficulty: 'medium',
    topics: ['division', 'word_problem', 'sharing']
  },

  {
    id: 'math_4_word_problem_multi_step',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Anna hat {start} Äpfel. Sie kauft {more} dazu und verschenkt {give_away}. Wie viele hat sie jetzt?',
    parameters: [
      { name: 'start', type: 'number', range: [15, 30] },
      { name: 'more', type: 'number', range: [8, 20] },
      { name: 'give_away', type: 'number', range: [5, 15] }
    ],
    explanation: 'Mehrschrittige Textaufgabe: Addition und Subtraktion',
    difficulty: 'hard',
    topics: ['mixed_operations', 'word_problem', 'multi_step']
  }
];