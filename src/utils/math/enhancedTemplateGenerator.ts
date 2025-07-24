/**
 * Phase 3: Enhanced Template-Based Question Generation
 * Improved randomization, difficulty scaling, and question diversity
 */

import { QuestionTemplate, GeneratedQuestion } from '../questionTemplates';
import { GermanMathParser } from './germanMathParser';
import { DuplicateDetectionEngine } from './duplicateDetection';
import { SelectionQuestion } from '@/types/questionTypes';

export interface GenerationConfig {
  maxAttempts: number;
  diversityMode: boolean;
  difficultyBalance: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypeBalance: boolean;
  topicRotation: boolean;
}

export interface GenerationResult {
  questions: SelectionQuestion[];
  success: boolean;
  generationTime: number;
  sourceStats: {
    templatesUsed: number;
    duplicatesRejected: number;
    fallbacksUsed: number;
  };
  qualityMetrics: {
    averageComplexity: number;
    topicDiversity: number;
    typeDiversity: number;
  };
}

export class EnhancedTemplateGenerator {
  private static readonly DEFAULT_CONFIG: GenerationConfig = {
    maxAttempts: 50,
    diversityMode: true,
    difficultyBalance: 'mixed',
    questionTypeBalance: true,
    topicRotation: true
  };
  
  /**
   * Generate enhanced questions with improved algorithms
   */
  static async generateQuestions(
    templates: QuestionTemplate[],
    category: string,
    grade: number,
    userId: string,
    count: number = 5,
    config: Partial<GenerationConfig> = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    console.log('🚀 Enhanced Template Generation started:', {
      templates: templates.length,
      category,
      grade,
      count,
      config: finalConfig
    });
    
    // Initialize session for duplicate detection
    const sessionId = DuplicateDetectionEngine.initSession(userId, category, grade);
    
    const result: GenerationResult = {
      questions: [],
      success: false,
      generationTime: 0,
      sourceStats: {
        templatesUsed: 0,
        duplicatesRejected: 0,
        fallbacksUsed: 0
      },
      qualityMetrics: {
        averageComplexity: 0,
        topicDiversity: 0,
        typeDiversity: 0
      }
    };
    
    if (templates.length === 0) {
      console.warn('⚠️ No templates available for generation');
      result.generationTime = Date.now() - startTime;
      return result;
    }
    
    // Filter templates by difficulty if specified
    const filteredTemplates = this.filterTemplatesByDifficulty(templates, finalConfig.difficultyBalance, grade);
    console.log(`🎯 Filtered to ${filteredTemplates.length} templates by difficulty`);
    
    // Generate questions with enhanced algorithms
    const questions = await this.generateWithEnhancedAlgorithms(
      filteredTemplates,
      sessionId,
      count,
      finalConfig,
      result.sourceStats
    );
    
    result.questions = questions;
    result.success = questions.length >= Math.min(count, 3); // Success if at least 3 questions or target count
    result.generationTime = Date.now() - startTime;
    result.qualityMetrics = this.calculateQualityMetrics(questions);
    
    console.log('✅ Enhanced generation complete:', {
      generated: questions.length,
      target: count,
      success: result.success,
      time: result.generationTime + 'ms',
      stats: result.sourceStats,
      metrics: result.qualityMetrics
    });
    
    return result;
  }
  
  /**
   * Core generation algorithm with enhanced features
   */
  private static async generateWithEnhancedAlgorithms(
    templates: QuestionTemplate[],
    sessionId: string,
    count: number,
    config: GenerationConfig,
    stats: any
  ): Promise<SelectionQuestion[]> {
    const questions: SelectionQuestion[] = [];
    const usedTemplates = new Set<string>();
    const topicTracker = new Map<string, number>();
    const typeTracker = new Map<string, number>();
    
    let attempts = 0;
    
    while (questions.length < count && attempts < config.maxAttempts) {
      attempts++;
      
      // Select template with advanced strategies
      const template = this.selectTemplateIntelligently(
        templates,
        usedTemplates,
        topicTracker,
        typeTracker,
        config
      );
      
      if (!template) {
        console.warn(`⚠️ No suitable template found at attempt ${attempts}`);
        break;
      }
      
      // Generate question with enhanced parameter generation
      const generatedQuestion = await this.generateQuestionFromTemplate(
        template,
        sessionId,
        stats
      );
      
      if (!generatedQuestion) {
        continue;
      }
      
      // Check for duplicates with advanced detection
      const duplicateCheck = DuplicateDetectionEngine.checkDuplicate(
        sessionId,
        generatedQuestion,
        questions
      );
      
      if (duplicateCheck.isDuplicate) {
        stats.duplicatesRejected++;
        console.log(`🚫 Rejected duplicate: ${duplicateCheck.reason}`);
        continue;
      }
      
      // Quality validation
      if (!this.validateQuestionQuality(generatedQuestion, template)) {
        continue;
      }
      
      // Add to results
      questions.push(generatedQuestion);
      usedTemplates.add(template.id);
      stats.templatesUsed++;
      
      // Update tracking
      this.updateTrackingMaps(template, topicTracker, typeTracker);
      DuplicateDetectionEngine.registerQuestion(sessionId, generatedQuestion);
      
      console.log(`✅ Generated question ${questions.length}/${count}: ${generatedQuestion.question.substring(0, 50)}...`);
    }
    
    return questions;
  }
  
