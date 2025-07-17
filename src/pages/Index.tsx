
import React, { useState } from 'react';
import { GradeSelector } from '@/components/GradeSelector';
import { CategorySelector } from '@/components/CategorySelector';
import { CategoryMathProblem } from '@/components/CategoryMathProblem';
import { AuthForm } from '@/components/auth/AuthForm';
import { UserProfile } from '@/components/auth/UserProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Clock, RotateCcw } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'math' | 'german' | 'english' | null>(null);
  const [earnedTime, setEarnedTime] = useState<number>(0);
  const [earnedCategory, setEarnedCategory] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
    setShowSuccess(false);
  };

  const handleCategorySelect = (category: 'math' | 'german' | 'english') => {
    setSelectedCategory(category);
  };

  const handleStartGame = (grade: number) => {
    setSelectedGrade(grade);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleSignOut = () => {
    setSelectedGrade(null);
    setSelectedCategory(null);
    setShowSuccess(false);
    setEarnedTime(0);
    setEarnedCategory('');
  };

  const handleProblemComplete = (minutes: number, category: string) => {
    setEarnedTime(minutes);
    setEarnedCategory(category);
    setShowSuccess(true);
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedGrade) {
      setSelectedGrade(null);
    }
    setShowSuccess(false);
  };

  const handleBackToGradeSelection = () => {
    setSelectedCategory(null);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'math': return 'Mathematik';
      case 'german': return 'Deutsch';
      case 'english': return 'Englisch';
      default: return 'Lernen';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'math': return '🔢';
      case 'german': return '📚';
      case 'english': return '🇬🇧';
      default: return '📖';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">App wird geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth form if no user and auth is requested
  if (!user && showAuth) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Show user profile if user is logged in and no game is active
  if (user && !selectedGrade && !showSuccess) {
    return (
      <UserProfile 
        user={user} 
        onSignOut={handleSignOut} 
        onStartGame={handleStartGame} 
      />
    );
  }

  // Success screen when earning time
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-card">
          <CardContent className="p-8 text-center">
            <div className="text-8xl mb-6 animate-celebrate">🎉</div>
            <h1 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent mb-4">
              Fantastisch!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Du hast erfolgreich zusätzliche Handyzeit verdient!
            </p>
            
            <div className="bg-gradient-success text-success-foreground p-6 rounded-lg mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6" />
                <span className="text-lg font-semibold">
                  {getCategoryEmoji(earnedCategory)} {getCategoryName(earnedCategory)}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">
                +{earnedTime} Minuten
              </div>
              <div className="text-sm opacity-90">
                Bildschirmzeit verdient!
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleBack} variant="default" className="w-full">
                {user ? 'Zurück zum Profil' : 'Neue Runde starten'}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                {user ? 'Zeit wurde zu deinem Konto hinzugefügt! 📱⏰' : 'Erstelle ein Konto um deine Zeit zu speichern!'}
              </div>
              
              {!user && (
                <Button onClick={() => setShowAuth(true)} variant="outline" className="w-full">
                  Konto erstellen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show math problems if grade and category are selected
  if (selectedGrade && selectedCategory) {
    return (
      <CategoryMathProblem 
        grade={selectedGrade}
        category={selectedCategory}
        onBack={handleBackToGradeSelection}
        onComplete={handleProblemComplete}
        userId={user?.id}
      />
    );
  }

  // Show category selector if grade is selected but not category
  if (selectedGrade) {
    return (
      <CategorySelector
        grade={selectedGrade}
        onCategorySelect={handleCategorySelect}
        onBack={handleBack}
      />
    );
  }

  // Grade selector (default) - shown for non-logged in users
  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            MathTime 📱⏰
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Löse Lernaufgaben und verdiene Handyzeit!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setShowAuth(true)} variant="default" size="lg">
              Anmelden / Registrieren
            </Button>
            <Button onClick={() => setSelectedGrade(3)} variant="outline" size="lg">
              Ohne Konto spielen (Demo)
            </Button>
          </div>
        </div>
        
        <Card className="max-w-md mx-auto shadow-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-3">📚</div>
            <h3 className="font-semibold mb-2">Neue Lernkategorien!</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>🔢 Mathematik - Rechnen und Zahlen</li>
              <li>📚 Deutsch - Sprache und Wörter</li>
              <li>🇬🇧 Englisch - English vocabulary</li>
              <li>✅ Individuelle Belohnungszeiten</li>
              <li>✅ Fortschritt wird gespeichert</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
