import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, UserPlus, Shield, Heart } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('child');
  const [grade, setGrade] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'username'>('username');
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Für Username-Modus generieren wir eine konsistente E-Mail
      const authEmail = authMode === 'username' 
        ? `${username}@mathtime.internal` 
        : email;

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            name: name || username,
            role,
            grade: role === 'child' ? grade : null,
            username: authMode === 'username' ? username : undefined,
            auth_mode: authMode,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      if (authMode === 'username') {
        toast({
          title: "Konto erstellt!",
          description: `Willkommen ${username}! Du kannst dich jetzt anmelden.`,
        });
      } else {
        toast({
          title: "Konto erstellt!",
          description: "Bitte überprüfe deine E-Mail für die Bestätigung.",
        });
      }

      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Für Username-Modus verwenden wir die gleiche Domain wie bei der Registrierung
      const authEmail = authMode === 'username' 
        ? `${username}@mathtime.internal` 
        : email;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (error) throw error;

      const displayName = authMode === 'username' ? username : email;
      toast({
        title: "Willkommen zurück!",
        description: `Hallo ${displayName}! Du bist angemeldet.`,
      });

      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: authMode === 'username' 
          ? "Nutzername oder Passwort falsch." 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            MathTime 📱⏰
          </CardTitle>
          <p className="text-muted-foreground">
            Dein persönlicher Mathe-Assistent
          </p>
        </CardHeader>
        <CardContent>
          {/* Auth Mode Selector */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setAuthMode('username')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'username'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                👤 Nutzername
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'email'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📧 E-Mail
              </button>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {authMode === 'email' ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="deine-email@beispiel.de"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="username">Nutzername</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="dein-nutzername"
                      pattern="[a-zA-Z0-9_-]+"
                      title="Nur Buchstaben, Zahlen, _ und - erlaubt"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  variant="default"
                >
                  {loading ? 'Wird angemeldet...' : 'Anmelden'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Dein Name"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Ich bin ein...</Label>
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as 'parent' | 'child')}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="child" id="child" />
                      <Label htmlFor="child" className="flex items-center gap-2 cursor-pointer">
                        <Heart className="w-4 h-4 text-primary" />
                        Kind
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="parent" id="parent" />
                      <Label htmlFor="parent" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-4 h-4 text-secondary" />
                        Elternteil
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {role === 'child' && (
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
                )}
                
                {authMode === 'email' ? (
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">E-Mail</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="deine-email@beispiel.de"
                    />
                    <p className="text-xs text-muted-foreground">
                      📧 Du erhältst eine Bestätigungs-E-Mail
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="username-signup">Nutzername</Label>
                    <Input
                      id="username-signup"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="dein-nutzername"
                      pattern="[a-zA-Z0-9_-]+"
                      title="Nur Buchstaben, Zahlen, _ und - erlaubt"
                    />
                    <p className="text-xs text-muted-foreground">
                      🚀 Schnelle Anmeldung ohne E-Mail!
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Passwort</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  variant="secondary"
                >
                  {loading ? 'Wird erstellt...' : 'Konto erstellen'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}