import React, { useState } from 'react';
import { DragDropQuestion as DragDropQuestionType } from '@/types/questionTypes';

interface DragDropQuestionProps {
  question: DragDropQuestionType;
  currentPlacements: Record<string, string>;
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
    if (disabled) return;
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (disabled || !draggedItem) return;
    
    onItemMove(draggedItem, categoryId);
    setDraggedItem(null);
  };

  const getItemsInCategory = (categoryId: string) => {
    return question.items.filter(item => currentPlacements[item.id] === categoryId);
  };

  const getUnplacedItems = () => {
    return question.items.filter(item => !currentPlacements[item.id]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-medium mb-6">{question.question}</p>
      </div>

      {/* Unplaced Items */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-3">Items to categorize:</h3>
        <div className="flex flex-wrap gap-2">
          {getUnplacedItems().map((item) => (
            <div
              key={item.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(item.id)}
              className={`px-3 py-2 bg-background border rounded cursor-move transition-colors ${
                draggedItem === item.id ? 'opacity-50' : ''
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-accent'}`}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.categories.map((category) => (
          <div
            key={category.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category.id)}
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 min-h-[120px] transition-colors hover:border-muted-foreground/50"
          >
            <h3 className="font-medium mb-3 text-center">{category.name}</h3>
            <div className="space-y-2">
              {getItemsInCategory(category.id).map((item) => (
                <div
                  key={item.id}
                  draggable={!disabled}
                  onDragStart={() => handleDragStart(item.id)}
                  className={`px-3 py-2 bg-accent/50 rounded transition-colors ${
                    draggedItem === item.id ? 'opacity-50' : ''
                  } ${disabled ? 'cursor-not-allowed' : 'cursor-move hover:bg-accent'}`}
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