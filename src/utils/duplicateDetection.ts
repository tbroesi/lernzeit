/**
 * Duplicate detection and similarity utilities for question generation
 */

export interface SimilarityResult {
  similarity: number;
  isExactMatch: boolean;
  isDuplicate: boolean;
}

/**
 * Calculate similarity between two questions
 */
export function calculateQuestionSimilarity(question1: string, question2: string): SimilarityResult {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const q1 = normalize(question1);
  const q2 = normalize(question2);
  
  // Exact match
  if (q1 === q2) {
    return { similarity: 1.0, isExactMatch: true, isDuplicate: true };
  }
  
  // Word-based similarity
  const words1 = q1.split(/\s+/).filter(w => w.length > 2);
  const words2 = q2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) {
    return { similarity: 0, isExactMatch: false, isDuplicate: false };
  }
  
  // Jaccard similarity
  const intersection = words1.filter(w => words2.includes(w));
  const union = [...new Set([...words1, ...words2])];
  const jaccardSimilarity = intersection.length / union.length;
  
  // Pattern-based similarity for math questions
  const mathPattern1 = q1.match(/\d+\s*[+\-×÷]\s*\d+/g);
  const mathPattern2 = q2.match(/\d+\s*[+\-×÷]\s*\d+/g);
  
  let patternSimilarity = 0;
  if (mathPattern1 && mathPattern2) {
    const hasCommonPattern = mathPattern1.some(p1 => 
      mathPattern2.some(p2 => p1 === p2)
    );
    patternSimilarity = hasCommonPattern ? 0.8 : 0;
  }
  
  const finalSimilarity = Math.max(jaccardSimilarity, patternSimilarity);
  
  return {
    similarity: finalSimilarity,
    isExactMatch: false,
    isDuplicate: finalSimilarity > 0.8 // Threshold for considering questions as duplicates
  };
}

/**
 * Check if a question is too similar to any in a list of existing questions
 */
export function isDuplicateQuestion(
  newQuestion: string, 
  existingQuestions: string[], 
  threshold: number = 0.8
): boolean {
  return existingQuestions.some(existing => {
    const result = calculateQuestionSimilarity(newQuestion, existing);
    return result.similarity > threshold;
  });
}

/**
 * Filter out duplicate questions from a list
 */
export function removeDuplicateQuestions(questions: string[], threshold: number = 0.8): string[] {
  const uniqueQuestions: string[] = [];
  
  for (const question of questions) {
    if (!isDuplicateQuestion(question, uniqueQuestions, threshold)) {
      uniqueQuestions.push(question);
    }
  }
  
  return uniqueQuestions;
}

/**
 * Find the most similar question from a list
 */
export function findMostSimilarQuestion(
  targetQuestion: string, 
  candidateQuestions: string[]
): { question: string; similarity: number } | null {
  let maxSimilarity = 0;
  let mostSimilar: string | null = null;
  
  for (const candidate of candidateQuestions) {
    const result = calculateQuestionSimilarity(targetQuestion, candidate);
    if (result.similarity > maxSimilarity) {
      maxSimilarity = result.similarity;
      mostSimilar = candidate;
    }
  }
  
  return mostSimilar ? { question: mostSimilar, similarity: maxSimilarity } : null;
}