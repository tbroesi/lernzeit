import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Settings, Clock, Calendar, Save } from 'lucide-react';

interface ParentSettingsMenuProps {
  user: any;
  profile: any;
  onSignOut: () => void;
  onBack: () => void;
}

export function ParentSettingsMenu({ user, profile, onSignOut, onBack }: ParentSettingsMenuProps) {
  const [settings, setSettings] = useState({
    weekday_max_minutes: 30,
    weekend_max_minutes: 60
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          weekday_max_minutes: data.weekday_max_minutes,
          weekend_max_minutes: data.weekend_max_minutes
        });
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Einstellungen:', error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Check if settings already exist
      const { data: existing } = await supabase
        .from('parent_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('parent_settings')
          .update(settings)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('parent_settings')
          .insert([{
            user_id: user.id,
            ...settings
          }]);

        if (error) throw error;
      }

      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Bonuszeit-Limits wurden erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(120, numValue)) // Limit between 0 and 120 minutes
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Einstellungen werden geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <CardTitle>Einstellungen</CardTitle>
                </div>
              </div>
              <Badge variant="secondary">Elternteil</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Bonus Time Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Bonuszeit-Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Legen Sie fest, wie viele Minuten Bonuszeit Ihr Kind maximal pro Tag verdienen kann.
            </p>
            
            {/* Weekday Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <Label htmlFor="weekday" className="text-sm font-medium">
                  Wochentage (Mo-Fr)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="weekday"
                  type="number"
                  min="0"
                  max="120"
                  value={settings.weekday_max_minutes}
                  onChange={(e) => handleInputChange('weekday_max_minutes', e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">Minuten pro Tag</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Empfohlen: 15-45 Minuten für Schultage
              </p>
            </div>

            {/* Weekend Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <Label htmlFor="weekend" className="text-sm font-medium">
                  Wochenende (Sa-So)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="weekend"
                  type="number"
                  min="0"
                  max="120"
                  value={settings.weekend_max_minutes}
                  onChange={(e) => handleInputChange('weekend_max_minutes', e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">Minuten pro Tag</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Empfohlen: 30-90 Minuten für freie Tage
              </p>
            </div>

            {/* Current Settings Preview */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Aktuelle Limits:</h4>
              <div className="flex justify-between text-sm">
                <span>Montag - Freitag:</span>
                <Badge variant="outline">{settings.weekday_max_minutes} Min</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Samstag - Sonntag:</span>
                <Badge variant="outline">{settings.weekend_max_minutes} Min</Badge>
              </div>
            </div>

            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                "Wird gespeichert..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Einstellungen speichern
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">Name</Label>
              <p className="text-sm text-muted-foreground">{profile?.name || 'Nicht festgelegt'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Rolle</Label>
              <Badge variant="secondary">Elternteil</Badge>
            </div>
            <Button variant="outline" onClick={onSignOut} className="w-full mt-4">
              Abmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}