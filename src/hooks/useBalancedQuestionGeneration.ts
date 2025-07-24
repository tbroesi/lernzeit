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

  // Get excluded questions from feedback
  const getExcludedQuestions = async (category: string, grade: number, userId: string): Promise<string[]> => {
    try {
      const { data: feedback, error } = await supabase
        .from('question_feedback')
        .select('question_content')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('grade', grade)
        .in('feedback_type', ['duplicate', 'inappropriate', 'too_easy', 'too_hard']);
      
      if (error) {
        console.warn('Error fetching excluded questions:', error);
        return [];
      }
      
      const excluded = feedback?.map(f => f.question_content) || [];
      console.log(`🚫 Excluding ${excluded.length} questions based on user feedback`);
      return excluded;
    } catch (error) {
      console.warn('Error getting excluded questions:', error);
      return [];
    }
  };

  const generateTemplateProblems = async (): Promise<SelectionQuestion[]> => {
    console.log('🔧 Enhanced template generation with duplicate protection');
    
    // Get excluded questions from user feedback
    const excludedQuestions = await getExcludedQuestions(category, grade, userId);
    console.log(`🚫 Excluding ${excludedQuestions.length} questions based on feedback`);
    
    const generatedProblems: SelectionQuestion[] = [];
    const usedQuestions = new Set<string>();
    
    // Try to generate unique questions
    let attempts = 0;
    const maxAttempts = totalQuestions * 3;
    
    while (generatedProblems.length < totalQuestions && attempts < maxAttempts) {
      attempts++;
      
      try {
        if (category.toLowerCase() === 'mathematik' || category.toLowerCase() === 'math') {
          const mathProblem = generateMathProblem(grade);
          
          if (!usedQuestions.has(mathProblem.question) && 
              !excludedQuestions.includes(mathProblem.question)) {
            usedQuestions.add(mathProblem.question);
            generatedProblems.push(mathProblem);
          }
        } else if (category.toLowerCase() === 'deutsch' || category.toLowerCase() === 'german') {
          const germanProblem = generateGermanProblem(grade, usedQuestions, excludedQuestions);
          
          if (germanProblem && !usedQuestions.has(germanProblem.question)) {
            usedQuestions.add(germanProblem.question);
            generatedProblems.push(germanProblem);
          }
        }
      } catch (error) {
        console.error('Error generating template problem:', error);
      }
    }

    // If we still don't have enough questions, fill with simple math
    while (generatedProblems.length < totalQuestions) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const question = `Was ist ${a} + ${b}?`;
      
      if (!usedQuestions.has(question)) {
        usedQuestions.add(question);
        generatedProblems.push({
          id: Math.floor(Math.random() * 1000000),
          type: 'math',
          questionType: 'text-input',
          question,
          answer: (a + b).toString(),
          explanation: `${a} + ${b} = ${a + b}`
        });
      }
    }

    return generatedProblems;
  };

  const generateMathProblem = (grade: number): SelectionQuestion => {
    let a: number, b: number, operation: string, answer: number;
    
    switch (grade) {
      case 1:
      case 2:
        if (grade <= 2) {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
        } else if (grade <= 4) {
          a = Math.floor(Math.random() * 100) + 10;
          b = Math.floor(Math.random() * 100) + 10;
        } else {
          a = Math.floor(Math.random() * 500) + 50;
          b = Math.floor(Math.random() * 500) + 50;
        }
        
        operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '-' && a < b) [a, b] = [b, a];
        answer = operation === '+' ? a + b : a - b;
        break;
      case 3:
      case 4:
        if (Math.random() > 0.4) {
          // Complex addition/subtraction for grade 3-4
          a = Math.floor(Math.random() * 200) + 25;
          b = Math.floor(Math.random() * 200) + 25;
          operation = Math.random() > 0.5 ? '+' : '-';
          if (operation === '-' && a < b) [a, b] = [b, a];
          answer = operation === '+' ? a + b : a - b;
        } else {
          // Multiplication with larger numbers
          a = Math.floor(Math.random() * 25) + 5;
          b = Math.floor(Math.random() * 15) + 2;
          operation = '×';
          answer = a * b;
        }
        break;
      default:
        // Advanced math for higher grades
        a = Math.floor(Math.random() * 1000) + 100;
        b = Math.floor(Math.random() * 500) + 50;
        const ops = ['+', '-', '×', '÷'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        
        if (operation === '÷') {
          answer = Math.floor(Math.random() * 20) + 1;
          a = answer * b;
        } else if (operation === '-' && a < b) {
          [a, b] = [b, a];
          answer = a - b;
        } else {
          answer = operation === '+' ? a + b : operation === '×' ? a * b : a - b;
        }
        break;
    }

    return {
      id: Math.floor(Math.random() * 1000000),
      type: 'math',
      questionType: 'text-input',
      question: `Was ist ${a} ${operation} ${b}?`,
      answer: answer.toString(),
      explanation: `${a} ${operation} ${b} = ${answer}`
    };
  };

  const generateGermanProblem = (grade: number, usedQuestions: Set<string>, excludedQuestions: string[]): SelectionQuestion | null => {
    const expandedGermanQuestions = [
      // Plural forms - more variety
      { question: "Wie heißt die Mehrzahl von \"Baum\"?", answer: "Bäume", explanation: "Die Mehrzahl von Baum ist Bäume (mit Umlaut)." },
      { question: "Wie heißt die Mehrzahl von \"Haus\"?", answer: "Häuser", explanation: "Die Mehrzahl von Haus ist Häuser (mit Umlaut und -er Endung)." },
      { question: "Wie heißt die Mehrzahl von \"Kind\"?", answer: "Kinder", explanation: "Die Mehrzahl von Kind ist Kinder." },
      { question: "Wie heißt die Mehrzahl von \"Buch\"?", answer: "Bücher", explanation: "Die Mehrzahl von Buch ist Bücher." },
      { question: "Wie heißt die Mehrzahl von \"Tisch\"?", answer: "Tische", explanation: "Die Mehrzahl von Tisch ist Tische." },
      { question: "Wie heißt die Mehrzahl von \"Stuhl\"?", answer: "Stühle", explanation: "Die Mehrzahl von Stuhl ist Stühle." },
      { question: "Wie heißt die Mehrzahl von \"Blume\"?", answer: "Blumen", explanation: "Die Mehrzahl von Blume ist Blumen." },
      { question: "Wie heißt die Mehrzahl von \"Auto\"?", answer: "Autos", explanation: "Die Mehrzahl von Auto ist Autos." },
      { question: "Wie heißt die Mehrzahl von \"Hund\"?", answer: "Hunde", explanation: "Die Mehrzahl von Hund ist Hunde." },
      { question: "Wie heißt die Mehrzahl von \"Katze\"?", answer: "Katzen", explanation: "Die Mehrzahl von Katze ist Katzen." },
      
      // Articles
      { question: "Welcher Artikel gehört zu \"Sonne\"?", answer: "die", explanation: "Sonne ist feminin, daher: die Sonne." },
      { question: "Welcher Artikel gehört zu \"Mond\"?", answer: "der", explanation: "Mond ist maskulin, daher: der Mond." },
      { question: "Welcher Artikel gehört zu \"Auto\"?", answer: "das", explanation: "Auto ist neutrum, daher: das Auto." },
      { question: "Welcher Artikel gehört zu \"Blume\"?", answer: "die", explanation: "Blume ist feminin, daher: die Blume." },
      { question: "Welcher Artikel gehört zu \"Tisch\"?", answer: "der", explanation: "Tisch ist maskulin, daher: der Tisch." },
      
      // Word types
      { question: "Was ist \"laufen\" für eine Wortart?", answer: "Verb", explanation: "Laufen ist ein Verb (Tätigkeitswort)." },
      { question: "Was ist \"groß\" für eine Wortart?", answer: "Adjektiv", explanation: "Groß ist ein Adjektiv (Eigenschaftswort)." },
      { question: "Was ist \"Hund\" für eine Wortart?", answer: "Nomen", explanation: "Hund ist ein Nomen (Hauptwort)." },
      { question: "Was ist \"schnell\" für eine Wortart?", answer: "Adjektiv", explanation: "Schnell ist ein Adjektiv (Eigenschaftswort)." },
      { question: "Was ist \"springen\" für eine Wortart?", answer: "Verb", explanation: "Springen ist ein Verb (Tätigkeitswort)." },
      
      // Simple grammar
      { question: "Wie schreibt man \"ICH GEHE\"?", answer: "Ich gehe", explanation: "Satzanfänge werden groß geschrieben, der Rest klein." },
      { question: "Was gehört an das Satzende: \"Der Hund bellt\"", answer: ".", explanation: "Aussagesätze enden mit einem Punkt." },
      { question: "Wie nennt man Wörter wie 'und', 'aber', 'oder'?", answer: "Bindewörter", explanation: "Diese Wörter verbinden Satzteile miteinander." }
    ];
    
    // Filter out used and excluded questions
    const availableQuestions = expandedGermanQuestions.filter(q => 
      !usedQuestions.has(q.question) && 
      !excludedQuestions.includes(q.question)
    );
    
    if (availableQuestions.length === 0) {
      // Generate a fallback question that's likely to be unique
      const randomWord = ['Vogel', 'Fisch', 'Apfel', 'Ball', 'Schuh', 'Berg', 'See', 'Stern'][Math.floor(Math.random() * 8)];
      const pluralMap: { [key: string]: string } = {
        'Vogel': 'Vögel', 'Fisch': 'Fische', 'Apfel': 'Äpfel', 'Ball': 'Bälle', 
        'Schuh': 'Schuhe', 'Berg': 'Berge', 'See': 'Seen', 'Stern': 'Sterne'
      };
      
      return {
        id: Math.floor(Math.random() * 1000000),
        type: 'german',
        questionType: 'text-input',
        question: `Wie heißt die Mehrzahl von "${randomWord}"?`,
        answer: pluralMap[randomWord] || randomWord + 'e',
        explanation: `Die Mehrzahl von ${randomWord} ist ${pluralMap[randomWord] || randomWord + 'e'}.`
      };
    }
    
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    return {
      id: Math.floor(Math.random() * 1000000),
      type: 'german',
      questionType: 'text-input',
      question: randomQuestion.question,
      answer: randomQuestion.answer,
      explanation: randomQuestion.explanation
    };
  };

  const generateSimpleFallback = useCallback((): SelectionQuestion[] => {
    console.log('🔄 Using simple fallback generation');
    const simpleProblems: SelectionQuestion[] = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const maxNum = Math.min(100, 10 + (grade * 10));
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * (maxNum / 2)) + 1;
      const answer = a + b;
      
      simpleProblems.push({
        id: Math.floor(Math.random() * 1000000),
        type: 'math',
        questionType: 'text-input',
        question: `${a} + ${b} = ?`,
        answer: answer.toString(),
        explanation: `Die Lösung ist ${answer}, weil ${a} + ${b} = ${answer}.`
      });
    }
    
    return simpleProblems;
  }, [grade, totalQuestions]);

  // Load templates from database instead of calling AI directly
  const loadTemplatesFromDatabase = async (): Promise<SelectionQuestion[]> => {
    console.log('📂 Loading templates from database');
    
    try {
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      
      // Get templates from database
      const { data: templates, error } = await supabase
        .from('generated_templates')
        .select('*')
        .eq('category', category)
        .eq('grade', grade)
        .eq('is_active', true)
        .order('usage_count', { ascending: true }) // Prefer less used templates
        .limit(totalQuestions * 2); // Get more than needed for rotation

      if (error) {
        console.error('❌ Error loading templates:', error);
        return [];
      }

      if (!templates || templates.length === 0) {
        console.warn('📭 No templates found in database');
        return [];
      }

      console.log(`📊 Loaded ${templates.length} templates from database`);

      // Convert templates to SelectionQuestion format and filter excluded
      const questions: SelectionQuestion[] = [];
      
      for (const template of templates) {
        if (questions.length >= totalQuestions) break;
        
        try {
          const parsedContent = JSON.parse(template.content);
          
          // Skip if excluded
          if (excludedQuestions.includes(parsedContent.question)) {
            continue;
          }
          
          // Convert to SelectionQuestion format
          const question: SelectionQuestion = {
            id: template.id,
            question: parsedContent.question,
            options: parsedContent.options || [],
            correctAnswer: parsedContent.correctAnswer || 0,
            explanation: parsedContent.explanation || `Erklärung für: ${parsedContent.question}`,
            questionType: template.question_type as any,
            type: 'multiple-choice'
          };
          
          questions.push(question);
          
          // Update usage count
          await supabase
            .from('generated_templates')
            .update({ usage_count: template.usage_count + 1 })
            .eq('id', template.id);
            
        } catch (parseError) {
          console.error('❌ Error parsing template content:', parseError);
          continue;
        }
      }

      console.log(`✅ Successfully converted ${questions.length} templates to questions`);
      return questions;
      
    } catch (error) {
      console.error('❌ Error in loadTemplatesFromDatabase:', error);
      return [];
    }
  };

  // Fallback: Generate new templates if needed
  const generateFallbackTemplates = async (): Promise<SelectionQuestion[]> => {
    console.log('🆘 Fallback: Generating new templates via AI');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), 15000);
    });
    
    try {
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      
      const aiPromise = supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: Math.min(totalQuestions, 5), // Generate fewer for fallback
          excludeQuestions: excludedQuestions,
          sessionId,
          requestId: `fallback_${Date.now()}`,
          gradeRequirement: `grade_${grade}_appropriate`,
          qualityThreshold: 0.6 // Lower threshold for fallback
        }
      });
      
      const response = await Promise.race([aiPromise, timeoutPromise]);
      
      if (response.error) {
        console.warn('❌ Fallback AI generation failed:', response.error);
        return [];
      }
      
      const problems = response.data?.problems || [];
      console.log(`🆘 Fallback generated ${problems.length} problems`);
      
      return problems.map((problem: SelectionQuestion) => ({
        ...problem,
        explanation: problem.explanation || `Erklärung für: ${problem.question}`
      }));
    } catch (error) {
      console.warn('❌ Fallback generation failed:', error);
      return [];
    }
  };

  const generateProblems = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    console.log('🎯 Starting balanced question generation');
    console.log(`📊 Target: ${totalQuestions} questions for ${category}, Grade ${grade}, User: ${userId}`);
    
    try {
      // Primary: Load templates from database
      console.log('📂 Attempting template loading from database...');
      const templateProblems = await loadTemplatesFromDatabase();
      
      console.log(`🔍 Template Loading Result: ${templateProblems.length}/${totalQuestions} questions`);
      
      if (templateProblems.length >= totalQuestions) {
        console.log('✅ Using database templates - sufficient quantity');
        setProblems(templateProblems.slice(0, totalQuestions));
        setGenerationSource('template');
        return;
      } else if (templateProblems.length > 0) {
        console.log(`⚠️ Only ${templateProblems.length} templates available, need ${totalQuestions - templateProblems.length} more`);
        // Try to get remaining from fallback generation
        const remainingCount = totalQuestions - templateProblems.length;
        const fallbackProblems = await generateFallbackTemplates();
        const mixedProblems = [...templateProblems, ...fallbackProblems.slice(0, remainingCount)];
        setProblems(mixedProblems);
        setGenerationSource('template');
        return;
      }
      
      // Fall back to improved templates
      console.log('🎨 AI insufficient, using improved template problems');
      const templateProblems = await generateTemplateProblems();
      setProblems(templateProblems);
      setGenerationSource('template');
      
    } catch (error) {
      console.error('❌ Generation failed, using simple fallback:', error);
      const simpleProblems = generateSimpleFallback();
      setProblems(simpleProblems);
      setGenerationSource('simple');
    } finally {
      setIsGenerating(false);
      
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      console.log('📊 Question generation complete:', {
        totalGenerated: problems.length,
        source: generationSource,
        sessionId,
        excluded: excludedQuestions?.length || 0
      });
    }
  }, [isGenerating, totalQuestions, generateSimpleFallback]);

  return {
    problems,
    isGenerating,
    generationSource,
    sessionId,
    generateProblems
  };
}