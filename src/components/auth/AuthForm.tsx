import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Shield, Heart, Mail, Lock, User, GraduationCap, Sparkles, BookOpen } from 'lucide-react';

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
          },
          emailRedirectTo: `${window.location.origin}/`
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
        description: `Du bist erfolgreich angemeldet.`,
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
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full animate-pulse blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full animate-pulse blur-3xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-accent/30 rounded-full animate-pulse blur-xl" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with logo animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-3xl mb-4 shadow-lg animate-scale-in">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            LernZeit
          </h1>
          <p className="text-muted-foreground text-lg">
            Dein persönlicher Lern-Assistent
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Löse Aufgaben und verdiene Handyzeit</span>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>

        <Card className="shadow-card backdrop-blur-sm bg-card/95 border-0 animate-slide-up">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-background">Anmelden</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-background">Registrieren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-5 animate-fade-in">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Willkommen zurück!</h3>
                  <p className="text-sm text-muted-foreground">Melde dich an und setze dein Lernabenteuer fort</p>
                </div>
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="deine-email@beispiel.de"
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Wird angemeldet...
                      </div>
                    ) : (
                      'Anmelden'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-5 animate-fade-in">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Konto erstellen</h3>
                  <p className="text-sm text-muted-foreground">Starte dein Lernabenteuer und verdiene Handyzeit</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Dein Name"
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Ich bin ein...</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as 'parent' | 'child')}>
                      <div className="space-y-2">
                        <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${role === 'child' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                          <RadioGroupItem value="child" id="child" className="border-2" />
                          <Label htmlFor="child" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">Kind</div>
                              <div className="text-xs text-muted-foreground">Lerne und verdiene Handyzeit</div>
                            </div>
                          </Label>
                        </div>
                        <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${role === 'parent' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                          <RadioGroupItem value="parent" id="parent" className="border-2" />
                          <Label htmlFor="parent" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">Elternteil</div>
                              <div className="text-xs text-muted-foreground">Verwalte die Lernzeit deiner Kinder</div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {role === 'child' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="grade" className="text-sm font-medium">Klassenstufe</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <select 
                          value={grade}
                          onChange={(e) => setGrade(Number(e.target.value))}
                          className="w-full pl-10 h-12 border-2 rounded-lg bg-background focus:border-primary transition-colors appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(g => (
                            <option key={g} value={g}>Klasse {g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-signup" className="text-sm font-medium">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email-signup"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="deine-email@beispiel.de"
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Du erhältst eine Bestätigungs-E-Mail
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password-signup" className="text-sm font-medium">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Mindestens 6 Zeichen</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Wird erstellt...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Konto erstellen
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground animate-fade-in">
          <p>🔒 Deine Daten sind sicher und werden verschlüsselt übertragen</p>
        </div>
      </div>
    </div>
  );
}