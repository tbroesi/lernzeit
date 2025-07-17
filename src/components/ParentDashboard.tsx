import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFamilyLinking } from '@/hooks/useFamilyLinking';
import { Copy, Plus, Trash2, Users, Clock, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParentDashboardProps {
  userId: string;
}

export function ParentDashboard({ userId }: ParentDashboardProps) {
  const {
    loading,
    invitationCodes,
    linkedChildren,
    loadFamilyData,
    generateInvitationCode,
    removeChildLink,
  } = useFamilyLinking();
  
  const [newCodeLoading, setNewCodeLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFamilyData(userId);
  }, [userId]);

  const handleGenerateCode = async () => {
    setNewCodeLoading(true);
    await generateInvitationCode(userId);
    setNewCodeLoading(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code kopiert!",
      description: `Code ${code} wurde in die Zwischenablage kopiert.`,
    });
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return "Abgelaufen";
    if (diffMins < 60) return `${diffMins} Min`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  const activeInvitationCodes = invitationCodes.filter(
    code => !code.is_used && new Date(code.expires_at) > new Date()
  );

  const usedInvitationCodes = invitationCodes.filter(code => code.is_used);

  return (
    <div className="space-y-6">
      {/* Generate Invitation Code */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Einladungscode erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Erstellen Sie einen 6-stelligen Code, den Ihr Kind eingeben kann, um sein Konto zu verknüpfen.
          </p>
          <Button 
            onClick={handleGenerateCode}
            disabled={newCodeLoading}
            className="w-full"
            variant="default"
          >
            {newCodeLoading ? (
              "Code wird erstellt..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Neuen Code erstellen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Invitation Codes */}
      {activeInvitationCodes.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Aktive Einladungscodes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeInvitationCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-primary/5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-primary">
                      {code.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Läuft ab in: {formatTimeRemaining(code.expires_at)}
                  </div>
                </div>
                <Badge variant="default">Aktiv</Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              💡 Geben Sie diesen Code an Ihr Kind weiter, damit es sein Konto verknüpfen kann.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Linked Children */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Verknüpfte Kinder ({linkedChildren.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedChildren.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Noch keine Kinder verknüpft.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Erstellen Sie einen Einladungscode, damit Ihr Kind sein Konto verbinden kann.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedChildren.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
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
                      onClick={() => removeChildLink(userId, child.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Used Codes History */}
      {usedInvitationCodes.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Verwendete Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usedInvitationCodes.slice(0, 3).map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <span className="font-mono">{code.code}</span>
                  <Badge variant="outline">Verwendet</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}