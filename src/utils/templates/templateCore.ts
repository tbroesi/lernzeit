
import { QuestionTemplate, GeneratedQuestion } from '../questionTemplates';
import { QuestionGenerator } from './questionGenerator';

export class TemplateCore {
  
  static generateQuestionFromTemplate(
    template: QuestionTemplate, 
    usedCombinations: Set<string>
  ): GeneratedQuestion | null {
    return QuestionGenerator.generateQuestionFromTemplate(template, usedCombinations);
  }
}
