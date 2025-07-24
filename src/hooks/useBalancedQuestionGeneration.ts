import { useState, useCallback, useRef } from 'react';
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
  
  // Track generation state to prevent infinite loops
  const generationRef = useRef({
    isActive: false,
    lastParams: '',
    attempts: 0,
    maxAttempts: 3
  });

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

  // Load templates from database - PRIMARY METHOD
  const loadTemplatesFromDatabase = async (): Promise<SelectionQuestion[]> => {
    console.log('📂 Loading templates from database');
    console.log(`🔍 Looking for: category="${category}", grade=${grade}`);
    
    try {
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      
      // Get templates from database - try both category name variations
      const { data: templates, error } = await supabase
        .from('generated_templates')
        .select('*')
        .in('category', [category, category.toLowerCase(), 'Mathematik', 'Deutsch']) // Try multiple variations
        .eq('grade', grade)
        .eq('is_active', true)
        .order('usage_count', { ascending: true }) // Prefer less used templates
        .limit(totalQuestions * 2); // Get more than needed for rotation

      if (error) {
        console.error('❌ Database error loading templates:', error);
        console.error('❌ Error details:', { 
          message: error.message, 
          code: error.code, 
          details: error.details,
          hint: error.hint 
        });
        return [];
      }

      console.log(`📊 Raw database query result: ${templates?.length || 0} templates found`);
      if (templates) {
        console.log('📋 Template categories found:', templates.map(t => ({ 
          id: t.id, 
          category: t.category, 
          content: t.content?.substring(0, 50) + '...' 
        })));
      }

      if (!templates || templates.length === 0) {
        console.warn(`📭 No templates found in database for category="${category}", grade=${grade}`);
        console.warn('📭 This triggers the fallback to AI generation or simple fallback');
        return [];
      }

      // Filter templates by category match (case insensitive)
      const categoryLower = category.toLowerCase();
      const matchingTemplates = templates.filter(template => {
        const templateCategory = template.category?.toLowerCase();
        return templateCategory === categoryLower || 
               (categoryLower === 'mathematik' && templateCategory === 'math') ||
               (categoryLower === 'deutsch' && templateCategory === 'german');
      });

      console.log(`🎯 Filtered templates: ${matchingTemplates.length} matching templates for category "${category}"`);

      // Convert templates to SelectionQuestion format and filter excluded
      const questions: SelectionQuestion[] = [];
      
      for (const template of matchingTemplates) {
        if (questions.length >= totalQuestions) break;
        
        try {
          console.log(`🔧 Processing template:`, {
            id: template.id,
            category: template.category,
            question_type: template.question_type,
            contentPreview: template.content?.substring(0, 100) + '...'
          });

          // Check if content is JSON or plain text
          let parsedContent;
          let questionText;
          let answerValue;
          
          try {
            // Try to parse as JSON first
            parsedContent = JSON.parse(template.content);
            questionText = parsedContent.question || template.content;
            answerValue = parsedContent.answer || parsedContent.correctAnswer || '';
            console.log(`📄 Parsed JSON content:`, parsedContent);
          } catch (jsonError) {
            // If not JSON, treat as plain text question
            console.log(`📄 Plain text content detected:`, template.content);
            questionText = template.content;
            
            // Extract answer from simple math questions
            if (template.category === 'Mathematik' && template.content.includes('=')) {
              const match = template.content.match(/(.+?)=\s*\?/);
              if (match) {
                try {
                  // Enhanced math expression calculator
                  let expression = match[1].trim();
                  
                  // Handle different operation symbols
                  expression = expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/:/g, '/')
                    .replace(/\s+/g, ''); // Remove spaces
                  
                  // Safety check for valid math expressions only
                  if (/^[\d+\-*/.(),\s]+$/.test(expression)) {
                    const result = eval(expression);
                    answerValue = Number.isInteger(result) ? result.toString() : result.toFixed(2);
                    console.log(`🧮 Calculated answer: ${match[1].trim()} = ${answerValue}`);
                  } else {
                    console.warn(`⚠️ Invalid math expression: ${expression}`);
                    // Try to extract number from the end of the question text
                    const numberMatch = template.content.match(/(\d+(?:[.,]\d+)?)\s*$/);
                    answerValue = numberMatch ? numberMatch[1].replace(',', '.') : 'Fehler';
                  }
                } catch (calculationError) {
                  console.error(`❌ Calculation failed for: ${match[1]}`, calculationError);
                  // Try to extract a number from the template content as last resort
                  const numberMatch = template.content.match(/(\d+(?:[.,]\d+)?)/g);
                  if (numberMatch && numberMatch.length >= 2) {
                    // For simple addition/subtraction, try basic calculation
                    const nums = numberMatch.map(n => parseFloat(n.replace(',', '.')));
                    if (template.content.includes('+')) {
                      answerValue = (nums[0] + nums[1]).toString();
                    } else if (template.content.includes('-')) {
                      answerValue = (nums[0] - nums[1]).toString();
                    } else if (template.content.includes('×') || template.content.includes('*')) {
                      answerValue = (nums[0] * nums[1]).toString();
                    } else {
                      answerValue = 'Berechnung fehlgeschlagen';
                    }
                  } else {
                    answerValue = 'Berechnung fehlgeschlagen';
                  }
                }
              } else {
                console.warn(`⚠️ No math pattern found in: ${template.content}`);
                answerValue = 'Muster nicht erkannt';
              }
            } else {
              // For non-math templates, try to extract answer from content
              const answerMatch = template.content.match(/antwort[:\s]*([^.!?]*)/i);
              answerValue = answerMatch ? answerMatch[1].trim() : 'Antwort nicht gefunden';
            }
          }
          
          // Skip if excluded
          if (excludedQuestions.includes(questionText)) {
            console.log(`⏭️ Skipping excluded question: ${questionText}`);
            continue;
          }
          
          // Convert to SelectionQuestion format
          const questionType = template.question_type || 'text-input';
          
          const question: SelectionQuestion = {
            id: Math.floor(Math.random() * 1000000),
            question: questionText,
            options: parsedContent?.options || [],
            correctAnswer: typeof parsedContent?.correctAnswer === 'number' ? parsedContent.correctAnswer : 0,
            explanation: parsedContent?.explanation || `Die Antwort ist: ${answerValue}`,
            questionType: questionType as any,
            type: categoryLower === 'mathematik' ? 'math' : categoryLower === 'deutsch' ? 'german' : 'math'
          };

          // Add answer property for text-input questions
          if (questionType === 'text-input') {
            (question as any).answer = answerValue;
          }
          
          console.log(`✅ Converted template to question:`, {
            id: question.id,
            question: question.question,
            questionType: question.questionType,
            answer: questionType === 'text-input' ? answerValue : 'N/A'
          });
          
          questions.push(question);
          
          // Update usage count (don't await to avoid blocking)
          try {
            await supabase
              .from('generated_templates')
              .update({ usage_count: (template.usage_count || 0) + 1 })
              .eq('id', template.id);
            console.log(`📈 Updated usage count for template ${template.id}`);
          } catch (err) {
            console.warn(`⚠️ Failed to update usage count:`, err);
          }
            
        } catch (parseError) {
          console.error('❌ Error parsing template content:', parseError, 'Template:', template);
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

  const generateTemplateProblems = async (): Promise<SelectionQuestion[]> => {
    console.log('🔧 Enhanced template generation with duplicate protection');
    
    // Get excluded questions from user feedback
    const excludedQuestions = await getExcludedQuestions(category, grade, userId);
    console.log(`🚫 Excluding ${excludedQuestions.length} questions based on feedback`);
    
    const generatedProblems: SelectionQuestion[] = [];
    const usedQuestions = new Set<string>();
    
    // Try to generate unique questions
    let attempts = 0;
    const maxAttempts = totalQuestions * 5; // Increased attempts
    
    console.log(`🎯 Generating ${totalQuestions} ${category} questions for grade ${grade}`);
    
    while (generatedProblems.length < totalQuestions && attempts < maxAttempts) {
      attempts++;
      
      try {
        if (category.toLowerCase() === 'mathematik' || category.toLowerCase() === 'math') {
          const mathProblem = generateMathProblem(grade);
          
          if (!usedQuestions.has(mathProblem.question) && 
              !excludedQuestions.includes(mathProblem.question)) {
            usedQuestions.add(mathProblem.question);
            generatedProblems.push(mathProblem);
            console.log(`✅ Generated math problem ${generatedProblems.length}/${totalQuestions}: ${mathProblem.question}`);
          }
        } else if (category.toLowerCase() === 'deutsch' || category.toLowerCase() === 'german') {
          const germanProblem = generateGermanProblem(grade, usedQuestions, excludedQuestions);
          
          if (germanProblem && !usedQuestions.has(germanProblem.question)) {
            usedQuestions.add(germanProblem.question);
            generatedProblems.push(germanProblem);
            console.log(`✅ Generated German problem ${generatedProblems.length}/${totalQuestions}: ${germanProblem.question}`);
          }
        } else {
          // Default to math for unknown categories
          console.log(`⚠️ Unknown category ${category}, defaulting to math`);
          const mathProblem = generateMathProblem(grade);
          
          if (!usedQuestions.has(mathProblem.question) && 
              !excludedQuestions.includes(mathProblem.question)) {
            usedQuestions.add(mathProblem.question);
            generatedProblems.push(mathProblem);
            console.log(`✅ Generated fallback math problem ${generatedProblems.length}/${totalQuestions}: ${mathProblem.question}`);
          }
        }
      } catch (error) {
        console.error('Error generating template problem:', error);
      }
    }

    // If we still don't have enough questions, fill with guaranteed unique simple math
    let fallbackAttempts = 0;
    while (generatedProblems.length < totalQuestions && fallbackAttempts < 50) {
      fallbackAttempts++;
      
      // Generate more varied fallback questions based on grade
      let question: string, answer: string, explanation: string;
      
      if (grade <= 2) {
        let a = Math.floor(Math.random() * 15) + 1;
        let b = Math.floor(Math.random() * 10) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';
        
        if (operation === '-' && a < b) {
          [a, b] = [b, a]; // Ensure positive results
        }
        
        const result = operation === '+' ? a + b : a - b;
        question = `Was ist ${a} ${operation} ${b}?`;
        answer = result.toString();
        explanation = `${a} ${operation} ${b} = ${result}`;
      } else {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 20) + 5;
        const operations = ['+', '-', '×'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let result: number;
        if (operation === '×') {
          result = a * b;
        } else if (operation === '-') {
          result = Math.max(a, b) - Math.min(a, b);
          question = `Was ist ${Math.max(a, b)} ${operation} ${Math.min(a, b)}?`;
        } else {
          result = a + b;
        }
        
        if (operation !== '-') {
          question = `Was ist ${a} ${operation} ${b}?`;
        }
        
        answer = result.toString();
        explanation = `${operation === '-' ? Math.max(a, b) : a} ${operation} ${operation === '-' ? Math.min(a, b) : b} = ${result}`;
      }
      
      if (!usedQuestions.has(question)) {
        usedQuestions.add(question);
        generatedProblems.push({
          id: Math.floor(Math.random() * 1000000),
          type: 'math',
          questionType: 'text-input',
          question,
          answer,
          explanation
        });
        console.log(`🔄 Generated fallback problem ${generatedProblems.length}/${totalQuestions}: ${question}`);
      }
    }

    console.log(`📊 Template generation complete: ${generatedProblems.length}/${totalQuestions} questions generated in ${attempts} attempts`);
    return generatedProblems;
  };

  const generateMathProblem = (grade: number): SelectionQuestion => {
    // Use timestamp and random seed for true uniqueness
    const seed = Date.now() + Math.random() * 10000;
    const random = () => (Math.sin(seed + Math.random()) * 10000) % 1;
    
    let a: number, b: number, operation: string, answer: number;
    
    switch (grade) {
      case 1:
      case 2:
        // Vary range more for grades 1-2
        const range1 = Math.floor(Math.abs(random()) * 15) + 5; // 5-20
        a = Math.floor(Math.abs(random()) * range1) + 1;
        b = Math.floor(Math.abs(random()) * range1) + 1;
        
        operation = Math.abs(random()) > 0.5 ? '+' : '-';
        if (operation === '-' && a < b) [a, b] = [b, a];
        answer = operation === '+' ? a + b : a - b;
        break;
        
      case 3:
      case 4:
        if (Math.abs(random()) > 0.4) {
          // More varied addition/subtraction for grade 3-4
          const range3 = Math.floor(Math.abs(random()) * 150) + 50; // 50-200
          a = Math.floor(Math.abs(random()) * range3) + 25;
          b = Math.floor(Math.abs(random()) * range3) + 25;
          operation = Math.abs(random()) > 0.5 ? '+' : '-';
          if (operation === '-' && a < b) [a, b] = [b, a];
          answer = operation === '+' ? a + b : a - b;
        } else {
          // Varied multiplication
          a = Math.floor(Math.abs(random()) * 20) + 3; // 3-23
          b = Math.floor(Math.abs(random()) * 12) + 2; // 2-14
          operation = '×';
          answer = a * b;
        }
        break;
        
      default:
        // Much more varied advanced math for higher grades
        const baseRange = Math.floor(Math.abs(random()) * 800) + 200; // 200-1000
        a = Math.floor(Math.abs(random()) * baseRange) + 100;
        b = Math.floor(Math.abs(random()) * (baseRange / 2)) + 50;
        
        const ops = ['+', '-', '×', '÷'];
        operation = ops[Math.floor(Math.abs(random()) * ops.length)];
        
        if (operation === '÷') {
          // Ensure clean division with varied results
          answer = Math.floor(Math.abs(random()) * 25) + 5; // 5-30
          a = answer * (Math.floor(Math.abs(random()) * 15) + 5); // Varied multiplier
        } else if (operation === '-' && a < b) {
          [a, b] = [b, a];
          answer = a - b;
        } else {
          answer = operation === '+' ? a + b : operation === '×' ? a * b : a - b;
        }
        break;
    }

    return {
      id: Math.floor(Math.abs(random()) * 1000000),
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

  const generateProblems = useCallback(async () => {
    // Create unique parameter string to prevent duplicate calls
    const currentParams = `${category}-${grade}-${userId}-${totalQuestions}`;
    
    // Prevent infinite loops and duplicate executions
    if (generationRef.current.isActive) {
      console.log('⚠️ Generation already in progress, skipping...');
      return;
    }
    
    if (generationRef.current.lastParams === currentParams && generationRef.current.attempts >= generationRef.current.maxAttempts) {
      console.log('⚠️ Max attempts reached for these parameters, using simple fallback');
      const simpleFallback = generateSimpleFallback();
      setProblems(simpleFallback);
      setGenerationSource('simple');
      setIsGenerating(false);
      return;
    }
    
    // Update generation tracking
    if (generationRef.current.lastParams !== currentParams) {
      generationRef.current.attempts = 0;
    }
    generationRef.current.lastParams = currentParams;
    generationRef.current.attempts++;
    generationRef.current.isActive = true;
    
    console.log('🎯 Starting balanced question generation');
    console.log(`📊 Target: ${totalQuestions} questions for ${category}, Grade ${grade}, User: ${userId} (Attempt: ${generationRef.current.attempts})`);
    
    setIsGenerating(true);
    setProblems([]); // Clear existing problems
    
    try {
      // Set timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout')), 30000);
      });
      
      const generationPromise = (async () => {
        // PRIMARY: Load templates from database
        console.log('📂 Attempting template loading from database...');
        const databaseTemplates = await loadTemplatesFromDatabase();
        
        console.log(`🔍 Template Loading Result: ${databaseTemplates.length}/${totalQuestions} questions`);
        
        if (databaseTemplates.length >= totalQuestions) {
          console.log('✅ Using database templates - sufficient quantity');
          const finalQuestions = databaseTemplates.slice(0, totalQuestions);
          return { questions: finalQuestions, source: 'template' as const };
        } else if (databaseTemplates.length > 0) {
          console.log(`⚠️ Only ${databaseTemplates.length} templates available, filling with template generation`);
          const remainingCount = totalQuestions - databaseTemplates.length;
          const templateProblems = await generateTemplateProblems();
          const mixedProblems = [...databaseTemplates, ...templateProblems.slice(0, remainingCount)];
          return { questions: mixedProblems, source: 'template' as const };
        }
        
        // SECONDARY: Try AI template generation if no templates in database
        console.log('🆘 No templates in database, trying AI generation');
        const fallbackProblems = await generateFallbackTemplates();
        
        if (fallbackProblems.length >= totalQuestions) {
          console.log('✅ Using AI generated problems');
          return { questions: fallbackProblems.slice(0, totalQuestions), source: 'ai' as const };
        } else if (fallbackProblems.length > 0) {
          console.log(`⚠️ Only ${fallbackProblems.length} AI problems, filling with template generation`);
          const remainingCount = totalQuestions - fallbackProblems.length;
          const templateProblems = await generateTemplateProblems();
          const mixedProblems = [...fallbackProblems, ...templateProblems.slice(0, remainingCount)];
          return { questions: mixedProblems, source: 'ai' as const };
        }
        
        // TERTIARY: Use template generation as final fallback
        console.log('🔧 Using template generation as final fallback');
        const templateProblems = await generateTemplateProblems();
        return { questions: templateProblems.slice(0, totalQuestions), source: 'template' as const };
      })();
      
      const result = await Promise.race([generationPromise, timeoutPromise]);
      
      console.log('📋 Generated questions:', result.questions.map(q => ({ id: q.id, question: q.question.substring(0, 50) })));
      setProblems(result.questions);
      setGenerationSource(result.source);
      console.log('✅ Problems state updated successfully');
      
    } catch (error) {
      console.error('❌ Error in generateProblems:', error);
      
      // Emergency fallback with timeout protection
      console.log('🚨 Emergency fallback to simple generation');
      try {
        const emergencyProblems = generateSimpleFallback();
        setProblems(emergencyProblems);
        setGenerationSource('simple');
        console.log('✅ Emergency fallback completed');
      } catch (emergencyError) {
        console.error('❌ Emergency fallback failed:', emergencyError);
        setProblems([]);
        setGenerationSource(null);
      }
      
    } finally {
      generationRef.current.isActive = false;
      setIsGenerating(false);
      console.log('🏁 Generation process completed, isGenerating set to false');
    }
  }, [category, grade, userId, totalQuestions]); // Stable dependencies only
  
  return {
    problems,
    isGenerating,
    generationSource,
    sessionId,
    generateProblems
  };
}