
import { useState, useEffect } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';

// Storage utilities
const GLOBAL_QUESTIONS_KEY = (category: string, grade: number, userId: string) => 
  `global_questions_${category}_${grade}_${userId}`;

const SESSION_KEY = (category: string, grade: number, userId: string) => 
  `session_${category}_${grade}_${userId}`;

const getStoredQuestions = (category: string, grade: number, userId: string): Set<string> => {
  try {
    const stored = localStorage.getItem(GLOBAL_QUESTIONS_KEY(category, grade, userId));
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const storeQuestions = (category: string, grade: number, userId: string, questions: Set<string>) => {
  try {
    localStorage.setItem(GLOBAL_QUESTIONS_KEY(category, grade, userId), JSON.stringify(Array.from(questions)));
  } catch (e) {
    console.warn('Failed to store questions:', e);
  }
};

export function useQuestionGeneration(category: string, grade: number, userId: string, totalQuestions: number = 5) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [globalQuestions, setGlobalQuestions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'ai' | 'fallback' | null>(null);
  const [sessionId] = useState(() => {
    // Immer neue Session-ID für mehr Varianz
    const newSessionId = `session_${Date.now()}_${Math.random()}`;
    const storageKey = SESSION_KEY(category, grade, userId);
    localStorage.setItem(storageKey, newSessionId);
    console.log('🆕 New session ID created:', newSessionId);
    return newSessionId;
  });

  useEffect(() => {
    const storedQuestions = getStoredQuestions(category, grade, userId);
    setGlobalQuestions(storedQuestions);
    console.log(`🔄 Loaded ${storedQuestions.size} previously asked questions for ${category} Grade ${grade}`);
  }, [category, grade, userId]);

  const generateProblems = async () => {
    setIsGenerating(true);
    
    try {
      console.log(`🔄 Generating problems for ${category}, Grade ${grade}`);
      console.log(`📝 Global questions stored: ${globalQuestions.size}`);

      // Try AI generation first
      const aiProblems = await generateAIProblems();
      
      if (aiProblems.length >= totalQuestions) {
        const selectedProblems = aiProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        
        // Update global question tracking
        const updatedGlobalQuestions = new Set(globalQuestions);
        selectedProblems.forEach(problem => {
          updatedGlobalQuestions.add(problem.question);
        });
        setGlobalQuestions(updatedGlobalQuestions);
        storeQuestions(category, grade, userId, updatedGlobalQuestions);
        
        console.log(`✅ Using AI-generated problems: ${selectedProblems.length}`);
        console.log(`📊 Total questions now stored: ${updatedGlobalQuestions.size}`);
        setGenerationSource('ai');
        setIsGenerating(false); // WICHTIG: Status hier setzen
        return;
      }
    } catch (error) {
      console.error('❌ AI generation failed:', error);
    }

    // Fallback to local generation
    console.log('🔄 Using fallback problem generation...');
    const fallbackProblems = generateFallbackProblems();
    setProblems(fallbackProblems);
    setGenerationSource('fallback');

    setIsGenerating(false);
  };

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    try {
      console.log('🤖 Attempting AI generation via Supabase Edge Function...');
      
      const excludeQuestions = Array.from(globalQuestions);
      console.log(`📝 Excluding ${excludeQuestions.length} global questions`);
      console.log(`📋 Sample excluded questions:`, excludeQuestions.slice(0, 3));
      
      const response = await supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions + 5,
          excludeQuestions,
          sessionId,
          globalQuestionCount: globalQuestions.size,
          requestId: `${Date.now()}_${Math.random()}`
        }
      });

      console.log('📡 Full Supabase response:', response);

      if (response.error) {
        console.error('❌ Supabase function error:', response.error);
        return [];
      }

      const problems = response.data?.problems || [];
      console.log(`🎯 AI generated ${problems.length} problems`);
      console.log(`📋 Sample AI questions:`, problems.slice(0, 2).map(p => p.question));
      
      const filteredProblems = problems.filter((problem: SelectionQuestion) => {
        const isDuplicate = Array.from(globalQuestions).some(existingQ => 
          similarity(problem.question.toLowerCase(), existingQ.toLowerCase()) > 0.7
        );
        if (isDuplicate) {
          console.log(`🚫 Filtered duplicate: "${problem.question}"`);
        }
        return !isDuplicate;
      });
      
      console.log(`✅ After filtering: ${filteredProblems.length} unique problems`);
      return filteredProblems;
    } catch (error) {
      console.error('❌ Error calling AI generation:', error);
      return [];
    }
  };

  const generateFallbackProblems = (): SelectionQuestion[] => {
    console.log('🔄 Generating fallback problems...');
    const fallbackProblems: SelectionQuestion[] = [];
    
    // Generate simple math problems as fallback
    for (let i = 0; i < totalQuestions; i++) {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 30) + 5;
      const operation = Math.random() > 0.5 ? '+' : '-';
      const answer = operation === '+' ? a + b : a - b;
      
      fallbackProblems.push({
        id: Math.floor(Math.random() * 1000000),
        questionType: 'text-input',
        question: `${a} ${operation} ${b} = ?`,
        answer: answer,
        type: 'math',
        explanation: `${a} ${operation} ${b} = ${answer}`
      });
    }
    
    return fallbackProblems;
  };

  const similarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
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
  };

  return {
    problems,
    globalQuestions,
    sessionId,
    isGenerating,
    generationSource,
    generateProblems
  };
}