  /**
   * Intelligent template selection with multiple strategies
   */
  private static selectTemplateIntelligently(
    templates: QuestionTemplate[],
    usedTemplates: Set<string>,
    topicTracker: Map<string, number>,
    typeTracker: Map<string, number>,
    config: GenerationConfig
  ): QuestionTemplate | null {
    // Strategy 1: Filter out used templates if enough remain
    let availableTemplates = templates.filter(t => !usedTemplates.has(t.id));
    
    if (availableTemplates.length === 0) {
      // Reset if we've used all templates
      availableTemplates = templates;
    }
    
    // Strategy 2: Balance topic distribution if enabled
    if (config.topicRotation && topicTracker.size > 0) {
      availableTemplates = this.filterByTopicBalance(availableTemplates, topicTracker);
    }
    
    // Strategy 3: Balance question types if enabled
    if (config.questionTypeBalance && typeTracker.size > 0) {
      availableTemplates = this.filterByTypeBalance(availableTemplates, typeTracker);
    }
    
    // Strategy 4: Apply difficulty weighting
    const weightedTemplates = this.applyDifficultyWeighting(availableTemplates, config.difficultyBalance);
    
    // Strategy 5: Random selection from weighted pool
    return this.selectRandomWeighted(weightedTemplates);
  }
  
  /**
   * Generate question from template with enhanced parameter generation
   */
  private static async generateQuestionFromTemplate(
    template: QuestionTemplate,
    sessionId: string,
    stats: any
  ): Promise<SelectionQuestion | null> {
    try {
      // Enhanced parameter generation
      const parameters = this.generateEnhancedParameters(template);
      
      // Generate question text
      let questionText = template.template;
      for (const [key, value] of Object.entries(parameters)) {
        questionText = questionText.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      }
      
      // Calculate answer using enhanced math parser
      let answer: string | number = '';
      let explanation = template.explanation || '';
      
      if (template.category === 'Mathematik' || template.category === 'math') {
        const mathResult = GermanMathParser.parse(questionText);
        if (mathResult.success && mathResult.answer !== undefined) {
          answer = mathResult.answer;
          if (mathResult.steps && mathResult.steps.length > 0) {
            explanation += ' Rechenweg: ' + mathResult.steps.join(', ');
          }
        } else {
          // Fallback to basic calculation
          answer = this.calculateBasicAnswer(template, parameters);
        }
      } else {
        // Handle German/language questions
        answer = this.calculateLanguageAnswer(template, parameters);
      }
      
      if (!answer && answer !== 0) {
        console.warn(`⚠️ Could not calculate answer for template ${template.id}`);
        return null;
      }
      
      // Create SelectionQuestion object based on type
      if (template.type === 'multiple-choice') {
        const options = this.generateMultipleChoiceOptions(answer, template);
        const question: SelectionQuestion = {
          id: Math.floor(Math.random() * 1000000),
          question: questionText,
          questionType: 'multiple-choice',
          explanation,
          type: template.category === 'Mathematik' ? 'math' : 'german',
          options: options.options,
          correctAnswer: options.correctIndex
        };
        return question;
      } else {
        const question: SelectionQuestion = {
          id: Math.floor(Math.random() * 1000000),
          question: questionText,
          questionType: 'text-input',
          explanation,
          type: template.category === 'Mathematik' ? 'math' : 'german',
          answer: answer
        };
        return question;
      }
      
    } catch (error) {
      console.error(`❌ Error generating question from template ${template.id}:`, error);
      return null;
    }
  }
  
