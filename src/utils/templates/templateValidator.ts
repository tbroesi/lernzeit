import { QuestionTemplate, GeneratedQuestion } from '../questionTemplates';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validTemplates: number;
  totalIssues: number;
  criticalIssues: number;
  overallHealth: number;
  templateResults?: any[];
}

export class TemplateValidator {
  
  static runComprehensiveValidation(templates: QuestionTemplate[]): ValidationResult {
    const errors: string[] = [];
    
    for (const template of templates) {
      if (!this.validateTemplateStructure(template)) {
        errors.push(`Invalid template structure: ${template.id}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      validTemplates: templates.length - errors.length,
      totalIssues: errors.length,
      criticalIssues: errors.length,
      overallHealth: ((templates.length - errors.length) / templates.length) * 100,
      templateResults: []
    };
  }

  private static validateTemplateStructure(template: QuestionTemplate): boolean {
    return !!(template.id && template.category && template.grade && template.type);
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