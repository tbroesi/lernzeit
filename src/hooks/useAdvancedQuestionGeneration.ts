/**
 * Advanced Question Generation Hook
 * Integrates all phases of the improved question generation system
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';
import { questionTemplates } from '@/utils/questionTemplates';
import { EnhancedTemplateGenerator, GenerationConfig } from '@/utils/math/enhancedTemplateGenerator';
import { DuplicateDetectionEngine } from '@/utils/math/duplicateDetection';
import { GermanMathParser } from '@/utils/math/germanMathParser';
import { 
  detectDuplicatesWithContext, 
  filterForDiversity,
  calculateQuestionSimilarity,
  type DiversityMetrics 
} from '@/utils/duplicateDetection';

export interface AdvancedGenerationOptions {
  enableDuplicateDetection: boolean;
  enableEnhancedParsing: boolean;
  maxDatabaseAttempts: number;
  enableFallbackChain: boolean;
  qualityThreshold: number;
  generationConfig: Partial<GenerationConfig>;
}

export interface GenerationMetrics {
  totalGenerationTime: number;
  databaseTemplatesUsed: number;
  localTemplatesUsed: number;
  aiGenerationUsed: boolean;
  duplicatesRejected: number;
  parseSuccessRate: number;
  averageQuality: number;
}

interface UseAdvancedQuestionGenerationProps {
  category: string;
  grade: number;
  userId: string;
  totalQuestions?: number;
  autoGenerate?: boolean;
  options?: Partial<AdvancedGenerationOptions>;
}

export function useAdvancedQuestionGeneration({
  category,
  grade,
  userId,
  totalQuestions = 5,
  autoGenerate = true,
  options = {}
}: UseAdvancedQuestionGenerationProps) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'database' | 'template' | 'ai' | 'hybrid' | null>(null);
  const [metrics, setMetrics] = useState<GenerationMetrics | null>(null);
  const [sessionId] = useState(() => `advanced_${Date.now()}_${Math.random()}`);
  
  // Generation state tracking
  const generationRef = useRef({
    isActive: false,
    lastParams: '',
    attempts: 0,
    maxAttempts: 3
  });

  // Default options
  const defaultOptions: AdvancedGenerationOptions = {
    enableDuplicateDetection: true,
    enableEnhancedParsing: true,
    maxDatabaseAttempts: 2,
    enableFallbackChain: true,
    qualityThreshold: 0.7,
    generationConfig: {
      maxAttempts: 30,
      diversityMode: true,
      difficultyBalance: 'mixed',
      questionTypeBalance: true,
      topicRotation: true
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  // Auto-generate on mount if enabled
  useEffect(() => {
    if (autoGenerate && problems.length === 0 && !isGenerating) {
      generateProblems();
    }
  }, [autoGenerate, category, grade, userId, totalQuestions]);

  // Main generation function with intelligent fallback chain
  const generateProblems = useCallback(async (): Promise<void> => {
    const currentParams = `${category}_${grade}_${userId}_${totalQuestions}`;
    
    // Prevent duplicate generation
    if (generationRef.current.isActive || generationRef.current.lastParams === currentParams) {
      console.log('🔄 Generation already in progress or duplicate params, skipping');
      return;
    }

    generationRef.current.isActive = true;
    generationRef.current.lastParams = currentParams;
    generationRef.current.attempts++;

    if (generationRef.current.attempts > generationRef.current.maxAttempts) {
      console.warn('⚠️ Maximum generation attempts reached');
      generationRef.current.isActive = false;
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();
    
    console.log('🚀 Advanced Question Generation started:', {
      category,
      grade,
      userId,
      totalQuestions,
      sessionId,
      options: finalOptions
    });

    try {
      const generationMetrics: GenerationMetrics = {
        totalGenerationTime: 0,
        databaseTemplatesUsed: 0,
        localTemplatesUsed: 0,
        aiGenerationUsed: false,
        duplicatesRejected: 0,
        parseSuccessRate: 0,
        averageQuality: 0
      };

      let questions: SelectionQuestion[] = [];
      let currentSource: typeof generationSource = null;

      // Phase 1: Enhanced Database Template Generation
      console.log('📊 Phase 1: Enhanced Database Template Generation');
      const dbResult = await generateFromDatabase(
        category,
        grade,
        userId,
        totalQuestions,
        finalOptions,
        generationMetrics
      );

      if (dbResult.length >= totalQuestions) {
        questions = dbResult;
        currentSource = 'database';
        console.log('✅ Database generation successful, target met');
      } else if (dbResult.length > 0) {
        questions = dbResult;
        currentSource = 'hybrid';
        console.log(`🔄 Database partial success: ${dbResult.length}/${totalQuestions}, continuing with fallback`);
      }

      // Phase 2: Local Template Fallback (if needed)
      if (questions.length < totalQuestions && finalOptions.enableFallbackChain) {
        console.log('🔧 Phase 2: Enhanced Local Template Generation');
        
        const remaining = totalQuestions - questions.length;
        const templateResult = await generateFromLocalTemplates(
          category,
          grade,
          userId,
          remaining,
          finalOptions,
          generationMetrics,
          questions // Pass existing questions for duplicate checking
        );

        questions = [...questions, ...templateResult];
        
        if (currentSource === null) {
          currentSource = 'template';
        } else if (currentSource === 'database' && templateResult.length > 0) {
          currentSource = 'hybrid';
        }

        console.log(`🔧 Local template result: +${templateResult.length} questions, total: ${questions.length}`);
      }

      // Phase 3: AI Fallback (if still needed and enabled) - Fixed trigger condition
      if (questions.length < totalQuestions && finalOptions.enableFallbackChain) {
        console.log('🤖 Phase 3: AI Generation Fallback');
        
        const remaining = totalQuestions - questions.length;
        const aiResult = await generateFromAI(
          category,
          grade,
          userId,
          remaining,
          finalOptions,
          generationMetrics,
          questions
        );

        questions = [...questions, ...aiResult];
        
        if (aiResult.length > 0) {
          generationMetrics.aiGenerationUsed = true;
          if (currentSource === null) {
            currentSource = 'ai';
          } else {
            currentSource = 'hybrid';
          }
        }

        console.log(`🤖 AI generation result: +${aiResult.length} questions, total: ${questions.length}`);
      }

      // Final validation, quality check, and diversity filtering
      const qualityFiltered = questions.filter(q => validateQuestionQuality(q, finalOptions.qualityThreshold));
      
      // Apply diversity filtering if we have more questions than needed
      const diversityFiltered = qualityFiltered.length > totalQuestions ? 
        filterForDiversity(
          qualityFiltered.map(q => q.question), 
          totalQuestions,
          await getExcludedQuestions(category, grade, userId)
        ).map(questionText => qualityFiltered.find(q => q.question === questionText)!)
          .filter(Boolean) :
        qualityFiltered;
        
      // Enhanced duplicate detection across all sources
      if (finalOptions.enableDuplicateDetection && diversityFiltered.length > 0) {
        const allExisting = await getExcludedQuestions(category, grade, userId);
        const duplicateAnalysis = detectDuplicatesWithContext(
          diversityFiltered.map(q => q.question),
          allExisting,
          [],
          { strictMode: true, maxDuplicates: 10 }
        );
        
        console.log('🔍 Duplicate analysis:', {
          original: diversityFiltered.length,
          unique: duplicateAnalysis.unique.length,
          duplicates: duplicateAnalysis.duplicates.length,
          metrics: duplicateAnalysis.metrics
        });
        
        const finalQuestions = diversityFiltered.filter(q => 
          duplicateAnalysis.unique.includes(q.question)
        );
        
        generationMetrics.duplicatesRejected += duplicateAnalysis.duplicates.length;
        setProblems(finalQuestions);
      } else {
        setProblems(diversityFiltered);
      }
      
      generationMetrics.totalGenerationTime = Date.now() - startTime;
      generationMetrics.averageQuality = calculateAverageQuality(diversityFiltered);
      generationMetrics.parseSuccessRate = diversityFiltered.length / Math.max(questions.length, 1);

      console.log('✅ Advanced Generation Complete:', {
        generated: problems.length,
        target: totalQuestions,
        source: currentSource,
        metrics: generationMetrics
      });

      setGenerationSource(currentSource);
      setMetrics(generationMetrics);

    } catch (error) {
      console.error('❌ Advanced generation failed:', error);
      setProblems([]);
      setGenerationSource(null);
    } finally {
      setIsGenerating(false);
      generationRef.current.isActive = false;
    }
  }, [category, grade, userId, totalQuestions, finalOptions, sessionId]);

  // Enhanced Database Generation
  const generateFromDatabase = async (
    category: string,
    grade: number,
    userId: string,
    count: number,
    options: AdvancedGenerationOptions,
    metrics: GenerationMetrics
  ): Promise<SelectionQuestion[]> => {
    try {
      console.log('📊 Querying database templates with enhanced parsing');

      // Get excluded questions from user feedback
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      
      // Query database with category variations
      const categoryVariations = getCategoryVariations(category);
      
      const { data: templates, error } = await supabase
        .from('generated_templates')
        .select('*')
        .in('category', categoryVariations)
        .eq('grade', grade)
        .eq('is_active', true)
        .gte('quality_score', options.qualityThreshold)
        .order('quality_score', { ascending: false })
        .limit(count * 3);

      if (error) {
        console.error('❌ Database query failed:', error);
        return [];
      }

      if (!templates || templates.length === 0) {
        console.warn('📭 No database templates found');
        return [];
      }

      console.log(`📊 Found ${templates.length} database templates`);

      // Parse templates with enhanced parsing
      const questions: SelectionQuestion[] = [];
      let parseSuccesses = 0;

      for (const template of templates) {
        if (questions.length >= count) break;

        try {
          const parsed = await parseEnhancedTemplate(template, options);
          
          if (parsed) {
            parseSuccesses++;
            
            // Check if excluded
            if (excludedQuestions.includes(parsed.question)) {
              continue;
            }

            // Duplicate detection
            if (options.enableDuplicateDetection) {
              const duplicateCheck = DuplicateDetectionEngine.checkDuplicate(
                DuplicateDetectionEngine.initSession(userId, category, grade),
                parsed,
                questions
              );
              
              if (duplicateCheck.isDuplicate) {
                metrics.duplicatesRejected++;
                continue;
              }
            }

            questions.push(parsed);
            metrics.databaseTemplatesUsed++;

            // Update template usage
            updateTemplateUsageAsync(template.id, template.usage_count);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse template ${template.id}:`, error);
        }
      }

      metrics.parseSuccessRate = parseSuccesses / templates.length;
      console.log(`📊 Database parsing: ${parseSuccesses}/${templates.length} successful, ${questions.length} questions generated`);

      return questions;

    } catch (error) {
      console.error('❌ Database generation error:', error);
      return [];
    }
  };

  // Enhanced Local Template Generation
  const generateFromLocalTemplates = async (
    category: string,
    grade: number,
    userId: string,
    count: number,
    options: AdvancedGenerationOptions,
    metrics: GenerationMetrics,
    existingQuestions: SelectionQuestion[] = []
  ): Promise<SelectionQuestion[]> => {
    try {
      console.log('🔧 Enhanced local template generation');

      // Filter local templates
      const relevantTemplates = questionTemplates.filter(t => 
        (t.category.toLowerCase() === category.toLowerCase() || 
         (category.toLowerCase() === 'math' && t.category === 'Mathematik') ||
         (category.toLowerCase() === 'mathematik' && t.category === 'Mathematik') ||
         (category.toLowerCase() === 'german' && t.category === 'Deutsch') ||
         (category.toLowerCase() === 'deutsch' && t.category === 'Deutsch')) &&
        t.grade <= grade + 1 && t.grade >= Math.max(1, grade - 1)
      );

      console.log(`🔧 Found ${relevantTemplates.length} relevant local templates`);

      if (relevantTemplates.length === 0) {
        console.warn('⚠️ No relevant local templates found');
        return [];
      }

      // Use enhanced template generator
      const result = await EnhancedTemplateGenerator.generateQuestions(
        relevantTemplates,
        category,
        grade,
        userId,
        count,
        options.generationConfig
      );

      metrics.localTemplatesUsed += result.sourceStats.templatesUsed;
      metrics.duplicatesRejected += result.sourceStats.duplicatesRejected;

      console.log(`🔧 Local generation result:`, {
        generated: result.questions.length,
        success: result.success,
        time: result.generationTime,
        stats: result.sourceStats
      });

      return result.questions;

    } catch (error) {
      console.error('❌ Local template generation error:', error);
      return [];
    }
  };

  // AI Generation Fallback
  const generateFromAI = async (
    category: string,
    grade: number,
    userId: string,
    count: number,
    options: AdvancedGenerationOptions,
    metrics: GenerationMetrics,
    existingQuestions: SelectionQuestion[] = []
  ): Promise<SelectionQuestion[]> => {
    try {
      console.log('🤖 AI fallback generation');

      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      const allExcluded = [
        ...excludedQuestions,
        ...existingQuestions.map(q => q.question)
      ];

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI generation timeout')), 15000);
      });

      const aiPromise = supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count,
          excludeQuestions: allExcluded,
          sessionId,
          requestId: `ai_fallback_${Date.now()}`,
          qualityThreshold: options.qualityThreshold,
          enhancedPrompt: true
        }
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);

      if (response.error) {
        console.error('❌ AI generation failed:', response.error);
        return [];
      }

      const problems = response.data?.problems || [];
      console.log(`🤖 AI generated ${problems.length} problems`);

      return problems.filter(p => p && p.question && p.explanation);

    } catch (error) {
      console.error('❌ AI generation error:', error);
      return [];
    }
  };

  // Helper functions
  const parseEnhancedTemplate = async (template: any, options: AdvancedGenerationOptions): Promise<SelectionQuestion | null> => {
    try {
      // Try JSON parsing first
      try {
        const parsed = JSON.parse(template.content);
        if (parsed.question && (parsed.answer || parsed.correctAnswer)) {
          return {
            id: Math.floor(Math.random() * 1000000),
            question: parsed.question,
            questionType: parsed.questionType || 'text-input',
            explanation: parsed.explanation || 'Automatisch generierte Erklärung',
            type: template.category === 'Mathematik' ? 'math' : 'german',
            ...(parsed.questionType === 'multiple-choice' ? {
              options: parsed.options || [],
              correctAnswer: parsed.correctAnswer || 0
            } : {
              answer: parsed.answer
            })
          };
        }
      } catch (e) {
        // Continue to enhanced parsing
      }

      // Enhanced parsing for math content
      if (options.enableEnhancedParsing && (template.category === 'Mathematik' || template.category === 'math')) {
        const mathResult = GermanMathParser.parse(template.content);
        if (mathResult.success && mathResult.answer !== undefined) {
          return {
            id: Math.floor(Math.random() * 1000000),
            question: template.content,
            questionType: 'text-input',
            explanation: mathResult.steps ? mathResult.steps.join(', ') : 'Mathematische Berechnung',
            type: 'math',
            answer: mathResult.answer
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Template parsing failed:', error);
      return null;
    }
  };

  const getCategoryVariations = (category: string): string[] => {
    const variations = [category, category.toLowerCase(), category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()];
    
    if (category.toLowerCase() === 'mathematik' || category.toLowerCase() === 'math') {
      variations.push('Mathematik', 'math', 'mathematik');
    }
    if (category.toLowerCase() === 'deutsch' || category.toLowerCase() === 'german') {
      variations.push('Deutsch', 'german', 'deutsch');
    }
    
    return [...new Set(variations)];
  };

  const getExcludedQuestions = async (category: string, grade: number, userId: string): Promise<string[]> => {
    try {
      const { data: feedback, error } = await supabase
        .from('question_feedback')
        .select('question_content')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('grade', grade)
        .in('feedback_type', ['duplicate', 'inappropriate', 'too_easy', 'too_hard']);
      
      return error ? [] : (feedback?.map(f => f.question_content) || []);
    } catch (error) {
      console.warn('Error fetching excluded questions:', error);
      return [];
    }
  };

  const updateTemplateUsageAsync = async (templateId: string, currentUsage: number) => {
    try {
      await supabase
        .from('generated_templates')
        .update({ usage_count: (currentUsage || 0) + 1 })
        .eq('id', templateId);
    } catch (err) {
      console.warn('Failed to update template usage:', err);
    }
  };

  const validateQuestionQuality = (question: SelectionQuestion, threshold: number): boolean => {
    if (!question.question || question.question.length < 10) return false;
    if (question.question.includes('{') || question.question.includes('}')) return false;
    if (question.questionType === 'text-input' && !question.answer && question.answer !== 0) return false;
    return true;
  };

  const calculateAverageQuality = (questions: SelectionQuestion[]): number => {
    if (questions.length === 0) return 0;
    
    const scores = questions.map(q => {
      let score = 0.5; // Base score
      if (q.explanation && q.explanation.length > 10) score += 0.2;
      if (q.question.length > 20 && q.question.length < 200) score += 0.2;
      if (q.questionType === 'multiple-choice' && q.options && q.options.length >= 3) score += 0.1;
      return Math.min(score, 1.0);
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Reset generation state when parameters change
  useEffect(() => {
    generationRef.current.lastParams = '';
    generationRef.current.attempts = 0;
  }, [category, grade, userId, totalQuestions]);

  return {
    problems,
    isGenerating,
    isInitialized: problems.length >= totalQuestions && !isGenerating,
    generationSource: generationSource as 'template' | 'ai' | 'simple',
    generationError: null,
    canRetry: true,
    manualRetry: generateProblems,
    refreshQuestions: generateProblems,
    metrics,
    sessionId,
    generateProblems,
    getSessionStats: () => DuplicateDetectionEngine.getSessionStats(
      DuplicateDetectionEngine.initSession(userId, category, grade)
    )
  };
}