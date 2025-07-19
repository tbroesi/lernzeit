
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ChildSettings {
  math_minutes_per_task: number;
  german_minutes_per_task: number;
  english_minutes_per_task: number;
  geography_minutes_per_task: number;
  history_minutes_per_task: number;
  physics_minutes_per_task: number;
  biology_minutes_per_task: number;
  chemistry_minutes_per_task: number;
  latin_minutes_per_task: number;
  weekday_max_minutes: number;
  weekend_max_minutes: number;
}

export function useChildSettings(childId: string) {
  const [settings, setSettings] = useState<ChildSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChildSettings();
    }
  }, [childId]);

  const refreshSettings = () => {
    if (childId) {
      loadChildSettings();
    }
  };

  const loadChildSettings = async () => {
    if (!childId) {
      console.log('❌ No childId provided to useChildSettings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔧 Loading child settings for:', childId);
      
      // Get child-specific settings (only source of truth now)
      console.log('🔍 Querying child_settings with child_id:', childId);
      const { data: childSettings, error: childError } = await supabase
        .from('child_settings')
        .select('*')
        .eq('child_id', childId)
        .maybeSingle();

      console.log('🔧 Child settings query result:', { 
        childId, 
        childSettings, 
        childError,
        query: `SELECT * FROM child_settings WHERE child_id = '${childId}'`
      });

      if (childSettings && !childError) {
        console.log('✅ Found child-specific settings:', childSettings);
        setSettings(childSettings);
        return;
      }

      // If no child settings found, use default settings (1 minute per task)
      console.log('🔧 No child settings found, using default settings (1 minute per task)');
      const defaultSettings = {
        math_minutes_per_task: 1,
        german_minutes_per_task: 1,
        english_minutes_per_task: 1,
        geography_minutes_per_task: 1,
        history_minutes_per_task: 1,
        physics_minutes_per_task: 1,
        biology_minutes_per_task: 1,
        chemistry_minutes_per_task: 1,
        latin_minutes_per_task: 1,
        weekday_max_minutes: 30,
        weekend_max_minutes: 60,
      };
      
      setSettings(defaultSettings);

    } catch (error) {
      console.error('❌ Error loading child settings:', error);
      
      // Use defaults on error (1 minute per task)
      const defaultSettings = {
        math_minutes_per_task: 1,
        german_minutes_per_task: 1,
        english_minutes_per_task: 1,
        geography_minutes_per_task: 1,
        history_minutes_per_task: 1,
        physics_minutes_per_task: 1,
        biology_minutes_per_task: 1,
        chemistry_minutes_per_task: 1,
        latin_minutes_per_task: 1,
        weekday_max_minutes: 30,
        weekend_max_minutes: 60,
      };
      
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refreshSettings };
}
