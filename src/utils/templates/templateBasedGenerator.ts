// Template-based question generator with proper validation and variety
import { SelectionQuestion } from '@/types/questionTypes';
import { 
  GradeTemplate, 
  getTemplatesForGradeAndCategory, 
  getAllWordProblemTemplates,
  validateTemplate 
} from './gradeSpecificTemplates';

export class TemplateBasedGenerator {
  private usedCombinations = new Set<string>();
  private templateUsageCount = new Map<string, number>();

  // Main generation method
  static generateProblems(category: string, grade: number, count: number): SelectionQuestion[] {
    const generator = new TemplateBasedGenerator();
    return generator.generateQuestionsFromTemplates(category, grade, count);
  }

  private generateQuestionsFromTemplates(category: string, grade: number, count: number): SelectionQuestion[] {
    const problems: SelectionQuestion[] = [];
    
    // Get all available templates for this grade and category
    const templates = this.getAvailableTemplates(category, grade);
    
    if (templates.length === 0) {
      console.warn(`No templates found for ${category}, grade ${grade}`);
      return this.generateFallbackProblems(category, grade, count);
    }

    console.log(`📋 Found ${templates.length} templates for ${category}, grade ${grade}`);

    for (let i = 0; i < count; i++) {
      const template = this.selectTemplate(templates);
      if (!template) {
        console.warn(`Failed to select template for question ${i + 1}`);
        continue;
      }

      const question = this.generateQuestionFromTemplate(template, i);
      if (question) {
        problems.push(question);
        this.registerTemplateUsage(template.id);
      }
    }

    console.log(`✅ Generated ${problems.length}/${count} questions using templates`);
    return problems;
  }

  private getAvailableTemplates(category: string, grade: number): GradeTemplate[] {
    let templates = getTemplatesForGradeAndCategory(grade, category);
    
    // Add word problems for math
    if (category === 'math' && grade >= 2) {
      const wordProblems = getAllWordProblemTemplates().filter(t => t.grade <= grade);
      templates = [...templates, ...wordProblems];
    }
    
    // Add templates from adjacent grades for variety
    if (grade > 1) {
      const lowerGradeTemplates = getTemplatesForGradeAndCategory(grade - 1, category)
        .filter(t => t.difficulty !== 'hard');
      templates = [...templates, ...lowerGradeTemplates];
    }
    
    if (grade < 6) {
      const higherGradeTemplates = getTemplatesForGradeAndCategory(grade + 1, category)
        .filter(t => t.difficulty === 'easy');
      templates = [...templates, ...higherGradeTemplates];
    }

    return templates.filter(validateTemplate);
  }

  private selectTemplate(templates: GradeTemplate[]): GradeTemplate | null {
    if (templates.length === 0) return null;

    // Prefer less-used templates for variety
    const sortedTemplates = templates.sort((a, b) => {
      const usageA = this.templateUsageCount.get(a.id) || 0;
      const usageB = this.templateUsageCount.get(b.id) || 0;
      return usageA - usageB;
    });

    // Pick from top 3 least used templates
    const candidatePool = sortedTemplates.slice(0, Math.min(3, sortedTemplates.length));
    return candidatePool[Math.floor(Math.random() * candidatePool.length)];
  }

  private generateQuestionFromTemplate(template: GradeTemplate, seed: number): SelectionQuestion | null {
    try {
      const parameters = this.generateParameters(template);
      if (!parameters) {
        console.warn(`Failed to generate parameters for template ${template.id}`);
        return null;
      }

      // Check for duplicates
      const combinationKey = this.createCombinationKey(template, parameters);
      if (this.usedCombinations.has(combinationKey)) {
        // Try again with different parameters
        const retryParameters = this.generateParameters(template);
        if (retryParameters) {
          const retryKey = this.createCombinationKey(template, retryParameters);
          if (!this.usedCombinations.has(retryKey)) {
            this.usedCombinations.add(retryKey);
            return this.buildQuestion(template, retryParameters, seed);
          }
        }
        console.warn(`Duplicate combination detected for template ${template.id}`);
        return null;
      }

      this.usedCombinations.add(combinationKey);
      return this.buildQuestion(template, parameters, seed);

    } catch (error) {
      console.error(`Error generating question from template ${template.id}:`, error);
      return null;
    }
  }

