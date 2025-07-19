
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
            className={`mx-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
              isSelected 
                ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                : 'bg-muted hover:bg-muted/80 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}`}
            onClick={() => !disabled && onWordToggle(index)}
            disabled={disabled}
          >
            {word}
          </button>
        );
      }
      
      return <span key={index} className="mx-1 text-lg">{word}</span>;
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium mb-6 text-center">
        {question.question}
      </p>
      
      <div className="text-lg leading-relaxed text-center bg-muted/10 p-6 rounded-lg border">
        {renderSentenceWithSelectableWords()}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Klicke auf die Wörter, die zur Antwort gehören
        </p>
        {selectedWords.length > 0 && (
          <p className="text-xs text-primary font-medium">
            {selectedWords.length} Wort{selectedWords.length !== 1 ? 'e' : ''} ausgewählt
          </p>
        )}
      </div>
    </div>
  );
}
