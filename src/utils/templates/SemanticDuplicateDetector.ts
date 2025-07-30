/**
 * Semantic Duplicate Detection Engine
 * Advanced duplicate detection using semantic analysis and pattern matching
 */

import { SelectionQuestion } from '@/types/questionTypes';

export interface SemanticAnalysis {
  isDuplicate: boolean;
  similarity: number;
  semanticScore: number;
  structuralScore: number;
  reason: string;
  category: 'exact' | 'semantic' | 'structural' | 'conceptual' | 'none';
  confidence: number;
}

export interface SemanticProfile {
  concepts: string[];
  operations: string[];
  numbers: number[];
  structure: string;
  complexity: number;
  language: 'math' | 'german' | 'mixed';
}

export class SemanticDuplicateDetector {
  private static readonly SEMANTIC_THRESHOLD = 0.75;
  private static readonly STRUCTURAL_THRESHOLD = 0.85;
  private static readonly CONCEPTUAL_THRESHOLD = 0.90;

  /**
   * Comprehensive duplicate analysis with semantic understanding
   */
  static analyze(
    newQuestion: SelectionQuestion,
    existingQuestions: SelectionQuestion[],
    strictMode: boolean = false
  ): SemanticAnalysis {
    console.log('🔍 Semantic analysis for:', newQuestion.question.substring(0, 50) + '...');

    const newProfile = this.createSemanticProfile(newQuestion);
    
    let maxSimilarity = 0;
    let bestMatch: SelectionQuestion | null = null;
    let bestAnalysis: SemanticAnalysis | null = null;

    for (const existing of existingQuestions) {
      const existingProfile = this.createSemanticProfile(existing);
      const analysis = this.compareProfiles(newProfile, existingProfile, newQuestion, existing);
      
      if (analysis.similarity > maxSimilarity) {
        maxSimilarity = analysis.similarity;
        bestMatch = existing;
        bestAnalysis = analysis;
      }
    }

    if (bestAnalysis) {
      // Adjust thresholds based on strict mode
      const threshold = strictMode ? 0.6 : this.SEMANTIC_THRESHOLD;
      bestAnalysis.isDuplicate = bestAnalysis.similarity > threshold;
      
      if (bestAnalysis.isDuplicate) {
        console.log(`🚫 Semantic duplicate detected: ${bestAnalysis.similarity.toFixed(2)} similarity`);
      }
      
      return bestAnalysis;
    }

    return {
      isDuplicate: false,
      similarity: 0,
      semanticScore: 0,
      structuralScore: 0,
      reason: 'No significant similarity found',
      category: 'none',
      confidence: 1.0
    };
  }

  /**
   * Create a semantic profile for a question
   */
  private static createSemanticProfile(question: SelectionQuestion): SemanticProfile {
    const text = question.question.toLowerCase();
    
    return {
      concepts: this.extractConcepts(text),
      operations: this.extractOperations(text),
      numbers: this.extractNumbers(text),
      structure: this.extractStructure(text),
      complexity: this.calculateComplexity(text),
      language: this.detectLanguage(text)
    };
  }

  /**
   * Compare two semantic profiles
   */
  private static compareProfiles(
    profile1: SemanticProfile,
    profile2: SemanticProfile,
    question1: SelectionQuestion,
    question2: SelectionQuestion
  ): SemanticAnalysis {
    
    // Calculate individual similarity scores
    const conceptScore = this.calculateConceptSimilarity(profile1.concepts, profile2.concepts);
    const operationScore = this.calculateOperationSimilarity(profile1.operations, profile2.operations);
    const structuralScore = this.calculateStructuralSimilarity(profile1.structure, profile2.structure);
    const numberScore = this.calculateNumberSimilarity(profile1.numbers, profile2.numbers);
    const complexityScore = this.calculateComplexitySimilarity(profile1.complexity, profile2.complexity);
    const languageScore = profile1.language === profile2.language ? 1.0 : 0.5;

    // Calculate weighted semantic score
    const semanticScore = (
      conceptScore * 0.3 +
      operationScore * 0.25 +
      numberScore * 0.15 +
      complexityScore * 0.15 +
      languageScore * 0.15
    );

    // Calculate overall similarity
    const overallSimilarity = (
      semanticScore * 0.6 +
      structuralScore * 0.4
    );

    // Determine category and reason
    const { category, reason, confidence } = this.categorizeAnalysis(
      overallSimilarity,
      semanticScore,
      structuralScore,
      conceptScore,
      operationScore,
      structuralScore
    );

    return {
      isDuplicate: overallSimilarity > this.SEMANTIC_THRESHOLD,
      similarity: overallSimilarity,
      semanticScore,
      structuralScore,
      reason,
      category,
      confidence
    };
  }

