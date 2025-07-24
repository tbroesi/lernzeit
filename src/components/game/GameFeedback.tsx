
import React from 'react';
import { Check, X, Flag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameFeedbackProps {
  feedback: 'correct' | 'incorrect' | null;
  explanation?: string;
  onReportIssue?: () => void;
  onSkipFeedback?: () => void;
}

export function GameFeedback({ 
  feedback, 
  explanation,
  onReportIssue,
  onSkipFeedback
}: GameFeedbackProps) {
  if (!feedback) return null;

  return (
    <div className={`p-6 rounded-lg border-2 ${
      feedback === 'correct' 
        ? 'bg-green-50 text-green-800 border-green-200' 
        : 'bg-red-50 text-red-800 border-red-200'
    }`}>
      <div className="flex items-center justify-center gap-3 mb-3">
        {feedback === 'correct' ? (
          <Check className="w-8 h-8 text-green-600" />
        ) : (
          <X className="w-8 h-8 text-red-600" />
        )}
        <span className="font-bold text-lg">
          {feedback === 'correct' ? '🎉 Richtig!' : '❌ Falsch!'}
        </span>
      </div>
      
      {explanation && (
        <div className="mt-3 p-3 bg-white/50 rounded-md">
          <p className="text-sm font-medium mb-1">Erklärung:</p>
          <p className="text-sm">{explanation}</p>
        </div>
      )}

      <div className="flex gap-2 mt-4 justify-center">
        {onReportIssue && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReportIssue}
            className="flex items-center gap-1"
          >
            <Flag className="w-4 h-4" />
            Problem melden
          </Button>
        )}
        
        {onSkipFeedback && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSkipFeedback}
            className="flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4" />
            Weiter
          </Button>
        )}
      </div>
    </div>
  );
}
