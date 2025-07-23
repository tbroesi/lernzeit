// Performance optimization utilities for question generation

export class PerformanceTimer {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime);
  }

  getDuration(checkpointName?: string): number {
    if (checkpointName && this.checkpoints.has(checkpointName)) {
      return this.checkpoints.get(checkpointName)!;
    }
    return Date.now() - this.startTime;
  }

  getReport(): { [key: string]: number } {
    const report: { [key: string]: number } = {};
    this.checkpoints.forEach((time, name) => {
      report[name] = time;
    });
    report.total = this.getDuration();
    return report;
  }
}

// Cache for frequently generated prompts
export class PromptCache {
  private cache = new Map<string, { prompt: string; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  getCacheKey(category: string, grade: number, excludeCount: number): string {
    return `${category}_${grade}_${Math.floor(excludeCount / 3)}`; // Group by exclude ranges
  }

  get(category: string, grade: number, excludeCount: number): string | null {
    const key = this.getCacheKey(category, grade, excludeCount);
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < this.TTL) {
      return cached.prompt;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired
    }
    
    return null;
  }

  set(category: string, grade: number, excludeCount: number, prompt: string): void {
    const key = this.getCacheKey(category, grade, excludeCount);
    this.cache.set(key, { prompt, timestamp: Date.now() });
    
    // Clean up old entries (keep max 50 entries)
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}

// Global instances
export const promptCache = new PromptCache();

export function optimizeGeminiRequest(baseConfig: any, attempt: number): any {
  // Optimize config based on attempt number
  return {
    ...baseConfig,
    generationConfig: {
      ...baseConfig.generationConfig,
      // Reduce quality slightly for faster responses on retries
      temperature: Math.min(baseConfig.generationConfig.temperature + (attempt * 0.1), 1.0),
      maxOutputTokens: Math.max(baseConfig.generationConfig.maxOutputTokens - (attempt * 500), 1000),
      topK: Math.max(baseConfig.generationConfig.topK - (attempt * 5), 20)
    }
  };
}

export function shouldUseCache(excludeCount: number): boolean {
  // Use cache for initial questions (low exclude count)
  return excludeCount < 3;
}
