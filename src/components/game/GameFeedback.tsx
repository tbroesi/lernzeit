
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight } from 'lucide-react';
import { SelectionQuestion } from '@/types/questionTypes';

interface GameFeedbackProps {
  feedback: 'correct' | 'incorrect' | null;
  currentQuestion: SelectionQuestion;
  currentProblem: number;
  totalQuestions: number;
  onNext: () => void;
}

export function GameFeedback({ 
  feedback, 
  currentQuestion, 
  currentProblem, 
  totalQuestions, 
  onNext 
}: GameFeedbackProps) {
  if (!feedback) return null;

  const getCorrectAnswer = (question: SelectionQuestion) => {
    switch (question.questionType) {
      case 'multiple-choice':
        return question.options[question.correctAnswer];
      case 'word-selection':
        const correctWords = question.selectableWords
          .filter(word => word.isCorrect)
          .map(word => word.word);
        return correctWords.join(', ');
      case 'text-input':
        return (question as any).answer?.toString();
      case 'matching':
        return 'Siehe die richtige Zuordnung oben';
      default:
        return 'Antwort nicht verfügbar';
    }
  };

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
      
      {currentQuestion.explanation && (
        <p className="text-sm mb-4">{currentQuestion.explanation}</p>
      )}
      
      {feedback === 'incorrect' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Richtige Antwort:</p>
          <div className="text-sm text-blue-700">
            {getCorrectAnswer(currentQuestion)}
          </div>
        </div>
      )}
      
      <Button 
        onClick={onNext}
        className="w-full max-w-sm"
        variant="default"
      >
        {currentProblem + 1 >= totalQuestions ? 'Fertig' : 'Weiter'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
