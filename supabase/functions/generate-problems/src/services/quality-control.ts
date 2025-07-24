import { validateCurriculumCompliance } from "../utils/curriculum.ts";
import { validateQuestionContent, calculateQuestionSimilarity } from "../utils/validator.ts";
import { logger } from "../utils/logger.ts";
import type { QualityMetrics, SelectionQuestion } from "../types.ts";

export class QualityControlService {
  
  // Evaluate question quality with multiple metrics
  evaluateQuestionQuality(
    question: SelectionQuestion,
    category: string,
    grade: number,
    requestId: string
  ): QualityMetrics {
    const curriculumScore = validateCurriculumCompliance(question.question, category, grade);
    const contentScore = validateQuestionContent(question.question, category, grade) ? 1.0 : 0.3;
    const engagementScore = this.calculateEngagementPotential(question);
    const difficultyScore = this.assessDifficultyAppropriateness(question, grade);
    
    // NEW: Mathematical validation for math questions
    const mathValidation = this.validateMathematicalCorrectness(question, category);
    
    const overallScore = (curriculumScore * 0.3) + (contentScore * 0.25) + (engagementScore * 0.15) + (difficultyScore * 0.1) + (mathValidation.score * 0.2);
    
    const metrics: QualityMetrics = {
      curriculum_alignment: curriculumScore,
      difficulty_appropriateness: difficultyScore,
      uniqueness_score: 1.0, // Will be set during uniqueness check
      engagement_potential: engagementScore,
      overall_score: mathValidation.isValid ? overallScore : 0.1 // Drastically reduce score for invalid math
    };

    if (!mathValidation.isValid) {
      logger.warn('Mathematical validation failed', {
        requestId,
        questionPreview: question.question.substring(0, 50),
        issue: mathValidation.issue,
        expectedAnswer: mathValidation.expectedAnswer,
        givenAnswer: mathValidation.givenAnswer
      });
    }

    logger.debug('Quality evaluation completed', {
      requestId,
      questionPreview: question.question.substring(0, 50),
      metrics,
      mathValidation
    });

    return metrics;
  }

  // Check uniqueness against existing questions
  checkUniqueness(
    question: string,
    excludedQuestions: string[],
    requestId: string
  ): { isUnique: boolean; similarityScore: number; matchedQuestion?: string } {
    let maxSimilarity = 0;
    let matchedQuestion = '';

    for (const excluded of excludedQuestions) {
      const similarity = calculateQuestionSimilarity(question, excluded);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        matchedQuestion = excluded;
      }
    }

    const isUnique = maxSimilarity < 0.7;
    
    if (!isUnique) {
      logger.warn('Non-unique question detected', {
        requestId,
        similarity: maxSimilarity,
        questionPreview: question.substring(0, 50),
        matchedPreview: matchedQuestion.substring(0, 50)
      });
    }