  /**
   * Enhanced parameter generation with better randomization
   */
  private static generateEnhancedParameters(template: QuestionTemplate): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    for (const param of template.parameters) {
      let value: any;
      
      if (param.type === 'number') {
        if (param.range) {
          const [min, max] = param.range;
          
          // Enhanced random distribution
          if (template.difficulty === 'easy') {
            // Favor smaller numbers for easy questions
            value = Math.floor(Math.random() * (max - min + 1)) + min;
            value = Math.min(value, min + Math.floor((max - min) * 0.7));
          } else if (template.difficulty === 'hard') {
            // Favor larger numbers for hard questions
            value = Math.floor(Math.random() * (max - min + 1)) + min;
            value = Math.max(value, min + Math.floor((max - min) * 0.3));
          } else {
            // Even distribution for medium questions
            value = Math.floor(Math.random() * (max - min + 1)) + min;
          }
        } else {
          value = Math.floor(Math.random() * 20) + 1;
        }
        
        // Apply constraints if present
        if (param.constraints) {
          let attempts = 0;
          while (!param.constraints(value, parameters) && attempts < 20) {
            value = Math.floor(Math.random() * (param.range![1] - param.range![0] + 1)) + param.range![0];
            attempts++;
          }
        }
      } else if (param.type === 'word') {
        if (param.values && param.values.length > 0) {
          value = param.values[Math.floor(Math.random() * param.values.length)];
        } else {
          value = this.generateRandomWord(template.category);
        }
      }
      
      parameters[param.name] = value;
    }
    
