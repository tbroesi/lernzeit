
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
import { useChildSettings } from '@/hooks/useChildSettings';
import { useAchievements } from '@/hooks/useAchievements';

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
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [loadingParentInfo, setLoadingParentInfo] = useState(true);
  const [checkingRelationship, setCheckingRelationship] = useState(false);
  const { toast } = useToast();
  
  // Use the existing useChildSettings hook 
  const { settings, loading: settingsLoading } = useChildSettings(user?.id || '');
  const { userAchievements, getCompletedAchievements, getTotalRewardMinutes, loading: achievementsLoading } = useAchievements(user?.id);

  useEffect(() => {
    if (user?.id && !settingsLoading) {
      loadParentInfo();
    }
  }, [user?.id, settingsLoading]);

  const loadParentInfo = async () => {
    if (!user?.id) {
      console.log('❌ No user ID provided');
      setLoadingParentInfo(false);
      setParentInfo(null);
      return;
    }
    
    setLoadingParentInfo(true);
    console.log('🔍 Loading parent info for child:', user.id);
    
    try {
      // Get parent-child relationship to find parent ID
      const { data: relationship, error: relationshipError } = await supabase
        .from('parent_child_relationships')
        .select('parent_id')
        .eq('child_id', user.id)
        .maybeSingle();

      console.log('👥 Relationship query result:', { relationship, relationshipError });

      if (relationshipError) {
        console.error('❌ Error fetching relationship:', relationshipError);
        setParentInfo(null);
        return;
      }

      if (relationship?.parent_id) {
        console.log('✅ Found parent relationship with parent ID:', relationship.parent_id);
        
        // Load parent profile
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
            email: ''
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
        setParentInfo(null);
      }
    } catch (error) {
      console.error('❌ Unexpected error in loadParentInfo:', error);
      setParentInfo(null);
      
      toast({
        title: "Fehler",
        description: "Verbindungsstatus konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingParentInfo(false);
    }
  };

  // Determine if there's a parent link based on parentInfo (not settings)
  const hasParentLink = parentInfo !== null;

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
    setCheckingRelationship(true);
    await loadParentInfo();
    setCheckingRelationship(false);
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
      description: (settingsLoading || loadingParentInfo) ? 'Lade Status...' : (hasParentLink ? 'Verwalte deine Eltern-Verbindung' : 'Verbinde dein Konto mit deinen Eltern'),
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
              {settingsLoading || loadingParentInfo ? (
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
                <div className="space-y-6">
                  {/* Current Parent Link Display */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        Aktuelle Verknüpfung
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                  {/* New Link Option */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Neue Verknüpfung erstellen</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Falls du dich mit einem anderen Elternteil verknüpfen möchtest
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ChildLinking 
                        userId={user.id} 
                        onLinked={() => {
                          console.log('✅ Child linked successfully, refreshing parent info');
                          loadParentInfo();
                          setActiveSection(null);
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <ChildLinking 
                  userId={user.id} 
                  onLinked={() => {
                    console.log('✅ Child linked successfully, refreshing parent info');
                    loadParentInfo();
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
                {achievementsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Lade deine Erfolge...</p>
                  </div>
                ) : (
                  <>
                    {/* Achievement Statistics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-800">
                          {getCompletedAchievements().length}
                        </div>
                        <div className="text-sm text-green-700">Erfolge erreicht</div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-800">
                          {getTotalRewardMinutes()}
                        </div>
                        <div className="text-sm text-purple-700">Bonus-Minuten</div>
                      </div>
                    </div>

                    {/* Achievement Categories */}
                    <div className="space-y-6">
                      {['math', 'german', 'english', 'general'].map(category => {
                        const categoryAchievements = userAchievements.filter(ach => ach.category === category);
                        const categoryName = {
                          'math': 'Mathematik 🧮',
                          'german': 'Deutsch 📚',
                          'english': 'English 🇬🇧',
                          'general': 'Allgemein 🎯'
                        }[category];

                        if (categoryAchievements.length === 0) return null;

                        return (
                          <div key={category}>
                            <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                              {categoryName}
                            </h4>
                            <div className="space-y-2">
                              {categoryAchievements.map((achievement) => (
                                <div 
                                  key={achievement.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    achievement.is_completed 
                                      ? 'bg-muted/30 border-primary/20' 
                                      : 'bg-muted/10 border-muted/30 opacity-60'
                                  }`}
                                  style={achievement.is_completed ? { 
                                    borderLeftColor: achievement.color,
                                    borderLeftWidth: '3px'
                                  } : {}}
                                >
                                  <div className="text-2xl">{achievement.icon}</div>
                                  <div className="flex-1">
                                    <div className={`font-medium ${achievement.is_completed ? '' : 'text-muted-foreground'}`}>
                                      {achievement.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {achievement.description}
                                    </div>
                                    {!achievement.is_completed && achievement.current_progress !== undefined && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Fortschritt: {achievement.current_progress} / {achievement.requirement_value}
                                      </div>
                                    )}
                                    {achievement.is_completed && achievement.reward_minutes > 0 && (
                                      <div className="text-xs font-medium text-primary mt-1">
                                        +{achievement.reward_minutes} Minuten Belohnung!
                                      </div>
                                    )}
                                  </div>
                                  {achievement.is_completed && (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <Star className="w-4 h-4 text-white fill-current" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {userAchievements.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <div className="font-medium mb-2">Noch keine Erfolge</div>
                        <div className="text-sm text-muted-foreground">
                          Löse deine ersten Aufgaben, um Erfolge zu sammeln!
                        </div>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-medium text-blue-900">Weiter so!</div>
                        <div className="text-sm text-blue-700">
                          {getCompletedAchievements().length > 0 
                            ? `Du hast bereits ${getCompletedAchievements().length} Erfolge erreicht!`
                            : 'Du bist auf einem guten Weg!'
                          }
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                      {item.id === 'family' && hasParentLink && !loadingParentInfo && (
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
