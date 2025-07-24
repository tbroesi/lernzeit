import { useState, useEffect, useRef, useCallback } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { useBalancedQuestionGeneration } from './useBalancedQuestionGeneration';

interface QuestionGenerationManagerProps {
  category: string;
  grade: number;
  userId: string;
  totalQuestions?: number;
  autoGenerate?: boolean;
}

export function useQuestionGenerationManager({
  category,
  grade,
  userId,
  totalQuestions = 5,
  autoGenerate = true
}: QuestionGenerationManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  // Track last generation parameters to prevent unnecessary regeneration
  const lastParamsRef = useRef<string>('');
  const initializationRef = useRef(false);
  
  const {
    problems,
    isGenerating,
    generationSource,
    sessionId,
    generateProblems
  } = useBalancedQuestionGeneration(category, grade, userId, totalQuestions);

  // Create stable parameter signature
  const currentParams = `${category}-${grade}-${userId}-${totalQuestions}`;

  // Reset initialization when parameters change
  useEffect(() => {
    if (lastParamsRef.current !== currentParams) {
      console.log('📝 Parameters changed, resetting initialization');
      setIsInitialized(false);
      setGenerationError(null);
      setRetryCount(0);
      initializationRef.current = false;
      lastParamsRef.current = currentParams;
    }
  }, [currentParams]);

  // Auto-generate questions when needed
  useEffect(() => {
    if (!autoGenerate) return;
    
    // Don't initialize if already done for these parameters
    if (initializationRef.current) {
      console.log('📝 Already initialized for current parameters, skipping');
      return;
    }
    
    // Don't generate if already generating or if we have problems
    if (isGenerating || problems.length >= totalQuestions) {
      console.log('📝 Skipping generation - isGenerating:', isGenerating, 'problems:', problems.length);
      return;
    }
    
    // Don't generate if we've exceeded retries
    if (retryCount >= maxRetries) {
      console.log('📝 Max retries exceeded, stopping auto-generation');
      setGenerationError(`Failed to generate questions after ${maxRetries} attempts`);
      return;
    }

    console.log('🚀 Auto-generating questions for:', currentParams);
    initializationRef.current = true;
    
    const generateWithErrorHandling = async () => {
      try {
        setGenerationError(null);
        await generateProblems();
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Generation failed:', error);
        setGenerationError(error instanceof Error ? error.message : 'Unknown error');
        setRetryCount(prev => prev + 1);
        initializationRef.current = false; // Allow retry
      }
    };

    generateWithErrorHandling();
  }, [
    autoGenerate, 
    isGenerating, 
    problems.length, 
    totalQuestions, 
    retryCount, 
    maxRetries, 
    generateProblems,
    currentParams
  ]);

  // Update initialized state when we have enough problems
  useEffect(() => {
    if (problems.length >= totalQuestions && !isGenerating) {
      setIsInitialized(true);
      setGenerationError(null);
    }
  }, [problems.length, totalQuestions, isGenerating]);

  const manualRetry = useCallback(async () => {
    console.log('🔄 Manual retry requested');
    setRetryCount(0);
    setGenerationError(null);
    setIsInitialized(false);
    initializationRef.current = false;
    
    try {
      await generateProblems();
    } catch (error) {
      console.error('❌ Manual retry failed:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [generateProblems]);

  const refreshQuestions = useCallback(async () => {
    console.log('🔄 Refreshing questions');
    setIsInitialized(false);
    initializationRef.current = false;
    
    try {
      await generateProblems();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [generateProblems]);

  return {
    problems,
    isGenerating,
    isInitialized,
    generationSource,
    sessionId,
    generationError,
    retryCount,
    maxRetries,
    canRetry: retryCount < maxRetries,
    hasProblems: problems.length > 0,
    isComplete: problems.length >= totalQuestions,
    manualRetry,
    refreshQuestions,
    generateProblems
  };
}