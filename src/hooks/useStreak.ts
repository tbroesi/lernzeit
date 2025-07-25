import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStreak(userId?: string) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      calculateStreak();
    }
  }, [userId]);

  const calculateStreak = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);

      // Get unique dates from both learning_sessions and game_sessions
      const [learningSessionsRes, gameSessionsRes] = await Promise.all([
        supabase
          .from('learning_sessions')
          .select('session_date')
          .eq('user_id', userId)
          .order('session_date', { ascending: false }),
        supabase
          .from('game_sessions')
          .select('session_date')
          .eq('user_id', userId)
          .order('session_date', { ascending: false })
      ]);

      // Combine and get unique dates
      const allDates = new Set<string>();
      
      if (learningSessionsRes.data) {
        learningSessionsRes.data.forEach(session => {
          if (session.session_date) {
            const date = new Date(session.session_date).toISOString().split('T')[0];
            allDates.add(date);
          }
        });
      }

      if (gameSessionsRes.data) {
        gameSessionsRes.data.forEach(session => {
          if (session.session_date) {
            const date = new Date(session.session_date).toISOString().split('T')[0];
            allDates.add(date);
          }
        });
      }

      // Convert to sorted array (newest first)
      const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (sortedDates.length === 0) {
        setStreak(0);
        return;
      }

      // Check if user played today or yesterday (to maintain streak)
      const mostRecentDate = sortedDates[0];
      if (mostRecentDate !== today && mostRecentDate !== yesterday) {
        setStreak(0);
        return;
      }

      // Count consecutive days
      let checkDate = new Date();
      
      // If the most recent activity was yesterday, start from yesterday
      if (mostRecentDate === yesterday) {
        checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(checkDate.getTime() - i * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        
        if (sortedDates[i] === expectedDate) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Fehler beim Berechnen des Streaks:', error);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    streak,
    loading,
    reload: calculateStreak
  };
}