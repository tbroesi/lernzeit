
import React from 'react';
import { WordSelectionQuestion as WordSelectionQuestionType } from '@/types/questionTypes';

interface WordSelectionQuestionProps {
  question: WordSelectionQuestionType;
  selectedWords: number[];
  onWordToggle: (wordIndex: number) => void;
  disabled?: boolean;
}

export function WordSelectionQuestion({ 
  question, 
  selectedWords, 
  onWordToggle, 
  disabled = false 
}: WordSelectionQuestionProps) {
  const renderSentenceWithSelectableWords = () => {
    const words = question.sentence.split(' ');
    
    return words.map((word, index) => {
      const selectableWord = question.selectableWords.find(sw => sw.index === index);
      const isSelected = selectedWords.includes(index);
      
      if (selectableWord) {
        return (
          <button
            key={index}
            className={`mx-1 px-2 py-1 rounded transition-colors ${
              isSelected 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80 border-2 border-dashed border-muted-foreground/30'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={() => !disabled && onWordToggle(index)}
            disabled={disabled}
          >
            {word}
          </button>
        );
      }
      
      return <span key={index} className="mx-1">{word}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xl font-medium mb-6 text-center">
        {question.question}
      </p>
      
      <div className="text-lg leading-relaxed text-center bg-muted/10 p-6 rounded-lg">
        {renderSentenceWithSelectableWords()}
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Klicke auf die Wörter, die zur Antwort gehören
      </p>
    </div>
  );
}
