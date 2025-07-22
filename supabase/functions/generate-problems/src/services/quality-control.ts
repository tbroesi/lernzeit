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
    
    const overallScore = (curriculumScore * 0.4) + (contentScore * 0.3) + (engagementScore * 0.2) + (difficultyScore * 0.1);
    
    const metrics: QualityMetrics = {
      curriculum_alignment: curriculumScore,
      difficulty_appropriateness: difficultyScore,
      uniqueness_score: 1.0, // Will be set during uniqueness check
      engagement_potential: engagementScore,
      overall_score: overallScore
    };

    logger.debug('Quality evaluation completed', {
      requestId,
      questionPreview: question.question.substring(0, 50),
      metrics
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
}