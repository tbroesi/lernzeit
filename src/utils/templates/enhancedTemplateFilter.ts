// Enhanced template filtering system to prevent problematic questions
import { SelectionQuestion } from '@/types/questionTypes';

interface TemplateQualityCheck {
  isValid: boolean;
  score: number;
  issues: string[];
  category: 'high' | 'medium' | 'low' | 'invalid';
}

export class EnhancedTemplateFilter {
  private static readonly PROBLEMATIC_PATTERNS = [
    /23\s*\+\s*17/i,           // Specific problematic question
    /undefined/i,              // Contains undefined
    /null/i,                   // Contains null
    /NaN/i,                    // Contains NaN
    /^\s*$/, // Empty or whitespace only
    /\[object\s*object\]/i,    // Serialization error
    /error/i,                  // Contains error text
    /failed/i                  // Contains failed text
  ];

  private static readonly QUALITY_INDICATORS = {
    good: [
      /Quadrat.*Seitenlänge.*\d+/i,     // Well-formed geometry
      /Rechteck.*Länge.*\d+.*Breite.*\d+/i, // Well-formed rectangle
      /Was ist \d+ [+\-×÷] \d+/i,       // Well-formed arithmetic
      /Fläche.*=.*cm²/i,                // Proper unit notation
      /Umfang.*=.*cm/i                  // Proper unit notation
    ],
    questionMarkers: [
      /Was ist/i,
      /Wie viel/i,
      /Berechne/i,
      /\?/                              // Has question mark
    ],
    hasExplanation: [
      /=.*\d+/,                         // Contains calculation
      /Fläche\s*=/i,                    // Formula explanation
      /Umfang\s*=/i                     // Formula explanation
    ]
  };

  static filterTemplates(templates: any[], maxCount: number): any[] {
    console.log(`🔍 Filtering ${templates.length} templates, need ${maxCount}`);
    
    // Score and filter templates
    const scoredTemplates = templates
      .map(template => ({
        ...template,
        qualityCheck: this.assessTemplateQuality(template)
      }))
      .filter(template => template.qualityCheck.isValid)
      .sort((a, b) => {
        // Sort by category first, then by score
        const categoryOrder = { high: 3, medium: 2, low: 1, invalid: 0 };
        const aCatScore = categoryOrder[a.qualityCheck.category];
        const bCatScore = categoryOrder[b.qualityCheck.category];
        
        if (aCatScore !== bCatScore) {
          return bCatScore - aCatScore;
        }
        
        return b.qualityCheck.score - a.qualityCheck.score;
      });

    console.log(`✅ Filtered to ${scoredTemplates.length} valid templates`);
    
    // Log quality distribution
    const distribution = scoredTemplates.reduce((acc, t) => {
      acc[t.qualityCheck.category] = (acc[t.qualityCheck.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Quality distribution:', distribution);
    
    return scoredTemplates.slice(0, maxCount);
  }

  static assessTemplateQuality(template: any): TemplateQualityCheck {
    const content = template.content || '';
    let score = 0;
    const issues: string[] = [];

    // Check for problematic patterns
    for (const pattern of this.PROBLEMATIC_PATTERNS) {
      if (pattern.test(content)) {
        issues.push(`Contains problematic pattern: ${pattern}`);
        return {
          isValid: false,
          score: 0,
          issues,
          category: 'invalid'
        };
      }
    }

    // Basic validity checks
    if (content.length < 10) {
      issues.push('Content too short');
      return { isValid: false, score: 0, issues, category: 'invalid' };
    }

    // Score based on quality indicators
    let goodPatternCount = 0;
    for (const pattern of this.QUALITY_INDICATORS.good) {
      if (pattern.test(content)) {
        score += 20;
        goodPatternCount++;
      }
    }

    // Check for question markers
    let hasQuestionMarker = false;
    for (const pattern of this.QUALITY_INDICATORS.questionMarkers) {
      if (pattern.test(content)) {
        score += 10;
        hasQuestionMarker = true;
        break;
      }
    }

    if (!hasQuestionMarker) {
      issues.push('No clear question marker found');
      score -= 15;
    }

    // Check for explanation patterns
    let hasExplanation = false;
    for (const pattern of this.QUALITY_INDICATORS.hasExplanation) {
      if (pattern.test(content)) {
        score += 15;
        hasExplanation = true;
        break;
      }
    }

    // Additional scoring factors
    if (template.quality_score) {
      score += template.quality_score * 10;
    }

    if (template.usage_count > 10) {
      score -= 5; // Penalize overused templates
    }

    // Determine category based on score
    let category: 'high' | 'medium' | 'low' | 'invalid';
    if (score >= 50) {
      category = 'high';
    } else if (score >= 30) {
      category = 'medium';
    } else if (score >= 15) {
      category = 'low';
    } else {
      category = 'invalid';
    }

    return {
      isValid: score >= 15,
      score,
      issues,
      category
    };
  }

  static validateParsedQuestion(question: SelectionQuestion): boolean {
    // Additional validation for parsed questions
    if (!question.question || question.question.trim().length < 5) {
      console.warn('🚫 Invalid question: too short');
      return false;
    }

    const hasAnswer = (question as any).correctAnswer || (question as any).answer;
    if (!hasAnswer) {
      console.warn('🚫 Invalid question: no answer provided');
      return false;
    }

    // Check for specific invalid patterns in parsed content
    const questionText = question.question.toLowerCase();
    if (questionText.includes('undefined') || 
        questionText.includes('null') || 
        questionText.includes('[object object]')) {
      console.warn('🚫 Invalid question: contains error text');
      return false;
    }

    return true;
  }

  static logFilteringStats(originalCount: number, filteredCount: number, finalCount: number): void {
    console.log(`📊 FILTERING STATS:
    📥 Original templates: ${originalCount}
    ✅ Passed quality filter: ${filteredCount}
    🎯 Final selection: ${finalCount}
    📉 Filtered out: ${originalCount - filteredCount} (${((originalCount - filteredCount) / originalCount * 100).toFixed(1)}%)
    `);
  }
}