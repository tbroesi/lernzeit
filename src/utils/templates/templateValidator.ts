
import { QuestionTemplate, GeneratedQuestion } from '../questionTemplates';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ComprehensiveValidationResult {
  isValid: boolean;
  errors: string[];
  validTemplates: number;
  totalIssues: number;
  criticalIssues: string[];
  overallHealth: number;
  templateResults: Map<string, ValidationResult>;
}

export class TemplateValidator {
  
  static runComprehensiveValidation(templates: QuestionTemplate[]): ComprehensiveValidationResult {
    const templateResults = new Map<string, ValidationResult>();
    const allErrors: string[] = [];
    const criticalIssues: string[] = [];
    
    for (const template of templates) {
      const result = this.validateTemplateStructure(template);
      templateResults.set(template.id, result);
      
      if (!result.isValid) {
        allErrors.push(...result.errors);
        criticalIssues.push(...result.errors);
      }
    }
    
    const validTemplates = templates.filter(t => templateResults.get(t.id)?.isValid).length;
    const overallHealth = templates.length > 0 ? validTemplates / templates.length : 0;
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      validTemplates,
      totalIssues: allErrors.length,
      criticalIssues,
      overallHealth,
      templateResults
    };
  }

  private static validateTemplateStructure(template: QuestionTemplate): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!template.id) {
      errors.push('Template missing ID');
    }
    
    if (!template.category) {
      errors.push('Template missing category');
    }
    
    if (!template.grade) {
      errors.push('Template missing grade');
    }
    
    if (!template.type) {
      errors.push('Template missing type');
    }
    
    if (!template.template) {
      errors.push('Template missing template string');
    }
    
    if (!template.parameters || template.parameters.length === 0) {
      warnings.push('Template has no parameters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateQuestion(template: QuestionTemplate, generatedQuestion: GeneratedQuestion): boolean {
    try {
      if (template.category === 'Mathematik') {
        return this.validateMathQuestion(template, generatedQuestion);
      }
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  private static validateMathQuestion(template: QuestionTemplate, question: GeneratedQuestion): boolean {
    const params = this.extractParametersFromQuestion(question.question, template);
    if (!params) return false;

    if (template.id.includes('addition')) {
      const a = Number(params.a || 0);
      const b = Number(params.b || 0);
      return Number(question.answer) === (a + b);
    }
    
    if (template.id.includes('subtraction')) {
      const a = Number(params.a || 0);
      const b = Number(params.b || 0);
      return Number(question.answer) === (a - b);
    }
    
    if (template.id.includes('multiplication')) {
      const a = Number(params.a || 0);
      const b = Number(params.b || 0);
      return Number(question.answer) === (a * b);
    }

    return true;
  }

  private static extractParametersFromQuestion(questionText: string, template: QuestionTemplate): Record<string, any> | null {
    try {
      const params: Record<string, any> = {};
      const numbers = questionText.match(/\b\d+\b/g);
      if (numbers && template.parameters.length >= 2) {
        params.a = Number(numbers[0]);
        params.b = Number(numbers[1]);
      }
      return params;
    } catch {
      return null;
    }
  }
}
