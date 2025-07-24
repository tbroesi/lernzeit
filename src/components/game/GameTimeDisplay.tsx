import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trophy, Zap } from 'lucide-react';

interface GameTimeDisplayProps {
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  timePerTask: number;
  achievementBonusMinutes?: number;
}

export function GameTimeDisplay({ 
  correctAnswers, 
  totalQuestions, 
  timeSpentSeconds, 
  timePerTask,
  achievementBonusMinutes = 0 
}: GameTimeDisplayProps) {
  const earnedSeconds = correctAnswers * timePerTask;
  const earnedMinutes = Math.round(earnedSeconds / 60 * 100) / 100;
  const timeSpentMinutes = Math.round(timeSpentSeconds / 60 * 100) / 100;
  const netTimeMinutes = Math.max(0, earnedMinutes - timeSpentMinutes + achievementBonusMinutes);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-primary mb-4">
            Zeitberechnung
          </div>
          
          {/* Base Time Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 justify-center">
              <Trophy className="w-4 h-4 text-green-600" />
              <span>
                {correctAnswers} × {timePerTask}s = <strong>{earnedSeconds}s</strong>
              </span>
            </div>
            
            <div className="flex items-center gap-2 justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>
                Verbrauchte Zeit: <strong>{timeSpentMinutes.toFixed(1)}min</strong>
              </span>
            </div>
            
            {achievementBonusMinutes > 0 && (
              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>
                  Bonus: <strong>+{achievementBonusMinutes}min</strong>
                </span>
              </div>
            )}
          </div>

          {/* Calculation Formula */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Berechnung:</div>
            <div className="font-mono text-sm">
              {earnedMinutes.toFixed(1)}min 
              {timeSpentMinutes > 0 && ` - ${timeSpentMinutes.toFixed(1)}min`}
              {achievementBonusMinutes > 0 && ` + ${achievementBonusMinutes}min`}
              = <strong className="text-primary">{netTimeMinutes.toFixed(1)}min</strong>
            </div>
          </div>

          {/* Result */}
          <div className="text-lg">
            <span className="text-muted-foreground">Gewonnene Zeit: </span>
            <span className="text-2xl font-bold text-green-600">
              {netTimeMinutes.toFixed(1)} Minuten
            </span>
          </div>

          {/* Performance Indicator */}
          <div className="text-xs text-muted-foreground">
            Effizienz: {correctAnswers}/{totalQuestions} richtige Antworten
            {timeSpentSeconds > 0 && ` in ${timeSpentMinutes.toFixed(1)} Minuten`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}