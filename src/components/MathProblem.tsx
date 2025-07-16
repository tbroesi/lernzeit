import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface Problem {
  question: string;
  answer: number;
  type: string;
}

interface MathProblemProps {
  grade: number;
  onBack: () => void;
  onComplete: (earnedMinutes: number) => void;
}

const generateProblem = (grade: number): Problem => {
  switch (grade) {
    case 1:
    case 2: {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const isAddition = Math.random() > 0.5;
      if (isAddition) {
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: 'Addition'
        };
      } else {
        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        return {
          question: `${larger} - ${smaller} = ?`,
          answer: larger - smaller,
          type: 'Subtraktion'
        };
      }
    }
    case 3:
    case 4: {
      const operations = ['multiply', 'divide', 'add', 'subtract'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      
      if (operation === 'multiply') {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        return {
          question: `${a} × ${b} = ?`,
          answer: a * b,
          type: 'Multiplikation'
        };
      } else if (operation === 'divide') {
        const answer = Math.floor(Math.random() * 12) + 1;
        const divisor = Math.floor(Math.random() * 10) + 2;
        return {
          question: `${answer * divisor} ÷ ${divisor} = ?`,
          answer: answer,
          type: 'Division'
        };
      } else {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 30) + 5;
        if (operation === 'add') {
          return {
            question: `${a} + ${b} = ?`,
            answer: a + b,
            type: 'Addition'
          };
        } else {
          return {
            question: `${a} - ${b} = ?`,
            answer: a - b,
            type: 'Subtraktion'
          };
        }
      }
    }
    default: {
      const operations = ['add', 'subtract', 'multiply'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      
      if (operation === 'multiply') {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * 15) + 5;
        return {
          question: `${a} × ${b} = ?`,
          answer: a * b,
          type: 'Multiplikation'
        };
      } else if (operation === 'add') {
        const a = Math.floor(Math.random() * 100) + 20;
        const b = Math.floor(Math.random() * 100) + 20;
        return {
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: 'Addition'
        };
      } else {
        const a = Math.floor(Math.random() * 200) + 50;
        const b = Math.floor(Math.random() * 50) + 10;
        return {
          question: `${a} - ${b} = ?`,
          answer: a - b,
          type: 'Subtraktion'
        };
      }
    }
  }
};

export function MathProblem({ grade, onBack, onComplete }: MathProblemProps) {
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(grade));
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const targetQuestions = 5;
  const progress = (correctAnswers / targetQuestions) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Zeit abgelaufen
          onComplete(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(userAnswer);
    
    if (isNaN(answer)) return;
    
    setTotalQuestions(prev => prev + 1);
    
    if (answer === currentProblem.answer) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback('correct');
      
      if (correctAnswers + 1 >= targetQuestions) {
        // Ziel erreicht!
        setTimeout(() => {
          const earnedMinutes = 15 + (streak >= 3 ? 5 : 0); // Bonus für Streak
          onComplete(earnedMinutes);
        }, 1500);
        return;
      }
    } else {
      setStreak(0);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentProblem(generateProblem(grade));
      setUserAnswer('');
    }, 1500);
  };

  if (correctAnswers >= targetQuestions) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-card">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-celebrate">🎉</div>
            <h2 className="text-2xl font-bold text-success mb-4">
              Geschafft!
            </h2>
            <p className="text-muted-foreground mb-6">
              Du hast {correctAnswers} von {targetQuestions} Aufgaben richtig gelöst!
            </p>
            <div className="bg-gradient-success text-success-foreground p-4 rounded-lg mb-6">
              <div className="text-2xl font-bold">
                +{15 + (streak >= 3 ? 5 : 0)} Minuten
              </div>
              <div className="text-sm opacity-90">Handyzeit verdient!</div>
            </div>
            <Button onClick={onBack} variant="default" className="w-full">
              Zurück zur Auswahl
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </Badge>
            
            {streak > 0 && (
              <Badge variant="default" className="flex items-center gap-2 bg-gradient-accent">
                <Star className="w-4 h-4" />
                {streak}x Streak!
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Fortschritt</span>
              <span className="text-sm text-muted-foreground">
                {correctAnswers} / {targetQuestions} korrekt
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Problem Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-center">
              <Badge variant="outline" className="mb-4">
                Klasse {grade} • {currentProblem.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-4xl font-bold mb-6 text-foreground">
                {currentProblem.question}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Deine Antwort..."
                  className="text-center text-2xl h-16 text-lg"
                  autoFocus
                  disabled={feedback !== null}
                />
                
                <Button 
                  type="submit" 
                  variant="game" 
                  size="lg" 
                  className="w-full h-14 text-lg"
                  disabled={!userAnswer || feedback !== null}
                >
                  Antwort prüfen
                </Button>
              </form>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center p-4 rounded-lg ${
                feedback === 'correct' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                <div className="flex items-center justify-center gap-2 text-xl mb-2">
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Richtig!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6" />
                      Falsch! Die richtige Antwort ist {currentProblem.answer}
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Richtig</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Falsch</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}