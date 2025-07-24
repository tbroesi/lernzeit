import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Zap, Target, Award } from 'lucide-react';

interface GameCompletionScreenProps {
  score: number;
  totalQuestions: number;
  sessionDuration: number;
  timePerTask: number;
  achievementBonusMinutes: number;
  perfectSessionBonus?: number; // in minutes
  onContinue: () => void;
}

export function GameCompletionScreen({
  score,
  totalQuestions,
  sessionDuration,
  timePerTask,
  achievementBonusMinutes,
  perfectSessionBonus = 0,
  onContinue
}: GameCompletionScreenProps) {
  const earnedSeconds = score * timePerTask;
  const timeSpentSeconds = Math.round(sessionDuration / 1000);
  const perfectSessionBonusSeconds = perfectSessionBonus * 60;
  const netTimeSeconds = Math.max(0, earnedSeconds - timeSpentSeconds + (achievementBonusMinutes * 60) + perfectSessionBonusSeconds);
  const efficiency = Math.round((score / totalQuestions) * 100);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        {/* Success Animation */}
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Fantastisch!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-4">
          Du hast erfolgreich zusätzliche Handyzeit verdient!
        </p>

        {/* Achievement Badge */}
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
          <Award className="w-4 h-4" />
          {score} von {totalQuestions} Fragen richtig beantwortet!
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Time Calculation Display */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-6 border">
          <h2 className="text-xl font-bold text-center mb-6 text-blue-800 dark:text-blue-200">
            Zeitberechnung
          </h2>
          
          {/* Calculation Steps */}
          <div className="space-y-4">
            {/* Earned Time */}
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-medium">Verdiente Zeit:</span>
              </div>
              <div className="text-lg font-mono">
                {score} × {timePerTask}s = <span className="font-bold text-green-600">{earnedSeconds}s</span>
              </div>
            </div>

            {/* Time Spent */}
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Verbrauchte Zeit:</span>
              </div>
              <div className="text-lg font-mono font-bold text-orange-600">
                {timeSpentSeconds}s
              </div>
            </div>

            {/* Perfect Session Bonus */}
            {perfectSessionBonus > 0 && (
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Perfect Session Bonus:</span>
                </div>
                <div className="text-lg font-mono font-bold text-green-600">
                  +{perfectSessionBonusSeconds}s
                </div>
              </div>
            )}

            {/* Achievement Bonus */}
            {achievementBonusMinutes > 0 && (
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Achievement Bonus:</span>
                </div>
                <div className="text-lg font-mono font-bold text-purple-600">
                  +{achievementBonusMinutes * 60}s
                </div>
              </div>
            )}

            {/* Final Calculation */}
            <div className="border-t pt-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Berechnung:</div>
                <div className="font-mono text-lg mb-3">
                  {earnedSeconds}s
                  {timeSpentSeconds > 0 && ` - ${timeSpentSeconds}s`}
                  {perfectSessionBonus > 0 && ` + ${perfectSessionBonusSeconds}s`}
                  {achievementBonusMinutes > 0 && ` + ${achievementBonusMinutes * 60}s`}
                  = <span className="font-bold text-2xl text-green-600">{netTimeSeconds}s</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Das sind <span className="font-bold">{Math.round(netTimeSeconds / 60 * 10) / 10} Minuten</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{efficiency}%</div>
            <div className="text-sm text-muted-foreground">Genauigkeit</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{netTimeSeconds}s</div>
            <div className="text-sm text-muted-foreground">Gewonnene Sekunden</div>
          </div>
        </div>

        {/* Main Action Button */}
        <div className="space-y-3">
          <Button 
            onClick={onContinue}
            size="lg" 
            className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white"
          >
            <Trophy className="w-5 h-5 mr-2" />
            +{netTimeSeconds}s ({Math.round(netTimeSeconds / 60 * 10) / 10}min) Bildschirmzeit verdient!
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Zeit wurde zu deinem Konto hinzugefügt! 📱⏰
          </div>
        </div>
      </CardContent>
    </Card>
  );
}