  /**
   * Extract mathematical/educational concepts from text
   */
  private static extractConcepts(text: string): string[] {
    const concepts: string[] = [];
    
    // Mathematical concepts
    const mathConcepts = {
      'addition': ['add', 'plus', 'sum', 'zusammen', 'addier', 'hinzu'],
      'subtraction': ['minus', 'subtract', 'difference', 'weniger', 'subtrah', 'abzieh'],
      'multiplication': ['multiply', 'times', 'product', 'mal', 'multipli', 'vervielfach'],
      'division': ['divide', 'quotient', 'teil', 'divid', 'aufgeteilt'],
      'geometry': ['area', 'perimeter', 'rectangle', 'square', 'fläche', 'umfang', 'rechteck', 'quadrat'],
      'fractions': ['fraction', 'half', 'quarter', 'bruch', 'hälfte', 'viertel'],
      'time': ['hour', 'minute', 'second', 'stunde', 'minute', 'sekunde'],
      'money': ['euro', 'cent', 'dollar', 'geld', 'kosten', 'preis'],
      'comparison': ['greater', 'less', 'equal', 'größer', 'kleiner', 'gleich']
    };

    // German language concepts
    const germanConcepts = {
      'grammar': ['nomen', 'verb', 'adjektiv', 'artikel'],
      'syllables': ['silbe', 'silben'],
      'spelling': ['buchstabe', 'schreib', 'rechtschreib'],
      'plural': ['mehrzahl', 'plural', 'einzahl', 'singular']
    };

    // Check for mathematical concepts
    for (const [concept, keywords] of Object.entries(mathConcepts)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        concepts.push(concept);
      }
    }

