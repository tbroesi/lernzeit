
import { useState, useCallback } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';

export function useSimpleQuestionGeneration(
  category: string, 
  grade: number, 
  userId: string, 
  totalQuestions: number = 5
) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'ai' | 'simple' | null>(null);
  const [sessionId] = useState(() => `simple_${Date.now()}_${Math.random()}`);

  const generateSimpleProblems = useCallback((): SelectionQuestion[] => {
    console.log('🚀 Generating simple problems for:', category);
    const simpleProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const id = Math.floor(Math.random() * 1000000);
      
      if (category === 'Mathematik') {
        // Simple math problems based on grade
        const gradeMultiplier = Math.max(1, grade - 1);
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let a, b, answer, questionText;
        
        switch (operation) {
          case '+':
            a = Math.floor(Math.random() * (20 + gradeMultiplier * 10)) + 5;
            b = Math.floor(Math.random() * (15 + gradeMultiplier * 5)) + 3;
            answer = a + b;
            questionText = `${a} + ${b} = ?`;
            break;
          case '-':
            a = Math.floor(Math.random() * (30 + gradeMultiplier * 15)) + 20;
            b = Math.floor(Math.random() * (15 + gradeMultiplier * 5)) + 5;
            answer = a - b;
            questionText = `${a} - ${b} = ?`;
            break;
          case '*':
            a = Math.floor(Math.random() * Math.min(12, 3 + gradeMultiplier * 2)) + 2;
            b = Math.floor(Math.random() * Math.min(10, 2 + gradeMultiplier)) + 2;
            answer = a * b;
            questionText = `${a} × ${b} = ?`;
            break;
          default:
            a = 5;
            b = 3;
            answer = 8;
            questionText = '5 + 3 = ?';
        }
        
        simpleProblems.push({
          id,
          questionType: 'text-input',
          question: questionText,
          answer,
          type: 'math',
          explanation: `Die Lösung ist ${answer}`
        });
      } else if (category === 'Deutsch') {
        // Simple German problems
        const words = ['Hund', 'Katze', 'Baum', 'Haus', 'Auto', 'Buch', 'Tisch', 'Blume'];
        const word = words[Math.floor(Math.random() * words.length)];
        const syllables = Math.max(1, Math.ceil(word.length / 2.5));
        
        simpleProblems.push({
          id,
          questionType: 'text-input',
          question: `Wie viele Silben hat das Wort "${word}"?`,
          answer: syllables,
          type: 'german',
          explanation: `Das Wort "${word}" hat ${syllables} Silben`
        });
      } else {
        // Generic problems for other subjects
        const num1 = Math.floor(Math.random() * 50) + 10;
        const num2 = Math.floor(Math.random() * 20) + 5;
        const result = num1 + num2;
        
        simpleProblems.push({
          id,
          questionType: 'text-input',
          question: `Was ist ${num1} + ${num2}?`,
          answer: result,
          type: category.toLowerCase() as any,
          explanation: `Die Antwort ist ${result}`
        });
      }
    }
    
    return simpleProblems;
  }, [category, grade, totalQuestions]);

  const generateProblems = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    console.log('🎯 Starting simple question generation');
    
    try {
      // Try AI generation first with short timeout
      const aiProblems = await generateAIProblems();
      
      if (aiProblems.length >= totalQuestions) {
        console.log('✅ Using AI problems');
        setProblems(aiProblems.slice(0, totalQuestions));
        setGenerationSource('ai');
      } else {
        console.log('⚡ Using simple fallback');
        const simpleProblems = generateSimpleProblems();
        setProblems(simpleProblems);
        setGenerationSource('simple');
      }
    } catch (error) {
      console.error('❌ Generation failed, using simple fallback:', error);
      const simpleProblems = generateSimpleProblems();
      setProblems(simpleProblems);
      setGenerationSource('simple');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, totalQuestions, generateSimpleProblems]);

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    console.log('🤖 Trying AI generation with timeout');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions,
          excludeQuestions: [],
          sessionId,
          requestId: `simple_${Date.now()}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.error) {
        console.warn('AI generation failed:', response.error);
        return [];
      }
      
      const problems = response.data?.problems || [];
      console.log(`🎯 AI generated ${problems.length} problems`);
      return problems;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('AI generation timed out or failed:', error);
      return [];
    }
  };

  return {
    problems,
    isGenerating,
    generationSource,
    sessionId,
    generateProblems
  };
}
