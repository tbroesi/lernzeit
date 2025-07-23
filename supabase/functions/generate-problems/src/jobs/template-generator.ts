import { GeminiService } from "../services/gemini.ts";
import { DatabaseService } from "../services/database.ts";
import { QualityControlService } from "../services/quality-control.ts";
import { DiversityEngine } from "./diversity-engine.ts";
import { generateCurriculumPrompt } from "../utils/curriculum.ts";
import { validateGeneratedProblems } from "../utils/validator.ts";
import { logger } from "../utils/logger.ts";
import { GENERATION_CONSTANTS } from "../config.ts";
import { PerformanceTimer, promptCache } from "../utils/performance.ts";
import type { ProblemRequest, SelectionQuestion, GeneratedTemplate } from "../types.ts";

export class TemplateGenerator {
  private geminiService: GeminiService;
  private databaseService: DatabaseService;
  private qualityControlService: QualityControlService;
  private diversityEngine: DiversityEngine;

  constructor(private requestId: string) {
    this.geminiService = new GeminiService();
    this.databaseService = new DatabaseService();
    this.qualityControlService = new QualityControlService();
    this.diversityEngine = new DiversityEngine();
  }

  async generateProblems(request: ProblemRequest): Promise<{ problems: SelectionQuestion[] }> {
    const timer = new PerformanceTimer();
    
    try {
      logger.requestStarted(this.requestId, request);
      timer.checkpoint('request_started');
      
      // Generate curriculum-aligned prompt with caching
      const excludeCount = request.excludeQuestions?.length || 0;
      let enhancedPrompt = promptCache.get(request.category, request.grade, excludeCount);
      
      if (!enhancedPrompt) {
        const curriculumPrompt = generateCurriculumPrompt(request.category, request.grade);
        enhancedPrompt = this.diversityEngine.enhancePromptForDiversity(
          curriculumPrompt, 
          request.excludeQuestions || []
        );
        promptCache.set(request.category, request.grade, excludeCount, enhancedPrompt);
      }
      
      timer.checkpoint('prompt_generated');

      // Generate problems using Gemini with retries
      const rawResponse = await this.geminiService.generateProblemsWithRetry(
        request,
        enhancedPrompt,
        this.requestId
      );

      // Validate and transform response
      const validatedProblems = validateGeneratedProblems(rawResponse);
      const transformedProblems = this.transformToSelectionQuestions(validatedProblems.problems, request);

      // Apply quality control and uniqueness filtering
      const qualityFilteredProblems = await this.applyQualityControl(
        transformedProblems,
        request
      );

      // Store successful templates in database (async, don't wait)
      this.storeGeneratedTemplatesAsync(qualityFilteredProblems, request);

      timer.checkpoint('completed');
      const performanceReport = timer.getReport();
      logger.requestCompleted(this.requestId, performanceReport.total, qualityFilteredProblems.length);
      
      // Log performance metrics for monitoring
      if (performanceReport.total > 10000) { // Log slow requests
        logger.warn('Slow request detected', {
          requestId: this.requestId,
          performance: performanceReport,
          category: request.category,
          grade: request.grade
        });
      }

      return { problems: qualityFilteredProblems };

    } catch (error) {
      const duration = timer.getDuration();
      logger.requestFailed(this.requestId, duration, error as Error);
      throw error;
    }
  }

  private transformToSelectionQuestions(rawProblems: any[], request: ProblemRequest): SelectionQuestion[] {
    return rawProblems.map((problem, index) => ({
      id: Math.floor(Math.random() * 1000000),
      question: problem.question,
      type: request.category.toLowerCase(),
      explanation: problem.explanation || `Solution for: ${problem.question}`,
      questionType: problem.questionType || 'text-input',
      ...(problem.questionType === 'multiple-choice' && {
        options: problem.options || [],
        correctAnswer: problem.correctAnswer || 0
      }),
      ...(problem.questionType === 'word-selection' && {
        sentence: problem.sentence || '',
        selectableWords: problem.selectableWords || []
      }),
      ...(problem.questionType === 'matching' && {
        items: problem.items?.map((item: any, itemIndex: number) => ({
          id: item.id || `item-${itemIndex}`,
          content: item.content || item.word,
          category: item.category
        })) || [],
        categories: problem.categories?.map((category: any, catIndex: number) => ({
          id: category.id || category.name || `category-${catIndex}`,
          name: category.name,
          acceptsItems: category.acceptsItems || []
        })) || []
      }),
      ...(problem.questionType === 'text-input' && {
        answer: problem.answer || problem.correctAnswer || ''
      })
    })) as SelectionQuestion[];
  }

  private async applyQualityControl(
    problems: SelectionQuestion[],
    request: ProblemRequest
  ): Promise<SelectionQuestion[]> {
    const filteredProblems: SelectionQuestion[] = [];

    for (const problem of problems) {
      // Quality evaluation
      const qualityMetrics = this.qualityControlService.evaluateQuestionQuality(
        problem,
        request.category,
        request.grade,
        this.requestId
      );

      // Uniqueness check
      const uniquenessResult = this.qualityControlService.checkUniqueness(
        problem.question,
        request.excludeQuestions || [],
        this.requestId
      );

      qualityMetrics.uniqueness_score = uniquenessResult.similarityScore;
      qualityMetrics.overall_score = (qualityMetrics.overall_score * 0.8) + (qualityMetrics.uniqueness_score * 0.2);

      // Apply quality thresholds
      if (qualityMetrics.overall_score >= GENERATION_CONSTANTS.MIN_QUALITY_SCORE && uniquenessResult.isUnique) {
        filteredProblems.push(problem);
        logger.templateGenerated(this.requestId, problem.id.toString(), qualityMetrics.overall_score);
      } else {
        logger.templateFiltered(
          this.requestId,
          `Quality: ${qualityMetrics.overall_score.toFixed(2)}, Unique: ${uniquenessResult.isUnique}`,
          problem.question
        );
      }
    }

    return filteredProblems;
  }

  private async storeGeneratedTemplatesAsync(
    problems: SelectionQuestion[],
    request: ProblemRequest
  ): Promise<void> {
    // Run asynchronously to not block response
    setTimeout(async () => {
      try {
        for (const problem of problems) {
          const template: Omit<GeneratedTemplate, 'id' | 'created_at' | 'updated_at'> = {
            content: problem.question,
            category: request.category,
            grade: request.grade,
            question_type: problem.questionType,
            quality_score: 0.8, // Will be properly calculated
            usage_count: 0,
            is_active: true,
            content_hash: await this.generateContentHash(problem.question)
          };

          await this.databaseService.storeTemplate(template, this.requestId);
        }
      } catch (error) {
        logger.warn('Failed to store some templates', {
          requestId: this.requestId,
          error: error.message
        });
      }
    }, 0);
  }

  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}