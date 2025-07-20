
import { QuestionTemplate } from '../questionTemplates';
import { ParameterGenerator } from './parameterGenerator';
import { AnswerCalculator } from './answerCalculator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  testResults?: TestResult[];
}

export interface TestResult {
  testCase: number;
  parameters: Record<string, any>;
  calculatedAnswer: string | number;
  success: boolean;
  errors: string[];
  calculationSteps?: string[];
}

export class TemplateValidator {
  
  static validateTemplate(template: QuestionTemplate, testCases: number = 10): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const testResults: TestResult[] = [];

    // Basic structure validation
    if (!template.id || typeof template.id !== 'string') {
      errors.push('Template must have a valid ID');
    }

    if (!template.category || typeof template.category !== 'string') {
      errors.push('Template must have a valid category');
    }

    if (!template.grade || typeof template.grade !== 'number' || template.grade < 1 || template.grade > 12) {
      errors.push('Template must have a valid grade (1-12)');
    }

    if (!['text-input', 'multiple-choice', 'word-selection', 'matching', 'drag-drop'].includes(template.type)) {
      errors.push('Template must have a valid question type');
    }

    if (!template.template || typeof template.template !== 'string') {
      errors.push('Template must have a question template string');
    }

    if (!Array.isArray(template.parameters)) {
      errors.push('Template must have a parameters array');
    } else {
      // Validate each parameter
      template.parameters.forEach((param, index) => {
        if (!param.name || typeof param.name !== 'string') {
          errors.push(`Parameter ${index} must have a valid name`);
        }

        if (!['number', 'word', 'list'].includes(param.type)) {
          errors.push(`Parameter ${param.name} must have a valid type`);
        }

        if (param.type === 'number' && !param.range) {
          errors.push(`Number parameter ${param.name} must have a range`);
        }

        if ((param.type === 'word' || param.type === 'list') && (!param.values || !Array.isArray(param.values))) {
          errors.push(`Parameter ${param.name} must have values array`);
        }
      });
    }

    if (!['easy', 'medium', 'hard'].includes(template.difficulty)) {
      errors.push('Template must have a valid difficulty level');
    }

    if (!Array.isArray(template.topics) || template.topics.length === 0) {
      warnings.push('Template should have topics defined');
    }

    // Functional testing - generate test cases and verify calculations
    if (errors.length === 0) {
      for (let i = 0; i < testCases; i++) {
        const paramResult = ParameterGenerator.generateParameters(template);
        
        if (!paramResult.isValid) {
          testResults.push({
            testCase: i + 1,
            parameters: paramResult.parameters,
            calculatedAnswer: '',
            success: false,
            errors: paramResult.errors
          });
          continue;
        }

        const calculationResult = AnswerCalculator.calculateAnswer(template, paramResult.parameters);
        
        testResults.push({
          testCase: i + 1,
          parameters: paramResult.parameters,
          calculatedAnswer: calculationResult.answer,
          success: calculationResult.isValid,
          errors: calculationResult.errors,
          calculationSteps: calculationResult.calculationSteps
        });

        if (!calculationResult.isValid) {
          errors.push(`Test case ${i + 1} failed: ${calculationResult.errors.join(', ')}`);
        }
      }

      // Check if template placeholders match parameters
      const templatePlaceholders = template.template.match(/{(\w+)}/g);
      if (templatePlaceholders) {
        const placeholderNames = templatePlaceholders.map(p => p.slice(1, -1));
        const parameterNames = template.parameters.map(p => p.name);
        
        placeholderNames.forEach(placeholder => {
          if (!parameterNames.includes(placeholder)) {
            errors.push(`Template uses placeholder {${placeholder}} but no parameter with that name exists`);
          }
        });
      }
    }

    const successfulTests = testResults.filter(t => t.success).length;
    const testSuccessRate = testCases > 0 ? successfulTests / testCases : 0;

    if (testSuccessRate < 0.8) {
      warnings.push(`Low test success rate: ${Math.round(testSuccessRate * 100)}% (${successfulTests}/${testCases})`);
    }

    return {
      isValid: errors.length === 0 && testSuccessRate >= 0.5,
      errors,
      warnings,
      testResults
    };
  }

  static runComprehensiveValidation(templates: QuestionTemplate[]): {
    overallHealth: number;
    validTemplates: number;
    totalIssues: number;
    criticalIssues: string[];
    templateResults: Map<string, ValidationResult>;
  } {
    const templateResults = new Map<string, ValidationResult>();
    const criticalIssues: string[] = [];
    let validTemplates = 0;
    let totalIssues = 0;

    templates.forEach(template => {
      const result = this.validateTemplate(template, 5);
      templateResults.set(template.id, result);
      
      if (result.isValid) {
        validTemplates++;
      }
      
      totalIssues += result.errors.length + result.warnings.length;
      
      if (result.errors.length > 0) {
        criticalIssues.push(`${template.id}: ${result.errors.join(', ')}`);
      }
    });

    const overallHealth = templates.length > 0 ? validTemplates / templates.length : 0;

    return {
      overallHealth,
      validTemplates,
      totalIssues,
      criticalIssues,
      templateResults
    };
  }
}
