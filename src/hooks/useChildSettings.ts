
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
    loadChildSettings();
  }, [childId]);

  const loadChildSettings = async () => {
    try {
      setLoading(true);
      
      // First try to get child-specific settings
      const { data: childSettings, error: childError } = await supabase
        .from('child_settings')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (childSettings && !childError) {
        setSettings(childSettings);
        return;
      }

      // If no child-specific settings, try to get parent settings
      const { data: relationships, error: relError } = await supabase
        .from('parent_child_relationships')
        .select('parent_id')
        .eq('child_id', childId)
        .single();

      if (relationships && !relError) {
        const { data: parentSettings, error: parentError } = await supabase
          .from('parent_settings')
          .select('*')
          .eq('user_id', relationships.parent_id)
          .single();

        if (parentSettings && !parentError) {
          setSettings(parentSettings);
          return;
        }
      }

      // If no settings found, use defaults
      setSettings({
        math_minutes_per_task: 5,
        german_minutes_per_task: 5,
        english_minutes_per_task: 5,
        geography_minutes_per_task: 5,
        history_minutes_per_task: 5,
        physics_minutes_per_task: 5,
        biology_minutes_per_task: 5,
        chemistry_minutes_per_task: 5,
        latin_minutes_per_task: 5,
      });

    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
      // Use defaults on error
      setSettings({
        math_minutes_per_task: 5,
        german_minutes_per_task: 5,
        english_minutes_per_task: 5,
        geography_minutes_per_task: 5,
        history_minutes_per_task: 5,
        physics_minutes_per_task: 5,
        biology_minutes_per_task: 5,
        chemistry_minutes_per_task: 5,
        latin_minutes_per_task: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}
