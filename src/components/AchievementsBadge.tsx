import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';

interface AchievementsBadgeProps {
  userId: string;
}

export function AchievementsBadge({ userId }: AchievementsBadgeProps) {
  const { userAchievements, getCompletedAchievements, getRecentAchievements, getTotalRewardMinutes, loading } = useAchievements(userId);

  console.log('🏆 AchievementsBadge data:', {
    userId,
    totalAchievements: userAchievements.length,
    completedCount: getCompletedAchievements().length,
    recentCount: getRecentAchievements().length,
    loading
  });

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Erfolge</div>
              <div className="text-sm text-muted-foreground">Wird geladen...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedAchievements = getCompletedAchievements();
  const recentAchievements = getRecentAchievements();
  const totalRewardMinutes = getTotalRewardMinutes();

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium flex items-center gap-2">
              Erfolge
              {recentAchievements.length > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {completedAchievements.length > 0 ? (
                <>
                  {completedAchievements.length} erreicht • +{totalRewardMinutes} Min Bonus
                </>
              ) : userAchievements.length > 0 ? (
                <>
                  {userAchievements.filter(a => a.current_progress > 0).length} in Arbeit • {userAchievements.length} verfügbar
                </>
              ) : (
                'Sammle deine ersten Erfolge!'
              )}
            </div>
          </div>
          <div className="text-2xl">
            {completedAchievements.length > 0 ? '🏆' : '🎯'}
          </div>
        </div>
        
        {recentAchievements.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs font-medium text-primary mb-2">
              🎉 Neue Erfolge!
            </div>
            <div className="space-y-1">
              {recentAchievements.slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 text-xs">
                  <span>{achievement.icon}</span>
                  <span className="text-muted-foreground">{achievement.name}</span>
                  {achievement.reward_minutes > 0 && (
                    <span className="text-primary font-medium">+{achievement.reward_minutes}min</span>
                  )}
                </div>
              ))}
              {recentAchievements.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  ... und {recentAchievements.length - 2} weitere
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}