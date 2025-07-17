import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFamilyLinking } from '@/hooks/useFamilyLinking';
import { RefreshCw, Settings, Users, Clock, TrendingUp } from 'lucide-react';

interface ParentDashboardProps {
  userId: string;
}

export function ParentDashboard({ userId }: ParentDashboardProps) {
  const {
    loading,
    linkedChildren,
    loadFamilyData,
  } = useFamilyLinking();

  // Load family data when component mounts
  useEffect(() => {
    console.log('🔄 ParentDashboard: Loading family data for userId:', userId);
    if (userId) {
      loadFamilyData(userId);
    }
  }, [userId, loadFamilyData]);

  // Event handlers
  const handleRefresh = () => {
    loadFamilyData(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eltern-Dashboard</h1>
          <p className="text-muted-foreground">
            Übersicht über Ihre verknüpften Kinder
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <div className="text-2xl font-bold">{linkedChildren.length}</div>
              <div className="text-sm text-muted-foreground">Verknüpfte Kinder</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold">30</div>
              <div className="text-sm text-muted-foreground">Minuten heute</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm text-muted-foreground">Fortschritt</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kinder verwalten
            </CardTitle>
            <CardDescription>
              Neue Kinder hinzufügen oder bestehende Verbindungen verwalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Zu den Einstellungen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Zeitlimits
            </CardTitle>
            <CardDescription>
              Individuelle Bildschirmzeiten für jedes Kind festlegen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Limits konfigurieren
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Linked Children Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Verknüpfte Kinder</CardTitle>
          <CardDescription>
            Übersicht über alle mit Ihrem Konto verbundenen Kinder
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedChildren.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Noch keine Kinder verknüpft.
              </p>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Kind hinzufügen
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {linkedChildren.map((child) => (
                <Card key={child.id} className="border border-border">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{child.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Klasse {child.grade}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Verknüpft</Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}