
import { QuestionTemplate, GeneratedQuestion } from '../questionTemplates';
import { AnswerCalculator } from './answerCalculator';
import { ParameterGenerator } from './parameterGenerator';
import { OptionGenerator } from './optionGenerator';

export interface GenerationAuditLog {
  templateId: string;
  timestamp: number;
  parameters: Record<string, any>;
  calculationResult: any;
  finalAnswer: string | number;
  success: boolean;
  errors: string[];
}

export class QuestionGenerator {
  private static auditLog: GenerationAuditLog[] = [];
  
  static generateQuestionFromTemplate(
    template: QuestionTemplate, 
    usedCombinations: Set<string>
  ): GeneratedQuestion | null {
    const maxAttempts = 100; // Increased attempts for better reliability
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      
      // Generate parameter values with better error handling
      const paramResult = ParameterGenerator.generateParameters(template);
      if (!paramResult.isValid) {
        console.warn(`Parameter generation failed for ${template.id} on attempt ${attempts}:`, paramResult.errors);
        continue;
      }

      const params = paramResult.parameters;

      // Create combination key to check for duplicates
      const combinationKey = `${template.id}_${JSON.stringify(params)}`;
      if (usedCombinations.has(combinationKey)) {
        console.log(`⚠️ Combination already used: ${combinationKey}, trying again...`);
        continue;
      }

      // Calculate the answer
      const calculationResult = AnswerCalculator.calculateAnswer(template, params);
      
      if (!calculationResult.isValid) {
        console.error(`Answer calculation failed for ${template.id} on attempt ${attempts}:`, calculationResult.errors);
        this.logGeneration(template.id, params, calculationResult, '', false, calculationResult.errors);
        continue;
      }

      // Generate the question
      const question = this.generateQuestionFromParams(template, params, calculationResult);
      if (question) {
        usedCombinations.add(combinationKey);
        this.logGeneration(template.id, params, calculationResult, calculationResult.answer, true, []);
        console.log(`✅ Successfully generated question: "${question.question}" with params:`, params);
        return question;
      }
    }

    console.error(`❌ Failed to generate question for template ${template.id} after ${maxAttempts} attempts`);
    return null;
  }

  private static generateQuestionFromParams(
    template: QuestionTemplate, 
    params: Record<string, any>,
    calculationResult: any
  ): GeneratedQuestion | null {
    try {
      let questionText = template.template;

      // Replace parameters in template with proper error handling
      for (const [key, value] of Object.entries(params)) {
        const placeholder = `{${key}}`;
        if (questionText.includes(placeholder)) {
          questionText = questionText.replace(new RegExp(`\\{${key}\\}`, 'g'), value.toString());
        }
      }

      // Ensure we have a valid question text
      if (questionText.includes('{') && questionText.includes('}')) {
        console.error(`❌ Template ${template.id} has unresolved placeholders: ${questionText}`);
        return null;
      }

      const baseQuestion: GeneratedQuestion = {
        id: Math.floor(Math.random() * 1000000),
        questionType: template.type,
        question: questionText,
        answer: calculationResult.answer,
        type: template.category.toLowerCase(),
        explanation: template.explanation
      };

      // Add type-specific properties
      if (template.type === 'multiple-choice') {
        const options = OptionGenerator.generateMultipleChoiceOptions(calculationResult.answer, template, params);
        baseQuestion.options = options;
        baseQuestion.correctAnswer = options.indexOf(calculationResult.answer.toString());
      } else if (template.type === 'word-selection') {
        baseQuestion.selectableWords = OptionGenerator.generateWordSelection(template, params);
      } else if (template.type === 'matching') {
        const { items, categories } = OptionGenerator.generateMatchingQuestion(template, params);
        baseQuestion.items = items;
        baseQuestion.categories = categories;
      }

      return baseQuestion;
    } catch (error) {
      console.error('❌ Error generating question from template:', error);
      return null;
    }
  }

  private static logGeneration(
    templateId: string,
    parameters: Record<string, any>,
    calculationResult: any,
    finalAnswer: string | number,
    success: boolean,
    errors: string[]
  ): void {
    const logEntry: GenerationAuditLog = {
      templateId,
      timestamp: Date.now(),
      parameters,
      calculationResult,
      finalAnswer,
      success,
      errors
    };

    this.auditLog.push(logEntry);
    
    // Keep only last 100 entries to prevent memory issues
    if (this.auditLog.length > 100) {
      this.auditLog = this.auditLog.slice(-100);
    }

    console.log(`📝 Question generation ${success ? 'success' : 'failure'}:`, {
      template: templateId,
      params: parameters,
      answer: finalAnswer,
      errors
    });
  }

  static getAuditLog(): GenerationAuditLog[] {
    return [...this.auditLog];
  }

  static clearAuditLog(): void {
    this.auditLog = [];
  }
}
