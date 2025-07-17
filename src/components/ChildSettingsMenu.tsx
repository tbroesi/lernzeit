import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  LogOut, 
  Users, 
  Shield, 
  Clock, 
  ArrowLeft,
  Key
} from 'lucide-react';
import { ChildLinking } from '@/components/ChildLinking';
import { ScreenTimeWidget } from '@/components/ScreenTimeWidget';
import { supabase } from '@/lib/supabase';

interface ChildSettingsMenuProps {
  user: any;
  profile: any;
  onSignOut: () => void;
  onBack: () => void;
}

export function ChildSettingsMenu({ user, profile, onSignOut, onBack }: ChildSettingsMenuProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const menuItems = [
    {
      id: 'family',
      title: 'Mit Eltern verknüpfen',
      description: 'Verbinde dein Konto mit deinen Eltern',
      icon: Users,
      color: 'text-primary'
    },
    {
      id: 'screen-time',
      title: 'Bildschirmzeit',
      description: 'Sieh deine verfügbare Zeit',
      icon: Clock,
      color: 'text-secondary'
    },
    {
      id: 'profile',
      title: 'Profil-Einstellungen',
      description: 'Deine Kontoinformationen',
      icon: Settings,
      color: 'text-accent'
    },
    {
      id: 'family-controls',
      title: 'Familienkontrollen',
      description: 'Sicherheitseinstellungen',
      icon: Shield,
      color: 'text-muted-foreground'
    }
  ];

  if (activeSection) {
    return (
      <div className="min-h-screen bg-gradient-bg p-4">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setActiveSection(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          
          {activeSection === 'family' && (
            <ChildLinking userId={user.id} />
          )}
          
          {activeSection === 'screen-time' && (
            <ScreenTimeWidget />
          )}
          
          {activeSection === 'profile' && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Profil-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">E-Mail:</span>
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-sm">{profile?.name || 'Nicht gesetzt'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Klassenstufe:</span>
                    <span className="text-sm">Klasse {profile?.grade || 1}</span>
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
          
          {activeSection === 'family-controls' && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Familienkontrollen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Familienkontrollen werden von deinen Eltern verwaltet
                  </p>
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
                <CardTitle className="text-xl">Einstellungen</CardTitle>
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
                className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection(item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
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
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}