
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFamilyLinking } from '@/hooks/useFamilyLinking';
import { supabase } from '@/lib/supabase';
import { GradeManagement } from '@/components/GradeManagement';
import { Loader2, Save, Plus, Copy, Users, Key, Trash2, RefreshCw, Settings, Calendar, Clock, ArrowLeft, BookOpen, GraduationCap, Languages, Globe, FlaskConical, Atom, Leaf, Columns3, User } from 'lucide-react';

interface ParentSettings {
  weekday_max_minutes: number;
  weekend_max_minutes: number;
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

interface ChildSettings {
  id?: string;
  child_id: string;
  weekday_max_minutes: number;
  weekend_max_minutes: number;
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

interface ParentSettingsMenuProps {
  userId: string;
  onBack?: () => void;
}

export function ParentSettingsMenu({ userId, onBack }: ParentSettingsMenuProps) {
  const [settings, setSettings] = useState<ParentSettings>({
    weekday_max_minutes: 30,
    weekend_max_minutes: 60,
    math_minutes_per_task: 2,
    german_minutes_per_task: 2,
    english_minutes_per_task: 2,
    geography_minutes_per_task: 2,
    history_minutes_per_task: 2,
    physics_minutes_per_task: 2,
    biology_minutes_per_task: 2,
    chemistry_minutes_per_task: 2,
    latin_minutes_per_task: 2,
  });
  const [childSettings, setChildSettings] = useState<ChildSettings[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [newCodeLoading, setNewCodeLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const { toast } = useToast();
  const {
    invitationCodes,
    linkedChildren,
    loadFamilyData,
    generateInvitationCode,
    removeChildLink,
  } = useFamilyLinking();

  useEffect(() => {
    loadSettings();
    loadFamilyData(userId);
    loadProfileName();
  }, [userId]);

  useEffect(() => {
    loadChildSettings();
  }, [linkedChildren]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parent_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setSettings({
          weekday_max_minutes: data.weekday_max_minutes,
          weekend_max_minutes: data.weekend_max_minutes,
          math_minutes_per_task: data.math_minutes_per_task,
          german_minutes_per_task: data.german_minutes_per_task,
          english_minutes_per_task: data.english_minutes_per_task,
          geography_minutes_per_task: data.geography_minutes_per_task,
          history_minutes_per_task: data.history_minutes_per_task,
          physics_minutes_per_task: data.physics_minutes_per_task,
          biology_minutes_per_task: data.biology_minutes_per_task,
          chemistry_minutes_per_task: data.chemistry_minutes_per_task,
          latin_minutes_per_task: data.latin_minutes_per_task,
        });
      } else {
        // No settings found, save current defaults to database
        console.log('🔧 No parent settings found, creating defaults');
        await saveInitialSettings();
      }
    } catch (error: any) {
      console.error('❌ Error loading parent settings:', error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInitialSettings = async () => {
    try {
      const { error } = await supabase
        .from('parent_settings')
        .insert({
          user_id: userId,
          weekday_max_minutes: settings.weekday_max_minutes,
          weekend_max_minutes: settings.weekend_max_minutes,
          math_minutes_per_task: settings.math_minutes_per_task,
          german_minutes_per_task: settings.german_minutes_per_task,
          english_minutes_per_task: settings.english_minutes_per_task,
          geography_minutes_per_task: settings.geography_minutes_per_task,
          history_minutes_per_task: settings.history_minutes_per_task,
          physics_minutes_per_task: settings.physics_minutes_per_task,
          biology_minutes_per_task: settings.biology_minutes_per_task,
          chemistry_minutes_per_task: settings.chemistry_minutes_per_task,
          latin_minutes_per_task: settings.latin_minutes_per_task,
        });

      if (error) throw error;
      console.log('✅ Initial parent settings created successfully');
    } catch (error) {
      console.error('❌ Error creating initial parent settings:', error);
    }
  };

  const loadChildSettings = async () => {
    if (linkedChildren.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('child_settings')
        .select('*')
        .eq('parent_id', userId);

      if (error) throw error;

      const settingsMap = new Map(data?.map(s => [s.child_id, s]) || []);
      
      const allChildSettings = linkedChildren.map(child => {
        const existing = settingsMap.get(child.id);
        return existing || {
          child_id: child.id,
          weekday_max_minutes: settings.weekday_max_minutes,
          weekend_max_minutes: settings.weekend_max_minutes,
          math_minutes_per_task: settings.math_minutes_per_task,
          german_minutes_per_task: settings.german_minutes_per_task,
          english_minutes_per_task: settings.english_minutes_per_task,
          geography_minutes_per_task: settings.geography_minutes_per_task,
          history_minutes_per_task: settings.history_minutes_per_task,
          physics_minutes_per_task: settings.physics_minutes_per_task,
          biology_minutes_per_task: settings.biology_minutes_per_task,
          chemistry_minutes_per_task: settings.chemistry_minutes_per_task,
          latin_minutes_per_task: settings.latin_minutes_per_task,
        };
      });

      setChildSettings(allChildSettings);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Kind-Einstellungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('parent_settings')
        .upsert({
          user_id: userId,
          weekday_max_minutes: settings.weekday_max_minutes,
          weekend_max_minutes: settings.weekend_max_minutes,
          math_minutes_per_task: settings.math_minutes_per_task,
          german_minutes_per_task: settings.german_minutes_per_task,
          english_minutes_per_task: settings.english_minutes_per_task,
          geography_minutes_per_task: settings.geography_minutes_per_task,
          history_minutes_per_task: settings.history_minutes_per_task,
          physics_minutes_per_task: settings.physics_minutes_per_task,
          biology_minutes_per_task: settings.biology_minutes_per_task,
          chemistry_minutes_per_task: settings.chemistry_minutes_per_task,
          latin_minutes_per_task: settings.latin_minutes_per_task,
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich gespeichert",
        description: "Ihre Einstellungen wurden aktualisiert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveChildSettings = async () => {
    try {
      setSaving(true);
      
      for (const childSetting of childSettings) {
        const { error } = await supabase
          .from('child_settings')
          .upsert({
            parent_id: userId,
            child_id: childSetting.child_id,
            weekday_max_minutes: childSetting.weekday_max_minutes,
            weekend_max_minutes: childSetting.weekend_max_minutes,
            math_minutes_per_task: childSetting.math_minutes_per_task,
            german_minutes_per_task: childSetting.german_minutes_per_task,
            english_minutes_per_task: childSetting.english_minutes_per_task,
            geography_minutes_per_task: childSetting.geography_minutes_per_task,
            history_minutes_per_task: childSetting.history_minutes_per_task,
            physics_minutes_per_task: childSetting.physics_minutes_per_task,
            biology_minutes_per_task: childSetting.biology_minutes_per_task,
            chemistry_minutes_per_task: childSetting.chemistry_minutes_per_task,
            latin_minutes_per_task: childSetting.latin_minutes_per_task,
          });

        if (error) throw error;
      }

      toast({
        title: "Erfolgreich gespeichert",
        description: "Kind-Einstellungen wurden aktualisiert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Kind-Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadProfileName = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data?.name) {
        setProfileName(data.name);
      }
    } catch (error) {
      console.error('Error loading profile name:', error);
    }
  };

  const saveProfileName = async () => {
    if (!profileName.trim()) return;

    try {
      setLoadingProfile(true);

      const { error } = await supabase
        .from('profiles')
        .update({ name: profileName.trim() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profil aktualisiert",
        description: "Ihr Name wurde erfolgreich gespeichert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Name konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPasswordChanging(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich aktualisiert.",
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Passwort konnte nicht geändert werden.",
        variant: "destructive",
      });
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleGenerateCode = async () => {
    setNewCodeLoading(true);
    await generateInvitationCode(userId);
    setNewCodeLoading(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code kopiert!",
      description: "Der Einladungscode wurde in die Zwischenablage kopiert.",
    });
  };

  const handleRemoveChild = async (childId: string) => {
    const success = await removeChildLink(userId, childId);
    if (success) {
      loadFamilyData(userId);
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Abgelaufen';
    
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 60) return `${diffMin} Min`;
    
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ${diffMin % 60}min`;
  };

  const activeCodes = invitationCodes.filter(code => 
    !code.is_used && new Date(code.expires_at) > new Date()
  );

  const updateChildSetting = (childId: string, field: keyof ChildSettings, value: number) => {
    setChildSettings(prev => prev.map(setting => 
      setting.child_id === childId 
        ? { ...setting, [field]: value }
        : setting
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const subjects = [
    { key: 'math', name: 'Mathematik', icon: BookOpen },
    { key: 'german', name: 'Deutsch', icon: Languages },
    { key: 'english', name: 'Englisch', icon: GraduationCap },
    { key: 'geography', name: 'Geographie', icon: Globe },
    { key: 'history', name: 'Geschichte', icon: Clock },
    { key: 'physics', name: 'Physik', icon: Atom },
    { key: 'biology', name: 'Biologie', icon: Leaf },
    { key: 'chemistry', name: 'Chemie', icon: FlaskConical },
    { key: 'latin', name: 'Latein', icon: Columns3 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        )}
        <h1 className="text-2xl font-bold">Einstellungen</h1>
      </div>

      <Tabs defaultValue="family" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="family">Familie</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
          <TabsTrigger value="codes">Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="family" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Familienverwaltung
              </CardTitle>
              <CardDescription>
                Verwalten Sie Ihre verknüpften Kinder
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkedChildren.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Kinder verknüpft. Erstellen Sie einen Einladungscode im "Codes" Tab.
                </p>
              ) : (
                <div className="space-y-4">
                  {linkedChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{child.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Klasse {child.grade}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Verknüpft</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChild(child.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil bearbeiten
              </CardTitle>
              <CardDescription>
                Namen und Profilbild anpassen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Ihr Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="profile-name"
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ihr Name"
                  />
                  <Button
                    onClick={saveProfileName}
                    disabled={loadingProfile || !profileName.trim()}
                    size="sm"
                  >
                    {loadingProfile ? "Speichert..." : "Speichern"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Passwort ändern
              </CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihr Konto-Passwort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                />
              </div>
              
              <Button 
                onClick={changePassword} 
                disabled={passwordChanging || !newPassword || !confirmPassword}
                className="w-full"
              >
                {passwordChanging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ändern...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Passwort ändern
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Einladungscodes verwalten
              </CardTitle>
              <CardDescription>
                Erstellen Sie Codes zum Verknüpfen neuer Kinder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerateCode}
                disabled={newCodeLoading}
                className="w-full"
              >
                {newCodeLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Erstelle Code...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Neuen Einladungscode erstellen
                  </>
                )}
              </Button>

              {activeCodes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Aktive Codes</h4>
                    {activeCodes.map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="font-mono text-lg font-bold">{code.code}</div>
                          <div className="text-sm text-muted-foreground">
                            Läuft ab in: {formatTimeRemaining(code.expires_at)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Kopieren
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
