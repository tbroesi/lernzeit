import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Settings, LogOut, Baby, Shield, Clock, Award } from 'lucide-react';
import { ScreenTimeWidget } from '@/components/ScreenTimeWidget';
import { ParentDashboard } from '@/components/ParentDashboard';
import { ChildLinking } from '@/components/ChildLinking';

interface UserProfileProps {
  user: any;
  onSignOut: () => void;
  onStartGame: (grade: number) => void;
}

export function UserProfile({ user, onSignOut, onStartGame }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [grade, setGrade] = useState<number>(1);
  const [totalTimeEarned, setTotalTimeEarned] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          name: user.user_metadata?.name || '',
          role: user.user_metadata?.role || 'child',
          grade: user.user_metadata?.grade || 1,
          created_at: new Date().toISOString(),
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(created);
        setGrade(created.grade || 1);
      } else {
        setProfile(data);
        setGrade(data.grade || 1);
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const totalTime = data.reduce((sum, session) => sum + session.time_earned, 0);
        setTotalTimeEarned(totalTime);
        setGamesPlayed(data.length);
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ grade })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, grade });
      setEditMode(false);
      
      toast({
        title: "Profil aktualisiert!",
        description: "Deine Änderungen wurden gespeichert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Profil wird geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  {profile?.role === 'parent' ? (
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <Baby className="w-6 h-6 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Willkommen, {profile?.name || 'Nutzer'}!
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={profile?.role === 'parent' ? 'secondary' : 'default'}>
                      {profile?.role === 'parent' ? 'Elternteil' : 'Kind'}
                    </Badge>
                    {profile?.role === 'child' && (
                      <Badge variant="outline">
                        Klasse {profile?.grade || 1}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        {profile?.role === 'child' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{totalTimeEarned}</div>
                <div className="text-sm text-muted-foreground">Min. verdient</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">{gamesPlayed}</div>
                <div className="text-sm text-muted-foreground">Spiele gespielt</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <User className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">
                  {gamesPlayed > 0 ? Math.round(totalTimeEarned / gamesPlayed) : 0}
                </div>
                <div className="text-sm text-muted-foreground">⌀ Min./Spiel</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profil-Einstellungen
              </CardTitle>
              {!editMode && profile?.role === 'child' && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Bearbeiten
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Klassenstufe</Label>
                  <select 
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(g => (
                      <option key={g} value={g}>Klasse {g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateProfile} variant="default">
                    Speichern
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="outline">
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-Mail:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{profile?.name || 'Nicht gesetzt'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rolle:</span>
                  <span>{profile?.role === 'parent' ? 'Elternteil' : 'Kind'}</span>
                </div>
                {profile?.role === 'child' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Klassenstufe:</span>
                    <span>Klasse {profile?.grade || 1}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Start */}
        {profile?.role === 'child' && (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Bereit für Mathe?</h3>
                <p className="text-muted-foreground text-sm">
                  Starte eine neue Übungsrunde und verdiene Handyzeit!
                </p>
              </div>
              <Button 
                onClick={() => onStartGame(profile?.grade || 1)} 
                variant="game" 
                className="w-full h-12"
              >
                🎯 Spiel starten (Klasse {profile?.grade || 1})
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Family Linking for Children */}
        {profile?.role === 'child' && (
          <ChildLinking userId={user.id} />
        )}

        {/* Screen Time Widget */}
        <ScreenTimeWidget />

        {/* Parent Dashboard */}
        {profile?.role === 'parent' && (
          <ParentDashboard userId={user.id} />
        )}
      </div>
    </div>
  );
}