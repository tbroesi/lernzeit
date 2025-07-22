// Structured logging utility with request tracking

interface LogContext {
  requestId?: string;
  templateId?: string;
  duration?: number;
  category?: string;
  grade?: number;
  count?: number;
  status?: string;
  error?: string;
  stack?: string;
  qualityScore?: number;
  uniquenessScore?: number;
  [key: string]: any;
}

class Logger {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || 'unknown';
    
    const logEntry = {
      timestamp,
      level,
      message,
      requestId,
      ...context
    };
    
    return JSON.stringify(logEntry);
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('ERROR', message, context));
  }

  debug(message: string, context?: LogContext): void {
    console.debug(this.formatMessage('DEBUG', message, context));
  }

  // Specialized logging methods for template generation
  requestStarted(requestId: string, request: any): void {
    this.info('Request started', {
      requestId,
      category: request.category,
      grade: request.grade,
      count: request.count,
      excludeCount: request.excludeQuestions?.length || 0,
      sessionId: request.sessionId
    });
  }

  requestCompleted(requestId: string, duration: number, problemCount: number): void {
    this.info('Request completed successfully', {
      requestId,
      duration,
      generatedCount: problemCount,
      status: 'success'
    });
  }

  requestFailed(requestId: string, duration: number, error: Error): void {
    this.error('Request failed', {
      requestId,
      duration,
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }

  templateGenerated(requestId: string, templateId: string, qualityScore: number): void {
    this.info('Template generated', {
      requestId,
      templateId,
      qualityScore,
      status: 'generated'
    });
  }

  templateFiltered(requestId: string, reason: string, questionPreview: string): void {
    this.warn('Template filtered out', {
      requestId,
      reason,
      questionPreview: questionPreview.substring(0, 50) + '...'
    });
  }

  geminiApiCall(requestId: string, config: any, duration?: number): void {
    this.info('Gemini API call', {
      requestId,
      temperature: config.temperature,
      topP: config.topP,
      topK: config.topK,
      duration,
      model: config.model || 'gemini-1.5-flash-latest'
    });
  }

  qualityControlResult(requestId: string, templateId: string, metrics: any): void {
    this.info('Quality control completed', {
      requestId,
      templateId,
      curriculumAlignment: metrics.curriculum_alignment,
      difficultyScore: metrics.difficulty_appropriateness,
      uniquenessScore: metrics.uniqueness_score,
      overallScore: metrics.overall_score
    });
  }

  // Metrics logging for observability
  logMetrics(requestId: string, metrics: {
    requestCount: number;
    errorRate: number;
    averageQualityScore: number;
    averageResponseTime: number;
    uniqueTemplatesGenerated: number;
  }): void {
    this.info('Generation metrics', {
      requestId,
      ...metrics,
      type: 'metrics'
    });
  }
}

export const logger = new Logger();