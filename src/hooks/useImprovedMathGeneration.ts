/**
 * Improved Math Generation Hook
 * Centralizes all enhanced question generation capabilities
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { ImprovedGermanMathParser } from '@/utils/math/ImprovedGermanMathParser';
import { SemanticDuplicateDetector } from '@/utils/templates/SemanticDuplicateDetector';
import { StepByStepExplainer, DetailedExplanation } from '@/utils/templates/StepByStepExplainer';
import { ImprovedDuplicateDetectionEngine } from '@/utils/templates/improvedDuplicateDetection';
import { useQuestionGenerationManager } from './useQuestionGenerationManager';
import { supabase } from '@/lib/supabase';

export interface ImprovedGenerationOptions {
  enableSemanticDuplicateDetection: boolean;
  enableStepByStepExplanations: boolean;
  enableImprovedMathParsing: boolean;
  enableQualityAssurance: boolean;
  strictDuplicateMode: boolean;
  enhancedFallback: boolean;
  maxRetries: number;
}

export interface GenerationQualityMetrics {
  parseSuccessRate: number;
  duplicateRejectionRate: number;
  explanationCoverage: number;
  semanticQualityScore: number;
  averageSteps: number;
  mathAccuracy: number;
}

export interface ImprovedGenerationResult {
  questions: SelectionQuestion[];
  explanations: Map<string, DetailedExplanation>;
  qualityMetrics: GenerationQualityMetrics;
  generationTime: number;
  source: 'enhanced' | 'fallback' | 'hybrid';
  errors: string[];
}

interface UseImprovedMathGenerationProps {
  category: string;
  grade: number;
  userId: string;
  totalQuestions?: number;
  autoGenerate?: boolean;
  options?: Partial<ImprovedGenerationOptions>;
}

export function useImprovedMathGeneration({
  category,
  grade,
  userId,
  totalQuestions = 5,
  autoGenerate = true,
  options = {}
}: UseImprovedMathGenerationProps) {
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImprovedGenerationResult | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const lastGenerationRef = useRef<string>('');

  // Default options
  const defaultOptions: ImprovedGenerationOptions = {
    enableSemanticDuplicateDetection: true,
    enableStepByStepExplanations: true,
    enableImprovedMathParsing: true,
    enableQualityAssurance: true,
    strictDuplicateMode: false,
    enhancedFallback: true,
    maxRetries: 3
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Use the question generation manager as base
  const {
    problems,
    isGenerating,
    generationError,
    generateProblems: baseGenerateProblems,
    sessionId,
    generationSource
  } = useQuestionGenerationManager({
    category,
    grade,
    userId,
    totalQuestions,
    autoGenerate: false, // We'll control generation manually
    useEnhancedMode: true
  });

  /**
   * Enhanced generation process with all improvements
   */
  const generateEnhancedQuestions = useCallback(async (): Promise<void> => {
    const generationKey = `${category}-${grade}-${userId}-${totalQuestions}`;
    
    if (lastGenerationRef.current === generationKey && !isProcessing) {
      console.log('🔄 Skipping duplicate generation request');
      return;
    }

    lastGenerationRef.current = generationKey;
    setIsProcessing(true);
    setProcessingStage('Initialisierung...');

    const startTime = Date.now();
    const errors: string[] = [];
    
    console.log('🚀 Starting improved math generation:', {
      category,
      grade,
      userId,
      totalQuestions,
      options: finalOptions
    });

    try {
      // Phase 1: Generate base questions
      setProcessingStage('Generiere Grundfragen...');
      await baseGenerateProblems();
      
      if (problems.length === 0) {
        throw new Error('No base questions generated');
      }

      // Phase 2: Enhanced parsing and validation
      setProcessingStage('Verbessere Mathematik-Parsing...');
      const enhancedQuestions = await enhanceWithImprovedParsing(problems, finalOptions);
      
      // Phase 3: Semantic duplicate detection
      setProcessingStage('Prüfe semantische Duplikate...');
      const uniqueQuestions = await applySemanticDuplicateDetection(enhancedQuestions, finalOptions);
      
      // Phase 4: Quality assurance
      setProcessingStage('Qualitätskontrolle...');
      const qualityCheckedQuestions = await applyQualityAssurance(uniqueQuestions, finalOptions);
      
      // Phase 5: Generate step-by-step explanations
      setProcessingStage('Erstelle Erklärungen...');
      const explanations = await generateDetailedExplanations(qualityCheckedQuestions, finalOptions);
      
      // Phase 6: Calculate quality metrics
      setProcessingStage('Berechne Qualitätsmetriken...');
      const qualityMetrics = calculateQualityMetrics(
        problems,
        qualityCheckedQuestions,
        explanations,
        finalOptions
      );

      // Phase 7: Finalize result
      const generationTime = Date.now() - startTime;
      const finalResult: ImprovedGenerationResult = {
        questions: qualityCheckedQuestions,
        explanations,
        qualityMetrics,
        generationTime,
        source: determineGenerationSource(qualityCheckedQuestions, problems),
        errors
      };

      setResult(finalResult);
      setProcessingStage('Abgeschlossen');

      console.log('✅ Improved generation complete:', {
        originalCount: problems.length,
        finalCount: qualityCheckedQuestions.length,
        qualityScore: qualityMetrics.semanticQualityScore,
        generationTime: generationTime + 'ms'
      });

    } catch (error) {
      console.error('❌ Improved generation failed:', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to basic result
      const fallbackResult: ImprovedGenerationResult = {
        questions: problems,
        explanations: new Map(),
        qualityMetrics: {
          parseSuccessRate: 0,
          duplicateRejectionRate: 0,
          explanationCoverage: 0,
          semanticQualityScore: 0.5,
          averageSteps: 0,
          mathAccuracy: 0
        },
        generationTime: Date.now() - startTime,
        source: 'fallback',
        errors
      };
      
      setResult(fallbackResult);
    } finally {
      setIsProcessing(false);
    }
  }, [category, grade, userId, totalQuestions, problems, baseGenerateProblems, finalOptions]);

  // Auto-generate when needed
  useEffect(() => {
    if (autoGenerate && !result && !isProcessing && problems.length > 0) {
      generateEnhancedQuestions();
    }
  }, [autoGenerate, result, isProcessing, problems.length, generateEnhancedQuestions]);

  /**
   * Enhanced parsing phase
   */
  const enhanceWithImprovedParsing = async (
    questions: SelectionQuestion[],
    options: ImprovedGenerationOptions
  ): Promise<SelectionQuestion[]> => {
    if (!options.enableImprovedMathParsing) return questions;

    console.log('🔍 Applying improved math parsing to', questions.length, 'questions');

    const enhancedQuestions: SelectionQuestion[] = [];

    for (const question of questions) {
      try {
        if (question.type === 'math' || category.toLowerCase() === 'mathematik') {
          const parseResult = ImprovedGermanMathParser.parse(question.question);
          
          if (parseResult.success && parseResult.confidence && parseResult.confidence > 0.7) {
            // Use improved parsing result - handle different question types
            let enhancedQuestion: SelectionQuestion;
            
            if (question.questionType === 'text-input') {
              enhancedQuestion = {
                ...question,
                answer: parseResult.answer,
                explanation: question.explanation + 
                  (parseResult.steps ? '\n\nLösungsweg: ' + parseResult.steps.join(', ') : '')
              };
            } else {
              // For non-text-input questions, preserve original structure
              enhancedQuestion = {
                ...question,
                explanation: question.explanation + 
                  (parseResult.steps ? '\n\nLösungsweg: ' + parseResult.steps.join(', ') : '')
              };
            }
            
            // Store metadata separately if needed
            (enhancedQuestion as any).metadata = {
              ...((question as any).metadata || {}),
              improvedParsing: true,
              confidence: parseResult.confidence,
              questionType: parseResult.questionType,
              parsingMetadata: parseResult.metadata
            };
            enhancedQuestions.push(enhancedQuestion);
            console.log(`✅ Enhanced parsing for: ${question.question.substring(0, 30)}...`);
          } else {
            enhancedQuestions.push(question);
          }
        } else {
          enhancedQuestions.push(question);
        }
      } catch (error) {
        console.warn('⚠️ Parsing enhancement failed for question:', error);
        enhancedQuestions.push(question);
      }
    }

    console.log(`🔍 Parsing enhancement: ${enhancedQuestions.length}/${questions.length} processed`);
    return enhancedQuestions;
  };

  /**
   * Semantic duplicate detection phase
   */
  const applySemanticDuplicateDetection = async (
    questions: SelectionQuestion[],
    options: ImprovedGenerationOptions
  ): Promise<SelectionQuestion[]> => {
    if (!options.enableSemanticDuplicateDetection) return questions;

    console.log('🔍 Applying semantic duplicate detection');

    // Get session history for comparison
    const sessionId = ImprovedDuplicateDetectionEngine.initSession(userId, category, grade);
    const sessionStats = ImprovedDuplicateDetectionEngine.getSessionStats(sessionId);
    
    const previousQuestions = sessionStats?.questionsGenerated > 0 ? 
      await getPreviousQuestionsFromDatabase(userId, category, grade) : [];

    // Apply semantic analysis
    const analysisResult = SemanticDuplicateDetector.analyzeQuestionSet(
      [...previousQuestions, ...questions],
      options.strictDuplicateMode
    );

    const uniqueQuestions = analysisResult.unique.filter(q => 
      questions.some(originalQ => originalQ.id === q.id)
    );

    // Register unique questions in session
    uniqueQuestions.forEach(q => {
      ImprovedDuplicateDetectionEngine.registerQuestion(sessionId, q);
    });

    console.log(`🔍 Semantic duplicate detection: ${uniqueQuestions.length}/${questions.length} unique`);
    console.log(`📊 Analysis stats:`, analysisResult.stats);

    return uniqueQuestions;
  };

  /**
   * Quality assurance phase
   */
  const applyQualityAssurance = async (
    questions: SelectionQuestion[],
    options: ImprovedGenerationOptions
  ): Promise<SelectionQuestion[]> => {
    if (!options.enableQualityAssurance) return questions;

    console.log('🔍 Applying quality assurance');

    const qualityCheckedQuestions: SelectionQuestion[] = [];

    for (const question of questions) {
      // Basic quality checks
      if (question.question.length < 10 || question.question.length > 300) {
        console.log(`🚫 Question too short/long: ${question.question.substring(0, 30)}...`);
        continue;
      }

      // Check for placeholder values
      if (question.question.includes('undefined') || 
          question.question.includes('NaN') ||
          question.question.includes('null')) {
        console.log(`🚫 Question contains placeholders: ${question.question.substring(0, 30)}...`);
        continue;
      }

      // Math-specific quality checks
      if (question.type === 'math') {
        const hasValidAnswer = (question as any).answer !== undefined && 
                              (question as any).answer !== null &&
                              !isNaN(Number((question as any).answer));
        
        if (!hasValidAnswer) {
          console.log(`🚫 Math question without valid answer: ${question.question.substring(0, 30)}...`);
          continue;
        }
      }

      qualityCheckedQuestions.push(question);
    }

    console.log(`🔍 Quality assurance: ${qualityCheckedQuestions.length}/${questions.length} passed`);
    return qualityCheckedQuestions;
  };

  /**
   * Step-by-step explanation generation
   */
  const generateDetailedExplanations = async (
    questions: SelectionQuestion[],
    options: ImprovedGenerationOptions
  ): Promise<Map<string, DetailedExplanation>> => {
    if (!options.enableStepByStepExplanations) return new Map();

    console.log('📚 Generating step-by-step explanations');

    const explanations = new Map<string, DetailedExplanation>();

    for (const question of questions) {
      try {
        const explanation = StepByStepExplainer.explain(question, (question as any).answer);
        explanations.set(question.id.toString(), explanation);
        console.log(`📚 Generated ${explanation.steps.length} steps for question ${question.id}`);
      } catch (error) {
        console.warn(`⚠️ Failed to generate explanation for question ${question.id}:`, error);
      }
    }

    console.log(`📚 Generated explanations for ${explanations.size}/${questions.length} questions`);
    return explanations;
  };

  /**
   * Quality metrics calculation
   */
  const calculateQualityMetrics = (
    originalQuestions: SelectionQuestion[],
    finalQuestions: SelectionQuestion[],
    explanations: Map<string, DetailedExplanation>,
    options: ImprovedGenerationOptions
  ): GenerationQualityMetrics => {
    
    const parseSuccessRate = finalQuestions.filter(q => 
      (q as any).metadata?.improvedParsing
    ).length / Math.max(finalQuestions.length, 1);

    const duplicateRejectionRate = originalQuestions.length > 0 ?
      1 - (finalQuestions.length / originalQuestions.length) : 0;

    const explanationCoverage = explanations.size / Math.max(finalQuestions.length, 1);

    const semanticQualityScore = finalQuestions.reduce((score, q) => {
      return score + ((q as any).metadata?.confidence || 0.5);
    }, 0) / Math.max(finalQuestions.length, 1);

    const averageSteps = Array.from(explanations.values())
      .reduce((sum, exp) => sum + exp.steps.length, 0) / Math.max(explanations.size, 1);

    const mathAccuracy = finalQuestions.filter(q => 
      q.type === 'math' && (q as any).answer !== undefined
    ).length / Math.max(finalQuestions.filter(q => q.type === 'math').length, 1);

    return {
      parseSuccessRate,
      duplicateRejectionRate,
      explanationCoverage,
      semanticQualityScore,
      averageSteps,
      mathAccuracy
    };
  };

  /**
   * Helper functions
   */
  const determineGenerationSource = (
    finalQuestions: SelectionQuestion[],
    originalQuestions: SelectionQuestion[]
  ): 'enhanced' | 'fallback' | 'hybrid' => {
    const enhancedCount = finalQuestions.filter(q => 
      (q as any).metadata?.improvedParsing
    ).length;

    if (enhancedCount === finalQuestions.length) return 'enhanced';
    if (enhancedCount === 0) return 'fallback';
    return 'hybrid';
  };

  const getPreviousQuestionsFromDatabase = async (
    userId: string,
    category: string,
    grade: number
  ): Promise<SelectionQuestion[]> => {
    try {
      // This would query a database of previously generated questions
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.warn('Failed to get previous questions:', error);
      return [];
    }
  };

  return {
    // Generation state
    isGenerating: isGenerating || isProcessing,
    isProcessing,
    processingStage,
    
    // Results
    result,
    questions: result?.questions || [],
    explanations: result?.explanations || new Map(),
    qualityMetrics: result?.qualityMetrics,
    
    // Actions
    generateEnhancedQuestions,
    
    // Status
    hasError: !!generationError || (result?.errors.length || 0) > 0,
    errors: result?.errors || (generationError ? [generationError] : []),
    
    // Metadata
    sessionId,
    generationSource: result?.source || generationSource,
    generationTime: result?.generationTime || 0,
    
    // Options
    options: finalOptions
  };
}