    // Check for German concepts
    for (const [concept, keywords] of Object.entries(germanConcepts)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        concepts.push(concept);
      }
    }

    return concepts;
  }

  /**
   * Extract mathematical operations from text
   */
  private static extractOperations(text: string): string[] {
    const operations: string[] = [];
    
    if (text.match(/[+]/) || text.includes('addier') || text.includes('plus')) {
      operations.push('addition');
    }
    if (text.match(/[-]/) || text.includes('subtrah') || text.includes('minus')) {
      operations.push('subtraction');
    }
    if (text.match(/[×*]/) || text.includes('mal') || text.includes('multipli')) {
      operations.push('multiplication');
    }
    if (text.match(/[÷\/]/) || text.includes('teil') || text.includes('divid')) {
      operations.push('division');
    }
    if (text.includes('vergleich') || text.includes('größer') || text.includes('kleiner')) {
      operations.push('comparison');
    }

    return operations;
  }

  /**
   * Extract numbers from text
   */
  private static extractNumbers(text: string): number[] {
    const numberMatches = text.match(/\d+(?:[,.]\d+)?/g);
    if (!numberMatches) return [];
    
    return numberMatches
      .map(match => parseFloat(match.replace(',', '.')))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b); // Sort for consistent comparison
  }

  /**
   * Extract structural pattern from text
   */
  private static extractStructure(text: string): string {
    return text
      .replace(/\d+(?:[,.]\d+)?/g, 'N')  // Replace numbers with N
      .replace(/[a-zäöüß]+/gi, 'W')      // Replace words with W
      .replace(/\s+/g, '_')             // Replace spaces with underscores
      .replace(/[^\w_]/g, 'S');         // Replace symbols with S
  }

  /**
   * Calculate text complexity
   */
  private static calculateComplexity(text: string): number {
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const numberCount = (text.match(/\d+/g) || []).length;
    const symbolCount = (text.match(/[^\w\s]/g) || []).length;
    
    // Normalized complexity score
    return (wordCount * 0.3 + uniqueWords * 0.3 + numberCount * 0.2 + symbolCount * 0.2) / 10;
  }

  /**
   * Detect primary language of the question
   */
  private static detectLanguage(text: string): 'math' | 'german' | 'mixed' {
    const mathKeywords = ['=', '+', '-', '×', '÷', 'fläche', 'umfang', 'berechne'];
    const germanKeywords = ['silbe', 'wort', 'buchstabe', 'plural', 'nomen', 'verb'];
    
    const mathScore = mathKeywords.reduce((score, keyword) => 
      score + (text.includes(keyword) ? 1 : 0), 0
    );
    const germanScore = germanKeywords.reduce((score, keyword) => 
      score + (text.includes(keyword) ? 1 : 0), 0
    );
    
    if (mathScore > germanScore) return 'math';
    if (germanScore > mathScore) return 'german';
    return 'mixed';
  }

  /**
   * Similarity calculation methods
   */
  private static calculateConceptSimilarity(concepts1: string[], concepts2: string[]): number {
    if (concepts1.length === 0 && concepts2.length === 0) return 1.0;
    if (concepts1.length === 0 || concepts2.length === 0) return 0.0;
    
    const set1 = new Set(concepts1);
    const set2 = new Set(concepts2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private static calculateOperationSimilarity(ops1: string[], ops2: string[]): number {
    if (ops1.length === 0 && ops2.length === 0) return 1.0;
    if (ops1.length === 0 || ops2.length === 0) return 0.0;
    
    const set1 = new Set(ops1);
    const set2 = new Set(ops2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    return intersection.size / Math.max(set1.size, set2.size);
  }

  private static calculateNumberSimilarity(nums1: number[], nums2: number[]): number {
    if (nums1.length === 0 && nums2.length === 0) return 1.0;
    if (nums1.length === 0 || nums2.length === 0) return 0.0;
    
    // Check for exact matches
    const exactMatches = nums1.filter(n1 => nums2.some(n2 => Math.abs(n1 - n2) < 0.001)).length;
    
    // Check for similar ranges
    const range1 = nums1.length > 0 ? Math.max(...nums1) - Math.min(...nums1) : 0;
    const range2 = nums2.length > 0 ? Math.max(...nums2) - Math.min(...nums2) : 0;
    const rangeSimilarity = range1 === 0 && range2 === 0 ? 1.0 : 
      1 - Math.abs(range1 - range2) / Math.max(range1, range2, 1);
    
    return (exactMatches / Math.max(nums1.length, nums2.length)) * 0.7 + rangeSimilarity * 0.3;
  }

  private static calculateStructuralSimilarity(struct1: string, struct2: string): number {
    if (struct1 === struct2) return 1.0;
    
    // Calculate edit distance
    const editDistance = this.levenshteinDistance(struct1, struct2);
    const maxLength = Math.max(struct1.length, struct2.length);
    
    return maxLength === 0 ? 1.0 : 1 - (editDistance / maxLength);
  }

  private static calculateComplexitySimilarity(comp1: number, comp2: number): number {
    const diff = Math.abs(comp1 - comp2);
    const maxComp = Math.max(comp1, comp2, 1);
    return 1 - (diff / maxComp);
  }

  /**
   * Categorize the analysis result
   */
  private static categorizeAnalysis(
    overallSimilarity: number,
    semanticScore: number,
    structuralScore: number,
    conceptScore: number,
    operationScore: number,
    numberScore: number
  ): { category: SemanticAnalysis['category'], reason: string, confidence: number } {
    
    if (overallSimilarity > 0.95) {
      return {
        category: 'exact',
        reason: 'Questions are nearly identical',
        confidence: 0.95
      };
    }
    
    if (structuralScore > this.STRUCTURAL_THRESHOLD) {
      return {
        category: 'structural',
        reason: `Structural similarity: ${(structuralScore * 100).toFixed(1)}%`,
        confidence: 0.9
      };
    }
    
    if (conceptScore > this.CONCEPTUAL_THRESHOLD && operationScore > 0.8) {
      return {
        category: 'conceptual',
        reason: `Same concepts and operations: ${(conceptScore * 100).toFixed(1)}% concept similarity`,
        confidence: 0.85
      };
    }
    
    if (semanticScore > this.SEMANTIC_THRESHOLD) {
      return {
        category: 'semantic',
        reason: `Semantic similarity: ${(semanticScore * 100).toFixed(1)}%`,
        confidence: 0.8
      };
    }
    
    return {
      category: 'none',
      reason: 'Questions are sufficiently different',
      confidence: 0.9
    };
  }

  /**
   * Utility: Levenshtein distance calculation
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Batch analysis for multiple questions
   */
  static analyzeQuestionSet(questions: SelectionQuestion[], strictMode: boolean = false): {
    duplicates: Array<{ question: SelectionQuestion, duplicateOf: SelectionQuestion, analysis: SemanticAnalysis }>,
    unique: SelectionQuestion[],
    stats: {
      totalQuestions: number,
      uniqueQuestions: number,
      duplicateCount: number,
      averageSimilarity: number
    }
  } {
    const duplicates: Array<{ question: SelectionQuestion, duplicateOf: SelectionQuestion, analysis: SemanticAnalysis }> = [];
    const unique: SelectionQuestion[] = [];
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < questions.length; i++) {
      const current = questions[i];
      const previousQuestions = questions.slice(0, i);
      
      const analysis = this.analyze(current, previousQuestions, strictMode);
      totalSimilarity += analysis.similarity;
      comparisons++;

      if (analysis.isDuplicate && previousQuestions.length > 0) {
        // Find the most similar previous question
        let bestMatch = previousQuestions[0];
        let bestSimilarity = 0;
        
        for (const prev of previousQuestions) {
          const tempAnalysis = this.analyze(current, [prev], strictMode);
          if (tempAnalysis.similarity > bestSimilarity) {
            bestSimilarity = tempAnalysis.similarity;
            bestMatch = prev;
          }
        }
        
        duplicates.push({
          question: current,
          duplicateOf: bestMatch,
          analysis
        });
      } else {
        unique.push(current);
      }
    }

    return {
      duplicates,
      unique,
      stats: {
        totalQuestions: questions.length,
        uniqueQuestions: unique.length,
        duplicateCount: duplicates.length,
        averageSimilarity: comparisons > 0 ? totalSimilarity / comparisons : 0
      }
    };
  }
}