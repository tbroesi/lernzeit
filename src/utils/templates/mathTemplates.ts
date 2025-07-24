
import { QuestionTemplate } from '../questionTemplates';

export const mathTemplates: QuestionTemplate[] = [
  // =================== GRADE 1 MATH TEMPLATES ===================
  
  // Basic Addition - Extended
  {
    id: 'math_1_addition_single_digit',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 5] },
      { name: 'b', type: 'number', range: [1, 5] }
    ],
    explanation: 'Einfache Addition kleiner Zahlen',
    difficulty: 'easy',
    topics: ['addition', 'single_digit']
  },
  {
    id: 'math_1_addition_with_ten',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [6, 10] },
      { name: 'b', type: 'number', range: [1, 10], constraints: (b, params) => params.a + b <= 20 }
    ],
    explanation: 'Addition im Zahlenraum bis 20',
    difficulty: 'medium',
    topics: ['addition', 'zahlenraum_20']
  },

  // Basic Subtraction - Extended
  {
    id: 'math_1_subtraction_small',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: '{a} - {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [5, 10] },
      { name: 'b', type: 'number', range: [1, 5], constraints: (b, params) => b < params.a }
    ],
    explanation: 'Einfache Subtraktion kleiner Zahlen',
    difficulty: 'easy',
    topics: ['subtraction', 'small_numbers']
  },

  // Counting - Extended
  {
    id: 'math_1_counting_sequence',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: 'Welche Zahl kommt nach {number}?',
    parameters: [
      { name: 'number', type: 'number', range: [1, 19] }
    ],
    explanation: 'Zahlenfolge fortsetzen',
    difficulty: 'easy',
    topics: ['counting', 'sequence', 'numbers']
  },
  {
    id: 'math_1_counting_backwards',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: 'Welche Zahl kommt vor {number}?',
    parameters: [
      { name: 'number', type: 'number', range: [2, 20] }
    ],
    explanation: 'Rückwärts zählen',
    difficulty: 'medium',
    topics: ['counting', 'backwards', 'numbers']
  },

  // =================== GRADE 2 MATH TEMPLATES ===================
  
  // Two-digit Addition
  {
    id: 'math_2_addition_two_digit_easy',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [10, 30] },
      { name: 'b', type: 'number', range: [10, 30] }
    ],
    explanation: 'Addition zweistelliger Zahlen ohne Übertrag',
    difficulty: 'medium',
    topics: ['addition', 'two_digit', 'no_carry']
  },
  {
    id: 'math_2_addition_with_carry',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [15, 45] },
      { name: 'b', type: 'number', range: [15, 45] }
    ],
    explanation: 'Addition mit Zehnerübertrag',
    difficulty: 'hard',
    topics: ['addition', 'carry', 'two_digit']
  },

  // FIXED: Multiplication Introduction with explicit parameters
  {
    id: 'math_2_multiplication_by_2',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{a} × {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 10] },
      { name: 'b', type: 'number', range: [2, 2] } // Fixed to always be 2
    ],
    explanation: 'Multiplikation mit 2',
    difficulty: 'medium',
    topics: ['multiplication', 'times_two']
  },
  {
    id: 'math_2_multiplication_by_5',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: '{a} × {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 10] },
      { name: 'b', type: 'number', range: [5, 5] } // Fixed to always be 5
    ],
    explanation: 'Multiplikation mit 5',
    difficulty: 'medium',
    topics: ['multiplication', 'times_five']
  },

  // =================== GRADE 3 MATH TEMPLATES ===================
  
  // FIXED: Advanced Multiplication with explicit parameters
  {
    id: 'math_3_multiplication_table_6',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{a} × {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 10] },
      { name: 'b', type: 'number', range: [6, 6] } // Fixed to always be 6
    ],
    explanation: '6er Einmaleins',
    difficulty: 'medium',
    topics: ['multiplication', 'times_six', 'einmaleins']
  },
  {
    id: 'math_3_multiplication_table_7',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{a} × {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 10] },
      { name: 'b', type: 'number', range: [7, 7] } // Fixed to always be 7
    ],
    explanation: '7er Einmaleins',
    difficulty: 'hard',
    topics: ['multiplication', 'times_seven', 'einmaleins']
  },

  // General multiplication table practice
  {
    id: 'math_3_multiplication_general',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{a} × {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [2, 10] },
      { name: 'b', type: 'number', range: [2, 10] }
    ],
    explanation: 'Allgemeine Multiplikation',
    difficulty: 'medium',
    topics: ['multiplication', 'general', 'einmaleins']
  },

  // Division with Remainders
  {
    id: 'math_3_division_with_remainder',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: '{dividend} ÷ {divisor} = ? Rest ?',
    parameters: [
      { name: 'dividend', type: 'number', range: [10, 50] },
      { name: 'divisor', type: 'number', range: [3, 7] }
    ],
    explanation: 'Division mit Rest',
    difficulty: 'hard',
    topics: ['division', 'remainder']
  },

  // =================== GRADE 4 MATH TEMPLATES ===================
  
  // Large Number Operations
  {
    id: 'math_4_addition_hundreds',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{a} + {b} = ?',
    parameters: [
      { name: 'a', type: 'number', range: [100, 500] },
      { name: 'b', type: 'number', range: [100, 400] }
    ],
    explanation: 'Addition im Hunderterbereich',
    difficulty: 'medium',
    topics: ['addition', 'hundreds', 'large_numbers']
  },

  // Advanced Geometry
  {
    id: 'math_4_perimeter_rectangle',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: 'Ein Rechteck hat die Länge {length} cm und die Breite {width} cm. Wie groß ist der Umfang?',
    parameters: [
      { name: 'length', type: 'number', range: [5, 15] },
      { name: 'width', type: 'number', range: [3, 12] }
    ],
    explanation: 'Umfang eines Rechtecks berechnen',
    difficulty: 'medium',
    topics: ['geometry', 'perimeter', 'rectangle']
  },

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
    explanation: 'Fläche eines Rechtecks berechnen',
    difficulty: 'medium',
    topics: ['geometry', 'area', 'rectangle']
  },

  // =================== MULTIPLE CHOICE TEMPLATES ===================
  {
    id: 'math_2_multiple_choice_addition',
    category: 'Mathematik',
    grade: 2,
    type: 'multiple-choice',
    template: 'Was ist {a} + {b}?',
    parameters: [
      { name: 'a', type: 'number', range: [10, 50] },
      { name: 'b', type: 'number', range: [10, 50] }
    ],
    explanation: 'Addition mit Multiple Choice',
    difficulty: 'medium',
    topics: ['addition', 'multiple_choice']
  },

  {
    id: 'math_3_multiple_choice_multiplication',
    category: 'Mathematik',
    grade: 3,
    type: 'multiple-choice',
    template: 'Was ist {a} × {b}?',
    parameters: [
      { name: 'a', type: 'number', range: [2, 9] },
      { name: 'b', type: 'number', range: [2, 9] }
    ],
    explanation: 'Multiplikation mit Multiple Choice',
    difficulty: 'medium',
    topics: ['multiplication', 'multiple_choice']
  },

  // =================== WORD SELECTION TEMPLATES ===================
  {
    id: 'math_3_word_selection_even_odd',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: 'Ist die Zahl {number} gerade oder ungerade?',
    parameters: [
      { name: 'number', type: 'number', range: [2, 20] }
    ],
    explanation: 'Gerade und ungerade Zahlen erkennen',
    difficulty: 'easy',
    topics: ['numbers', 'even_odd']
  },

  // =================== DIVISION TEMPLATES ===================
  {
    id: 'math_4_division_word_problem',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{total} Äpfel sollen gleichmäßig auf {groups} Kinder verteilt werden. Wie viele bekommt jedes Kind?',
    parameters: [
      { name: 'total', type: 'number', range: [20, 60] },
      { name: 'groups', type: 'number', range: [2, 6] }
    ],
    explanation: 'Division in Textaufgaben',
    difficulty: 'medium',
    topics: ['division', 'word_problem']
  },

  // =================== MORE VARIED TEXT INPUT ===================
  {
    id: 'math_2_word_problem_money',
    category: 'Mathematik',
    grade: 2,
    type: 'text-input',
    template: 'Anna hat {money1} Euro und bekommt {money2} Euro dazu. Wie viel Geld hat sie jetzt?',
    parameters: [
      { name: 'money1', type: 'number', range: [5, 25] },
      { name: 'money2', type: 'number', range: [3, 20] }
    ],
    explanation: 'Geld addieren in Textaufgaben',
    difficulty: 'medium',
    topics: ['addition', 'money', 'word_problem']
  },

  {
    id: 'math_3_word_problem_time',
    category: 'Mathematik',
    grade: 3,
    type: 'text-input',
    template: 'Ein Film dauert {duration} Minuten. Wie viele Stunden und Minuten sind das?',
    parameters: [
      { name: 'duration', type: 'number', range: [70, 150] }
    ],
    explanation: 'Zeit umrechnen: Minuten in Stunden und Minuten',
    difficulty: 'medium',
    topics: ['time', 'conversion', 'word_problem']
  },

  {
    id: 'math_4_division_simple',
    category: 'Mathematik',
    grade: 4,
    type: 'text-input',
    template: '{dividend} ÷ {divisor} = ?',
    parameters: [
      { name: 'dividend', type: 'number', range: [20, 80] },
      { name: 'divisor', type: 'number', range: [2, 8] }
    ],
    explanation: 'Einfache Division ohne Rest',
    difficulty: 'medium',
    topics: ['division', 'exact']
  },

  {
    id: 'math_1_number_comparison',
    category: 'Mathematik',
    grade: 1,
    type: 'text-input',
    template: 'Welche Zahl ist größer: {a} oder {b}?',
    parameters: [
      { name: 'a', type: 'number', range: [1, 20] },
      { name: 'b', type: 'number', range: [1, 20] }
    ],
    explanation: 'Zahlen vergleichen',
    difficulty: 'easy',
    topics: ['comparison', 'numbers']
  }
];
