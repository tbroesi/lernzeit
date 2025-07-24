import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Star } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';

interface AchievementProgressOverviewProps {
  userId: string;
}

export function AchievementProgressOverview({ userId }: AchievementProgressOverviewProps) {
  const { userAchievements, loading } = useAchievements(userId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Erfolgs-Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Wird geladen...</div>
        </CardContent>
      </Card>
    );
  }

  if (userAchievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Erfolgs-Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Löse deine ersten Aufgaben, um Erfolge freizuschalten!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by category
  const achievementsByCategory = userAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof userAchievements>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'math': return '🧮';
      case 'german': return '📚';
      case 'english': return '🇬🇧';
      case 'geography': return '🌍';
      case 'history': return '📜';
      case 'physics': return '⚛️';
      case 'biology': return '🧬';
      case 'chemistry': return '🧪';
      case 'latin': return '🏛️';
      default: return '🎯';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'math': return 'Mathematik';
      case 'german': return 'Deutsch';
      case 'english': return 'Englisch';
      case 'geography': return 'Geographie';
      case 'history': return 'Geschichte';
      case 'physics': return 'Physik';
      case 'biology': return 'Biologie';
      case 'chemistry': return 'Chemie';
      case 'latin': return 'Latein';
      default: return category;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Erfolgs-Fortschritt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(achievementsByCategory).map(([category, achievements]) => {
            const completed = achievements.filter(a => a.is_completed).length;
            const inProgress = achievements.filter(a => a.current_progress > 0 && !a.is_completed).length;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{getCategoryName(category)}</div>
                    <div className="text-sm text-muted-foreground">
                      {completed} abgeschlossen • {inProgress} in Arbeit • {achievements.length} gesamt
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 ml-11">
                  {achievements.slice(0, 3).map((achievement) => {
                    const progress = (achievement.current_progress || 0) / achievement.requirement_value * 100;
                    
                    return (
                      <div key={achievement.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{achievement.icon}</span>
                            <span className={achievement.is_completed ? 'text-green-600 font-medium' : ''}>
                              {achievement.name}
                            </span>
                            {achievement.is_completed && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.current_progress || 0}/{achievement.requirement_value}
                          </div>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                  
                  {achievements.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      ... und {achievements.length - 3} weitere Erfolge
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}