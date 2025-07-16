import React, { useState } from 'react';
import { GradeSelector } from '@/components/GradeSelector';
import { MathProblem } from '@/components/MathProblem';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, RotateCcw } from 'lucide-react';

const Index = () => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [earnedTime, setEarnedTime] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
    setShowSuccess(false);
  };

  const handleProblemComplete = (minutes: number) => {
    setEarnedTime(prev => prev + minutes);
    setShowSuccess(true);
    setTimeout(() => {
      setSelectedGrade(null);
      setShowSuccess(false);
    }, 3000);
  };

  const handleBack = () => {
    setSelectedGrade(null);
    setShowSuccess(false);
  };

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
                <span className="text-lg font-semibold">Neue Handyzeit</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                +{earnedTime > 0 ? earnedTime : 15} Minuten
              </div>
              <div className="text-sm opacity-90">
                Gesamt verdient heute: {earnedTime} Minuten
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                variant="default" 
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Nochmal spielen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show math problems if grade is selected
  if (selectedGrade) {
    return (
      <MathProblem 
        grade={selectedGrade} 
        onBack={handleBack}
        onComplete={handleProblemComplete}
      />
    );
  }

  // Show grade selector by default
  return <GradeSelector onSelectGrade={handleGradeSelect} />;
};

export default Index;
