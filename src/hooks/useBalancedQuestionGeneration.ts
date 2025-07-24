import { useState, useCallback } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';

export function useBalancedQuestionGeneration(
  category: string, 
  grade: number, 
  userId: string, 
  totalQuestions: number = 5
) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'ai' | 'template' | 'simple' | null>(null);
  const [sessionId] = useState(() => `balanced_${Date.now()}_${Math.random()}`);

  const generateTemplateProblems = useCallback((): SelectionQuestion[] => {
    console.log(`🎯 Generating improved template problems for grade ${grade}`);
    const templateProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const id = Math.floor(Math.random() * 1000000);
      const problemTypes = ['text-input', 'multiple-choice', 'word-selection'];
      const randomType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
      
      if (category === 'Mathematik') {
        // Grade-appropriate math complexity
        const baseComplexity = Math.max(1, grade - 1);
        const maxNumber = Math.min(1000, 10 + (grade * 20));
        const minNumber = Math.max(1, grade);
        
        if (randomType === 'multiple-choice') {
          const operations = [
            { symbol: '+', name: 'Addition', calc: (a: number, b: number) => a + b },
            { symbol: '-', name: 'Subtraktion', calc: (a: number, b: number) => Math.max(0, a - b) },
            ...(grade >= 3 ? [{ symbol: '×', name: 'Multiplikation', calc: (a: number, b: number) => a * b }] : []),
            ...(grade >= 4 ? [{ symbol: '÷', name: 'Division', calc: (a: number, b: number) => b !== 0 ? a / b : 0 }] : [])
          ];
          
          const operation = operations[Math.floor(Math.random() * operations.length)];
          let a = Math.floor(Math.random() * maxNumber) + minNumber;
          let b = Math.floor(Math.random() * (maxNumber / 2)) + minNumber;
          
          // Ensure valid operations
          if (operation.symbol === '-' && b > a) [a, b] = [b, a];
          if (operation.symbol === '÷') a = b * Math.floor(Math.random() * 10 + 1);
          
          const correctAnswer = operation.calc(a, b);
          const wrongAnswers = [
            correctAnswer + Math.floor(Math.random() * 5) + 1,
            correctAnswer - Math.floor(Math.random() * 5) - 1,
            correctAnswer + Math.floor(Math.random() * 10) + 5
          ].filter(x => x !== correctAnswer && x >= 0);
          
          const allOptions = [correctAnswer, ...wrongAnswers.slice(0, 3)];
          const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
          const correctIndex = shuffledOptions.indexOf(correctAnswer);
          
          templateProblems.push({
            id,
            questionType: 'multiple-choice',
            question: `Was ist ${a} ${operation.symbol} ${b}?`,
            options: shuffledOptions.map(String),
            correctAnswer: correctIndex,
            type: 'math',
            explanation: `${a} ${operation.symbol} ${b} = ${correctAnswer}. Das ist ${operation.name}.`
          });
          
        } else if (randomType === 'word-selection') {
          const mathTerms = [
            ...(grade >= 1 ? ['Addition', 'Subtraktion', 'Plus', 'Minus'] : []),
            ...(grade >= 3 ? ['Multiplikation', 'Division', 'Mal', 'Geteilt'] : []),
            ...(grade >= 4 ? ['Gleichung', 'Summe', 'Differenz', 'Produkt'] : []),
            ...(grade >= 5 ? ['Quotient', 'Bruch', 'Prozent'] : [])
          ];
          
          const correctTerm = mathTerms[Math.floor(Math.random() * mathTerms.length)];
          const sentence = `Bei der Aufgabe 8 + 3 = 11 handelt es sich um eine ${correctTerm}.`;
          const words = sentence.split(' ');
          const correctIndex = words.findIndex(word => word.includes(correctTerm));
          
          templateProblems.push({
            id,
            questionType: 'word-selection',
            question: 'Wähle den richtigen mathematischen Begriff:',
            sentence,
            selectableWords: words.map((word, index) => ({
              word,
              isCorrect: index === correctIndex,
              index
            })),
            type: 'math',
            explanation: `Der Begriff "${correctTerm}" ist korrekt für diese Art von Aufgabe.`
          });
          
        } else {
          // Text input with grade-appropriate word problems
          const wordProblems = [
            ...(grade >= 1 ? [
              {
                template: 'Lisa hat {a} Stifte und bekommt {b} weitere. Wie viele Stifte hat sie insgesamt?',
                calculate: (a: number, b: number) => a + b,
                explanation: (a: number, b: number, result: number) => `Lisa hatte ${a} Stifte und bekam ${b} dazu: ${a} + ${b} = ${result} Stifte.`
              }
            ] : []),
            ...(grade >= 3 ? [
              {
                template: 'In jeder Schachtel sind {a} Bonbons. Max hat {b} Schachteln. Wie viele Bonbons hat er insgesamt?',
                calculate: (a: number, b: number) => a * b,
                explanation: (a: number, b: number, result: number) => `${b} Schachteln mit je ${a} Bonbons: ${a} × ${b} = ${result} Bonbons.`
              }
            ] : []),
            ...(grade >= 4 ? [
              {
                template: '{a} Äpfel sollen gleichmäßig auf {b} Kinder verteilt werden. Wie viele Äpfel bekommt jedes Kind?',
                calculate: (a: number, b: number) => Math.floor(a / b),
                explanation: (a: number, b: number, result: number) => `${a} Äpfel geteilt durch ${b} Kinder: ${a} ÷ ${b} = ${result} Äpfel pro Kind.`
              }
            ] : [])
          ];
          
          const wordProblem = wordProblems[Math.floor(Math.random() * wordProblems.length)];
          let a = Math.floor(Math.random() * (maxNumber / 2)) + minNumber;
          let b = Math.floor(Math.random() * (maxNumber / 3)) + minNumber;
          
          // Ensure valid operations for division
          if (wordProblem.template.includes('verteilt')) {
            a = b * Math.floor(Math.random() * 10 + 1);
          }
          
          const answer = wordProblem.calculate(a, b);
          const questionText = wordProblem.template.replace('{a}', a.toString()).replace('{b}', b.toString());
          
          templateProblems.push({
            id,
            questionType: 'text-input',
            question: questionText,
            answer: answer.toString(),
            type: 'math',
            explanation: wordProblem.explanation(a, b, answer)
          });
        }
        
      } else if (category === 'Deutsch') {
        // Grade-appropriate German problems
        const germanProblems = [
          // Basic problems for lower grades
          ...(grade <= 2 ? [
            {
              question: 'Welcher Buchstabe kommt nach "F"?',
              questionType: 'text-input' as const,
              answer: 'G',
              explanation: 'Nach dem Buchstaben "F" kommt "G" im Alphabet.'
            },
            {
              question: 'Wie viele Silben hat das Wort "Blume"?',
              questionType: 'text-input' as const,
              answer: '2',
              explanation: 'Das Wort "Blume" hat 2 Silben: Blu-me.'
            }
          ] : []),
          
          // Intermediate problems for grades 3-4
          ...(grade >= 3 && grade <= 4 ? [
            {
              question: 'Welche Wortart ist "schön"?',
              questionType: 'multiple-choice' as const,
              options: ['Nomen', 'Verb', 'Adjektiv', 'Artikel'],
              correctAnswer: 2,
              explanation: '"Schön" ist ein Adjektiv (Eigenschaftswort).'
            },
            {
              question: 'Wie heißt die Mehrzahl von "Maus"?',
              questionType: 'text-input' as const,
              answer: 'Mäuse',
              explanation: 'Die Mehrzahl von "Maus" ist "Mäuse".'
            }
          ] : []),
          
          // Advanced problems for grades 5+
          ...(grade >= 5 ? [
            {
              question: 'In welcher Zeitform steht "Ich habe gelesen"?',
              questionType: 'multiple-choice' as const,
              options: ['Präsens', 'Präteritum', 'Perfekt', 'Futur'],
              correctAnswer: 2,
              explanation: '"Ich habe gelesen" steht im Perfekt (vollendete Gegenwart).'
            },
            {
              question: 'Welcher Fall wird hier verwendet: "Ich schenke der Mutter Blumen"?',
              questionType: 'text-input' as const,
              answer: 'Dativ',
              explanation: '"Der Mutter" steht im Dativ (3. Fall).'
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

  const generateSimpleFallback = useCallback((): SelectionQuestion[] => {
    console.log('🔄 Using simple fallback generation');
    const simpleProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const id = Math.floor(Math.random() * 1000000);
      const maxNum = Math.min(100, 10 + (grade * 10));
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * (maxNum / 2)) + 1;
      const answer = a + b;
      
      simpleProblems.push({
        id,
        questionType: 'text-input',
        question: `${a} + ${b} = ?`,
        answer: answer.toString(),
        type: 'math',
        explanation: `Die Lösung ist ${answer}, weil ${a} + ${b} = ${answer}.`
      });
    }
    
    return simpleProblems;
  }, [grade, totalQuestions]);

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    console.log('🤖 Trying AI generation with improved prompts');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), 10000);
    });
    
    try {
      const aiPromise = supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions,
          excludeQuestions: [],
          sessionId,
          requestId: `balanced_${Date.now()}`,
          gradeRequirement: `grade_${grade}_appropriate`,
          qualityThreshold: 0.7
        }
      });
      
      const response = await Promise.race([aiPromise, timeoutPromise]);
      
      if (response.error) {
        console.warn('AI generation failed:', response.error);
        return [];
      }
      
      const problems = response.data?.problems || [];
      console.log(`🎯 AI generated ${problems.length} problems`);
      
      return problems.map((problem: SelectionQuestion) => ({
        ...problem,
        explanation: problem.explanation || `Erklärung für: ${problem.question}`
      }));
    } catch (error) {
      console.warn('AI generation timed out or failed:', error);
      return [];
    }
  };

  const generateProblems = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    console.log('🎯 Starting balanced question generation');
    
    try {
      // Try AI first
      const aiProblems = await generateAIProblems();
      
      if (aiProblems.length >= totalQuestions) {
        console.log('✅ Using AI problems');
        setProblems(aiProblems.slice(0, totalQuestions));
        setGenerationSource('ai');
        return;
      }
      
      // Fall back to improved templates
      console.log('🎨 AI insufficient, using improved template problems');
      const templateProblems = generateTemplateProblems();
      setProblems(templateProblems);
      setGenerationSource('template');
      
    } catch (error) {
      console.error('❌ Generation failed, using simple fallback:', error);
      const simpleProblems = generateSimpleFallback();
      setProblems(simpleProblems);
      setGenerationSource('simple');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, totalQuestions, generateTemplateProblems, generateSimpleFallback]);

  return {
    problems,
    isGenerating,
    generationSource,
    sessionId,
    generateProblems
  };
}
