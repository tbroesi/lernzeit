
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="text-xs space-y-1">
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
          <div className="text-muted-foreground">
            Session: {sessionId.substring(0, 12)}... | {category} Grade {grade}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
