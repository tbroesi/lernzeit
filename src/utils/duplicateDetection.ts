/**
 * Enhanced duplicate detection and similarity utilities for question generation
 */

export interface SimilarityResult {
  similarity: number;
  isExactMatch: boolean;
  isDuplicate: boolean;
  reason?: string;
  category?: 'exact' | 'semantic' | 'structural' | 'mathematical';
}

export interface DiversityMetrics {
  uniqueTopics: string[];
  averageSimilarity: number;
  duplicateCount: number;
  qualityScore: number;
}

/**
 * Enhanced question similarity calculation with multiple detection strategies
 */
export function calculateQuestionSimilarity(question1: string, question2: string): SimilarityResult {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s\d.,+\-×÷=]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const q1 = normalize(question1);
  const q2 = normalize(question2);
  
  // Exact match
  if (q1 === q2) {
    return { 
      similarity: 1.0, 
      isExactMatch: true, 
      isDuplicate: true,
      reason: 'Exact text match',
      category: 'exact'
    };
  }
  
  // Content hash comparison for very similar questions
  const contentHash1 = generateSimpleHash(q1);
  const contentHash2 = generateSimpleHash(q2);
  if (contentHash1 === contentHash2) {
    return { 
      similarity: 0.95, 
      isExactMatch: false, 
      isDuplicate: true,
      reason: 'Identical content hash',
      category: 'exact'
    };
  }
  
  // Mathematical pattern detection
  const mathResult = compareMathematicalPatterns(q1, q2);
  if (mathResult.isDuplicate) {
    return mathResult;
  }
  
  // Semantic similarity (word overlap)
  const semanticResult = compareSemanticSimilarity(q1, q2);
  if (semanticResult.isDuplicate) {
    return semanticResult;
  }
  
  // Structural similarity (sentence structure)
  const structuralResult = compareStructuralSimilarity(q1, q2);
  
  // Return the highest similarity found
  const results = [mathResult, semanticResult, structuralResult];
  const maxResult = results.reduce((max, curr) => 
    curr.similarity > max.similarity ? curr : max
  );
  
  return {
    ...maxResult,
    isDuplicate: maxResult.similarity > 0.7 // Stricter threshold
  };
}

/**
 * Compare mathematical patterns in questions
 */
function compareMathematicalPatterns(q1: string, q2: string): SimilarityResult {
  // Extract numbers and operators
  const mathPattern = /(\d+(?:[,.]\d+)?)\s*([+\-×÷*\/])\s*(\d+(?:[,.]\d+)?)/g;
  const patterns1 = [...q1.matchAll(mathPattern)];
  const patterns2 = [...q2.matchAll(mathPattern)];
  
  if (patterns1.length === 0 || patterns2.length === 0) {
    return { similarity: 0, isExactMatch: false, isDuplicate: false, category: 'mathematical' };
  }
  
  // Check for identical mathematical expressions
  const expressions1 = patterns1.map(m => `${m[1]}${m[2]}${m[3]}`);
  const expressions2 = patterns2.map(m => `${m[1]}${m[2]}${m[3]}`);
  
  const identicalExpressions = expressions1.filter(e1 => 
    expressions2.some(e2 => e1 === e2)
  ).length;
  
  const similarity = identicalExpressions / Math.max(expressions1.length, expressions2.length);
  
  if (similarity > 0.8) {
    return {
      similarity,
      isExactMatch: false,
      isDuplicate: true,
      reason: `${identicalExpressions} identical math expressions`,
      category: 'mathematical'
    };
  }
  
  return { similarity, isExactMatch: false, isDuplicate: false, category: 'mathematical' };
}

/**
 * Compare semantic similarity based on word overlap
 */
function compareSemanticSimilarity(q1: string, q2: string): SimilarityResult {
  const words1 = q1.split(/\s+/).filter(w => w.length > 2);
  const words2 = q2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) {
    return { similarity: 0, isExactMatch: false, isDuplicate: false, category: 'semantic' };
  }
  
  // Jaccard similarity
  const intersection = words1.filter(w => words2.includes(w));
  const union = [...new Set([...words1, ...words2])];
  const jaccardSimilarity = intersection.length / union.length;
  
  // Bonus for shared rare words (mathematical terms, specific vocabulary)
  const rareWords = ['rechteck', 'fläche', 'umfang', 'volumen', 'prozent', 'bruch'];
  const sharedRareWords = intersection.filter(w => rareWords.includes(w.toLowerCase()));
  const rareWordBonus = sharedRareWords.length > 0 ? 0.2 : 0;
  
  const similarity = Math.min(1.0, jaccardSimilarity + rareWordBonus);
  
  if (similarity > 0.75) {
    return {
      similarity,
      isExactMatch: false,
      isDuplicate: true,
      reason: `${intersection.length} shared words (${Math.round(similarity * 100)}% similarity)`,
      category: 'semantic'
    };
  }
  
  return { similarity, isExactMatch: false, isDuplicate: false, category: 'semantic' };
}

