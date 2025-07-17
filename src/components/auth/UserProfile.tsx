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
import { ChildSettingsMenu } from '@/components/ChildSettingsMenu';
import { ParentSettingsMenu } from '@/components/ParentSettingsMenu';

interface UserProfileProps {
  user: any;
  onSignOut: () => void;
  onStartGame: (grade: number) => void;
}

export function UserProfile({ user, onSignOut, onStartGame }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
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
      } else {
        setProfile(data);
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

  // Show settings menu for children
  if (profile?.role === 'child' && showSettingsMenu) {
    return (
      <ChildSettingsMenu 
        user={user} 
        profile={profile} 
        onSignOut={onSignOut} 
        onBack={() => setShowSettingsMenu(false)} 
      />
    );
  }

  // Show settings menu for parents
  if (profile?.role === 'parent' && showSettingsMenu) {
    return (
      <ParentSettingsMenu 
        user={user} 
        profile={profile} 
        onSignOut={onSignOut} 
        onBack={() => setShowSettingsMenu(false)} 
      />
    );
  }

  // Child Dashboard
  if (profile?.role === 'child') {
    return (
      <div className="min-h-screen bg-gradient-bg p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Baby className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Hallo, {profile?.name || 'Nutzer'}!
                    </CardTitle>
                    <Badge variant="outline">
                      Klasse {profile?.grade || 1}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSettingsMenu(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-primary">{totalTimeEarned}</div>
                <div className="text-xs text-muted-foreground">Min. verdient</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Award className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="text-xl font-bold text-secondary">{gamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Spiele</div>
              </CardContent>
            </Card>
          </div>

          {/* Game Start */}
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
        </div>
      </div>
    );
  }

  // Parent Dashboard
  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Willkommen, {profile?.name || 'Nutzer'}!
                  </CardTitle>
                  <Badge variant="secondary">Elternteil</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSettingsMenu(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Screen Time Widget */}
        <ScreenTimeWidget />

        {/* Parent Dashboard */}
        <ParentDashboard userId={user.id} />
      </div>
    </div>
  );
}