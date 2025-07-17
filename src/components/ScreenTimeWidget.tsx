import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useScreenTime } from '@/hooks/useScreenTime';
import { Clock, Shield, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ScreenTimeWidget() {
  const { 
    isAvailable, 
    hasPermission, 
    usage, 
    remainingTime, 
    loading,
    requestPermission,
    refreshUsage 
  } = useScreenTime();
  const { toast } = useToast();
  const [timePercentage, setTimePercentage] = useState(0);

  useEffect(() => {
    if (usage) {
      // Calculate percentage of time used (assuming 60 min daily limit)
      const dailyLimit = 60;
      const percentage = Math.min((usage.timeSpent / dailyLimit) * 100, 100);
      setTimePercentage(percentage);
    }
  }, [usage]);

  useEffect(() => {
    // Refresh usage every minute
    const interval = setInterval(() => {
      if (hasPermission) {
        refreshUsage();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [hasPermission, refreshUsage]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Berechtigung erteilt",
        description: "Familienkontrollen wurden erfolgreich aktiviert.",
      });
    } else {
      toast({
        title: "Berechtigung verweigert",
        description: "Familienkontrollen konnten nicht aktiviert werden.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTimeStatus = () => {
    if (!usage) return 'normal';
    if (remainingTime <= 0) return 'exceeded';
    if (remainingTime <= 15) return 'warning';
    return 'normal';
  };

  const getStatusColor = () => {
    const status = getTimeStatus();
    switch (status) {
      case 'exceeded': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Familienkontrollen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Familienkontrollen
          </CardTitle>
          <CardDescription>
            Familienkontrollen sind auf diesem Gerät nicht verfügbar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Diese Funktion erfordert Family Link (Android) oder Bildschirmzeit (iOS).
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Familienkontrollen
          </CardTitle>
          <CardDescription>
            Berechtigung für Familienkontrollen erforderlich
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Um Bildschirmzeit zu verwalten und Berichte zu senden, benötigen wir Zugriff auf die Familienkontrollen.
          </p>
          <Button onClick={handleRequestPermission} className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Berechtigung erteilen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Bildschirmzeit
        </CardTitle>
        <CardDescription>
          Tägliche Nutzung und verbleibende Zeit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usage && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Heute genutzt</span>
                <Badge variant={getStatusColor()}>
                  {formatTime(usage.timeSpent)}
                </Badge>
              </div>
              <Progress value={timePercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Verbleibend
                </div>
                <div className="text-lg font-semibold">
                  {formatTime(remainingTime)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Sitzungen
                </div>
                <div className="text-lg font-semibold">
                  {usage.sessionCount}
                </div>
              </div>
            </div>

            {getTimeStatus() === 'warning' && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Nur noch {formatTime(remainingTime)} übrig!
                </span>
              </div>
            )}

            {getTimeStatus() === 'exceeded' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Tägliches Zeitlimit erreicht
                </span>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Letzte Aktualisierung: {usage.lastUsed.toLocaleTimeString()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}