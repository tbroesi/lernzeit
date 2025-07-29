// Enhanced duplicate detection system with improved session management
import { SelectionQuestion } from '@/types/questionTypes';

interface SessionState {
  userId: string;
  category: string;
  grade: number;
  seenQuestions: Set<string>;
  questionHashes: Set<string>;
  topicCounts: Map<string, number>;
  usedTemplateIds: Set<string>;
  sessionStartTime: number;
  lastActivity: number;
}

interface DuplicateAnalysis {
  isDuplicate: boolean;
  similarity: number;
  reason: string;
  category: 'exact' | 'semantic' | 'structural' | 'template';
}

export class ImprovedDuplicateDetectionEngine {
  private static sessions = new Map<string, SessionState>();
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static lastCleanup = Date.now();

  static initSession(userId: string, category: string, grade: number): string {
    this.performPeriodicCleanup();
    
    const sessionId = `${userId}_${category}_${grade}`;
    const now = Date.now();
    
    let session = this.sessions.get(sessionId);
    if (!session || (now - session.lastActivity) > this.SESSION_TIMEOUT) {
      console.log(`🔄 Creating new session: ${sessionId}`);
      session = {
        userId,
        category,
        grade,
        seenQuestions: new Set(),
        questionHashes: new Set(),
        topicCounts: new Map(),
        usedTemplateIds: new Set(),
        sessionStartTime: now,
        lastActivity: now
      };
      this.sessions.set(sessionId, session);
    } else {
      session.lastActivity = now;
      console.log(`♻️ Reusing session: ${sessionId}, questions seen: ${session.seenQuestions.size}`);
    }
    
    return sessionId;
  }

  static checkDuplicate(sessionId: string, question: SelectionQuestion, existingQuestions?: SelectionQuestion[]): DuplicateAnalysis {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ Session not found: ${sessionId}`);
      return { isDuplicate: false, similarity: 0, reason: 'No session found', category: 'exact' };
    }

    const questionText = this.normalizeText(question.question);
    const questionHash = this.generateQuestionHash(question);

    // Check against session history first
    if (session.seenQuestions.has(questionText)) {
      console.log(`🚫 EXACT duplicate in session: "${questionText}"`);
      return { 
        isDuplicate: true, 
        similarity: 1.0, 
        reason: 'Exact match in session history', 
        category: 'exact' 
      };
    }

    if (session.questionHashes.has(questionHash)) {
      console.log(`🚫 STRUCTURAL duplicate in session: "${questionText}"`);
      return { 
        isDuplicate: true, 
        similarity: 0.9, 
        reason: 'Structural match in session history', 
        category: 'structural' 
      };
    }

    // Check template ID if available (using id as fallback for templateId)
    const templateId = (question as any).templateId || question.id;
    if (templateId && session.usedTemplateIds.has(templateId)) {
      console.log(`🚫 TEMPLATE duplicate: ID ${templateId} already used`);
      return { 
        isDuplicate: true, 
        similarity: 0.95, 
        reason: 'Template already used in session', 
        category: 'template' 
      };
    }

    // Check against existing questions batch if provided
    if (existingQuestions && existingQuestions.length > 0) {
      for (const existingQ of existingQuestions) {
        const normalizedExisting = this.normalizeText(existingQ.question);
        const similarity = this.calculateSimilarity(questionText, normalizedExisting);
        
        if (similarity > 0.85) {
          console.log(`🚫 HIGH similarity with batch question: ${similarity.toFixed(2)}`);
          return { 
            isDuplicate: true, 
            similarity, 
            reason: 'High similarity with batch question', 
            category: 'semantic' 
          };
        }
      }
    }

    // Check topic distribution
    const topic = this.extractTopic(question.question);
    const topicCount = session.topicCounts.get(topic) || 0;
    if (topicCount >= 3) {
      console.log(`🚫 TOPIC oversaturation: ${topic} used ${topicCount} times`);
      return { 
        isDuplicate: true, 
        similarity: 0.7, 
        reason: `Topic "${topic}" oversaturated`, 
        category: 'semantic' 
      };
    }

    console.log(`✅ Question approved: "${questionText}"`);
    return { isDuplicate: false, similarity: 0, reason: 'Unique question', category: 'exact' };
  }

  static registerQuestion(sessionId: string, question: SelectionQuestion): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const questionText = this.normalizeText(question.question);
    const questionHash = this.generateQuestionHash(question);
    const topic = this.extractTopic(question.question);

    session.seenQuestions.add(questionText);
    session.questionHashes.add(questionHash);
    session.topicCounts.set(topic, (session.topicCounts.get(topic) || 0) + 1);
    session.lastActivity = Date.now();

    const templateId = (question as any).templateId || question.id;
    if (templateId) {
      session.usedTemplateIds.add(templateId);
    }

    console.log(`📝 Registered question in session ${sessionId}: topic=${topic}, total=${session.seenQuestions.size}`);
  }

  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static generateQuestionHash(question: SelectionQuestion): string {
    const structure = question.question
      .replace(/\d+/g, 'N')
      .replace(/[a-z]+/gi, 'W')
      .replace(/\s+/g, '_');
    const optionsLength = (question as any).options?.length || 0;
    return `${question.type}_${structure}_${optionsLength}`;
  }

  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' '));
    const words2 = new Set(text2.split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  private static extractTopic(question: string): string {
    const text = question.toLowerCase();
    
    if (text.includes('quadrat') || text.includes('viereck')) return 'quadrat';
    if (text.includes('rechteck')) return 'rechteck';
    if (text.includes('kreis')) return 'kreis';
    if (text.includes('fläche') || text.includes('flächeninhalt')) return 'fläche';
    if (text.includes('umfang')) return 'umfang';
    if (text.includes('addition') || text.includes('+')) return 'addition';
    if (text.includes('subtraktion') || text.includes('-')) return 'subtraktion';
    if (text.includes('multiplikation') || text.includes('×') || text.includes('*')) return 'multiplikation';
    if (text.includes('division') || text.includes('÷') || text.includes('/')) return 'division';
    
    return 'allgemein';
  }

  private static performPeriodicCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) return;

    let cleanedCount = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
    this.lastCleanup = now;
  }

  static getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId,
      questionsGenerated: session.seenQuestions.size,
      uniqueTopics: session.topicCounts.size,
      topicDistribution: Array.from(session.topicCounts.entries()),
      templatesUsed: session.usedTemplateIds.size,
      sessionDuration: Date.now() - session.sessionStartTime,
      lastActivity: new Date(session.lastActivity).toISOString()
    };
  }

  static clearSession(sessionId: string): void {
    if (this.sessions.delete(sessionId)) {
      console.log(`🗑️ Cleared session: ${sessionId}`);
    }
  }

  static getAllSessionStats(): any[] {
    return Array.from(this.sessions.keys()).map(sessionId => this.getSessionStats(sessionId));
  }
}