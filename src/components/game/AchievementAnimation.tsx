import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Star } from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  reward_minutes: number;
  icon: string;
  color: string;
}

interface AchievementAnimationProps {
  achievements: Achievement[];
  onClose: () => void;
  isVisible: boolean;
}

export function AchievementAnimation({ achievements, onClose, isVisible }: AchievementAnimationProps) {
  if (!isVisible || achievements.length === 0) return null;

  const totalRewardMinutes = achievements.reduce((sum, achievement) => sum + achievement.reward_minutes, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-md w-full shadow-card animate-scale-in">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-6xl animate-pulse">🎉</div>
          
          <h2 className="text-2xl font-bold text-primary animate-fade-in">
            Ziel erreicht!
          </h2>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="bg-primary/10 p-3 rounded-lg animate-fade-in border-l-4 border-primary"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                  {achievement.reward_minutes > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{achievement.reward_minutes} Min
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalRewardMinutes > 0 && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg animate-fade-in border-2 border-yellow-300">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">+{totalRewardMinutes} Extra-Minuten!</span>
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                Zusätzliche Bildschirmzeit für deine Erfolge
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Weiter
          </button>
        </CardContent>
      </Card>
    </div>
  );
}