    return {
      isUnique,
      similarityScore: 1 - maxSimilarity,
      matchedQuestion: isUnique ? undefined : matchedQuestion
    };
  }

  private calculateEngagementPotential(question: SelectionQuestion): number {
    let score = 0.5; // Base score

    // Interactive question types get higher engagement scores
    switch (question.questionType) {
      case 'multiple-choice':
        score += 0.3;
        break;
      case 'word-selection':
        score += 0.4;
        break;
      case 'matching':
        score += 0.4;
        break;
      case 'text-input':
        score += 0.1;
        break;
    }

    // Check for engaging content patterns
    const questionLower = question.question.toLowerCase();
    if (questionLower.includes('warum') || questionLower.includes('erkläre')) score += 0.1;
    if (questionLower.includes('beispiel') || questionLower.includes('vergleiche')) score += 0.1;

    return Math.min(1.0, score);
  }

  private assessDifficultyAppropriateness(question: SelectionQuestion, grade: number): number {
    const wordCount = question.question.split(/\s+/).length;
    const hasComplexWords = /\w{10,}/.test(question.question);
    
    // Grade-appropriate expectations
    const gradeExpectations = {
      1: { minWords: 5, maxWords: 12, allowComplex: false },
      2: { minWords: 6, maxWords: 15, allowComplex: false },
      3: { minWords: 8, maxWords: 18, allowComplex: false },
      4: { minWords: 10, maxWords: 22, allowComplex: true },
      5: { minWords: 12, maxWords: 25, allowComplex: true },
      6: { minWords: 14, maxWords: 30, allowComplex: true },
      7: { minWords: 16, maxWords: 35, allowComplex: true },
      8: { minWords: 18, maxWords: 40, allowComplex: true },
      9: { minWords: 20, maxWords: 45, allowComplex: true },
      10: { minWords: 22, maxWords: 50, allowComplex: true }
    };

    const expectation = gradeExpectations[grade as keyof typeof gradeExpectations] || gradeExpectations[10];
    
    let score = 1.0;
    
    if (wordCount < expectation.minWords) score -= 0.3;
    if (wordCount > expectation.maxWords) score -= 0.2;
    if (!expectation.allowComplex && hasComplexWords) score -= 0.4;
    if (grade >= 7 && wordCount < 15 && !hasComplexWords) score -= 0.2;

    return Math.max(0, score);
  }

  private validateMathematicalCorrectness(question: SelectionQuestion, category: string): { isValid: boolean; score: number; issue?: string; expectedAnswer?: any; givenAnswer?: any } {
    // Only validate mathematical questions
    if (category.toLowerCase() !== 'mathematik') {
      return { isValid: true, score: 1.0 };
    }

    const questionText = question.question.toLowerCase();
    
    // Handle Roman numeral questions
    if (questionText.includes('römisch') && questionText.includes('arabisch')) {
      return this.validateRomanNumeralQuestion(question);
    }
    
    // Handle basic arithmetic
    if (this.containsBasicArithmetic(questionText)) {
      return this.validateArithmeticQuestion(question);
    }
    
    // For other math questions, assume they're valid for now
    return { isValid: true, score: 1.0 };
  }

  private validateRomanNumeralQuestion(question: SelectionQuestion): { isValid: boolean; score: number; issue?: string; expectedAnswer?: any; givenAnswer?: any } {
    const questionText = question.question;
    
    // Extract Roman numerals from the question
    const romanPattern = /([IVXLCDM]+(?:\s*[+]\s*[IVXLCDM]+)*)/i;
    const match = questionText.match(romanPattern);
    
    if (!match) {
      return { isValid: true, score: 1.0 }; // Can't validate, assume valid
    }
    
    const romanExpression = match[1];
    
    try {
      const expectedAnswer = this.calculateRomanNumeralExpression(romanExpression);
      
      // Check against the provided answer
      let givenAnswer;
      
      if (question.questionType === 'multiple-choice' && question.options && question.correctAnswer !== undefined) {
        givenAnswer = parseInt(question.options[question.correctAnswer]);
      } else if (question.questionType === 'text-input' && question.answer) {
        givenAnswer = typeof question.answer === 'number' ? question.answer : parseInt(question.answer.toString());
      }
      
      if (givenAnswer !== undefined && givenAnswer !== expectedAnswer) {
        return {
          isValid: false,
          score: 0.0,
          issue: 'Roman numeral calculation error',
          expectedAnswer,
          givenAnswer
        };
      }
      
      return { isValid: true, score: 1.0 };
      
    } catch (error) {
      return { isValid: true, score: 1.0 }; // Can't validate, assume valid
    }
  }

  private calculateRomanNumeralExpression(expression: string): number {
    // Split by + and calculate each Roman numeral
    const parts = expression.split('+').map(part => part.trim());
    let total = 0;
    
    for (const part of parts) {
      total += this.romanToArabic(part);
    }
    
    return total;
  }

  private romanToArabic(roman: string): number {
    const romanMap: { [key: string]: number } = {
      'I': 1, 'V': 5, 'X': 10, 'L': 50,
      'C': 100, 'D': 500, 'M': 1000
    };
    
    let result = 0;
    const cleanRoman = roman.toUpperCase().trim();
    
    for (let i = 0; i < cleanRoman.length; i++) {
      const current = romanMap[cleanRoman[i]];
      const next = romanMap[cleanRoman[i + 1]];
      
      if (next && current < next) {
        result += next - current;
        i++; // Skip next character
      } else {
        result += current;
      }
    }
    
    return result;
  }

  private containsBasicArithmetic(questionText: string): boolean {
    return /\d+\s*[+\-×÷*\/]\s*\d+/.test(questionText);
  }

  private validateArithmeticQuestion(question: SelectionQuestion): { isValid: boolean; score: number; issue?: string; expectedAnswer?: any; givenAnswer?: any } {
    // Basic arithmetic validation could be added here
    // For now, return valid
    return { isValid: true, score: 1.0 };
  }
}