  private generateParameters(template: GradeTemplate): Record<string, any> | null {
    const parameters: Record<string, any> = {};
    
    try {
      for (const [paramName, paramConfig] of Object.entries(template.parameters)) {
        switch (paramConfig.type) {
          case 'number':
            if (paramConfig.range) {
              const [min, max] = paramConfig.range;
              parameters[paramName] = Math.floor(Math.random() * (max - min + 1)) + min;
            } else {
              parameters[paramName] = Math.floor(Math.random() * 100) + 1;
            }
            break;
            
          case 'word':
            if (paramConfig.values && paramConfig.values.length > 0) {
              parameters[paramName] = paramConfig.values[Math.floor(Math.random() * paramConfig.values.length)];
            } else {
              parameters[paramName] = 'default';
            }
            break;
            
          case 'list':
            if (paramConfig.values && paramConfig.values.length > 0) {
              parameters[paramName] = paramConfig.values;
            } else {
              parameters[paramName] = [];
            }
            break;
        }
      }

      // Calculate derived values for math problems
      this.calculateDerivedValues(template, parameters);
      
      return parameters;
    } catch (error) {
      console.error(`Error generating parameters for ${template.id}:`, error);
      return null;
    }
  }

  private calculateDerivedValues(template: GradeTemplate, parameters: Record<string, any>): void {
    switch (template.type) {
      case 'addition':
        if (parameters.a && parameters.b) {
          parameters.sum = parameters.a + parameters.b;
        }
        break;
        
      case 'subtraction':
        if (parameters.a && parameters.b) {
          // Ensure positive result
          if (parameters.a < parameters.b) {
            [parameters.a, parameters.b] = [parameters.b, parameters.a];
          }
          parameters.difference = parameters.a - parameters.b;
        }
        break;
        
      case 'multiplication':
        if (parameters.table && parameters.factor) {
          parameters.product = parameters.table * parameters.factor;
        } else if (parameters.a && parameters.b) {
          parameters.product = parameters.a * parameters.b;
        }
        break;
        
      case 'division':
        if (parameters.divisor && parameters.quotient) {
          parameters.dividend = parameters.divisor * parameters.quotient;
        }
        break;
        
      case 'geometry':
        if (parameters.length && parameters.width) {
          parameters.area = parameters.length * parameters.width;
          parameters.perimeter = 2 * (parameters.length + parameters.width);
        } else if (parameters.side) {
          parameters.area = parameters.side * parameters.side;
          parameters.perimeter = 4 * parameters.side;
        }
        break;
        
      case 'decimals':
        if (parameters.num1 && parameters.num2) {
          parameters.sum = (parameters.num1 + parameters.num2).toFixed(1);
        }
        break;
        
      case 'word_problem':
        if (parameters.items && parameters.price) {
          parameters.total = parameters.items * parameters.price;
        } else if (parameters.groups && parameters.animals_per_group) {
          parameters.total_animals = parameters.groups * parameters.animals_per_group;
        }
        break;
    }
  }

  private buildQuestion(template: GradeTemplate, parameters: Record<string, any>, seed: number): SelectionQuestion {
    const questionType = this.selectQuestionType(template);
    const questionText = this.fillTemplate(template.questionTemplate, parameters);
    const answerText = this.fillTemplate(template.answerTemplate, parameters);
    const explanationText = this.fillTemplate(template.explanationTemplate, parameters);

    const baseQuestion: Partial<SelectionQuestion> = {
      id: Math.floor(Math.random() * 1000000) + seed,
      type: template.category as any, // Cast to satisfy type requirements
      question: questionText,
      explanation: explanationText
    };

    switch (questionType) {
      case 'multiple-choice':
        return {
          ...baseQuestion,
          questionType: 'multiple-choice',
          options: this.generateOptions(template, parameters, answerText),
          correctAnswer: 0 // First option is always correct in our generation
        } as SelectionQuestion;

      case 'word-selection':
        return {
          ...baseQuestion,
          questionType: 'word-selection',
          sentence: questionText,
          selectableWords: this.generateSelectableWords(template, parameters)
        } as SelectionQuestion;

      default:
      return {
        ...baseQuestion,
        questionType: 'text-input',
        answer: answerText
      } as SelectionQuestion;
    }
  }

