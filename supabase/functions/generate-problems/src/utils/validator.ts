import { 
  ProblemRequestSchema, 
  GeneratedProblemsSchema,
  ValidationError,
  type ProblemRequest 
} from "../types.ts";

// Validate incoming problem request
export function validateProblemRequest(data: unknown) {
  return ProblemRequestSchema.safeParse(data);
}

// Validate generated problems from Gemini
export function validateGeneratedProblems(data: unknown) {
  const result = GeneratedProblemsSchema.safeParse(data);
  
  if (!result.success) {
    throw new ValidationError(
      'Generated problems validation failed',
      result.error.errors
    );
  }
  
  return result.data;
}

// Content validation helpers
export function validateQuestionContent(question: string, category: string, grade: number): boolean {
  // Basic content validation
  if (!question || question.trim().length < 5) {
    return false;
  }
  
  // Category-specific validation
  switch (category.toLowerCase()) {
    case 'mathematik':
    case 'math':
      return validateMathQuestion(question, grade);
    case 'deutsch':
    case 'german':
      return validateGermanQuestion(question, grade);
    case 'englisch':
    case 'english':
      return validateEnglishQuestion(question, grade);
    default:
      return validateGenericQuestion(question, grade);
  }
}

function validateMathQuestion(question: string, grade: number): boolean {
  const hasNumbers = /\d/.test(question);
  const hasMathTerms = /\+|\-|\×|\÷|=|berechne|löse|rechne/.test(question.toLowerCase());
  
  // Grade-appropriate complexity
  if (grade <= 2 && /\d{3,}/.test(question)) return false; // No numbers > 99 for grades 1-2
  if (grade <= 4 && /\d{4,}/.test(question)) return false; // No numbers > 999 for grades 3-4
  
  return hasNumbers || hasMathTerms;
}

function validateGermanQuestion(question: string, grade: number): boolean {
  const hasGermanTerms = /wort|satz|verb|nomen|adjektiv|grammatik|rechtschreibung/.test(question.toLowerCase());
  const appropriateLength = grade <= 4 ? question.length <= 200 : question.length <= 500;
  
  return hasGermanTerms && appropriateLength;
}

function validateEnglishQuestion(question: string, grade: number): boolean {
  const hasEnglishTerms = /english|verb|noun|adjective|grammar|tense/.test(question.toLowerCase());
  const appropriateComplexity = grade <= 6 ? !/subjunctive|conditional/.test(question.toLowerCase()) : true;
  
  return hasEnglishTerms && appropriateComplexity;
}

function validateGenericQuestion(question: string, grade: number): boolean {
  const minLength = grade <= 4 ? 10 : 15;
  const maxLength = grade <= 4 ? 150 : 300;
  
  return question.length >= minLength && question.length <= maxLength;
}

// Uniqueness validation
export function calculateQuestionSimilarity(question1: string, question2: string): number {
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  const q1 = normalize(question1);
  const q2 = normalize(question2);
  
  // Exact match
  if (q1 === q2) return 1.0;
  
  // Word overlap calculation
  const words1 = q1.split(/\s+/).filter(w => w.length > 2);
  const words2 = q2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const intersection = words1.filter(w => words2.includes(w));
  const union = [...new Set([...words1, ...words2])];
  
  const jaccardSimilarity = intersection.length / union.length;
  
  // Pattern-based similarity (for math questions)
  const mathPattern1 = q1.match(/\d+\s*[+\-×÷]\s*\d+/g);
  const mathPattern2 = q2.match(/\d+\s*[+\-×÷]\s*\d+/g);
  
  if (mathPattern1 && mathPattern2) {
    const patternSimilarity = mathPattern1.some(p1 => 
      mathPattern2.some(p2 => p1 === p2)
    ) ? 0.8 : 0;
    
    return Math.max(jaccardSimilarity, patternSimilarity);
  }
  
  return jaccardSimilarity;
}

