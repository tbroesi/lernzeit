
import React from 'react';
import { Check, X } from 'lucide-react';

interface GameFeedbackProps {
  feedback: 'correct' | 'incorrect' | null;
  explanation?: string;
}

export function GameFeedback({ 
  feedback, 
  explanation 
}: GameFeedbackProps) {
  if (!feedback) return null;

  return (
    <div className={`text-center p-6 rounded-lg border-2 ${
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
    </div>
  );
}
