
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
    console.log('🎯 Generating template-based problems for:', category);
    const templateProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const id = Math.floor(Math.random() * 1000000);
      const problemTypes = ['text-input', 'multiple-choice', 'word-selection'];
      const randomType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
      
      if (category === 'Mathematik') {
        if (randomType === 'multiple-choice') {
          // Multiple Choice Mathe-Aufgabe
          const a = Math.floor(Math.random() * (15 + grade * 5)) + 5;
          const b = Math.floor(Math.random() * (10 + grade * 3)) + 3;
          const correctAnswer = a + b;
          const wrongAnswers = [
            correctAnswer + Math.floor(Math.random() * 5) + 1,
            correctAnswer - Math.floor(Math.random() * 5) - 1,
            correctAnswer + Math.floor(Math.random() * 10) + 5
          ];
          const allOptions = [correctAnswer, ...wrongAnswers];
          const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
          const correctIndex = shuffledOptions.indexOf(correctAnswer);
          
          templateProblems.push({
            id,
            questionType: 'multiple-choice',
            question: `Was ist ${a} + ${b}?`,
            options: shuffledOptions.map(String),
            correctAnswer: correctIndex,
            type: 'math',
            explanation: `${a} + ${b} = ${correctAnswer}`
          });
        } else if (randomType === 'word-selection') {
          // Wort-Auswahl für Mathe-Begriffe
          const mathTerms = ['Addition', 'Subtraktion', 'Multiplikation', 'Division', 'Gleichung', 'Summe', 'Differenz', 'Produkt', 'Quotient'];
          const correctTerm = mathTerms[Math.floor(Math.random() * mathTerms.length)];
          const sentence = `Bei der Aufgabe 5 + 3 = 8 handelt es sich um eine ${correctTerm}.`;
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
            explanation: `Der Begriff "${correctTerm}" ist korrekt`
          });
        } else {
          // Textaufgabe
          const scenarios = [
            { text: 'Anna hat {a} Äpfel und bekommt {b} weitere dazu', operation: 'addition' },
            { text: 'Im Korb sind {a} Birnen, {b} werden gegessen', operation: 'subtraction' },
            { text: 'In jeder Reihe stehen {a} Stühle. Es gibt {b} Reihen', operation: 'multiplication' }
          ];
          
          const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
          const a = Math.floor(Math.random() * (10 + grade * 2)) + 2;
          const b = Math.floor(Math.random() * (8 + grade)) + 1;
          
          let answer: number;
          let questionText: string;
          
          switch (scenario.operation) {
            case 'addition':
              answer = a + b;
              questionText = scenario.text.replace('{a}', a.toString()).replace('{b}', b.toString()) + '. Wie viele hat sie insgesamt?';
              break;
            case 'subtraction':
              answer = a - b;
              questionText = scenario.text.replace('{a}', a.toString()).replace('{b}', b.toString()) + '. Wie viele bleiben übrig?';
              break;
            case 'multiplication':
              answer = a * b;
              questionText = scenario.text.replace('{a}', a.toString()).replace('{b}', b.toString()) + '. Wie viele Stühle gibt es insgesamt?';
              break;
            default:
              answer = a + b;
              questionText = `${a} + ${b} = ?`;
          }
          
          templateProblems.push({
            id,
            questionType: 'text-input',
            question: questionText,
            answer,
            type: 'math',
            explanation: `Die Antwort ist ${answer}`
          });
        }
      } else if (category === 'Deutsch') {
        if (randomType === 'multiple-choice') {
          // Multiple Choice Deutsch
          const words = ['Hund', 'Katze', 'Elefant', 'Schmetterling', 'Blume', 'Baum', 'Haus', 'Auto'];
          const word = words[Math.floor(Math.random() * words.length)];
          const correctSyllables = Math.max(1, Math.ceil(word.length / 2.5));
          const wrongAnswers = [correctSyllables + 1, correctSyllables - 1, correctSyllables + 2].filter(x => x > 0);
          const allOptions = [correctSyllables, ...wrongAnswers.slice(0, 3)];
          const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
          const correctIndex = shuffledOptions.indexOf(correctSyllables);
          
          templateProblems.push({
            id,
            questionType: 'multiple-choice',
            question: `Wie viele Silben hat das Wort "${word}"?`,
            options: shuffledOptions.map(String),
            correctAnswer: correctIndex,
            type: 'german',
            explanation: `Das Wort "${word}" hat ${correctSyllables} Silben`
          });
        } else if (randomType === 'word-selection') {
          // Wortarten erkennen
          const sentences = [
            'Der große Hund bellt laut.',
            'Die schöne Blume blüht im Garten.',
            'Das kleine Kind spielt fröhlich.'
          ];
          const sentence = sentences[Math.floor(Math.random() * sentences.length)];
          const words = sentence.split(' ');
          const adjectiveIndex = words.findIndex(word => ['große', 'schöne', 'kleine'].includes(word));
          
          templateProblems.push({
            id,
            questionType: 'word-selection',
            question: 'Wähle das Adjektiv (Eigenschaftswort):',
            sentence,
            selectableWords: words.map((word, index) => ({
              word,
              isCorrect: index === adjectiveIndex,
              index
            })),
            type: 'german',
            explanation: `"${words[adjectiveIndex]}" ist ein Adjektiv`
          });
        } else {
          // Text-Eingabe Deutsch
          const questions = [
            { q: 'Wie lautet die Mehrzahl von "Haus"?', a: 'Häuser' },
            { q: 'Wie lautet die Mehrzahl von "Kind"?', a: 'Kinder' },
            { q: 'Wie lautet die Mehrzahl von "Buch"?', a: 'Bücher' }
          ];
          const question = questions[Math.floor(Math.random() * questions.length)];
          
          templateProblems.push({
            id,
            questionType: 'text-input',
            question: question.q,
            answer: question.a,
            type: 'german',
            explanation: `Die Mehrzahl ist "${question.a}"`
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
      const a = Math.floor(Math.random() * (20 + grade * 5)) + 5;
      const b = Math.floor(Math.random() * (15 + grade * 3)) + 3;
      const answer = a + b;
      
      simpleProblems.push({
        id,
        questionType: 'text-input',
        question: `${a} + ${b} = ?`,
        answer,
        type: 'math',
        explanation: `Die Lösung ist ${answer}`
      });
    }
    
    return simpleProblems;
  }, [grade, totalQuestions]);

  const generateProblems = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    console.log('🎯 Starting balanced question generation');
    
    try {
      // Erste Priorität: AI-generierte Fragen (kurzes Timeout)
      const aiProblems = await generateAIProblems();
      
      if (aiProblems.length >= totalQuestions) {
        console.log('✅ Using AI problems');
        setProblems(aiProblems.slice(0, totalQuestions));
        setGenerationSource('ai');
        setIsGenerating(false);
        return;
      }
      
      // Zweite Priorität: Template-basierte Fragen
      console.log('🎨 Using template problems');
      const templateProblems = generateTemplateProblems();
      setProblems(templateProblems);
      setGenerationSource('template');
      
    } catch (error) {
      console.error('❌ Generation failed, using simple fallback:', error);
      // Letzte Priorität: Einfache Grundrechenaufgaben
      const simpleProblems = generateSimpleFallback();
      setProblems(simpleProblems);
      setGenerationSource('simple');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, totalQuestions, generateTemplateProblems, generateSimpleFallback]);

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    console.log('🤖 Trying AI generation with short timeout');
    
    // Sehr kurzes Timeout für AI (2 Sekunden)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), 2000);
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
          forceVariation: true
        }
      });
      
      const response = await Promise.race([aiPromise, timeoutPromise]);
      
      if (response.error) {
        console.warn('AI generation failed:', response.error);
        return [];
      }
      
      const problems = response.data?.problems || [];
      console.log(`🎯 AI generated ${problems.length} problems`);
      return problems;
    } catch (error) {
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
