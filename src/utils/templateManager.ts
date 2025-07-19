
import { 
  questionTemplates, 
  QuestionTemplate, 
  getTemplatesForCategory,
  getTemplatesByDifficulty,
  validateTemplate,
  getTemplateStats
} from './questionTemplates';

export interface TemplateAnalysis {
  isValid: boolean;
  issues: string[];
  coverage: {
    categories: string[];
    grades: number[];
    difficulties: string[];
    types: string[];
  };
  recommendations: string[];
}

export interface CoverageGap {
  category: string;
  grade: number;
  missingDifficulties: string[];
  missingTypes: string[];
  templateCount: number;
}

export class TemplateManager {
  
  /**
   * Analyze template coverage and identify gaps
   */
  static analyzeCoverage(): CoverageGap[] {
    const gaps: CoverageGap[] = [];
    const categories = ['Mathematik', 'Deutsch', 'Englisch', 'Geographie', 'Geschichte', 'Naturwissenschaften', 'Latein'];
    const grades = [1, 2, 3, 4];
    const expectedDifficulties = ['easy', 'medium', 'hard'];
    const expectedTypes = ['text-input', 'multiple-choice', 'word-selection', 'matching'];

    categories.forEach(category => {
      grades.forEach(grade => {
        const templates = getTemplatesForCategory(category, grade);
        
        if (templates.length === 0) {
          gaps.push({
            category,
            grade,
            missingDifficulties: expectedDifficulties,
            missingTypes: expectedTypes,
            templateCount: 0
          });
          return;
        }

        const existingDifficulties = new Set(templates.map(t => t.difficulty));
        const existingTypes = new Set(templates.map(t => t.type));
        
        const missingDifficulties = expectedDifficulties.filter(d => !existingDifficulties.has(d as any));
        const missingTypes = expectedTypes.filter(t => !existingTypes.has(t as any));

        if (missingDifficulties.length > 0 || missingTypes.length > 0 || templates.length < 3) {
          gaps.push({
            category,
            grade,
            missingDifficulties,
            missingTypes,
            templateCount: templates.length
          });
        }
      });
    });

    return gaps;
  }

  /**
   * Validate all templates and return analysis
   */
  static validateAllTemplates(): TemplateAnalysis {
    const issues: string[] = [];
    const categories = new Set<string>();
    const grades = new Set<number>();
    const difficulties = new Set<string>();
    const types = new Set<string>();
    let validCount = 0;

    questionTemplates.forEach((template, index) => {
      const isValid = validateTemplate(template);
      
      if (isValid) {
        validCount++;
        categories.add(template.category);
        grades.add(template.grade);
        difficulties.add(template.difficulty);
        types.add(template.type);
      } else {
        issues.push(`Template ${index} (${template.id}) is invalid`);
      }

      // Additional validation checks
      if (!template.explanation) {
        issues.push(`Template ${template.id} lacks explanation`);
      }

      if (template.topics.length === 0) {
        issues.push(`Template ${template.id} has no topics defined`);
      }

      // Check for duplicate IDs
      const duplicates = questionTemplates.filter(t => t.id === template.id);
      if (duplicates.length > 1) {
        issues.push(`Duplicate template ID: ${template.id}`);
      }
    });

    const recommendations: string[] = [];
    
    // Coverage recommendations
    const gaps = this.analyzeCoverage();
    if (gaps.length > 0) {
      recommendations.push(`Found ${gaps.length} coverage gaps that need attention`);
    }

    // Balance recommendations
    const stats = getTemplateStats();
    const avgTemplatesPerCategory = stats.total / Object.keys(stats.byCategory).length;
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      if (count < avgTemplatesPerCategory * 0.5) {
        recommendations.push(`Category "${category}" needs more templates (currently ${count})`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
      coverage: {
        categories: Array.from(categories),
        grades: Array.from(grades).sort((a, b) => a - b),
        difficulties: Array.from(difficulties),
        types: Array.from(types)
      },
      recommendations
    };
  }

  /**
   * Get template distribution statistics
   */
  static getDistributionStats() {
    const stats = getTemplateStats();
    
    return {
      ...stats,
      averagePerCategory: Math.round(stats.total / Object.keys(stats.byCategory).length),
      averagePerGrade: Math.round(stats.total / Object.keys(stats.byGrade).length),
      mostPopularCategory: Object.entries(stats.byCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0],
      leastPopularCategory: Object.entries(stats.byCategory).reduce((a, b) => a[1] < b[1] ? a : b)[0]
    };
  }

  /**
   * Generate recommendations for template improvements
   */
  static generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const gaps = this.analyzeCoverage();
    const stats = this.getDistributionStats();

    // Coverage recommendations
    gaps.forEach(gap => {
      if (gap.templateCount === 0) {
        recommendations.push(`🚨 URGENT: No templates for ${gap.category} Grade ${gap.grade}`);
      } else if (gap.templateCount < 3) {
        recommendations.push(`⚠️ LOW: Only ${gap.templateCount} templates for ${gap.category} Grade ${gap.grade}`);
      }

      if (gap.missingDifficulties.length > 0) {
        recommendations.push(`📈 Add ${gap.missingDifficulties.join(', ')} difficulty templates for ${gap.category} Grade ${gap.grade}`);
      }

      if (gap.missingTypes.length > 0) {
        recommendations.push(`🎯 Add ${gap.missingTypes.join(', ')} question types for ${gap.category} Grade ${gap.grade}`);
      }
    });

    // Balance recommendations
    if (stats.averagePerCategory < 5) {
      recommendations.push(`📊 Consider increasing template density (current average: ${stats.averagePerCategory} per category)`);
    }

    // Variety recommendations
    Object.entries(stats.byType).forEach(([type, count]) => {
      if (count < stats.total * 0.15) {
        recommendations.push(`🎨 Consider adding more "${type}" question types (currently ${count}/${stats.total})`);
      }
    });

    return recommendations;
  }

  /**
   * Export template summary for documentation
   */
  static exportSummary() {
    const analysis = this.validateAllTemplates();
    const distribution = this.getDistributionStats();
    const gaps = this.analyzeCoverage();
    const recommendations = this.generateRecommendations();

    return {
      summary: {
        totalTemplates: questionTemplates.length,
        validTemplates: questionTemplates.filter(validateTemplate).length,
        categories: analysis.coverage.categories.length,
        grades: analysis.coverage.grades,
        coverageGaps: gaps.length,
        priorityIssues: analysis.issues.length
      },
      distribution,
      gaps: gaps.filter(g => g.templateCount < 3), // Focus on significant gaps
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      validation: {
        isHealthy: analysis.isValid && gaps.length < 5,
        issues: analysis.issues.slice(0, 5), // Top 5 issues
        strengths: [
          `${analysis.coverage.categories.length} subjects covered`,
          `${analysis.coverage.types.length} question types available`,
          `${analysis.coverage.difficulties.length} difficulty levels`
        ]
      }
    };
  }
}

// Export for easy access
export const templateManager = TemplateManager;
