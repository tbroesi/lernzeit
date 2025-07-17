
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  LogOut, 
  Users, 
  Shield, 
  Clock, 
  ArrowLeft,
  User,
  Trophy,
  Star,
  Target,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ChildLinking } from '@/components/ChildLinking';
import { ScreenTimeWidget } from '@/components/ScreenTimeWidget';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ChildSettingsMenuProps {
  user: any;
  profile: any;
  onSignOut: () => void;
  onBack: () => void;
}

interface ParentInfo {
  id: string;
  name: string;
  email: string;
}

export function ChildSettingsMenu({ user, profile, onSignOut, onBack }: ChildSettingsMenuProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [hasParentLink, setHasParentLink] = useState(false);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [loadingParentInfo, setLoadingParentInfo] = useState(true);
  const [checkingRelationship, setCheckingRelationship] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      checkParentLink();
    }
  }, [user?.id]);

  const checkParentLink = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available');
      setLoadingParentInfo(false);
      return;
    }
    
    setLoadingParentInfo(true);
    setCheckingRelationship(true);
    console.log('🔍 Checking parent link for child:', user.id);
    
    try {
      // Schritt 1: Parent-Child Beziehung suchen
      const { data: relationship, error: relationshipError } = await supabase
        .from('parent_child_relationships')
        .select('parent_id')
        .eq('child_id', user.id)
        .maybeSingle();

      console.log('👥 Relationship query result:', { relationship, relationshipError });

      if (relationshipError) {
        console.error('❌ Error fetching relationship:', relationshipError);
        setHasParentLink(false);
        setParentInfo(null);
        return;
      }

      if (relationship?.parent_id) {
        console.log('✅ Found parent relationship with parent ID:', relationship.parent_id);
        setHasParentLink(true);
        
        // Schritt 2: Eltern-Profil laden
        const { data: parentProfile, error: parentError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', relationship.parent_id)
          .maybeSingle();

        console.log('👨‍👩‍👧‍👦 Parent profile query result:', { parentProfile, parentError });

        if (parentProfile && !parentError) {
          const parentData = {
            id: parentProfile.id,
            name: parentProfile.name || 'Elternteil',
            email: '' // Email ist nicht verfügbar über profiles
          };
          console.log('✅ Setting parent info:', parentData);
          setParentInfo(parentData);
        } else {
          console.error('❌ Error fetching parent profile:', parentError);
          setParentInfo({
            id: relationship.parent_id,
            name: 'Elternteil',
            email: ''
          });
        }
      } else {
        console.log('❌ No parent relationship found');
        setHasParentLink(false);
        setParentInfo(null);
      }
    } catch (error) {
      console.error('❌ Unexpected error in checkParentLink:', error);
      setHasParentLink(false);
      setParentInfo(null);
      
      toast({
        title: "Fehler",
        description: "Verbindungsstatus konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingParentInfo(false);
      setCheckingRelationship(false);
    }
  };

  const handleUnlinkParent = async () => {
    if (!parentInfo || !user?.id) return;
    
    try {
      console.log('🔥 Unlinking parent:', parentInfo.id, 'from child:', user.id);
      
      const { error } = await supabase
        .from('parent_child_relationships')
        .delete()
        .eq('child_id', user.id)
        .eq('parent_id', parentInfo.id);

      if (error) {
        console.error('❌ Error unlinking parent:', error);
        throw error;
      }

      console.log('✅ Successfully unlinked parent');
      setHasParentLink(false);
      setParentInfo(null);
      
      toast({
        title: "Verknüpfung entfernt",
        description: "Die Verbindung zu deinen Eltern wurde getrennt.",
      });
    } catch (error: any) {
      console.error('❌ Error in handleUnlinkParent:', error);
      toast({
        title: "Fehler",
        description: "Verknüpfung konnte nicht entfernt werden.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const refreshParentLink = async () => {
    await checkParentLink();
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Mein Profil',
      description: 'Deine Kontoinformationen',
      icon: User,
      color: 'text-primary',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'screen-time',
      title: 'Bildschirmzeit',
      description: 'Sieh deine verfügbare Zeit',
      icon: Clock,
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'family',
      title: 'Eltern-Verknüpfung',
      description: loadingParentInfo ? 'Lade Status...' : (hasParentLink ? 'Verwalte deine Eltern-Verbindung' : 'Verbinde dein Konto mit deinen Eltern'),
      icon: Users,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'achievements',
      title: 'Erfolge',
      description: 'Deine Lernfortschritte',
      icon: Trophy,
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-orange-600'
    }
  ];

  if (activeSection) {
    return (
      <div className="min-h-screen bg-gradient-bg p-4">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setActiveSection(null)}
            className="mb-4 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          
          {activeSection === 'family' && (
            <>
              {loadingParentInfo ? (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      Eltern-Verknüpfung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      <div>
                        <div className="font-medium text-blue-800">Lade Informationen...</div>
                        <div className="text-sm text-blue-600">Verbindung wird überprüft</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : hasParentLink && parentInfo ? (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      Eltern-Verknüpfung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-green-800">Mit Eltern verknüpft</div>
                        <div className="text-sm text-green-600">
                          Verbunden mit: {parentInfo.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Was bedeutet das?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Deine Eltern können deine Lernfortschritte sehen</li>
                        <li>• Sie können deine Bildschirmzeit verwalten</li>
                        <li>• Du bekommst automatisch Zeit für gelöste Aufgaben</li>
                        <li>• Deine Eltern können Einstellungen anpassen</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={refreshParentLink}
                        variant="outline"
                        className="w-full"
                        disabled={checkingRelationship}
                      >
                        {checkingRelationship ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Überprüfe...
                          </>
                        ) : (
                          'Status aktualisieren'
                        )}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        onClick={handleUnlinkParent}
                        className="w-full"
                        disabled={checkingRelationship}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Verknüpfung trennen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ChildLinking 
                  userId={user.id} 
                  onLinked={() => {
                    console.log('✅ Child linked successfully, refreshing parent info');
                    checkParentLink();
                    setActiveSection(null);
                  }}
                />
              )}
            </>
          )}
          
          {activeSection === 'screen-time' && (
            <ScreenTimeWidget />
          )}
          
          {activeSection === 'profile' && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Mein Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">E-Mail:</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{profile?.name || 'Nicht gesetzt'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Klassenstufe:</span>
                    <span className="text-sm font-medium">Klasse {profile?.grade || 1}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-sm font-medium">
                      {loadingParentInfo ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Prüfe...
                        </span>
                      ) : hasParentLink ? (
                        '👨‍👩‍👧‍👦 Mit Eltern verknüpft' 
                      ) : (
                        '🔓 Unabhängig'
                      )}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Klassenstufe kann nur von Eltern geändert werden
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeSection === 'achievements' && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  Deine Erfolge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div>
                      <div className="font-medium">Lern-Einsteiger</div>
                      <div className="text-sm text-muted-foreground">Erste Aufgabe gelöst!</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg opacity-50">
                    <Target className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-muted-foreground">Mathe-Meister</div>
                      <div className="text-sm text-muted-foreground">10 Mathe-Aufgaben lösen</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg opacity-50">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-muted-foreground">Zeit-Sammler</div>
                      <div className="text-sm text-muted-foreground">100 Minuten sammeln</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-medium text-blue-900">Weiter so!</div>
                    <div className="text-sm text-blue-700">Du bist auf einem guten Weg!</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
                <div>
                  <CardTitle className="text-xl">⚙️ Einstellungen</CardTitle>
                  <p className="text-sm text-muted-foreground">Verwalte dein Konto</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={item.id} 
                className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setActiveSection(item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.id === 'family' && hasParentLink && (
                        <div className="flex items-center gap-1 mt-1">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">Verknüpft</span>
                        </div>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {item.id === 'family' && loadingParentInfo && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {item.id !== 'family' || !loadingParentInfo ? '→' : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full h-12 text-lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Abmelden
            </Button>
          </CardContent>
        </Card>

        {/* Fun Footer */}
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🚀</div>
          <p className="text-sm text-muted-foreground">
            Bleib motiviert und sammle weiter Lernzeit!
          </p>
        </div>
      </div>
    </div>
  );
}
