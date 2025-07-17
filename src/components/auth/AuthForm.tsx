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
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('child');
  const [grade, setGrade] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            grade: role === 'child' ? grade : null,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Konto erstellt!",
        description: "Bitte überprüfe deine E-Mail für die Bestätigung.",
      });

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Willkommen zurück!",
        description: "Du bist erfolgreich angemeldet.",
      });

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
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
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
                </div>
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