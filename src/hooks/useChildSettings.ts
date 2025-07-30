
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChildSettings {
  mathematik_seconds_per_task: number;
  deutsch_seconds_per_task: number;
  englisch_seconds_per_task: number;
  geographie_seconds_per_task: number;
  geschichte_seconds_per_task: number;
  physik_seconds_per_task: number;
  biologie_seconds_per_task: number;
  chemie_seconds_per_task: number;
  latein_seconds_per_task: number;
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

      // If no child settings found, use default settings (30 seconds per task)
      console.log('🔧 No child settings found, using default settings (30 seconds per task)');
      const defaultSettings = {
        mathematik_seconds_per_task: 30,
        deutsch_seconds_per_task: 30,
        englisch_seconds_per_task: 30,
        geographie_seconds_per_task: 30,
        geschichte_seconds_per_task: 30,
        physik_seconds_per_task: 30,
        biologie_seconds_per_task: 30,
        chemie_seconds_per_task: 30,
        latein_seconds_per_task: 30,
        weekday_max_minutes: 30,
        weekend_max_minutes: 60,
      };
      
      setSettings(defaultSettings);

    } catch (error) {
      console.error('❌ Error loading child settings:', error);
      
      // Use defaults on error (30 seconds per task)
      const defaultSettings = {
        mathematik_seconds_per_task: 30,
        deutsch_seconds_per_task: 30,
        englisch_seconds_per_task: 30,
        geographie_seconds_per_task: 30,
        geschichte_seconds_per_task: 30,
        physik_seconds_per_task: 30,
        biologie_seconds_per_task: 30,
        chemie_seconds_per_task: 30,
        latein_seconds_per_task: 30,
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
