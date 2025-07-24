/**
 * Phase 4: Advanced Duplicate Detection System
 * Prevents repetitive questions and manages question diversity
 */

import { SelectionQuestion } from '@/types/questionTypes';

export interface DuplicateAnalysis {
  isDuplicate: boolean;
  similarity: number;
  reason?: string;
  category: 'exact' | 'semantic' | 'structural' | 'none';
}

export interface SessionState {
  userId: string;
  category: string;
  grade: number;
  seenQuestions: Set<string>;
  questionHashes: Set<string>;
  topicCounts: Map<string, number>;
  lastGenerated: number;
  sessionStart: number;
}

export class DuplicateDetectionEngine {
  private static sessions: Map<string, SessionState> = new Map();
  private static readonly SIMILARITY_THRESHOLD = 0.75;
  private static readonly MAX_TOPIC_REPETITION = 2;
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Initialize or get session state
   */
  static initSession(userId: string, category: string, grade: number): string {
    const sessionId = `${userId}_${category}_${grade}`;
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        userId,
        category,
        grade,
        seenQuestions: new Set(),
        questionHashes: new Set(),
        topicCounts: new Map(),
        lastGenerated: Date.now(),
        sessionStart: Date.now()
      });
    }
    
    // Clean up old sessions
    this.cleanupExpiredSessions();
    
    return sessionId;
  }
  
  /**
   * Check if a question is a duplicate
   */
  static checkDuplicate(
    sessionId: string, 
    question: SelectionQuestion,
    existingQuestions: SelectionQuestion[] = []
  ): DuplicateAnalysis {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { isDuplicate: false, similarity: 0, category: 'none' };
    }
    
    // Check against session history
    const sessionDuplicate = this.checkSessionDuplicate(session, question);
    if (sessionDuplicate.isDuplicate) {
      return sessionDuplicate;
    }
    
    // Check against current question set
    const batchDuplicate = this.checkBatchDuplicate(question, existingQuestions);
    if (batchDuplicate.isDuplicate) {
      return batchDuplicate;
    }
    
    // Check topic over-representation
    const topicCheck = this.checkTopicOveruse(session, question);
    if (topicCheck.isDuplicate) {
      return topicCheck;
    }
    
    return { isDuplicate: false, similarity: 0, category: 'none' };
  }
  
  /**
   * Register a question as used
   */
  static registerQuestion(sessionId: string, question: SelectionQuestion): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Add to seen questions
    const questionKey = this.normalizeQuestion(question.question);
    session.seenQuestions.add(questionKey);
    
    // Add content hash
    const hash = this.generateQuestionHash(question);
    session.questionHashes.add(hash);
    
    // Update topic counts
    const topics = this.extractTopics(question);
    topics.forEach(topic => {
      session.topicCounts.set(topic, (session.topicCounts.get(topic) || 0) + 1);
    });
    
    session.lastGenerated = Date.now();
  }
  
  /**
   * Get diverse question suggestions
   */
  static getDiversityRecommendations(
    sessionId: string,
    availableQuestions: SelectionQuestion[]
  ): SelectionQuestion[] {
    const session = this.sessions.get(sessionId);
    if (!session) return availableQuestions;
    
    // Score questions by diversity
    const scoredQuestions = availableQuestions.map(question => ({
      question,
      score: this.calculateDiversityScore(session, question)
    }));
    
    // Sort by diversity score (higher is better)
    scoredQuestions.sort((a, b) => b.score - a.score);
    
    return scoredQuestions.map(item => item.question);
  }
  
  /**
   * Clean up expired sessions
   */
  private static cleanupExpiredSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastGenerated > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
      }
    }
  }
  
  /**
   * Check for duplicates in session history
   */
  private static checkSessionDuplicate(session: SessionState, question: SelectionQuestion): DuplicateAnalysis {
    const normalizedQuestion = this.normalizeQuestion(question.question);
    
    // Exact match check
    if (session.seenQuestions.has(normalizedQuestion)) {
      return {
        isDuplicate: true,
        similarity: 1.0,
        category: 'exact',
        reason: 'Identische Frage bereits in dieser Sitzung gesehen'
      };
    }
    
    // Hash-based structural similarity
    const questionHash = this.generateQuestionHash(question);
    if (session.questionHashes.has(questionHash)) {
      return {
        isDuplicate: true,
        similarity: 0.9,
        category: 'structural',
        reason: 'Strukturell identische Frage bereits gesehen'
      };
    }
    
    // Semantic similarity check
    for (const seenQuestion of session.seenQuestions) {
      const similarity = this.calculateSemanticSimilarity(normalizedQuestion, seenQuestion);
      if (similarity > this.SIMILARITY_THRESHOLD) {
        return {
          isDuplicate: true,
          similarity,
          category: 'semantic',
          reason: `Ähnliche Frage bereits gesehen (${Math.round(similarity * 100)}% Ähnlichkeit)`
        };
      }
    }
    
    return { isDuplicate: false, similarity: 0, category: 'none' };
  }
  
  /**
   * Check for duplicates in current batch
   */
  private static checkBatchDuplicate(
    question: SelectionQuestion, 
    existingQuestions: SelectionQuestion[]
  ): DuplicateAnalysis {
    const normalizedQuestion = this.normalizeQuestion(question.question);
    
    for (const existing of existingQuestions) {
      const normalizedExisting = this.normalizeQuestion(existing.question);
      
      // Exact match
      if (normalizedQuestion === normalizedExisting) {
        return {
          isDuplicate: true,
          similarity: 1.0,
          category: 'exact',
          reason: 'Identische Frage im aktuellen Fragensatz'
        };
      }
      
      // Semantic similarity
      const similarity = this.calculateSemanticSimilarity(normalizedQuestion, normalizedExisting);
      if (similarity > this.SIMILARITY_THRESHOLD) {
        return {
          isDuplicate: true,
          similarity,
          category: 'semantic',
          reason: `Ähnliche Frage im aktuellen Satz (${Math.round(similarity * 100)}% Ähnlichkeit)`
        };
      }
    }
    
    return { isDuplicate: false, similarity: 0, category: 'none' };
  }
  
  /**
   * Check for topic overuse
   */
  private static checkTopicOveruse(session: SessionState, question: SelectionQuestion): DuplicateAnalysis {
    const topics = this.extractTopics(question);
    
    for (const topic of topics) {
      const count = session.topicCounts.get(topic) || 0;
      if (count >= this.MAX_TOPIC_REPETITION) {
        return {
          isDuplicate: true,
          similarity: 0.8,
          category: 'structural',
          reason: `Thema "${topic}" bereits ${count}x verwendet`
        };
      }
    }
    
    return { isDuplicate: false, similarity: 0, category: 'none' };
  }
  
  /**
   * Calculate diversity score for question selection
   */
  private static calculateDiversityScore(session: SessionState, question: SelectionQuestion): number {
    let score = 1.0;
    
    // Penalty for seen questions
    const normalizedQuestion = this.normalizeQuestion(question.question);
    if (session.seenQuestions.has(normalizedQuestion)) {
      return 0;
    }
    
    // Penalty for overused topics
    const topics = this.extractTopics(question);
    for (const topic of topics) {
      const count = session.topicCounts.get(topic) || 0;
      const penalty = Math.min(count * 0.3, 0.8);
      score -= penalty;
    }
    
    // Bonus for question type diversity
    const questionType = question.questionType;
    // Could add logic to track question type usage
    
    return Math.max(score, 0);
  }
  
  /**
   * Normalize question text for comparison
   */
  private static normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\säöüß]/g, '')
      .trim();
  }
  
  /**
   * Generate content hash for structural similarity
   */
  private static generateQuestionHash(question: SelectionQuestion): string {
    // Extract the mathematical/structural pattern
    let pattern = question.question
      .replace(/\d+/g, 'NUM')                    // Replace numbers with placeholder
      .replace(/[äöüÄÖÜß]/g, 'UMLAUT')          // Replace umlauts
      .replace(/\s+/g, ' ')                      // Normalize spaces
      .toLowerCase()
      .trim();
    
    // Add question type and structure info
    const structure = `${question.questionType}_${pattern}`;
    
    return structure;
  }
  
  /**
   * Calculate semantic similarity between two questions
   */
  private static calculateSemanticSimilarity(q1: string, q2: string): number {
    // Simple Jaccard similarity for now
    const words1 = new Set(q1.split(' '));
    const words2 = new Set(q2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Extract topics from question
   */
  private static extractTopics(question: SelectionQuestion): string[] {
    const topics: string[] = [];
    const questionText = question.question.toLowerCase();
    
    // Math topics
    if (questionText.includes('+') || questionText.includes('addier') || questionText.includes('plus')) {
      topics.push('addition');
    }
    if (questionText.includes('-') || questionText.includes('subtrah') || questionText.includes('minus')) {
      topics.push('subtraction');
    }
    if (questionText.includes('×') || questionText.includes('*') || questionText.includes('mal') || questionText.includes('multipli')) {
      topics.push('multiplication');
    }
    if (questionText.includes('÷') || questionText.includes('/') || questionText.includes('teil') || questionText.includes('divid')) {
      topics.push('division');
    }
    
    // Geometry topics
    if (questionText.includes('rechteck') || questionText.includes('fläche') || questionText.includes('umfang')) {
      topics.push('geometry');
    }
    
    // Time topics
    if (questionText.includes('stunden') || questionText.includes('minuten') || questionText.includes('zeit')) {
      topics.push('time');
    }
    
    // Money topics
    if (questionText.includes('euro') || questionText.includes('geld') || questionText.includes('cent')) {
      topics.push('money');
    }
    
    // German topics
    if (questionText.includes('silbe') || questionText.includes('wort') || questionText.includes('buchstab')) {
      topics.push('language');
    }
    
    return topics.length > 0 ? topics : ['general'];
  }
  
  /**
   * Get session statistics
   */
  static getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      questionsGenerated: session.seenQuestions.size,
      topicDistribution: Object.fromEntries(session.topicCounts),
      sessionDuration: Date.now() - session.sessionStart,
      lastActivity: Date.now() - session.lastGenerated
    };
  }
}