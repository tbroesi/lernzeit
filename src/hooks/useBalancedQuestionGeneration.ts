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

  // PHASE 1: Enhanced Database Template Loading with Diagnosis
  const loadTemplatesFromDatabase = async (): Promise<SelectionQuestion[]> => {
    console.log('🚀 PHASE 1: Enhanced Database Template Loading');
    console.log(`🔍 Target: category="${category}", grade=${grade}, userId="${userId}"`);
    
    try {
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      console.log(`🚫 Excluded questions: ${excludedQuestions.length}`);
      
      // DIAGNOSIS: Check category mapping inconsistencies
      const categoryVariations = [
        category,
        category.toLowerCase(),
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        // German-specific mappings
        ...(category.toLowerCase() === 'mathematik' || category.toLowerCase() === 'math' ? ['Mathematik', 'math', 'mathematik'] : []),
        ...(category.toLowerCase() === 'deutsch' || category.toLowerCase() === 'german' ? ['Deutsch', 'german', 'deutsch'] : [])
      ];
      
      console.log(`🗺️ Trying category variations:`, categoryVariations);
      
      // Enhanced database query with better error handling
      const { data: templates, error } = await supabase
        .from('generated_templates')
        .select('*')
        .in('category', categoryVariations)
        .eq('grade', grade)
        .eq('is_active', true)
        .order('quality_score', { ascending: false }) // Prioritize high-quality templates
        .limit(totalQuestions * 3); // Get more templates for better selection

      if (error) {
        console.error('❌ CRITICAL: Database error loading templates:', error);
        console.error('❌ Error details:', { 
          message: error.message, 
          code: error.code, 
          details: error.details,
          hint: error.hint 
        });
        return [];
      }

      console.log(`📊 Database query success: ${templates?.length || 0} templates found`);
      
      if (templates && templates.length > 0) {
        console.log('📋 Template analysis:', templates.map(t => ({ 
          id: t.id.substring(0, 8), 
          category: t.category, 
          grade: t.grade,
          quality: t.quality_score,
          type: t.question_type,
          contentPreview: t.content?.substring(0, 50) + '...' 
        })));
      }

      if (!templates || templates.length === 0) {
        console.warn(`📭 ISSUE: No templates found for any category variation`);
        console.warn(`📭 Category variations tried:`, categoryVariations);
        console.warn(`📭 Grade: ${grade}`);
        console.warn(`📭 This indicates missing templates in database - triggering fallback`);
        return [];
      }

      // PHASE 2: Robust template parsing with better error handling
      console.log('🔧 PHASE 2: Enhanced Template Parsing');
      
      const questions: SelectionQuestion[] = [];
      const parseErrors: string[] = [];
      
      for (const template of templates) {
        if (questions.length >= totalQuestions) break;
        
        try {
          console.log(`🔧 Processing template ${template.id}:`, {
            category: template.category,
            grade: template.grade,
            type: template.question_type,
            quality: template.quality_score
          });

          // ROBUST PARSING: Multiple parsing strategies
          const parseResult = parseTemplateContent(template);
          
          if (!parseResult.success) {
            parseErrors.push(`Template ${template.id}: ${parseResult.error}`);
            console.warn(`⚠️ Parse failed for ${template.id}: ${parseResult.error}`);
            continue;
          }
          
          const { questionText, answerValue, parsedContent } = parseResult;
          
          // Skip if excluded
          if (excludedQuestions.includes(questionText)) {
            console.log(`⏭️ Skipping excluded question: ${questionText.substring(0, 30)}...`);
            continue;
          }
          
          // VALIDATION: Ensure content quality before adding
          if (!validateQuestionContent(questionText, answerValue, template)) {
            console.warn(`⚠️ Content validation failed for template ${template.id}`);
            continue;
          }
          
          // Convert to SelectionQuestion format
          const question = createSelectionQuestion(
            template, 
            questionText, 
            answerValue, 
            parsedContent,
            category
          );
          
          console.log(`✅ Converted template ${template.id}:`, {
            question: question.question.substring(0, 50) + '...',
            type: question.questionType,
            hasAnswer: question.questionType === 'text-input' ? !!(question as any).answer : 'N/A'
          });
          
          questions.push(question);
          
          // Update usage count asynchronously
          updateTemplateUsageAsync(template.id, template.usage_count);
            
        } catch (parseError) {
          const errorMsg = `Parse error for template ${template.id}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
          parseErrors.push(errorMsg);
          console.error('❌', errorMsg, parseError);
          continue;
        }
      }

      if (parseErrors.length > 0) {
        console.warn(`⚠️ Template parsing issues (${parseErrors.length}):`, parseErrors.slice(0, 3));
      }

      console.log(`✅ PHASE 1 SUCCESS: Converted ${questions.length}/${totalQuestions} templates to questions`);
      return questions;
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in loadTemplatesFromDatabase:', error);
      return [];
    }
  };

  // PHASE 2: Robust Template Content Parsing
  const parseTemplateContent = (template: any): { 
    success: boolean; 
    questionText?: string; 
    answerValue?: string; 
    parsedContent?: any; 
    error?: string 
  } => {
    try {
      // Strategy 1: Try JSON parsing
      try {
        const parsedContent = JSON.parse(template.content);
        const questionText = parsedContent.question || template.content;
        const answerValue = parsedContent.answer || parsedContent.correctAnswer || '';
        
        console.log(`📄 JSON parse success for ${template.id}`);
        return { 
          success: true, 
          questionText, 
          answerValue: String(answerValue), 
          parsedContent 
        };
      } catch (jsonError) {
        // Continue to next strategy
      }
      
      // Strategy 2: Plain text with math expression extraction
      const content = template.content;
      console.log(`📄 Plain text parsing for ${template.id}: "${content.substring(0, 100)}..."`);
      
      // Enhanced math expression handling
      if (template.category === 'Mathematik' || template.category === 'math') {
        const mathResult = extractMathAnswer(content);
        if (mathResult.success) {
          return {
            success: true,
            questionText: content,
            answerValue: mathResult.answer,
            parsedContent: null
          };
        }
      }
      
      // Strategy 3: Extract answer from German text patterns
      if (template.category === 'Deutsch' || template.category === 'german') {
        const germanResult = extractGermanAnswer(content);
        if (germanResult.success) {
          return {
            success: true,
            questionText: content,
            answerValue: germanResult.answer,
            parsedContent: null
          };
        }
      }
      
      // Strategy 4: Default text extraction
      const answerMatch = content.match(/antwort[:\s]*([^.!?\n]*)/i) || 
                          content.match(/lösung[:\s]*([^.!?\n]*)/i) ||
                          content.match(/ergebnis[:\s]*([^.!?\n]*)/i);
      
      const answerValue = answerMatch ? answerMatch[1].trim() : 'Antwort nicht extrahiert';
      
      return {
        success: true,
        questionText: content,
        answerValue,
        parsedContent: null
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  };

  // Enhanced math answer extraction
  const extractMathAnswer = (content: string): { success: boolean; answer?: string } => {
    try {
      // Pattern 1: Question with = ?
      const equalMatch = content.match(/(.+?)=\s*\?/);
      if (equalMatch) {
        let expression = equalMatch[1].trim();
        
        // Normalize operators
        expression = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/:/g, '/')
          .replace(/\s+/g, '');
        
        // Safety check for valid math expressions
        if (/^[\d+\-*/.(),\s]+$/.test(expression)) {
          const result = eval(expression);
          const answer = Number.isInteger(result) ? result.toString() : result.toFixed(2);
          console.log(`🧮 Math calculation: ${equalMatch[1].trim()} = ${answer}`);
          return { success: true, answer };
        }
      }
      
      // Pattern 2: Simple arithmetic extraction
      const numbers = content.match(/\b\d+(?:[.,]\d+)?\b/g);
      if (numbers && numbers.length >= 2) {
        const nums = numbers.map(n => parseFloat(n.replace(',', '.')));
        
        if (content.includes('+')) {
          return { success: true, answer: (nums[0] + nums[1]).toString() };
        } else if (content.includes('-')) {
          return { success: true, answer: (nums[0] - nums[1]).toString() };
        } else if (content.includes('×') || content.includes('*')) {
          return { success: true, answer: (nums[0] * nums[1]).toString() };
        } else if (content.includes('÷') || content.includes('/')) {
          return { success: true, answer: (nums[0] / nums[1]).toFixed(2) };
        }
      }
      
      return { success: false };
    } catch (error) {
      console.warn(`⚠️ Math extraction failed:`, error);
      return { success: false };
    }
  };

  // Enhanced German answer extraction
  const extractGermanAnswer = (content: string): { success: boolean; answer?: string } => {
    const patterns = [
      /antwort[:\s]*([^.!?\n]*)/i,
      /lösung[:\s]*([^.!?\n]*)/i,
      /richtig[:\s]*([^.!?\n]*)/i,
      /korrekt[:\s]*([^.!?\n]*)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1].trim()) {
        return { success: true, answer: match[1].trim() };
      }
    }
    
    return { success: false };
  };

  // Content validation
  const validateQuestionContent = (questionText: string, answerValue: string, template: any): boolean => {
    if (!questionText || questionText.trim().length < 5) {
      console.warn(`⚠️ Question too short: "${questionText}"`);
      return false;
    }
    
    if (!answerValue || answerValue.includes('fehler') || answerValue.includes('Fehler')) {
      console.warn(`⚠️ Invalid answer: "${answerValue}"`);
      return false;
    }
    
    if (questionText.length > 500) {
      console.warn(`⚠️ Question too long: ${questionText.length} chars`);
      return false;
    }
    
    return true;
  };

  // Create SelectionQuestion object
  const createSelectionQuestion = (
    template: any, 
    questionText: string, 
    answerValue: string, 
    parsedContent: any,
    category: string
  ): SelectionQuestion => {
    const questionType = template.question_type || 'text-input';
    const categoryLower = category.toLowerCase();
    
    const question: SelectionQuestion = {
      id: Math.floor(Math.random() * 1000000),
      question: questionText,
      options: parsedContent?.options || [],
      correctAnswer: typeof parsedContent?.correctAnswer === 'number' ? parsedContent.correctAnswer : 0,
      explanation: parsedContent?.explanation || `Die Antwort ist: ${answerValue}`,
      questionType: questionType as any,
      type: categoryLower === 'mathematik' || categoryLower === 'math' ? 'math' : 
            categoryLower === 'deutsch' || categoryLower === 'german' ? 'german' : 'math'
    };

    // Add answer property for text-input questions
    if (questionType === 'text-input') {
      (question as any).answer = answerValue;
    }
    
    return question;
  };

  // Async usage update to avoid blocking
  const updateTemplateUsageAsync = async (templateId: string, currentUsage: number) => {
    try {
      await supabase
        .from('generated_templates')
        .update({ usage_count: (currentUsage || 0) + 1 })
        .eq('id', templateId);
      console.log(`📈 Updated usage count for template ${templateId}`);
    } catch (err) {
      console.warn(`⚠️ Failed to update usage count for ${templateId}:`, err);
    }
  };

  // PHASE 3: Controlled AI Fallback Generation
  const generateFallbackTemplates = async (): Promise<SelectionQuestion[]> => {
    console.log('🆘 PHASE 3: Controlled AI Fallback Generation');
    console.log('⚠️ This should only trigger when database templates are completely unavailable');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout after 20s')), 20000);
    });
    
    try {
      const excludedQuestions = await getExcludedQuestions(category, grade, userId);
      console.log(`🚫 AI generation excluding ${excludedQuestions.length} questions`);
      
      // Enhanced AI request with better parameters
      const aiPromise = supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions, // Generate full amount for AI fallback
          excludeQuestions: excludedQuestions,
          sessionId,
          requestId: `controlled_fallback_${Date.now()}`,
          gradeRequirement: `grade_${grade}_curriculum_aligned`,
          qualityThreshold: 0.7, // Higher threshold for better quality
          diversityRequirement: true,
          enhancedPrompt: true
        }
      });
      
      console.log('🔄 Invoking AI generation edge function...');
      const response = await Promise.race([aiPromise, timeoutPromise]);
      
      if (response.error) {
        console.error('❌ AI generation failed:', response.error);
        console.error('❌ Response details:', response);
        return [];
      }
      
      const problems = response.data?.problems || [];
      console.log(`🆘 AI generated ${problems.length}/${totalQuestions} problems`);
      
      if (problems.length === 0) {
        console.warn('❌ AI generated zero problems - potential configuration issue');
        return [];
      }
      
      // Validate AI-generated problems
      const validatedProblems = problems
        .filter((problem: any) => {
          if (!problem.question || !problem.explanation) {
            console.warn('⚠️ Invalid AI problem structure:', problem);
            return false;
          }
          return true;
        })
        .map((problem: SelectionQuestion) => ({
          ...problem,
          explanation: problem.explanation || `AI-generierte Erklärung für: ${problem.question}`
        }));
      
      console.log(`✅ AI fallback validation: ${validatedProblems.length}/${problems.length} problems validated`);
      return validatedProblems;
      
    } catch (error) {
      console.error('❌ AI fallback generation failed:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message, error.stack);
      }
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

  // PHASE 4: Controlled Generation with Strict Hierarchy
  const generateProblems = useCallback(async () => {
    // Create unique parameter string to prevent duplicate calls
    const currentParams = `${category}-${grade}-${userId}-${totalQuestions}`;
    
    // ENHANCED: Prevent infinite loops and duplicate executions
    if (generationRef.current.isActive) {
      console.log('⚠️ Generation already in progress, skipping...');
      return;
    }
    
    // RESTRICTED: Only allow simple fallback after multiple failed attempts
    if (generationRef.current.lastParams === currentParams && generationRef.current.attempts >= generationRef.current.maxAttempts) {
      console.warn('⚠️ Max attempts reached - using controlled simple fallback');
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
    
    console.log('🚀 PHASE 4: Controlled Question Generation with Strict Hierarchy');
    console.log(`📊 Target: ${totalQuestions} questions for ${category}, Grade ${grade}, User: ${userId}`);
    console.log(`🔄 Attempt: ${generationRef.current.attempts}/${generationRef.current.maxAttempts}`);
    
    setIsGenerating(true);
    setProblems([]); // Clear existing problems
    
    try {
      // Extended timeout for comprehensive generation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout after 45s')), 45000);
      });
      
      const generationPromise = (async () => {
        console.log('===============================================');
        console.log('🎯 HIERARCHY LEVEL 1: DATABASE TEMPLATES (PRIMARY)');
        console.log('===============================================');
        
        const databaseTemplates = await loadTemplatesFromDatabase();
        console.log(`📊 Database result: ${databaseTemplates.length}/${totalQuestions} questions`);
        
        // SUCCESS: Database templates are sufficient
        if (databaseTemplates.length >= totalQuestions) {
          console.log('✅ SUCCESS: Database templates provide full coverage');
          console.log('🎯 Using database templates as primary source');
          const finalQuestions = databaseTemplates.slice(0, totalQuestions);
          return { questions: finalQuestions, source: 'template' as const };
        }
        
        // PARTIAL: Database templates provide partial coverage
        if (databaseTemplates.length > 0) {
          console.log(`⚠️ PARTIAL: Database has ${databaseTemplates.length}/${totalQuestions} templates`);
          console.log('🔧 Supplementing with local template generation');
          
          const remainingCount = totalQuestions - databaseTemplates.length;
          const templateProblems = await generateTemplateProblems();
          
          const mixedProblems = [
            ...databaseTemplates,
            ...templateProblems.slice(0, remainingCount)
          ];
          
          console.log(`✅ MIXED SUCCESS: ${databaseTemplates.length} database + ${templateProblems.slice(0, remainingCount).length} template = ${mixedProblems.length} total`);
          return { questions: mixedProblems, source: 'template' as const };
        }
        
        console.log('===============================================');
        console.log('🆘 HIERARCHY LEVEL 2: AI GENERATION (SECONDARY)');
        console.log('===============================================');
        console.log('⚠️ No database templates available - this indicates a data issue');
        
        const fallbackProblems = await generateFallbackTemplates();
        console.log(`📊 AI generation result: ${fallbackProblems.length}/${totalQuestions} questions`);
        
        // SUCCESS: AI provides sufficient questions
        if (fallbackProblems.length >= totalQuestions) {
          console.log('✅ AI SUCCESS: Full coverage from AI generation');
          return { questions: fallbackProblems.slice(0, totalQuestions), source: 'ai' as const };
        }
        
        // PARTIAL: AI provides some questions
        if (fallbackProblems.length > 0) {
          console.log(`⚠️ AI PARTIAL: ${fallbackProblems.length}/${totalQuestions} from AI`);
          console.log('🔧 Supplementing with local template generation');
          
          const remainingCount = totalQuestions - fallbackProblems.length;
          const templateProblems = await generateTemplateProblems();
          
          const mixedProblems = [
            ...fallbackProblems,
            ...templateProblems.slice(0, remainingCount)
          ];
          
          console.log(`✅ AI-TEMPLATE MIX: ${fallbackProblems.length} AI + ${templateProblems.slice(0, remainingCount).length} template = ${mixedProblems.length} total`);
          return { questions: mixedProblems, source: 'ai' as const };
        }
        
        console.log('===============================================');
        console.log('🔧 HIERARCHY LEVEL 3: LOCAL TEMPLATES (FINAL)');
        console.log('===============================================');
        console.log('⚠️ Both database and AI failed - using local generation');
        
        const templateProblems = await generateTemplateProblems();
        console.log(`📊 Local template result: ${templateProblems.length}/${totalQuestions} questions`);
        
        if (templateProblems.length >= totalQuestions) {
          console.log('✅ LOCAL SUCCESS: Full coverage from local templates');
          return { questions: templateProblems.slice(0, totalQuestions), source: 'template' as const };
        }
        
        // If we still don't have enough, we have a serious problem
        console.error('❌ CRITICAL: All generation methods failed to provide sufficient questions');
        console.error(`❌ Got ${templateProblems.length}/${totalQuestions} questions total`);
        
        // Return what we have, even if incomplete
        return { questions: templateProblems, source: 'template' as const };
      })();
      
      const result = await Promise.race([generationPromise, timeoutPromise]);
      
      console.log('===============================================');
      console.log('📋 GENERATION COMPLETE - FINAL RESULT');
      console.log('===============================================');
      console.log(`✅ Generated ${result.questions.length}/${totalQuestions} questions`);
      console.log(`🎯 Source: ${result.source}`);
      console.log('📝 Questions:', result.questions.map((q, i) => `${i + 1}. ${q.question.substring(0, 60)}...`));
      
      if (result.questions.length < totalQuestions) {
        console.warn(`⚠️ INCOMPLETE: Only ${result.questions.length}/${totalQuestions} questions generated`);
      }
      
      setProblems(result.questions);
      setGenerationSource(result.source);
      console.log('✅ State updated successfully');
      
    } catch (error) {
      console.error('===============================================');
      console.error('❌ CRITICAL ERROR IN GENERATION PIPELINE');
      console.error('===============================================');
      console.error('❌ Error details:', error);
      
      // EMERGENCY: Last resort simple fallback
      console.log('🚨 EMERGENCY FALLBACK: Using simple math generation');
      try {
        const emergencyProblems = generateSimpleFallback();
        setProblems(emergencyProblems);
        setGenerationSource('simple');
        console.log('✅ Emergency fallback completed successfully');
      } catch (emergencyError) {
        console.error('❌ EMERGENCY FALLBACK FAILED:', emergencyError);
        setProblems([]);
        setGenerationSource(null);
      }
      
    } finally {
      generationRef.current.isActive = false;
      setIsGenerating(false);
      console.log('🏁 Generation process completed - state cleanup done');
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