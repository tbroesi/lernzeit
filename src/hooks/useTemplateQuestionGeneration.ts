
import { useState, useEffect } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';
import { 
  questionTemplates, 
  getTemplatesForCategory, 
  generateQuestionFromTemplate,
  QuestionTemplate,
  GeneratedQuestion
} from '@/utils/questionTemplates';

// Storage utilities for template combinations
const TEMPLATE_COMBINATIONS_KEY = (category: string, grade: number, userId: string) => 
  `template_combinations_${category}_${grade}_${userId}`;

const getUsedCombinations = (category: string, grade: number, userId: string): Set<string> => {
  try {
    const stored = localStorage.getItem(TEMPLATE_COMBINATIONS_KEY(category, grade, userId));
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const storeUsedCombinations = (category: string, grade: number, userId: string, combinations: Set<string>) => {
  try {
    const combinationsArray = Array.from(combinations);
    localStorage.setItem(TEMPLATE_COMBINATIONS_KEY(category, grade, userId), JSON.stringify(combinationsArray));
    console.log(`💾 Stored ${combinationsArray.length} template combinations`);
  } catch (e) {
    console.warn('Failed to store template combinations:', e);
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'template' | 'ai' | 'fallback' | null>(null);
  const [sessionId] = useState(() => `template_session_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    const storedCombinations = getUsedCombinations(category, grade, userId);
    setUsedCombinations(storedCombinations);
    console.log(`🔄 Loaded ${storedCombinations.size} used template combinations for ${category} Grade ${grade}`);
  }, [category, grade, userId]);

  const generateProblems = async () => {
    setIsGenerating(true);
    
    try {
      console.log(`🎯 Generating template-based problems for ${category}, Grade ${grade}`);
      console.log(`📝 Used combinations: ${usedCombinations.size}`);

      // Get available templates for this category and grade
      const availableTemplates = getTemplatesForCategory(category, grade);
      console.log(`📋 Available templates: ${availableTemplates.length}`);

      if (availableTemplates.length === 0) {
        console.log('⚠️ No templates available, falling back to AI generation');
        return await fallbackToAI();
      }

      // Generate questions using templates
      const templateProblems = await generateTemplateProblems(availableTemplates);
      
      if (templateProblems.length >= totalQuestions) {
        const selectedProblems = templateProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        setGenerationSource('template');
        
        console.log(`✅ Using template-generated problems: ${selectedProblems.length}`);
        console.log(`📊 Questions:`, selectedProblems.map(p => p.question.substring(0, 30) + '...'));
        
        setIsGenerating(false);
        return;
      }

      // If templates don't generate enough questions, try AI fallback
      console.log(`⚠️ Templates generated only ${templateProblems.length}/${totalQuestions} questions, trying AI fallback`);
      return await fallbackToAI();

    } catch (error) {
      console.error('❌ Template generation failed:', error);
      return await fallbackToAI();
    }
  };

  const generateTemplateProblems = async (templates: QuestionTemplate[]): Promise<SelectionQuestion[]> => {
    const problems: SelectionQuestion[] = [];
    const updatedCombinations = new Set(usedCombinations);
    const templateUsage = new Map<string, number>();

    // Track template usage to ensure variety
    templates.forEach(t => templateUsage.set(t.id, 0));

    const maxAttempts = totalQuestions * 10;
    let attempts = 0;

    while (problems.length < totalQuestions && attempts < maxAttempts) {
      attempts++;

      // Select template with preference for less used ones
      const sortedTemplates = templates.sort((a, b) => {
        const usageA = templateUsage.get(a.id) || 0;
        const usageB = templateUsage.get(b.id) || 0;
        if (usageA !== usageB) return usageA - usageB;
        return Math.random() - 0.5; // Random if usage is equal
      });

      const selectedTemplate = sortedTemplates[0];
      const generatedQuestion = generateQuestionFromTemplate(selectedTemplate, updatedCombinations);

      if (generatedQuestion) {
        const selectionQuestion = convertToSelectionQuestion(generatedQuestion);
        problems.push(selectionQuestion);
        templateUsage.set(selectedTemplate.id, (templateUsage.get(selectedTemplate.id) || 0) + 1);
        
        console.log(`✅ Generated: "${generatedQuestion.question.substring(0, 40)}..." (Template: ${selectedTemplate.id})`);
      }
    }

    // Store updated combinations
    setUsedCombinations(updatedCombinations);
    storeUsedCombinations(category, grade, userId, updatedCombinations);

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
          requestId: `${Date.now()}_${Math.random()}`
        }
      });

      if (response.error) {
        console.error('❌ AI fallback failed:', response.error);
        return generateFallbackProblems();
      }

      const aiProblems = response.data?.problems || [];
      if (aiProblems.length >= totalQuestions) {
        const selectedProblems = aiProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        setGenerationSource('ai');
        console.log(`✅ Using AI fallback: ${selectedProblems.length} problems`);
      } else {
        return generateFallbackProblems();
      }
    } catch (error) {
      console.error('❌ AI fallback error:', error);
      return generateFallbackProblems();
    }

    setIsGenerating(false);
  };

  const generateFallbackProblems = (): void => {
    console.log('⚡ Using simple fallback generation...');
    const fallbackProblems: SelectionQuestion[] = [];
    
    // Generate simple math problems as ultimate fallback
    for (let i = 0; i < totalQuestions; i++) {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 15) + 2;
      const operation = Math.random() > 0.5 ? '+' : '-';
      const answer = operation === '+' ? a + b : a - b;
      
      // Ensure positive results for subtraction
      const [first, second] = operation === '-' && answer < 0 ? [b, a] : [a, b];
      const finalAnswer = operation === '+' ? first + second : first - second;
      
      fallbackProblems.push({
        id: Math.floor(Math.random() * 1000000),
        questionType: 'text-input',
        question: `${first} ${operation} ${second} = ?`,
        answer: finalAnswer,
        type: 'math',
        explanation: `${first} ${operation} ${second} = ${finalAnswer}`
      });
    }
    
    setProblems(fallbackProblems);
    setGenerationSource('fallback');
    setIsGenerating(false);
  };

  return {
    problems,
    usedCombinations,
    sessionId,
    isGenerating,
    generationSource,
    generateProblems
  };
}
