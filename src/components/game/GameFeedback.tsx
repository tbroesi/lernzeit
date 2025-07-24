
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
    <div className={`text-center p-4 rounded-lg ${
      feedback === 'correct' 
        ? 'bg-green-50 text-green-800 border border-green-200' 
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        {feedback === 'correct' ? (
          <Check className="w-6 h-6 text-green-600" />
        ) : (
          <X className="w-6 h-6 text-red-600" />
        )}
        <span className="font-medium">
          {feedback === 'correct' ? 'Richtig!' : 'Falsch!'}
        </span>
      </div>
      
      {explanation && (
        <p className="text-sm">{explanation}</p>
      )}
    </div>
  );
}
