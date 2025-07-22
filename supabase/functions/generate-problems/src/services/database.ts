import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { config, DB_CONSTANTS } from "../config.ts";
import { logger } from "../utils/logger.ts";
import type { GeneratedTemplate, QualityMetrics } from "../types.ts";

export class DatabaseService {
  private supabase: any;

  constructor() {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase configuration is required');
    }
    
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  // Store generated template with quality metrics
  async storeTemplate(
    template: Omit<GeneratedTemplate, 'id' | 'created_at' | 'updated_at'>,
    requestId: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from(DB_CONSTANTS.TEMPLATES_TABLE)
        .insert({
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Failed to store template', {
          requestId,
          error: error.message,
          template: template.content.substring(0, 100)
        });
        throw error;
      }

      logger.info('Template stored successfully', {
        requestId,
        templateId: data.id,
        category: template.category,
        grade: template.grade,
        qualityScore: template.quality_score
      });

      return data.id;

    } catch (error) {
      logger.error('Database error storing template', {
        requestId,
        error: error.message
      });
      throw error;
    }
  }

  // Check for similar existing templates
  async findSimilarTemplates(
    content: string,
    category: string,
    grade: number,
    requestId: string,
    similarityThreshold: number = 0.7
  ): Promise<GeneratedTemplate[]> {
    try {
      // Generate content hash for exact matching
      const contentHash = await this.generateContentHash(content);

      // First check for exact content hash match
      const { data: exactMatches, error: exactError } = await this.supabase
        .from(DB_CONSTANTS.TEMPLATES_TABLE)
        .select('*')
        .eq('content_hash', contentHash)
        .eq('category', category)
        .eq('grade', grade)
        .eq('is_active', true);

      if (exactError) {
        logger.warn('Error checking exact matches', {
          requestId,
          error: exactError.message
        });
      }

      if (exactMatches && exactMatches.length > 0) {
        logger.info('Found exact content matches', {
          requestId,
          matchCount: exactMatches.length,
          contentHash
        });
        return exactMatches;
      }

      // Then check for similar templates using text similarity
      const { data: candidates, error: candidatesError } = await this.supabase
        .from(DB_CONSTANTS.TEMPLATES_TABLE)
        .select('*')
        .eq('category', category)
        .eq('grade', grade)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50); // Get recent templates for comparison

      if (candidatesError) {
        logger.warn('Error fetching candidate templates', {
          requestId,
          error: candidatesError.message
        });
        return [];
      }

      // Filter by content similarity (this would ideally be done in the database with vector similarity)
      const similarTemplates = candidates?.filter(template => {
        const similarity = this.calculateTextSimilarity(content, template.content);
        return similarity >= similarityThreshold;
      }) || [];

      logger.info('Similarity check completed', {
        requestId,
        candidatesChecked: candidates?.length || 0,
        similarFound: similarTemplates.length,
        threshold: similarityThreshold
      });

      return similarTemplates;

    } catch (error) {
      logger.error('Error finding similar templates', {
        requestId,
        error: error.message
      });
      return [];
    }
  }

  // Update template usage count
  async incrementUsageCount(templateId: string, requestId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(DB_CONSTANTS.TEMPLATES_TABLE)
        .update({
          usage_count: this.supabase.rpc('increment_usage_count', { template_id: templateId }),
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) {
        logger.warn('Failed to increment usage count', {
          requestId,
          templateId,
          error: error.message
        });
      } else {
        logger.debug('Usage count incremented', { requestId, templateId });
      }

    } catch (error) {
      logger.warn('Error incrementing usage count', {
        requestId,
        templateId,
        error: error.message
      });
    }
  }

  // Get template statistics for quality monitoring
  async getTemplateStats(category?: string, grade?: number): Promise<any> {
    try {
      let query = this.supabase
        .from(DB_CONSTANTS.TEMPLATES_TABLE)
        .select('quality_score, usage_count, created_at, is_active');

      if (category) {
        query = query.eq('category', category);
      }

      if (grade) {
        query = query.eq('grade', grade);
      }

      const { data, error } = await query.eq('is_active', true);

      if (error) {
        throw error;
      }

      // Calculate statistics
      const totalTemplates = data?.length || 0;
      const avgQualityScore = totalTemplates > 0 
        ? data.reduce((sum, t) => sum + t.quality_score, 0) / totalTemplates 
        : 0;
      const totalUsage = data?.reduce((sum, t) => sum + t.usage_count, 0) || 0;

      return {
        totalTemplates,
        avgQualityScore,
        totalUsage,
        lowQualityCount: data?.filter(t => t.quality_score < 0.6).length || 0,
        highQualityCount: data?.filter(t => t.quality_score >= 0.8).length || 0
      };

    } catch (error) {
      logger.error('Error getting template stats', { error: error.message });
      return null;
    }
  }

  // Store generation session for tracking
  async storeGenerationSession(
    sessionData: {
      request_id: string;
      session_id?: string;
      category: string;
      grade: number;
      requested_count: number;
      generated_count: number;
      excluded_count: number;
      duration_ms: number;
      success: boolean;
      error?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(DB_CONSTANTS.SESSIONS_TABLE)
        .insert({
          ...sessionData,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.warn('Failed to store generation session', {
          requestId: sessionData.request_id,
          error: error.message
        });
      }

    } catch (error) {
      logger.warn('Error storing generation session', {
        requestId: sessionData.request_id,
        error: error.message
      });
    }
  }

  // Helper methods
  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity for text comparison
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const words1 = new Set(normalize(text1).split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(normalize(text2).split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Create database tables if they don't exist (for initial setup)
  async ensureTablesExist(): Promise<void> {
    try {
      // This would typically be handled by migrations, but included for completeness
      logger.info('Checking database table existence');
      
      // Check if templates table exists by trying to select from it
      const { error } = await this.supabase
        .from(DB_CONSTANTS.TEMPLATES_TABLE)
        .select('id')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        logger.warn('Templates table does not exist - should be created via migrations');
      }

    } catch (error) {
      logger.warn('Error checking table existence', { error: error.message });
    }
  }
}