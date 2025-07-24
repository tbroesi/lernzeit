
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface GameProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

export function GameProgress({ 
  currentQuestion, 
  totalQuestions, 
  score 
}: GameProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="w-4 h-4" />
          Punkte: {score}
        </div>
        <div className="font-medium">
          {currentQuestion} / {totalQuestions}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
