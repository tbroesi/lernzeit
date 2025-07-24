import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameTimeDisplay } from '@/components/game/GameTimeDisplay';

interface GameCompletionScreenProps {
  score: number;
  totalQuestions: number;
  sessionDuration: number;
  timePerTask: number;
  achievementBonusMinutes: number;
  onContinue: () => void;
}

export function GameCompletionScreen({
  score,
  totalQuestions,
  sessionDuration,
  timePerTask,
  achievementBonusMinutes,
  onContinue
}: GameCompletionScreenProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-green-600">
          🎉 Spiel beendet!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <GameTimeDisplay 
          correctAnswers={score}
          totalQuestions={totalQuestions}
          timeSpentSeconds={sessionDuration / 1000}
          timePerTask={timePerTask}
          achievementBonusMinutes={achievementBonusMinutes}
        />
        
        <div className="text-center space-y-4">
          <p className="text-lg">
            Klasse! Du hast {score} von {totalQuestions} Fragen richtig beantwortet!
          </p>
          
          <Button 
            onClick={onContinue}
            size="lg" 
            className="w-full"
          >
            Weiter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}