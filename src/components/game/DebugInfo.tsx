
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { templateManager } from '@/utils/templateManager';
import { getTemplatesForCategory } from '@/utils/questionTemplates';

interface DebugInfoProps {
  currentProblem: number;
  totalQuestions: number;
  globalQuestionsCount: number;
  sessionId: string;
  category: string;
  grade: number;
  problemsLength: number;
  currentQuestionType?: string;
  generationSource?: 'template' | 'ai' | 'fallback' | null;
}

export function DebugInfo({ 
  currentProblem, 
  totalQuestions, 
  globalQuestionsCount,
  sessionId,
  category,
  grade,
  problemsLength,
  currentQuestionType,
  generationSource
}: DebugInfoProps) {
  const [showExtended, setShowExtended] = useState(false);

  const availableTemplates = getTemplatesForCategory(category, grade);
  const templateSummary = templateManager.exportSummary();

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Debug Information</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowExtended(!showExtended)}
            className="text-xs"
          >
            {showExtended ? 'Less' : 'More'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="text-xs space-y-2">
          {/* Basic Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Q: {currentProblem + 1}/{totalQuestions}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Problems: {problemsLength}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Used: {globalQuestionsCount}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Type: {currentQuestionType || 'Unknown'}
            </Badge>
            {generationSource && (
              <Badge 
                variant={generationSource === 'template' ? 'default' : generationSource === 'ai' ? 'secondary' : 'outline'} 
                className={`text-xs ${
                  generationSource === 'template' 
                    ? 'bg-blue-100 text-blue-800 border-blue-300' 
                    : generationSource === 'ai'
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-orange-100 text-orange-800 border-orange-300'
                }`}
              >
                {generationSource === 'template' ? '📋 Template' : generationSource === 'ai' ? '🤖 AI' : '⚡ Fallback'}
              </Badge>
            )}
          </div>

          {/* Template Coverage */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Templates: {availableTemplates.length}
            </Badge>
            <Badge 
              variant={availableTemplates.length >= 5 ? 'default' : availableTemplates.length >= 3 ? 'secondary' : 'destructive'} 
              className="text-xs"
            >
              Coverage: {availableTemplates.length >= 5 ? 'Good' : availableTemplates.length >= 3 ? 'Fair' : 'Low'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Health: {templateSummary.validation.isHealthy ? '✅ Good' : '⚠️ Issues'}
            </Badge>
          </div>

          {/* Session Info */}
          <div className="text-muted-foreground">
            Session: {sessionId.substring(0, 12)}... | {category} Grade {grade}
          </div>

          {/* Extended Info */}
          {showExtended && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold mb-1">Template Distribution:</div>
                  <div>Easy: {availableTemplates.filter(t => t.difficulty === 'easy').length}</div>
                  <div>Medium: {availableTemplates.filter(t => t.difficulty === 'medium').length}</div>
                  <div>Hard: {availableTemplates.filter(t => t.difficulty === 'hard').length}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Question Types:</div>
                  <div>Text: {availableTemplates.filter(t => t.type === 'text-input').length}</div>
                  <div>Choice: {availableTemplates.filter(t => t.type === 'multiple-choice').length}</div>
                  <div>Selection: {availableTemplates.filter(t => t.type === 'word-selection').length}</div>
                  <div>Matching: {availableTemplates.filter(t => t.type === 'matching').length}</div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-muted/50 p-2 rounded text-xs">
                <div className="font-semibold mb-1">System Status:</div>
                <div>📊 Total Templates: {templateSummary.summary.totalTemplates}</div>
                <div>🎯 Coverage Gaps: {templateSummary.summary.coverageGaps}</div>
                <div>⚡ Generation: {generationSource === 'template' ? 'Template-first (optimal)' : generationSource === 'ai' ? 'AI fallback' : 'Simple fallback'}</div>
              </div>

              {/* Quick Recommendations */}
              {templateSummary.recommendations.length > 0 && (
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <div className="font-semibold mb-1">Recommendations:</div>
                  {templateSummary.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="text-blue-700">• {rec}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
