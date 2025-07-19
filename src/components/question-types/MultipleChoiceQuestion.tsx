
import React from 'react';
import { Button } from '@/components/ui/button';
import { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/types/questionTypes';

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestionType;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  disabled?: boolean;
}

export function MultipleChoiceQuestion({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  disabled = false 
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-xl font-medium mb-6 text-center">
        {question.question}
      </p>
      
      <div className="grid gap-3 max-w-md mx-auto">
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === index ? "default" : "outline"}
            className={`h-12 text-left justify-start ${
              selectedAnswer === index ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => onAnswerSelect(index)}
            disabled={disabled}
          >
            <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
