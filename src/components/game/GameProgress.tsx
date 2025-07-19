
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface GameProgressProps {
  currentProblem: number;
  totalQuestions: number;
  timeElapsed: number;
  feedback: 'correct' | 'incorrect' | null;
}

export function GameProgress({ 
  currentProblem, 
  totalQuestions, 
  timeElapsed, 
  feedback 
}: GameProgressProps) {
  const progress = ((currentProblem + (feedback ? 1 : 0)) / totalQuestions) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>
        <div className="font-medium">
          {currentProblem + 1} / {totalQuestions}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