/**
 * Compare structural similarity (sentence patterns)
 */
function compareStructuralSimilarity(q1: string, q2: string): SimilarityResult {
  // Extract sentence structure patterns
  const structure1 = q1.replace(/\d+(?:[,.]\d+)?/g, 'NUM').replace(/[+\-×÷*\/]/g, 'OP');
  const structure2 = q2.replace(/\d+(?:[,.]\d+)?/g, 'NUM').replace(/[+\-×÷*\/]/g, 'OP');
  
  if (structure1 === structure2) {
    return {
      similarity: 0.8,
      isExactMatch: false,
      isDuplicate: true,
      reason: 'Identical sentence structure',
      category: 'structural'
    };
  }
  
  // Calculate edit distance for structure
  const editDistance = calculateEditDistance(structure1, structure2);
  const maxLength = Math.max(structure1.length, structure2.length);
  const similarity = maxLength > 0 ? 1 - (editDistance / maxLength) : 0;
  
  return { 
    similarity, 
    isExactMatch: false, 
    isDuplicate: similarity > 0.85,
    reason: similarity > 0.85 ? 'Very similar sentence structure' : undefined,
    category: 'structural'
  };
}

/**
 * Generate a simple hash for content comparison
 */
function generateSimpleHash(content: string): string {
  const normalized = content.replace(/\s+/g, '').toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Calculate edit distance between two strings
 */
function calculateEditDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
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

/**
 * Advanced duplicate detection with session awareness
 */
export function detectDuplicatesWithContext(
  newQuestions: string[],
  existingQuestions: string[],
  recentQuestions: string[] = [],
  options: {
    strictMode?: boolean;
    categoryWeights?: Record<string, number>;
    maxDuplicates?: number;
  } = {}
): {
  unique: string[];
  duplicates: Array<{ question: string; reason: string; similarity: number }>;
  metrics: DiversityMetrics;
} {
  const { strictMode = true, maxDuplicates = 0 } = options;
  const threshold = strictMode ? 0.65 : 0.8;
  
  const unique: string[] = [];
  const duplicates: Array<{ question: string; reason: string; similarity: number }> = [];
  const allExisting = [...existingQuestions, ...recentQuestions];
  
  for (const question of newQuestions) {
    let isDuplicate = false;
    let bestMatch: { similarity: number; reason: string } | null = null;
    
    // Check against existing questions
    for (const existing of allExisting) {
      const result = calculateQuestionSimilarity(question, existing);
      if (result.isDuplicate && result.similarity > threshold) {
        isDuplicate = true;
        bestMatch = { similarity: result.similarity, reason: result.reason || 'Similar content' };
        break;
      }
    }
    
    // Check against already accepted unique questions
    if (!isDuplicate) {
      for (const uniqueQ of unique) {
        const result = calculateQuestionSimilarity(question, uniqueQ);
        if (result.isDuplicate && result.similarity > threshold) {
          isDuplicate = true;
          bestMatch = { similarity: result.similarity, reason: result.reason || 'Similar to new question' };
          break;
        }
      }
    }
    
    if (isDuplicate && bestMatch) {
      duplicates.push({
        question,
        reason: bestMatch.reason,
        similarity: bestMatch.similarity
      });
    } else {
      unique.push(question);
    }
    
    // Stop if we have enough duplicates to report
    if (duplicates.length >= maxDuplicates && maxDuplicates > 0) {
      break;
    }
  }
  
  // Calculate diversity metrics
  const topics = extractTopics(unique);
  const similarities = unique.length > 1 ? 
    unique.slice(0, -1).map((q, i) => 
      calculateQuestionSimilarity(q, unique[i + 1]).similarity
    ) : [0];
  
  const metrics: DiversityMetrics = {
    uniqueTopics: topics,
    averageSimilarity: similarities.length > 0 ? 
      similarities.reduce((sum, s) => sum + s, 0) / similarities.length : 0,
    duplicateCount: duplicates.length,
    qualityScore: calculateQualityScore(unique, duplicates.length)
  };
  
  return { unique, duplicates, metrics };
}

/**
 * Extract topics from questions for diversity analysis
 */
function extractTopics(questions: string[]): string[] {
  const topics = new Set<string>();
  
  for (const question of questions) {
    const normalized = question.toLowerCase();
    
    // Mathematical topics
    if (normalized.includes('addier') || normalized.includes('+')) topics.add('addition');
    if (normalized.includes('subtrahier') || normalized.includes('-')) topics.add('subtraction');
    if (normalized.includes('multipli') || normalized.includes('×') || normalized.includes('*')) topics.add('multiplication');
    if (normalized.includes('divid') || normalized.includes('÷') || normalized.includes('/')) topics.add('division');
    if (normalized.includes('rechteck') || normalized.includes('fläche')) topics.add('geometry');
    if (normalized.includes('prozent') || normalized.includes('%')) topics.add('percentage');
    if (normalized.includes('bruch') || normalized.includes('½')) topics.add('fractions');
    if (normalized.includes('zeit') || normalized.includes('stunde')) topics.add('time');
    if (normalized.includes('länge') || normalized.includes('meter')) topics.add('measurement');
    if (normalized.includes('geld') || normalized.includes('euro')) topics.add('money');
    
    // German language topics
    if (normalized.includes('verb') || normalized.includes('zeitform')) topics.add('verbs');
    if (normalized.includes('substantiv') || normalized.includes('nomen')) topics.add('nouns');
    if (normalized.includes('adjektiv')) topics.add('adjectives');
    if (normalized.includes('satz') || normalized.includes('grammatik')) topics.add('grammar');
    if (normalized.includes('rechtschreibung')) topics.add('spelling');
  }
  
  return Array.from(topics);
}

/**
 * Calculate quality score based on uniqueness and diversity
 */
function calculateQualityScore(unique: string[], duplicateCount: number): number {
  if (unique.length === 0) return 0;
  
  const uniqueRatio = unique.length / (unique.length + duplicateCount);
  const diversityBonus = Math.min(1, extractTopics(unique).length / 3); // Bonus for multiple topics
  const lengthVariance = calculateLengthVariance(unique);
  
  return Math.min(1, uniqueRatio * 0.7 + diversityBonus * 0.2 + lengthVariance * 0.1);
}

/**
 * Calculate variance in question lengths (for diversity)
 */
function calculateLengthVariance(questions: string[]): number {
  if (questions.length < 2) return 0;
  
  const lengths = questions.map(q => q.length);
  const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  
  // Normalize variance to 0-1 scale (higher variance = more diversity)
  return Math.min(1, variance / 1000);
}

/**
 * Enhanced diversity-aware question filtering
 */
export function filterForDiversity(
  questions: string[],
  targetCount: number = 5,
  existingQuestions: string[] = []
): string[] {
  if (questions.length <= targetCount) return questions;
  
  const scored = questions.map(question => ({
    question,
    diversityScore: calculateDiversityScore(question, questions, existingQuestions)
  }));
  
  // Sort by diversity score (highest first) and take the top ones
  return scored
    .sort((a, b) => b.diversityScore - a.diversityScore)
    .slice(0, targetCount)
    .map(item => item.question);
}

/**
 * Calculate diversity score for a single question
 */
function calculateDiversityScore(
  question: string,
  allQuestions: string[],
  existingQuestions: string[]
): number {
  const topics = extractTopics([question]);
  const allTopics = extractTopics([...allQuestions, ...existingQuestions]);
  
  // Topic novelty (higher for rare topics)
  const topicNovelty = topics.length > 0 ? 
    topics.reduce((sum, topic) => {
      const frequency = allTopics.filter(t => t === topic).length;
      return sum + (1 / Math.max(1, frequency));
    }, 0) / topics.length : 0;
  
  // Length uniqueness
  const questionLength = question.length;
  const otherLengths = allQuestions.filter(q => q !== question).map(q => q.length);
  const lengthUniqueness = otherLengths.length > 0 ?
    Math.min(...otherLengths.map(len => Math.abs(len - questionLength))) / 100 : 1;
  
  // Similarity penalty (lower for questions similar to existing ones)
  const similarities = [...allQuestions, ...existingQuestions]
    .filter(q => q !== question)
    .map(q => calculateQuestionSimilarity(question, q).similarity);
  
  const maxSimilarity = similarities.length > 0 ? Math.max(...similarities) : 0;
  const similarityPenalty = 1 - maxSimilarity;
  
  return topicNovelty * 0.4 + lengthUniqueness * 0.2 + similarityPenalty * 0.4;
}