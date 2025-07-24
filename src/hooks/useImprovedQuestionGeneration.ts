import { useState, useCallback } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';

export function useImprovedQuestionGeneration(
  category: string, 
  grade: number, 
  userId: string, 
  totalQuestions: number = 5
) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'ai' | 'template' | 'simple' | null>(null);
  const [sessionId] = useState(() => `improved_${Date.now()}_${Math.random()}`);

  const generateGradeAppropriateTemplates = useCallback((): SelectionQuestion[] => {
    console.log(`🎯 Generating grade-appropriate templates for grade ${grade}`);
    const templateProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const id = Math.floor(Math.random() * 1000000);
      
      if (category === 'Mathematik') {
        // Grade-appropriate math problems
        const complexity = Math.max(1, grade - 2);
        const maxNumber = Math.min(100, 10 + (grade * 15));
        const minNumber = Math.max(1, grade * 2);
        
        const operations = [
          {
            name: 'addition',
            symbol: '+',
            calculate: (a: number, b: number) => a + b,
            description: 'Addition'
          },
          {
            name: 'subtraction', 
            symbol: '-',
            calculate: (a: number, b: number) => Math.max(0, a - b),
            description: 'Subtraktion'
          }
        ];

        // Add multiplication for grades 3+
        if (grade >= 3) {
          operations.push({
            name: 'multiplication',
            symbol: '×',
            calculate: (a: number, b: number) => a * b,
            description: 'Multiplikation'
          });
        }

        // Add division for grades 4+
        if (grade >= 4) {
          operations.push({
            name: 'division',
            symbol: '÷',
            calculate: (a: number, b: number) => b !== 0 ? a / b : 0,
            description: 'Division'
          });
        }

        const operation = operations[Math.floor(Math.random() * operations.length)];
        let a = Math.floor(Math.random() * maxNumber) + minNumber;
        let b = Math.floor(Math.random() * (maxNumber / 2)) + minNumber;

        // Ensure valid operations
        if (operation.name === 'subtraction' && b > a) {
          [a, b] = [b, a]; // Swap to avoid negative results
        }
        
        if (operation.name === 'division') {
          // Ensure clean division
          a = b * Math.floor(Math.random() * 10 + 1);
        }

        const answer = operation.calculate(a, b);
        const questionText = `${a} ${operation.symbol} ${b} = ?`;

        templateProblems.push({
          id,
          questionType: 'text-input',
          question: questionText,
          answer: answer.toString(),
          type: 'math',
          explanation: `${a} ${operation.symbol} ${b} = ${answer}. Das ist ${operation.description}.`
        });

      } else if (category === 'Deutsch') {
        // Grade-appropriate German problems - Fixed typing
        const germanProblems = [
          // Grades 1-2: Basic word recognition
          ...(grade <= 2 ? [
            {
              question: 'Welches Wort ist richtig geschrieben?',
              questionType: 'multiple-choice' as const,
              options: ['Hund', 'Hunt', 'Hundt', 'Huntd'],
              correctAnswer: 0,
              explanation: 'Das Wort "Hund" wird mit "d" am Ende geschrieben.'
            },
            {
              question: 'Wie viele Buchstaben hat das Wort "Katze"?',
              questionType: 'text-input' as const,
              answer: '5',
              explanation: 'Das Wort "Katze" hat 5 Buchstaben: K-a-t-z-e.'
            }
          ] : []),
          
          // Grades 3-4: Grammar basics
          ...(grade >= 3 && grade <= 4 ? [
            {
              question: 'Welche Wortart ist "schnell"?',
              questionType: 'multiple-choice' as const,
              options: ['Nomen', 'Verb', 'Adjektiv', 'Artikel'],
              correctAnswer: 2,
              explanation: '"Schnell" ist ein Adjektiv (Eigenschaftswort).'
            },
            {
              question: 'Wie lautet die Mehrzahl von "Baum"?',
              questionType: 'text-input' as const,
              answer: 'Bäume',
              explanation: 'Die Mehrzahl von "Baum" ist "Bäume".'
            }
          ] : []),
          
          // Grades 5+: Advanced grammar
          ...(grade >= 5 ? [
            {
              question: 'In welcher Zeitform steht "Er ist gegangen"?',
              questionType: 'multiple-choice' as const,
              options: ['Präsens', 'Präteritum', 'Perfekt', 'Futur'],
              correctAnswer: 2,
              explanation: '"Er ist gegangen" steht im Perfekt (vollendete Gegenwart).'
            },
            {
              question: 'Welcher Fall wird hier verwendet: "Ich gebe dem Kind einen Ball"?',
              questionType: 'text-input' as const,
              answer: 'Dativ',
              explanation: '"Dem Kind" steht im Dativ (3. Fall).'
            }
          ] : [])
        ];

        const problem = germanProblems[Math.floor(Math.random() * germanProblems.length)];
        
        // Create properly typed question based on questionType
        if (problem.questionType === 'multiple-choice') {
          templateProblems.push({
            id,
            questionType: 'multiple-choice',
            question: problem.question,
            options: problem.options,
            correctAnswer: problem.correctAnswer,
            type: 'german',
            explanation: problem.explanation
          });
        } else {
          templateProblems.push({
            id,
            questionType: 'text-input',
            question: problem.question,
            answer: problem.answer,
            type: 'german',
            explanation: problem.explanation
          });
        }
      }
    }
    
    return templateProblems;
  }, [category, grade, totalQuestions]);

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    console.log('🤖 Attempting improved AI generation');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), 12000); // Increased timeout
    });
    
    try {
      const aiPromise = supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions,
          excludeQuestions: [],
          sessionId,
          requestId: `improved_${Date.now()}`,
          gradeRequirement: `strict_grade_${grade}`, // Enforce grade level
          qualityThreshold: 0.8 // Higher quality threshold
        }
      });
      
      const response = await Promise.race([aiPromise, timeoutPromise]);
      
      if (response.error) {
        console.warn('AI generation failed:', response.error);
        return [];
      }
      
      const problems = response.data?.problems || [];
      console.log(`✅ AI generated ${problems.length} problems`);
      
      return problems.map((problem: SelectionQuestion) => ({
        ...problem,
        explanation: problem.explanation || `Erklärung für: ${problem.question}`
      }));
    } catch (error) {
      console.warn('AI generation failed:', error);
      return [];
    }
  };

  const generateProblems = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    console.log('🚀 Starting improved question generation');
    
    try {
      // Try AI first with improved prompts
      const aiProblems = await generateAIProblems();
      
      if (aiProblems.length >= totalQuestions) {
        console.log('✅ Using AI problems');
        setProblems(aiProblems.slice(0, totalQuestions));
        setGenerationSource('ai');
        return;
      }
      
      // Fall back to improved templates
      console.log('📚 Using improved template problems');
      const templateProblems = generateGradeAppropriateTemplates();
      setProblems(templateProblems);
      setGenerationSource('template');
      
    } catch (error) {
      console.error('❌ All generation failed:', error);
      // Last resort: simple math only
      const fallbackProblems = generateGradeAppropriateTemplates();
      setProblems(fallbackProblems);
      setGenerationSource('simple');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, totalQuestions, generateGradeAppropriateTemplates]);

  return {
    problems,
    isGenerating,
    generationSource,
    sessionId,
    generateProblems
  };
}
