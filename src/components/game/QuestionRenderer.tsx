
import React from 'react';
import { Input } from '@/components/ui/input';
import { MultipleChoiceQuestion } from '@/components/question-types/MultipleChoiceQuestion';
import { WordSelectionQuestion } from '@/components/question-types/WordSelectionQuestion';
import { MatchingQuestion } from '@/components/question-types/MatchingQuestion';
import { SelectionQuestion } from '@/types/questionTypes';

interface QuestionRendererProps {
  question: SelectionQuestion;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  selectedMultipleChoice: number | null;
  setSelectedMultipleChoice: (answer: number | null) => void;
  selectedWords: number[];
  setSelectedWords: (words: number[]) => void;
  onWordToggle: (wordIndex: number) => void;  
  onMatchingComplete: (isCorrect: boolean) => void;
  feedback: 'correct' | 'incorrect' | null;
}

export function QuestionRenderer({
  question,
  userAnswer,
  setUserAnswer,
  selectedMultipleChoice,
  setSelectedMultipleChoice,
  selectedWords,
  setSelectedWords,
  onWordToggle,
  onMatchingComplete,
  feedback
}: QuestionRendererProps) {
  console.log('🎯 QuestionRenderer - Question type:', question.questionType);
  console.log('🎯 QuestionRenderer - Question:', question.question);

  switch (question.questionType) {
    case 'multiple-choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          selectedAnswer={selectedMultipleChoice}
          onAnswerSelect={setSelectedMultipleChoice}
          disabled={feedback !== null}
        />
      );
      
    case 'word-selection':
      return (
        <WordSelectionQuestion
          question={question}
          selectedWords={selectedWords}
          onWordToggle={onWordToggle}
          disabled={feedback !== null}
        />
      );
      
    case 'matching':
      return (
        <MatchingQuestion
          question={question}
          onComplete={onMatchingComplete}
          disabled={feedback !== null}
        />
      );
      
    case 'text-input':
    default:
      return (
        <div className="text-center">
          <p className="text-xl font-medium mb-6">
            {question.question}
          </p>
          <div className="max-w-sm mx-auto">
            <Input
              type={typeof question.answer === 'number' ? "number" : "text"}
              inputMode={typeof question.answer === 'number' ? "numeric" : "text"}
              pattern={typeof question.answer === 'number' ? "[0-9]*" : undefined}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userAnswer.trim() && !feedback) {
                  // Let parent handle submission
                }
              }}
              placeholder="Deine Antwort..."
              className="text-center text-lg h-12"
              autoFocus
              disabled={feedback !== null}
            />
          </div>
        </div>
      );
  }
}
