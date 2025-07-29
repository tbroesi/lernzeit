// Template session management to prevent duplicate template usage
import { SelectionQuestion } from '@/types/questionTypes';

interface TemplateSession {
  sessionId: string;
  userId: string;
  category: string;
  grade: number;
  usedTemplateIds: Set<string>;
  usedQuestionHashes: Set<string>;
  startTime: number;
  lastActivity: number;
}

export class TemplateSessionManager {
  private static sessions = new Map<string, TemplateSession>();
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  static createSession(userId: string, category: string, grade: number): string {
    const sessionId = `${userId}_${category}_${grade}_${Date.now()}`;
    
    const session: TemplateSession = {
      sessionId,
      userId,
      category,
      grade,
      usedTemplateIds: new Set(),
      usedQuestionHashes: new Set(),
      startTime: Date.now(),
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);
    this.cleanupExpiredSessions();

    console.log(`📋 Created new template session: ${sessionId}`);
    return sessionId;
  }

  static isTemplateUsed(sessionId: string, templateId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    return session.usedTemplateIds.has(templateId);
  }

  static isQuestionUsed(sessionId: string, question: SelectionQuestion): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const questionHash = this.generateQuestionHash(question);
    return session.usedQuestionHashes.has(questionHash);
  }

  static markTemplateUsed(sessionId: string, templateId: string, question: SelectionQuestion): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.usedTemplateIds.add(templateId);
    session.usedQuestionHashes.add(this.generateQuestionHash(question));
    session.lastActivity = Date.now();

    console.log(`✅ Marked template ${templateId} as used in session ${sessionId}`);
  }

  static getUsedTemplateCount(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    return session ? session.usedTemplateIds.size : 0;
  }

  static getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      category: session.category,
      grade: session.grade,
      templatesUsed: session.usedTemplateIds.size,
      questionsGenerated: session.usedQuestionHashes.size,
      duration: Date.now() - session.startTime,
      lastActivity: new Date(session.lastActivity).toISOString()
    };
  }

  private static generateQuestionHash(question: SelectionQuestion): string {
    // Create a hash based on question structure
    const structure = question.question
      .toLowerCase()
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, '_'); // Replace spaces with underscores
    
    return `${question.type}_${structure}`;
  }

  private static cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_DURATION) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired template sessions`);
    }
  }

  static clearSession(sessionId: string): void {
    if (this.sessions.delete(sessionId)) {
      console.log(`🗑️ Cleared template session: ${sessionId}`);
    }
  }

  static getAllSessions(): any[] {
    return Array.from(this.sessions.values()).map(session => this.getSessionStats(session.sessionId));
  }
}