
import { useState, useEffect, useCallback } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';
import { 
  questionTemplates, 
  getTemplatesForCategory, 
  selectTemplateIntelligently,
  QuestionTemplate,
  GeneratedQuestion
} from '@/utils/questionTemplates';
import { TemplateCore } from '@/utils/templates/templateCore';
import { TemplateValidator } from '@/utils/templates/templateValidator';
import { QuestionGenerator } from '@/utils/templates/questionGenerator';

// Storage utilities for template combinations and usage tracking
const TEMPLATE_COMBINATIONS_KEY = (category: string, grade: number, userId: string) => 
  `template_combinations_${category}_${grade}_${userId}`;

const TEMPLATE_USAGE_KEY = (category: string, grade: number, userId: string) => 
  `template_usage_${category}_${grade}_${userId}`;

// FIXED: Robust storage with better error handling and fallbacks
const getUsedCombinations = (category: string, grade: number, userId: string): Set<string> => {
  try {
    if (typeof Storage === "undefined") {
      console.warn('📝 LocalStorage not available, using session memory');
      return new Set();
    }

    const stored = localStorage.getItem(TEMPLATE_COMBINATIONS_KEY(category, grade, userId));
    if (!stored) {
      console.log('📝 No stored combinations found, starting fresh');
      return new Set();
    }

    const parsed = JSON.parse(stored);
    const combinations = new Set(Array.isArray(parsed) ? parsed : []);
    console.log(`📝 Loaded ${combinations.size} used combinations for ${category} Grade ${grade}`);
    return combinations;
  } catch (error) {
    console.warn('📝 Failed to load combinations, clearing corrupted data:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(TEMPLATE_COMBINATIONS_KEY(category, grade, userId));
    } catch {}
    return new Set();
  }
};

const getTemplateUsage = (category: string, grade: number, userId: string): Map<string, number> => {
  try {
    if (typeof Storage === "undefined") {
      return new Map();
    }

    const stored = localStorage.getItem(TEMPLATE_USAGE_KEY(category, grade, userId));
    if (!stored) {
      return new Map();
    }

    const usageObj = JSON.parse(stored);
    const usage = new Map(Object.entries(usageObj).map(([key, value]) => [key, value as number]));
    console.log(`📊 Loaded template usage:`, Object.fromEntries(usage));
    return usage;
  } catch (error) {
    console.warn('📊 Failed to load usage statistics:', error);
    try {
      localStorage.removeItem(TEMPLATE_USAGE_KEY(category, grade, userId));
    } catch {}
    return new Map();
  }
};

const storeUsedCombinations = (category: string, grade: number, userId: string, combinations: Set<string>) => {
  try {
    if (typeof Storage === "undefined") {
      console.warn('📝 LocalStorage not available, cannot persist combinations');
      return;
    }

    const combinationsArray = Array.from(combinations);
    localStorage.setItem(TEMPLATE_COMBINATIONS_KEY(category, grade, userId), JSON.stringify(combinationsArray));
    console.log(`💾 Stored ${combinationsArray.length} template combinations`);
  } catch (error) {
    console.warn('💾 Failed to store template combinations:', error);
  }
};

const storeTemplateUsage = (category: string, grade: number, userId: string, usage: Map<string, number>) => {
  try {
    if (typeof Storage === "undefined") {
      return;
    }

    const usageObj = Object.fromEntries(usage);
    localStorage.setItem(TEMPLATE_USAGE_KEY(category, grade, userId), JSON.stringify(usageObj));
    console.log(`📊 Stored template usage statistics:`, usageObj);
  } catch (error) {
    console.warn('📊 Failed to store template usage:', error);
  }
};