    return parameters;
  }
  
  /**
   * Calculate basic math answers for fallback
   */
  private static calculateBasicAnswer(template: QuestionTemplate, params: Record<string, any>): string | number {
    if (template.id.includes('addition')) {
      return (params.a || 0) + (params.b || 0);
    } else if (template.id.includes('subtraction')) {
      return (params.a || 0) - (params.b || 0);
    } else if (template.id.includes('multiplication')) {
      return (params.a || 0) * (params.b || 1);
    } else if (template.id.includes('division')) {
      const divisor = params.b || params.divisor || 1;
      return divisor !== 0 ? Math.floor((params.a || params.dividend || 0) / divisor) : 0;
    } else if (template.id.includes('area_rectangle')) {
      return (params.length || 0) * (params.width || 0);
    } else if (template.id.includes('perimeter_rectangle')) {
      return 2 * ((params.length || 0) + (params.width || 0));
    }
    
    return '';
  }
  
  /**
   * Calculate language/German answers
   */
  private static calculateLanguageAnswer(template: QuestionTemplate, params: Record<string, any>): string {
    if (template.id.includes('syllables')) {
      const word = params.word || params.animal || '';
      return this.countSyllables(word).toString();
    } else if (template.id.includes('plural')) {
      return this.getGermanPlural(params.singular || '');
    } else if (template.id.includes('uppercase')) {
      return (params.letter || '').toUpperCase();
    }
    
    return params.answer || '';
  }
  
  /**
   * Filter templates by difficulty
   */
  private static filterTemplatesByDifficulty(
    templates: QuestionTemplate[],
    difficultyBalance: string,
    grade: number
  ): QuestionTemplate[] {
    if (difficultyBalance === 'mixed') {
      return templates;
    }
    
    const filtered = templates.filter(t => t.difficulty === difficultyBalance);
    
    // If no templates match the exact difficulty, fall back to grade-appropriate templates
    if (filtered.length === 0) {
      return templates.filter(t => t.grade <= grade + 1 && t.grade >= grade - 1);
    }
    
    return filtered;
  }
  
  /**
   * Helper methods for advanced selection
   */
  private static filterByTopicBalance(
    templates: QuestionTemplate[],
    topicTracker: Map<string, number>
  ): QuestionTemplate[] {
    const minUsage = Math.min(...topicTracker.values());
    
    return templates.filter(template => {
      const topics = template.topics || ['general'];
      return topics.some(topic => (topicTracker.get(topic) || 0) <= minUsage);
    });
  }
  
  private static filterByTypeBalance(
    templates: QuestionTemplate[],
    typeTracker: Map<string, number>
  ): QuestionTemplate[] {
    const minUsage = Math.min(...typeTracker.values());
    
    return templates.filter(template => 
      (typeTracker.get(template.type) || 0) <= minUsage
    );
  }
  
  private static applyDifficultyWeighting(
    templates: QuestionTemplate[],
    difficultyBalance: string
  ): Array<{ template: QuestionTemplate; weight: number }> {
    return templates.map(template => {
      let weight = 1;
      
      if (difficultyBalance === 'easy' && template.difficulty === 'easy') weight = 3;
      else if (difficultyBalance === 'medium' && template.difficulty === 'medium') weight = 3;
      else if (difficultyBalance === 'hard' && template.difficulty === 'hard') weight = 3;
      else if (difficultyBalance === 'mixed') weight = 1;
      
      return { template, weight };
    });
  }
  
  private static selectRandomWeighted(
    weightedTemplates: Array<{ template: QuestionTemplate; weight: number }>
  ): QuestionTemplate | null {
    if (weightedTemplates.length === 0) return null;
    
    const totalWeight = weightedTemplates.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of weightedTemplates) {
      random -= item.weight;
      if (random <= 0) {
        return item.template;
      }
    }
    
    return weightedTemplates[0].template;
  }
  
  private static updateTrackingMaps(
    template: QuestionTemplate,
    topicTracker: Map<string, number>,
    typeTracker: Map<string, number>
  ): void {
    // Update topic tracking
    const topics = template.topics || ['general'];
    topics.forEach(topic => {
      topicTracker.set(topic, (topicTracker.get(topic) || 0) + 1);
    });
    
    // Update type tracking
    typeTracker.set(template.type, (typeTracker.get(template.type) || 0) + 1);
  }
  
  private static validateQuestionQuality(question: SelectionQuestion, template: QuestionTemplate): boolean {
    // Check question length
    if (question.question.length < 10 || question.question.length > 300) {
      return false;
    }
    
    // Check for placeholder artifacts
    if (question.question.includes('{') || question.question.includes('}')) {
      return false;
    }
    
    // Check answer validity
    if (question.questionType === 'text-input') {
      const answer = (question as any).answer;
      if (!answer && answer !== 0) {
        return false;
      }
    }
    
    return true;
  }
  
  private static generateMultipleChoiceOptions(
    correctAnswer: string | number,
    template: QuestionTemplate
  ): { options: string[]; correctIndex: number } {
    const options: string[] = [String(correctAnswer)];
    const isNumeric = typeof correctAnswer === 'number' || !isNaN(Number(correctAnswer));
    
    if (isNumeric) {
      const num = Number(correctAnswer);
      // Generate plausible wrong answers
      const variations = [
        num + 1, num - 1, num + 2, num - 2,
        Math.floor(num * 1.5), Math.floor(num * 0.8),
        num + 10, num - 5
      ].filter(n => n !== num && n > 0);
      
      // Add 3 random variations
      for (let i = 0; i < 3 && variations.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * variations.length);
        options.push(variations[randomIndex].toString());
        variations.splice(randomIndex, 1);
      }
    } else {
      // For non-numeric answers, add some generic wrong options
      options.push('Falsch', 'Unbekannt', 'Andere');
    }
    
    // Shuffle options
    const correctIndex = Math.floor(Math.random() * options.length);
    const shuffled = [...options];
    shuffled[0] = options[correctIndex];
    shuffled[correctIndex] = options[0];
    
    return { options: shuffled, correctIndex: 0 };
  }
  
  private static calculateQualityMetrics(questions: SelectionQuestion[]): any {
    const topics = new Set<string>();
    const types = new Set<string>();
    
    questions.forEach(q => {
      types.add(q.questionType);
      // Extract topics from question content (simplified)
      if (q.question.includes('+') || q.question.includes('addier')) topics.add('addition');
      if (q.question.includes('-') || q.question.includes('subtrah')) topics.add('subtraction');
      if (q.question.includes('×') || q.question.includes('mal')) topics.add('multiplication');
      if (q.question.includes('÷') || q.question.includes('teil')) topics.add('division');
    });
    
    return {
      averageComplexity: questions.reduce((sum, q) => sum + q.question.length, 0) / questions.length,
      topicDiversity: topics.size / Math.max(questions.length, 1),
      typeDiversity: types.size / Math.max(questions.length, 1)
    };
  }
  
  private static countSyllables(word: string): number {
    const vowels = 'aeiouäöü';
    let count = 0;
    let previousWasVowel = false;
    
    for (const char of word.toLowerCase()) {
      const isVowel = vowels.includes(char);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    return Math.max(1, count);
  }
  
  private static getGermanPlural(word: string): string {
    const pluralMap: Record<string, string> = {
      'Hund': 'Hunde', 'Katze': 'Katzen', 'Buch': 'Bücher',
      'Auto': 'Autos', 'Haus': 'Häuser', 'Kind': 'Kinder'
    };
    return pluralMap[word] || word + 'e';
  }
  
  private static generateRandomWord(category: string): string {
    const words = {
      'Mathematik': ['Zahl', 'Rechnung', 'Summe', 'Ergebnis'],
      'Deutsch': ['Wort', 'Satz', 'Buchstabe', 'Silbe']
    };
    
    const wordList = words[category as keyof typeof words] || ['Wort'];
    return wordList[Math.floor(Math.random() * wordList.length)];
  }
}