  private selectQuestionType(template: GradeTemplate): string {
    if (template.questionTypes.length === 1) {
      return template.questionTypes[0];
    }
    
    return template.questionTypes[Math.floor(Math.random() * template.questionTypes.length)];
  }

  private fillTemplate(template: string, parameters: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(parameters)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    
    return result;
  }

  private generateOptions(template: GradeTemplate, parameters: Record<string, any>, correctAnswer: string): string[] {
    const options = [correctAnswer];
    const correctValue = parseFloat(correctAnswer) || 0;

    if (template.type === 'spelling' || template.type === 'word_recognition' || template.type === 'grammar') {
      // For language problems, use predefined wrong options
      const wrongOptions = parameters.wrong_options || ['Option B', 'Option C', 'Option D'];
      options.push(...wrongOptions.slice(0, 3));
    } else {
      // For math problems, generate logical wrong answers
      if (correctValue > 0) {
        options.push(String(Math.floor(correctValue * 1.2)));
        options.push(String(Math.max(1, Math.floor(correctValue * 0.8))));
        options.push(String(correctValue + Math.floor(Math.random() * 10) + 5));
      } else {
        options.push('Option B', 'Option C', 'Option D');
      }
    }

    // Shuffle options but remember correct position
    const correctIndex = 0;
    const shuffledOptions = this.shuffleArray([...options]);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return shuffledOptions;
  }

  private generateSelectableWords(template: GradeTemplate, parameters: Record<string, any>): Array<{ word: string; isCorrect: boolean; index: number }> {
    const words = ['Plus', 'Minus', 'Mal', 'Geteilt'];
    
    return words.map((word, index) => ({
      word,
      isCorrect: word === 'Mal', // Default to multiplication for word selection
      index
    }));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createCombinationKey(template: GradeTemplate, parameters: Record<string, any>): string {
    const sortedParams = Object.keys(parameters)
      .sort()
      .map(key => `${key}:${parameters[key]}`)
      .join('|');
    return `${template.id}|${sortedParams}`;
  }

  private registerTemplateUsage(templateId: string): void {
    const currentCount = this.templateUsageCount.get(templateId) || 0;
    this.templateUsageCount.set(templateId, currentCount + 1);
  }

  private generateFallbackProblems(category: string, grade: number, count: number): SelectionQuestion[] {
    console.log(`⚠️ Generating fallback problems for ${category}, grade ${grade}`);
    const problems: SelectionQuestion[] = [];

    for (let i = 0; i < count; i++) {
      if (category === 'math') {
        problems.push(this.generateSimpleMathFallback(grade, i));
      } else if (category === 'german') {
        problems.push(this.generateSimpleGermanFallback(grade, i));
      } else {
        problems.push(this.generateGenericFallback(grade, i));
      }
    }

    return problems;
  }

  private generateSimpleMathFallback(grade: number, seed: number): SelectionQuestion {
    const maxNum = Math.min(100, 10 + (grade * 15));
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = Math.floor(Math.random() * (maxNum / 2)) + 1;
    const answer = a + b;

    return {
      id: Math.floor(Math.random() * 1000000) + seed,
      type: 'math',
      questionType: 'text-input',
      question: `${a} + ${b} = ?`,
      answer: answer.toString(),
      explanation: `Die Lösung ist ${answer}, weil ${a} + ${b} = ${answer}.`
    };
  }

  private generateSimpleGermanFallback(grade: number, seed: number): SelectionQuestion {
    const words = ['Hund', 'Katze', 'Haus', 'Auto'];
    const word = words[Math.floor(Math.random() * words.length)];

    return {
      id: Math.floor(Math.random() * 1000000) + seed,
      type: 'german',
      questionType: 'text-input',
      question: `Wie schreibt man "${word}" richtig?`,
      answer: word,
      explanation: `Das Wort "${word}" wird so geschrieben.`
    };
  }

  private generateGenericFallback(grade: number, seed: number): SelectionQuestion {
    return {
      id: Math.floor(Math.random() * 1000000) + seed,
      type: 'math',
      questionType: 'text-input',
      question: `Was ist 5 + 5?`,
      answer: '10',
      explanation: '5 + 5 = 10. Das ist eine einfache Addition.'
    };
  }
}