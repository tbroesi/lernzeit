
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface MatchingItem {
  id: string;
  content: string;
  category: string;
}

interface MatchingCategory {
  id: string;
  name: string;
  acceptsItems: string[];
}

interface MatchingQuestionType {
  id: number;
  questionType: 'matching';
  question: string;
  type: string;
  explanation?: string;
  items: MatchingItem[];
  categories: MatchingCategory[];
}

interface MatchingQuestionProps {
  question: MatchingQuestionType;
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function MatchingQuestion({ question, onComplete, disabled = false }: MatchingQuestionProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [hasCompleted, setHasCompleted] = useState(false);

  // Debug logging
  console.log('🎯 MatchingQuestion state:', {
    question: question.question,
    matchesCount: Object.keys(matches).length,
    totalItems: question.items.length,
    disabled,
    hasCompleted
  });

  // Check if game is complete
  useEffect(() => {
    const totalItems = question.items.length;
    const matchedItems = Object.keys(matches).length;
    
    if (matchedItems === totalItems && !hasCompleted && !disabled) {
      console.log('🎯 Game completing with matches:', matches);
      
      // Check if all matches are correct
      const allCorrect = question.items.every(item => {
        const matchedCategory = matches[item.id];
        const isCorrect = matchedCategory === item.category;
        console.log(`🔍 Item ${item.id} -> ${matchedCategory}, expected: ${item.category}, correct: ${isCorrect}`);
        return isCorrect;
      });
      
      console.log('🎯 Final result:', { allCorrect, matches });
      setHasCompleted(true);
      
      // Delay to show final feedback before completing
      setTimeout(() => {
        onComplete(allCorrect);
      }, 1000);
    }
  }, [matches, question.items, hasCompleted, disabled, onComplete]);

  const handleItemClick = (itemId: string) => {
    if (disabled || matches[itemId] || hasCompleted) return;
    
    console.log('🎯 Item clicked:', itemId);
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (disabled || !selectedItem || hasCompleted) return;
    
    console.log('🎯 Category clicked:', categoryId, 'with selected item:', selectedItem);
    
    // Find the correct category for the selected item
    const item = question.items.find(i => i.id === selectedItem);
    if (!item) return;
    
    const isCorrect = item.category === categoryId;
    const matchKey = `${selectedItem}-${categoryId}`;
    
    if (isCorrect) {
      // Correct match
      setMatches(prev => ({ ...prev, [selectedItem]: categoryId }));
      setFeedback(prev => ({ ...prev, [matchKey]: 'correct' }));
      console.log('✅ Correct match:', selectedItem, '→', categoryId);
    } else {
      // Wrong match
      setWrongAttempts(prev => [...prev, matchKey]);
      setFeedback(prev => ({ ...prev, [matchKey]: 'incorrect' }));
      console.log('❌ Wrong match:', selectedItem, '→', categoryId);
    }
    
    // Reset selections
    setSelectedItem(null);
    
    // Clear feedback after delay
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, [matchKey]: null }));
    }, 1500);
  };

  const getItemsInCategory = (categoryId: string) => {
    return question.items.filter(item => matches[item.id] === categoryId);
  };

  const getUnmatchedItems = () => {
    return question.items.filter(item => !matches[item.id]);
  };

  const getItemFeedbackClass = (itemId: string) => {
    const item = question.items.find(i => i.id === itemId);
    if (!item) return '';
    
    if (matches[itemId]) {
      const isCorrect = matches[itemId] === item.category;
      return isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
    }
    
    return selectedItem === itemId ? 'border-blue-500 bg-blue-50' : '';
  };

  const getCategoryFeedbackClass = (categoryId: string) => {
    if (!selectedItem || hasCompleted) return '';
    
    const matchKey = `${selectedItem}-${categoryId}`;
    const feedbackState = feedback[matchKey];
    
    if (feedbackState === 'correct') {
      return 'border-green-500 bg-green-50';
    } else if (feedbackState === 'incorrect') {
      return 'border-red-500 bg-red-50';
    }
    
    return 'hover:border-blue-300 hover:bg-blue-50';
  };

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium mb-6 text-center">
        {question.question}
      </p>
      
      {!hasCompleted && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          Klicke auf ein Element und dann auf die passende Kategorie
        </p>
      )}

      {hasCompleted && (
        <p className="text-sm text-success text-center mb-4 font-medium">
          🎉 Aufgabe abgeschlossen! Weiter zur nächsten Frage...
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Items to match */}
        <div className="space-y-4">
          <h3 className="font-medium text-center text-lg">Elemente</h3>
          
          {/* Unmatched items */}
          <div className="space-y-2">
            {getUnmatchedItems().map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`p-4 border-2 rounded-lg transition-all select-none ${
                  disabled || hasCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${getItemFeedbackClass(item.id)}`}
                style={{ userSelect: 'none' }}
              >
                <div className="flex items-center justify-between">
                  <span>{item.content}</span>
                  {selectedItem === item.id && !hasCompleted && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Categories */}
        <div className="space-y-4">
          <h3 className="font-medium text-center text-lg">Kategorien</h3>
          
          <div className="space-y-4">
            {question.categories.map(category => {
              const itemsInCategory = getItemsInCategory(category.id);
              const matchKey = selectedItem ? `${selectedItem}-${category.id}` : '';
              const feedbackState = feedback[matchKey];
              
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`min-h-[100px] p-4 border-2 rounded-lg transition-all ${
                    disabled || hasCompleted ? 'opacity-50 cursor-not-allowed' : 
                    selectedItem ? 'cursor-pointer' : 'cursor-default'
                  } ${getCategoryFeedbackClass(category.id)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{category.name}</h4>
                    {feedbackState === 'correct' && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                    {feedbackState === 'incorrect' && (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  {/* Matched items in this category */}
                  <div className="space-y-2">
                    {itemsInCategory.map(item => (
                      <div
                        key={item.id}
                        className={`p-2 rounded border ${getItemFeedbackClass(item.id)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{item.content}</span>
                          {matches[item.id] === item.category ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {Object.keys(matches).length} von {question.items.length} zugeordnet
      </div>
    </div>
  );
}
