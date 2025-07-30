/**
 * Semantic Duplicate Detector for Math Questions
 * Simpler implementation focused on math-specific duplicate detection
 */

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  reason?: string;
}

export class SemanticDuplicateDetector {
  private cache: Map<string, string[]> = new Map();

  /**
   * Initialize detector for a user and grade
   */
  initialize(userId: string, grade: number): void {
    const key = `${userId}-${grade}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, []);
    }
  }

  /**
   * Check if a question is a duplicate
   */
  checkDuplicate(
    questionText: string,
    userId: string,
    grade: number,
    existingQuestions: string[] = []
  ): DuplicateCheckResult {
    const key = `${userId}-${grade}`;
    const storedQuestions = this.cache.get(key) || [];
    const allQuestions = [...storedQuestions, ...existingQuestions];

    // Check exact duplicates first
    if (allQuestions.includes(questionText)) {
      return {
        isDuplicate: true,
        similarity: 1.0,
        reason: 'Exact duplicate'
      };
    }

    // Check semantic similarity
    for (const existing of allQuestions) {
      const similarity = this.calculateSimilarity(questionText, existing);
      if (similarity > 0.8) {
        return {
          isDuplicate: true,
          similarity,
          reason: 'High semantic similarity'
        };
      }
    }

    return {
      isDuplicate: false,
      similarity: 0
    };
  }

  /**
   * Save a question to avoid duplicates
   */
  async saveQuestion(questionText: string, userId: string, grade: number): Promise<void> {
    const key = `${userId}-${grade}`;
    const questions = this.cache.get(key) || [];
    questions.push(questionText);
    this.cache.set(key, questions);
  }

  /**
   * Calculate similarity between two questions
   */
  private calculateSimilarity(question1: string, question2: string): number {
    // Simple similarity based on normalized text
    const normalize = (text: string) => 
      text.toLowerCase()
        .replace(/\d+/g, 'X') // Replace numbers with X
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .trim();

    const norm1 = normalize(question1);
    const norm2 = normalize(question2);

    if (norm1 === norm2) return 1.0;

    // Calculate word overlap
    const words1 = norm1.split(/\s+/);
    const words2 = norm2.split(/\s+/);
    const overlap = words1.filter(word => words2.includes(word)).length;
    const union = new Set([...words1, ...words2]).size;

    return overlap / union;
  }
}