// FIXED: Better random template selection when intelligent selection fails
const selectRandomTemplate = (templates: QuestionTemplate[], excludeIds: Set<string> = new Set()): QuestionTemplate | null => {
  const availableTemplates = templates.filter(t => !excludeIds.has(t.id));
  if (availableTemplates.length === 0) {
    console.warn('⚠️ No available templates after filtering');
    return templates.length > 0 ? templates[Math.floor(Math.random() * templates.length)] : null;
  }
  
  const randomIndex = Math.floor(Math.random() * availableTemplates.length);
  const selected = availableTemplates[randomIndex];
  console.log(`🎲 Randomly selected template: ${selected.id} from ${availableTemplates.length} options`);
  return selected;
};

// FIXED: Reset function to clear problematic combinations
const clearUsedCombinations = (category: string, grade: number, userId: string) => {
  try {
    localStorage.removeItem(TEMPLATE_COMBINATIONS_KEY(category, grade, userId));
    localStorage.removeItem(TEMPLATE_USAGE_KEY(category, grade, userId));
    console.log('🧹 Cleared all used combinations and usage statistics');
  } catch (error) {
    console.warn('🧹 Failed to clear storage:', error);
  }
};

export function useTemplateQuestionGeneration(
  category: string, 
  grade: number, 
  userId: string, 
  totalQuestions: number = 5
) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [usedCombinations, setUsedCombinations] = useState<Set<string>>(new Set());
  const [templateUsage, setTemplateUsage] = useState<Map<string, number>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'template' | 'ai' | 'fallback' | null>(null);
  const [sessionId] = useState(() => `template_session_${Date.now()}_${Math.random()}`);
  const [generationErrors, setGenerationErrors] = useState<string[]>([]);
  
  // FIXED: Session-based template tracking to prevent immediate repeats
  const [sessionUsedTemplates, setSessionUsedTemplates] = useState<Set<string>>(new Set());

  // Memoize initialization to prevent infinite loops
  const initializeData = useCallback(() => {
    const storedCombinations = getUsedCombinations(category, grade, userId);
    const storedUsage = getTemplateUsage(category, grade, userId);
    
    // FIXED: Auto-reset if too many combinations are stored (prevents exhaustion)
    const maxCombinations = 1000; // Adjust based on your template pool
    if (storedCombinations.size > maxCombinations) {
      console.log(`🧹 Too many combinations (${storedCombinations.size}), clearing to prevent exhaustion`);
      clearUsedCombinations(category, grade, userId);
      setUsedCombinations(new Set());
      setTemplateUsage(new Map());
    } else {
      setUsedCombinations(storedCombinations);
      setTemplateUsage(storedUsage);
    }
    
    // Reset session tracking
    setSessionUsedTemplates(new Set());
    
    console.log(`🔄 Initialized: ${storedCombinations.size} combinations, ${storedUsage.size} usage entries`);
  }, [category, grade, userId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const validateTemplatesForCategory = useCallback((templates: QuestionTemplate[]) => {
    console.log('🔍 Validating templates for category:', category);
    const validationResults = TemplateValidator.runComprehensiveValidation(templates);
    
    console.log(`📊 Template validation results:`, {
      overallHealth: Math.round(validationResults.overallHealth * 100) + '%',
      validTemplates: validationResults.validTemplates,
      totalTemplates: templates.length,
      totalIssues: validationResults.totalIssues,
      criticalIssues: validationResults.criticalIssues.length
    });

    if (validationResults.criticalIssues.length > 0) {
      console.warn('🚨 Critical template issues found:', validationResults.criticalIssues.slice(0, 3));
      setGenerationErrors(prev => [...prev, ...validationResults.criticalIssues.slice(0, 3)]);
    }

    return validationResults.overallHealth >= 0.5; // Lowered threshold to be less restrictive
  }, [category]);

  const generateProblems = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenerationErrors([]);
    
    try {
      console.log(`🎯 Generating template-based problems for ${category}, Grade ${grade}`);
      console.log(`📝 Used combinations: ${usedCombinations.size}, Session templates: ${sessionUsedTemplates.size}`);

      // Get available templates for this category and grade
      const availableTemplates = getTemplatesForCategory(category, grade);
      console.log(`📋 Available templates: ${availableTemplates.length}`);

      if (availableTemplates.length === 0) {
        console.log('⚠️ No templates available, falling back to AI generation');
        await fallbackToAI();
        return;
      }

      // Validate templates before using them
      const templatesAreHealthy = validateTemplatesForCategory(availableTemplates);
      if (!templatesAreHealthy) {
        console.warn('⚠️ Template validation failed, falling back to AI generation');
        await fallbackToAI();
        return;
      }

      // FIXED: Generate questions with better template selection
      const templateProblems = await generateTemplateProblemsWithBetterSelection(availableTemplates);
      
      if (templateProblems.length >= totalQuestions) {
        const selectedProblems = templateProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        setGenerationSource('template');
        
        console.log(`✅ Using template-generated problems: ${selectedProblems.length}`);
        console.log(`📊 Questions:`, selectedProblems.map(p => `"${p.question.substring(0, 40)}..."`));
      } else {
        console.log(`⚠️ Templates generated only ${templateProblems.length}/${totalQuestions} questions, trying AI fallback`);
        await fallbackToAI();
      }

    } catch (error) {
      console.error('❌ Template generation failed:', error);
      setGenerationErrors(prev => [...prev, `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      await fallbackToAI();
    } finally {
      setIsGenerating(false);
    }
  }, [category, grade, usedCombinations, templateUsage, sessionUsedTemplates, totalQuestions, isGenerating, validateTemplatesForCategory]);

  // FIXED: Improved template selection with multiple fallback strategies
  const generateTemplateProblemsWithBetterSelection = async (templates: QuestionTemplate[]): Promise<SelectionQuestion[]> => {
    const problems: SelectionQuestion[] = [];
    const updatedCombinations = new Set(usedCombinations);
    const updatedUsage = new Map(templateUsage);
    const sessionTemplates = new Set(sessionUsedTemplates);
    const errors: string[] = [];

    const getDifficultyForQuestion = (questionIndex: number): 'easy' | 'medium' | 'hard' | undefined => {
      if (questionIndex < 2) return 'easy';
      if (questionIndex < 4) return 'medium';
      return 'hard';
    };

    const maxAttempts = totalQuestions * 30; // Increased attempts
    let attempts = 0;
    let consecutiveFailures = 0;

    while (problems.length < totalQuestions && attempts < maxAttempts) {
      attempts++;
      const questionIndex = problems.length;
      
      let selectedTemplate: QuestionTemplate | null = null;
      
      // Strategy 1: Try intelligent selection
      const preferredDifficulty = getDifficultyForQuestion(questionIndex);
      selectedTemplate = selectTemplateIntelligently(templates, updatedUsage, preferredDifficulty);
      
      // Strategy 2: If intelligent selection fails or returns recently used template, try random selection
      if (!selectedTemplate || sessionTemplates.has(selectedTemplate.id)) {
        console.log(`🎲 Intelligent selection ${!selectedTemplate ? 'failed' : 'returned recently used template'}, trying random selection`);
        selectedTemplate = selectRandomTemplate(templates, sessionTemplates);
      }
      
      // Strategy 3: If still no template, ignore session restrictions
      if (!selectedTemplate) {
        console.log(`🎲 Random selection failed, ignoring session restrictions`);
        selectedTemplate = selectRandomTemplate(templates);
      }
      
      if (!selectedTemplate) {
        errors.push('No template could be selected with any strategy');
        console.error('❌ All template selection strategies failed');
        break;
      }

      // Generate question with the selected template
      console.log(`🔄 Attempt ${attempts}: Using template ${selectedTemplate.id} (${selectedTemplate.difficulty || 'unknown'})`);
      
      const generatedQuestion = QuestionGenerator.generateQuestionFromTemplate(selectedTemplate, updatedCombinations);

      if (generatedQuestion) {
        try {
          const selectionQuestion = convertToSelectionQuestion(generatedQuestion);
          problems.push(selectionQuestion);
          
          // Update tracking
          updatedUsage.set(selectedTemplate.id, (updatedUsage.get(selectedTemplate.id) || 0) + 1);
          sessionTemplates.add(selectedTemplate.id);
          consecutiveFailures = 0;
          
          console.log(`✅ Generated #${problems.length}: "${generatedQuestion.question.substring(0, 50)}..." (${selectedTemplate.id})`);
        } catch (conversionError) {
          console.error('❌ Error converting generated question:', conversionError);
          errors.push(`Conversion failed for template ${selectedTemplate.id}`);
          consecutiveFailures++;
        }
      } else {
        console.warn(`⚠️ Template ${selectedTemplate.id} failed to generate question`);
        errors.push(`Failed to generate question from template ${selectedTemplate.id}`);
        consecutiveFailures++;
        
        // If we have too many consecutive failures, try resetting combinations
        if (consecutiveFailures > 10) {
          console.log('🧹 Too many consecutive failures, partially clearing combinations');
          const currentSize = updatedCombinations.size;
          const newCombinations = new Set(Array.from(updatedCombinations).slice(-Math.floor(currentSize / 2)));
          updatedCombinations.clear();
          newCombinations.forEach(c => updatedCombinations.add(c));
          consecutiveFailures = 0;
        }
      }
    }

    // Store updated data
    setUsedCombinations(updatedCombinations);
    setTemplateUsage(updatedUsage);
    setSessionUsedTemplates(sessionTemplates);
    storeUsedCombinations(category, grade, userId, updatedCombinations);
    storeTemplateUsage(category, grade, userId, updatedUsage);

    if (errors.length > 0) {
      console.warn(`⚠️ Generation completed with ${errors.length} errors:`, errors.slice(0, 5));
      setGenerationErrors(prev => [...prev, ...errors.slice(0, 3)]);
    }

    console.log(`📊 Generation complete: ${problems.length}/${totalQuestions} questions after ${attempts} attempts`);

    return problems;
  };

  const convertToSelectionQuestion = (generated: GeneratedQuestion): SelectionQuestion => {
    const base = {
      id: generated.id,
      question: generated.question,
      type: generated.type as any,
      explanation: generated.explanation
    };

    switch (generated.questionType) {
      case 'multiple-choice':
        return {
          ...base,
          questionType: 'multiple-choice',
          options: generated.options || [],
          correctAnswer: generated.correctAnswer || 0
        };
      
      case 'word-selection':
        return {
          ...base,
          questionType: 'word-selection',
          sentence: generated.question,
          selectableWords: generated.selectableWords || []
        };
      
      case 'matching':
        return {
          ...base,
          questionType: 'matching',
          items: generated.items || [],
          categories: generated.categories || []
        };
      
      case 'drag-drop':
        return {
          ...base,
          questionType: 'drag-drop',
          items: generated.items || [],
          categories: generated.categories || []
        };
      
      case 'text-input':
      default:
        return {
          ...base,
          questionType: 'text-input',
          answer: generated.answer
        };
    }
  };

  const fallbackToAI = async (): Promise<void> => {
    try {
      console.log('🤖 Attempting AI generation as fallback...');
      
      const excludeQuestions = Array.from(usedCombinations);
      
      const response = await supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions + 2,
          excludeQuestions,
          sessionId,
          globalQuestionCount: usedCombinations.size,
          requestId: `${Date.now()}_${Math.random()}`, // FIXED: Better request ID generation
          forceVariation: true // NEW: Force the AI to create varied questions
        }
      });

      if (response.error) {
        console.error('❌ AI fallback failed:', response.error);
        generateFallbackProblems();
        return;
      }

      const aiProblems = response.data?.problems || [];
      if (aiProblems.length >= totalQuestions) {
        const selectedProblems = aiProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        setGenerationSource('ai');
        console.log(`✅ Using AI fallback: ${selectedProblems.length} problems`);
      } else {
        generateFallbackProblems();
      }
    } catch (error) {
      console.error('❌ AI fallback error:', error);
      generateFallbackProblems();
    }
  };

  // FIXED: Improved fallback with better randomization
  const generateFallbackProblems = (): void => {
    console.log('⚡ Using improved fallback generation...');
    const fallbackProblems: SelectionQuestion[] = [];
    
    // FIXED: Better random ranges to prevent "34 + 27" repetition
    const getRandomRange = (base: number, variance: number) => {
      return Math.floor(Math.random() * variance * 2) + base - variance;
    };
    
    for (let i = 0; i < totalQuestions; i++) {
      const timestamp = Date.now() + i; // Ensure different seed for each question
      const seed = (timestamp + Math.random() * 1000) % 1000;
      
      if (category === 'Mathematik') {
        // FIXED: Much wider ranges and varied operations
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor((seed * 3) % operations.length)];
        
        let a, b, answer, questionText;
        
        if (operation === '+') {
          a = getRandomRange(15, 10); // 5-25
          b = getRandomRange(12, 8);  // 4-20
          answer = a + b;
          questionText = `${a} + ${b} = ?`;
        } else if (operation === '-') {
          a = getRandomRange(30, 15); // 15-45
          b = getRandomRange(12, 8);  // 4-20
          answer = Math.max(0, a - b);
          questionText = `${a} - ${b} = ?`;
        } else { // multiplication
          a = getRandomRange(6, 3);   // 3-9
          b = getRandomRange(5, 2);   // 3-7
          answer = a * b;
          questionText = `${a} × ${b} = ?`;
        }
        
        fallbackProblems.push({
          id: Math.floor(seed * 1000000),
          questionType: 'text-input',
          question: questionText,
          answer: answer,
          type: 'math',
          explanation: `Fallback ${operation === '+' ? 'Addition' : operation === '-' ? 'Subtraktion' : 'Multiplikation'}`
        });
      } else if (category === 'Deutsch') {
        const words = ['Hund', 'Katze', 'Baum', 'Haus', 'Auto', 'Buch', 'Tisch', 'Stuhl', 'Blume', 'Vogel'];
        const wordIndex = Math.floor(seed % words.length);
        const word = words[wordIndex];
        const syllableCount = Math.max(1, Math.ceil(word.length / 2.5));
        
        fallbackProblems.push({
          id: Math.floor(seed * 1000000),
          questionType: 'text-input',
          question: `Wie viele Silben hat das Wort "${word}"?`,
          answer: syllableCount,
          type: 'german',
          explanation: 'Silben zählen'
        });
      } else {
        const num = Math.floor(seed % 50) + 20; // 20-70
        const addend = Math.floor(seed % 10) + 1; // 1-10
        fallbackProblems.push({
          id: Math.floor(seed * 1000000),
          questionType: 'text-input',
          question: `Was ist ${num} + ${addend}?`,
          answer: num + addend,
          type: category.toLowerCase() as 'math' | 'german' | 'english' | 'geography' | 'history' | 'physics' | 'biology' | 'chemistry' | 'latin',
          explanation: 'Einfache Rechnung'
        });
      }
    }
    
    console.log('⚡ Generated fallback problems:', fallbackProblems.map(p => p.question));
    setProblems(fallbackProblems);
    setGenerationSource('fallback');
  };

  const getGenerationStats = () => {
    return {
      totalCombinations: usedCombinations.size,
      sessionTemplates: sessionUsedTemplates.size,
      templateUsage: Object.fromEntries(templateUsage),
      availableTemplates: getTemplatesForCategory(category, grade).length,
      generationSource,
      generationErrors,
      auditLog: QuestionGenerator.getAuditLog().slice(-10),
      // NEW: Reset function for debugging
      resetData: () => {
        clearUsedCombinations(category, grade, userId);
        initializeData();
      }
    };
  };

  return {
    problems,
    usedCombinations,
    templateUsage,
    sessionUsedTemplates,
    sessionId,
    isGenerating,
    generationSource,
    generationErrors,
    generateProblems,
    getGenerationStats
  };
}
