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
    const questionsArray = Array.from(questions);
    
    // FIXED: Rotate stored questions if too many
    const maxStoredQuestions = 200;
    if (questionsArray.length > maxStoredQuestions) {
      const recentQuestions = questionsArray.slice(-maxStoredQuestions / 2);
      localStorage.setItem(GLOBAL_QUESTIONS_KEY(category, grade, userId), JSON.stringify(recentQuestions));
      console.log(`💾 Rotated questions: ${questionsArray.length} -> ${recentQuestions.length}`);
    } else {
      localStorage.setItem(GLOBAL_QUESTIONS_KEY(category, grade, userId), JSON.stringify(questionsArray));
      console.log(`💾 Stored ${questionsArray.length} questions to localStorage`);
    }
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
          console.log(`➕ Adding question to global store: "${problem.question.substring(0, 30)}..."`);
        });
        
        setGlobalQuestions(updatedGlobalQuestions);
        storeQuestions(category, grade, userId, updatedGlobalQuestions);
        
        console.log(`✅ Using AI-generated problems: ${selectedProblems.length}`);
        setGenerationSource('ai');
        setIsGenerating(false);
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
      
      const response = await supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions + 5,
          excludeQuestions,
          sessionId,
          globalQuestionCount: globalQuestions.size,
          requestId: `ai_${Date.now()}_${Math.random()}`,
          forceVariation: true // FIXED: Force variation in AI generation
        }
      });

      console.log('📡 Full Supabase response:', response);

      if (response.error) {
        console.error('❌ Supabase function error:', response.error);
        return [];
      }

      const problems = response.data?.problems || [];
      console.log(`🎯 AI generated ${problems.length} problems`);
      
      // FIXED: Better duplicate detection
      const filteredProblems = problems.filter((problem: SelectionQuestion) => {
        const isDuplicate = Array.from(globalQuestions).some(existingQ => 
          similarity(problem.question.toLowerCase(), existingQ.toLowerCase()) > 0.8
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

  // FIXED: Better fallback with proper randomization
  const generateFallbackProblems = (): SelectionQuestion[] => {
    console.log('🔄 Generating fallback problems...');
    const fallbackProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const seed = Math.random() * 1000000;
      
      if (category === 'Mathematik') {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let a, b, answer, questionText;
        
        if (operation === '+') {
          a = Math.floor(Math.random() * 60) + 15; // 15-74
          b = Math.floor(Math.random() * 30) + 8;  // 8-37
          answer = a + b;
          questionText = `${a} + ${b} = ?`;
        } else if (operation === '-') {
          a = Math.floor(Math.random() * 100) + 40; // 40-139
          b = Math.floor(Math.random() * 30) + 10;  // 10-39
          answer = a - b;
          questionText = `${a} - ${b} = ?`;
        } else { // multiplication
          a = Math.floor(Math.random() * 15) + 4;  // 4-18
          b = Math.floor(Math.random() * 9) + 3;   // 3-11
          answer = a * b;
          questionText = `${a} × ${b} = ?`;
        }
        
        fallbackProblems.push({
          id: Math.floor(seed),
          questionType: 'text-input',
          question: questionText,
          answer: answer,
          type: 'math',
          explanation: `Fallback ${operation === '+' ? 'Addition' : operation === '-' ? 'Subtraktion' : 'Multiplikation'}`
        });
      } else {
        const num = Math.floor(Math.random() * 70) + 25; // 25-94
        const addend = Math.floor(Math.random() * 20) + 5; // 5-24
        fallbackProblems.push({
          id: Math.floor(seed),
          questionType: 'text-input',
          question: `Was ist ${num} + ${addend}?`,
          answer: num + addend,
          type: category.toLowerCase() as any,
          explanation: 'Einfache Rechnung'
        });
      }
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
