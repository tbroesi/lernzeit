
import React, { useState } from 'react';
import { DragDropQuestion as DragDropQuestionType } from '@/types/questionTypes';

interface DragDropQuestionProps {
  question: DragDropQuestionType;
  currentPlacements: Record<string, string>; // itemId -> categoryId
  onItemMove: (itemId: string, categoryId: string) => void;
  disabled?: boolean;
}

export function DragDropQuestion({ 
  question, 
  currentPlacements, 
  onItemMove, 
  disabled = false 
}: DragDropQuestionProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => {
    if (!disabled) {
      setDraggedItem(itemId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedItem && !disabled) {
      onItemMove(draggedItem, categoryId);
      setDraggedItem(null);
    }
  };

  const getItemsInCategory = (categoryId: string) => {
    return question.items.filter(item => currentPlacements[item.id] === categoryId);
  };

  const getUnplacedItems = () => {
    return question.items.filter(item => !currentPlacements[item.id]);
  };

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium mb-6 text-center">
        {question.question}
      </p>
      
      {/* Unplaced items */}
      <div className="bg-muted/20 p-4 rounded-lg">
        <h3 className="font-medium mb-3 text-center">Ziehe die Elemente in die richtige Kategorie:</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {getUnplacedItems().map(item => (
            <div
              key={item.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(item.id)}
              className={`px-3 py-2 bg-card border rounded cursor-move transition-opacity ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              } ${draggedItem === item.id ? 'opacity-50' : ''}`}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.categories.map(category => (
          <div
            key={category.id}
            className="min-h-[120px] p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category.id)}
          >
            <h4 className="font-medium mb-3 text-center">{category.name}</h4>
            <div className="space-y-2">
              {getItemsInCategory(category.id).map(item => (
                <div
                  key={item.id}
                  draggable={!disabled}
                  onDragStart={() => handleDragStart(item.id)}
                  className={`px-3 py-2 bg-card border rounded cursor-move transition-opacity ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  } ${draggedItem === item.id ? 'opacity-50' : ''}`}
                >
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
