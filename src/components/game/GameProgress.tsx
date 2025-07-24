
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { GameTimer } from './GameTimer';

interface GameProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  startTime: number;
  isActive?: boolean;
}

export function GameProgress({ 
  currentQuestion, 
  totalQuestions, 
  score,
  startTime,
  isActive = true
}: GameProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  return (
    <div className="space-y-2">
      <GameTimer startTime={startTime} isActive={isActive} />
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
