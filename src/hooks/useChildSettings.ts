
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
}

export function useChildSettings(childId: string) {
  const [settings, setSettings] = useState<ChildSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChildSettings();
    }
  }, [childId]);

  const loadChildSettings = async () => {
    if (!childId) {
      console.log('❌ No childId provided to useChildSettings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔧 Loading child settings for:', childId);
      
      // First try to get child-specific settings
      const { data: childSettings, error: childError } = await supabase
        .from('child_settings')
        .select('*')
        .eq('child_id', childId)
        .maybeSingle();

      console.log('🔧 Child settings result:', { childSettings, childError });

      if (childSettings && !childError) {
        console.log('✅ Found child-specific settings');
        setSettings(childSettings);
        return;
      }

      // If no child-specific settings, try to get parent settings
      const { data: relationships, error: relError } = await supabase
        .from('parent_child_relationships')
        .select('parent_id')
        .eq('child_id', childId)
        .maybeSingle();

      console.log('🔧 Parent relationship result:', { relationships, relError });

      if (relationships && !relError && relationships.parent_id) {
        const { data: parentSettings, error: parentError } = await supabase
          .from('parent_settings')
          .select('*')
          .eq('user_id', relationships.parent_id)
          .maybeSingle();

        console.log('🔧 Parent settings result:', { parentSettings, parentError });

        if (parentSettings && !parentError) {
          console.log('✅ Found parent settings');
          setSettings(parentSettings);
          return;
        }
      }

      // If no settings found, use defaults
      console.log('🔧 Using default settings');
      const defaultSettings = {
        math_minutes_per_task: 5,
        german_minutes_per_task: 5,
        english_minutes_per_task: 5,
        geography_minutes_per_task: 5,
        history_minutes_per_task: 5,
        physics_minutes_per_task: 5,
        biology_minutes_per_task: 5,
        chemistry_minutes_per_task: 5,
        latin_minutes_per_task: 5,
      };
      
      setSettings(defaultSettings);

    } catch (error) {
      console.error('❌ Error loading child settings:', error);
      
      // Use defaults on error
      const defaultSettings = {
        math_minutes_per_task: 5,
        german_minutes_per_task: 5,
        english_minutes_per_task: 5,
        geography_minutes_per_task: 5,
        history_minutes_per_task: 5,
        physics_minutes_per_task: 5,
        biology_minutes_per_task: 5,
        chemistry_minutes_per_task: 5,
        latin_minutes_per_task: 5,
      };
      
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}