// Curriculum alignment validation
export function validateCurriculumAlignment(question: string, category: string, grade: number): number {
  // Return a score between 0 and 1 indicating curriculum alignment
  const categoryKeywords = getCategoryKeywords(category, grade);
  const questionLower = question.toLowerCase();
  
  let matchCount = 0;
  let totalKeywords = categoryKeywords.length;
  
  for (const keyword of categoryKeywords) {
    if (questionLower.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  // Grade-appropriate complexity check
  const complexityScore = validateComplexityForGrade(question, grade);
  
  // Combine keyword matching with complexity appropriateness
  const keywordScore = totalKeywords > 0 ? matchCount / totalKeywords : 0.5;
  return (keywordScore * 0.7) + (complexityScore * 0.3);
}

function getCategoryKeywords(category: string, grade: number): string[] {
  const keywordSets: { [key: string]: { [grade: number]: string[] } } = {
    'mathematik': {
      1: ['addition', 'subtraktion', 'zahlen', 'zählen', 'plus', 'minus'],
      2: ['einmaleins', 'multiplikation', 'verdoppeln', 'halbieren'],
      3: ['division', 'teilen', 'bruch', 'geometrie'],
      4: ['schriftlich', 'dezimal', 'komma', 'prozent'],
      5: ['bruchrechnung', 'prozentrechnung', 'gleichung'],
    },
    'math': {
      1: ['addition', 'subtraktion', 'zahlen', 'zählen', 'plus', 'minus'],
      2: ['einmaleins', 'multiplikation', 'verdoppeln', 'halbieren'],
      3: ['division', 'teilen', 'bruch', 'geometrie'],
      4: ['schriftlich', 'dezimal', 'komma', 'prozent'],
      5: ['bruchrechnung', 'prozentrechnung', 'gleichung'],
    },
    'deutsch': {
      1: ['buchstabe', 'silbe', 'wort', 'groß', 'klein'],
      2: ['satzzeichen', 'nomen', 'verb', 'punkt', 'komma'],
      3: ['adjektiv', 'zeitform', 'präsens', 'präteritum'],
      4: ['satzglied', 'subjekt', 'prädikat', 'objekt'],
      5: ['konjugation', 'deklination', 'fall', 'kasus'],
    },
    'german': {
      1: ['buchstabe', 'silbe', 'wort', 'groß', 'klein'],
      2: ['satzzeichen', 'nomen', 'verb', 'punkt', 'komma'],
      3: ['adjektiv', 'zeitform', 'präsens', 'präteritum'],
      4: ['satzglied', 'subjekt', 'prädikat', 'objekt'],
      5: ['konjugation', 'deklination', 'fall', 'kasus'],
    }
  };
  
  const categorySet = keywordSets[category.toLowerCase()];
  if (!categorySet) return [];
  
  // Get keywords for the specific grade, or fall back to lower grades
  for (let g = grade; g >= 1; g--) {
    if (categorySet[g]) {
      return categorySet[g];
    }
  }
  
  return [];
}

function validateComplexityForGrade(question: string, grade: number): number {
  const wordCount = question.split(/\s+/).length;
  const hasComplexWords = /\w{8,}/.test(question);
  const hasComplexStructure = /[,;:]/.test(question);
  
  // Define complexity expectations by grade
  const expectedComplexity = {
    1: { maxWords: 10, allowComplex: false },
    2: { maxWords: 15, allowComplex: false },
    3: { maxWords: 20, allowComplex: false },
    4: { maxWords: 25, allowComplex: true },
    5: { maxWords: 30, allowComplex: true },
    6: { maxWords: 35, allowComplex: true },
    7: { maxWords: 40, allowComplex: true },
    8: { maxWords: 45, allowComplex: true },
    9: { maxWords: 50, allowComplex: true },
    10: { maxWords: 60, allowComplex: true }
  };
  
  const gradeExpectation = expectedComplexity[grade as keyof typeof expectedComplexity] || 
                          expectedComplexity[10];
  
  // Calculate complexity score
  let score = 1.0;
  
  // Penalize if too complex for grade
  if (wordCount > gradeExpectation.maxWords) {
    score -= 0.2;
  }
  
  if (!gradeExpectation.allowComplex && (hasComplexWords || hasComplexStructure)) {
    score -= 0.3;
  }
  
  // Penalize if too simple for higher grades
  if (grade >= 7 && wordCount < 15 && !hasComplexWords) {
    score -= 0.2;
  }
  
  return Math.max(0, Math.min(1, score));
}