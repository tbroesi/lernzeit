import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, X, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useChildSettings } from '@/hooks/useChildSettings';
import { useScreenTimeLimit } from '@/hooks/useScreenTimeLimit';
import { useAchievements, NewAchievement } from '@/hooks/useAchievements';
import { AchievementPopup } from '@/components/AchievementPopup';

interface Problem {
  id: number;
  question: string;
  answer: string | number;
  type: 'math' | 'german' | 'english' | 'geography' | 'history' | 'physics' | 'biology' | 'chemistry' | 'latin';
  explanation?: string;
}

interface CategoryMathProblemProps {
  category: string;
  grade: number;
  onComplete: (timeEarned: number, category: string) => void;
  onBack: () => void;
  userId: string;
}

const generateMathProblem = (grade: number): Problem => {
  if (grade <= 2) {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === '+') {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * (20 - a)) + 1;
      return {
        id: 1,
        question: `${a} + ${b} = ?`,
        answer: a + b,
        type: 'math',
        explanation: `${a} + ${b} = ${a + b}`
      };
    } else {
      const answer = Math.floor(Math.random() * 10) + 1;
      const a = answer + Math.floor(Math.random() * 10) + 1;
      return {
        id: 1,
        question: `${a} - ${a - answer} = ?`,
        answer: answer,
        type: 'math',
        explanation: `${a} - ${a - answer} = ${answer}`
      };
    }
  } else if (grade <= 4) {
    const operations = ['+', '-', '×', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === '+') {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      return {
        id: 1,
        question: `${a} + ${b} = ?`,
        answer: a + b,
        type: 'math',
        explanation: `${a} + ${b} = ${a + b}`
      };
    } else if (op === '-') {
      const b = Math.floor(Math.random() * 50) + 10;
      const a = b + Math.floor(Math.random() * 90) + 10;
      return {
        id: 1,
        question: `${a} - ${b} = ?`,
        answer: a - b,
        type: 'math',
        explanation: `${a} - ${b} = ${a - b}`
      };
    } else if (op === '×') {
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 10) + 2;
      return {
        id: 1,
        question: `${a} × ${b} = ?`,
        answer: a * b,
        type: 'math',
        explanation: `${a} × ${b} = ${a * b}`
      };
    } else {
      const b = Math.floor(Math.random() * 9) + 2;
      const answer = Math.floor(Math.random() * 12) + 2;
      const a = b * answer;
      return {
        id: 1,
        question: `${a} ÷ ${b} = ?`,
        answer: answer,
        type: 'math',
        explanation: `${a} ÷ ${b} = ${answer}`
      };
    }
  } else {
    const operations = ['quadratic', 'percentage', 'fraction'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === 'quadratic') {
      const a = Math.floor(Math.random() * 5) + 2;
      return {
        id: 1,
        question: `${a}² = ?`,
        answer: a * a,
        type: 'math',
        explanation: `${a}² = ${a} × ${a} = ${a * a}`
      };
    } else if (op === 'percentage') {
      const base = [100, 200, 300, 400, 500][Math.floor(Math.random() * 5)];
      const percent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
      return {
        id: 1,
        question: `${percent}% von ${base} = ?`,
        answer: (base * percent) / 100,
        type: 'math',
        explanation: `${percent}% von ${base} = ${base} × ${percent}/100 = ${(base * percent) / 100}`
      };
    } else {
      const numerator = Math.floor(Math.random() * 9) + 1;
      const denominator = Math.floor(Math.random() * 7) + 2;
      const whole = Math.floor(Math.random() * 4) + 1;
      return {
        id: 1,
        question: `${numerator}/${denominator} + ${whole} = ? (als Dezimalzahl)`,
        answer: parseFloat((numerator / denominator + whole).toFixed(2)),
        type: 'math',
        explanation: `${numerator}/${denominator} + ${whole} = ${(numerator / denominator).toFixed(2)} + ${whole} = ${(numerator / denominator + whole).toFixed(2)}`
      };
    }
  }
};

const generateCategoryProblem = (category: string, grade: number): Problem => {
  const problemId = Math.floor(Math.random() * 1000000);
  
  switch (category) {
    case 'Deutsch':
      const germanWords = ['Haus', 'Auto', 'Schule', 'Buch', 'Freund', 'Familie', 'Garten', 'Wasser', 'Sonne', 'Mond'];
      const word = germanWords[Math.floor(Math.random() * germanWords.length)];
      return {
        id: problemId,
        question: `Wie viele Silben hat das Wort "${word}"?`,
        answer: word.toLowerCase().split(/[aeiouäöü]/).length - 1 || 1,
        type: 'german',
        explanation: `Das Wort "${word}" hat ${word.toLowerCase().split(/[aeiouäöü]/).length - 1 || 1} Silbe(n).`
      };
      
    case 'Englisch':
      const englishPairs = [
        { german: 'Haus', english: 'house' },
        { german: 'Auto', english: 'car' },
        { german: 'Schule', english: 'school' },
        { german: 'Buch', english: 'book' },
        { german: 'Freund', english: 'friend' },
        { german: 'Familie', english: 'family' },
        { german: 'Wasser', english: 'water' }
      ];
      const pair = englishPairs[Math.floor(Math.random() * englishPairs.length)];
      return {
        id: problemId,
        question: `Wie heißt "${pair.german}" auf Englisch?`,
        answer: pair.english,
        type: 'english',
        explanation: `"${pair.german}" heißt auf Englisch "${pair.english}".`
      };
      
    case 'Geographie':
      const countries = [
        { country: 'Deutschland', capital: 'Berlin' },
        { country: 'Frankreich', capital: 'Paris' },
        { country: 'Italien', capital: 'Rom' },
        { country: 'Spanien', capital: 'Madrid' },
        { country: 'England', capital: 'London' }
      ];
      const countryPair = countries[Math.floor(Math.random() * countries.length)];
      return {
        id: problemId,
        question: `Was ist die Hauptstadt von ${countryPair.country}?`,
        answer: countryPair.capital,
        type: 'geography',
        explanation: `Die Hauptstadt von ${countryPair.country} ist ${countryPair.capital}.`
      };
      
    case 'Geschichte':
      const historicalDates = [
        { event: 'Fall der Berliner Mauer', year: 1989 },
        { event: 'Erster Weltkrieg begann', year: 1914 },
        { event: 'Entdeckung Amerikas', year: 1492 },
        { event: 'Französische Revolution', year: 1789 }
      ];
      const historical = historicalDates[Math.floor(Math.random() * historicalDates.length)];
      return {
        id: problemId,
        question: `In welchem Jahr war ${historical.event}?`,
        answer: historical.year,
        type: 'history',
        explanation: `${historical.event} war im Jahr ${historical.year}.`
      };
      
    case 'Physik':
      const physicsQuestions = [
        { question: 'Bei welcher Temperatur gefriert Wasser?', answer: 0, unit: '°C' },
        { question: 'Bei welcher Temperatur kocht Wasser?', answer: 100, unit: '°C' },
        { question: 'Wie viele Planeten hat unser Sonnensystem?', answer: 8, unit: '' }
      ];
      const physics = physicsQuestions[Math.floor(Math.random() * physicsQuestions.length)];
      return {
        id: problemId,
        question: physics.question,
        answer: physics.answer,
        type: 'physics',
        explanation: `${physics.question} ${physics.answer}${physics.unit}`
      };
      
    case 'Biologie':
      const biologyQuestions = [
        { question: 'Wie viele Beine hat eine Spinne?', answer: 8 },
        { question: 'Wie viele Herzen hat ein Krake?', answer: 3 },
        { question: 'Wie viele Flügel hat ein Schmetterling?', answer: 4 }
      ];
      const biology = biologyQuestions[Math.floor(Math.random() * biologyQuestions.length)];
      return {
        id: problemId,
        question: biology.question,
        answer: biology.answer,
        type: 'biology',
        explanation: `${biology.question} ${biology.answer}`
      };
      
    case 'Chemie':
      const chemistryQuestions = [
        { question: 'Welches chemische Symbol hat Gold?', answer: 'Au' },
        { question: 'Welches chemische Symbol hat Wasser?', answer: 'H2O' },
        { question: 'Welches chemische Symbol hat Sauerstoff?', answer: 'O' }
      ];
      const chemistry = chemistryQuestions[Math.floor(Math.random() * chemistryQuestions.length)];
      return {
        id: problemId,
        question: chemistry.question,
        answer: chemistry.answer,
        type: 'chemistry',
        explanation: `${chemistry.question} ${chemistry.answer}`
      };
      
    case 'Latein':
      const latinWords = [
        { latin: 'aqua', german: 'Wasser' },
        { latin: 'vita', german: 'Leben' },
        { latin: 'terra', german: 'Erde' },
        { latin: 'luna', german: 'Mond' },
        { latin: 'sol', german: 'Sonne' }
      ];
      const latin = latinWords[Math.floor(Math.random() * latinWords.length)];
      return {
        id: problemId,
        question: `Was bedeutet "${latin.latin}" auf Deutsch?`,
        answer: latin.german,
        type: 'latin',
        explanation: `"${latin.latin}" bedeutet "${latin.german}" auf Deutsch.`
      };
      
    default:
      // Fallback to math problem
      return generateMathProblem(grade);
  }
};

export function CategoryMathProblem({ category, grade, onComplete, onBack, userId }: CategoryMathProblemProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const { toast } = useToast();
  const { settings } = useChildSettings(userId);
  const { canEarnMoreTime, isAtLimit, remainingMinutes, getDailyLimit } = useScreenTimeLimit(userId);
  const { updateProgress } = useAchievements(userId);

  const totalQuestions = 5;

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  useEffect(() => {
    generateProblems();
  }, []);

  const generateProblems = () => {
    const newProblems: Problem[] = [];
    for (let i = 0; i < totalQuestions; i++) {
      // Generate problems based on category
      if (category === 'Mathematik') {
        newProblems.push(generateMathProblem(grade));
      } else {
        newProblems.push(generateCategoryProblem(category, grade));
      }
    }
    setProblems(newProblems);
    setGameStarted(true);
  };

  const checkAnswer = () => {
    if (!problems[currentProblem]) return;

    const problem = problems[currentProblem];
    const userValue = parseFloat(userAnswer.trim());
    const correctValue = typeof problem.answer === 'number' ? problem.answer : parseFloat(problem.answer.toString());
    
    const isCorrect = typeof problem.answer === 'number' 
      ? Math.abs(userValue - correctValue) < 0.01
      : userAnswer.trim().toLowerCase() === problem.answer.toString().toLowerCase();

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentProblem + 1 >= totalQuestions) {
        completeGame();
      } else {
        setCurrentProblem(prev => prev + 1);
        setUserAnswer('');
        setFeedback(null);
      }
    }, 1500);
  };

  const completeGame = async () => {
    const categoryMapping: { [key: string]: keyof typeof settings } = {
      'Mathematik': 'math_minutes_per_task',
      'Deutsch': 'german_minutes_per_task',
      'Englisch': 'english_minutes_per_task',
      'Geographie': 'geography_minutes_per_task',
      'Geschichte': 'history_minutes_per_task',
      'Physik': 'physics_minutes_per_task',
      'Biologie': 'biology_minutes_per_task',
      'Chemie': 'chemistry_minutes_per_task',
      'Latein': 'latin_minutes_per_task'
    };

    // Mapping für deutsche zu englische Kategorienamen für die Datenbank
    const categoryToDbMapping: { [key: string]: string } = {
      'Mathematik': 'math',
      'Deutsch': 'german',
      'Englisch': 'english',
      'Geographie': 'geography',
      'Geschichte': 'history',
      'Physik': 'physics',
      'Biologie': 'biology',
      'Chemie': 'chemistry',
      'Latein': 'latin'
    };

    const minutesPerTask = settings?.[categoryMapping[category]] || 5;
    let timeEarned = 0;

    if (canEarnMoreTime) {
      timeEarned = correctAnswers * minutesPerTask;
      // timeEarned wird bereits korrekt berechnet
    }

    try {
      const { error } = await supabase.from('learning_sessions').insert({
        user_id: userId,
        category: categoryToDbMapping[category] || category.toLowerCase(),
        grade: grade,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_spent: timeElapsed,
        time_earned: timeEarned,
      });

      if (error) throw error;

      await updateAchievements();
      onComplete(timeEarned, category);
    } catch (error: any) {
      console.error('Fehler beim Speichern der Lernsession:', error);
      toast({
        title: "Fehler",
        description: "Die Lernsession konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const updateAchievements = async () => {
    const categoryMap: { [key: string]: string } = {
      'Mathematik': 'math',
      'Deutsch': 'german',
      'Englisch': 'english',
      'Geographie': 'geography',
      'Geschichte': 'history',
      'Physik': 'physics',
      'Biologie': 'biology',
      'Chemie': 'chemistry',
      'Latein': 'latin'
    };

    const achievementCategory = categoryMap[category] || 'general';
    
    try {
      const achievements: NewAchievement[] = [];

      const questionAchievements = await updateProgress(
        achievementCategory, 
        'questions_solved', 
        correctAnswers
      );
      achievements.push(...questionAchievements);

      if (correctAnswers > 0) {
        const minutesPerTask = settings?.[categoryMapping[category] as keyof typeof settings] || 5;
        const timeAchievements = await updateProgress(
          'general', 
          'time_earned', 
          Math.max(0, correctAnswers * minutesPerTask)
        );
        achievements.push(...timeAchievements);
      }

      if (achievements.length > 0) {
        setNewAchievements(achievements);
        setShowAchievementPopup(true);
      }
    } catch (error) {
      console.error('Error updating achievements:', error);
    }
  };

  const categoryMapping: { [key: string]: keyof typeof settings } = {
    'Mathematik': 'math_minutes_per_task',
    'Deutsch': 'german_minutes_per_task',
    'Englisch': 'english_minutes_per_task',
    'Geographie': 'geography_minutes_per_task',
    'Geschichte': 'history_minutes_per_task',
    'Physik': 'physics_minutes_per_task',
    'Biologie': 'biology_minutes_per_task',
    'Chemie': 'chemistry_minutes_per_task',
    'Latein': 'latin_minutes_per_task'
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim() && !feedback) {
      checkAnswer();
    }
  };

  const currentQuestionData = problems[currentProblem];
  const progress = ((currentProblem + (feedback ? 1 : 0)) / totalQuestions) * 100;

  if (!currentQuestionData) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Aufgaben werden generiert...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showAchievementPopup && (
        <AchievementPopup 
          achievements={newAchievements}
          onClose={() => setShowAchievementPopup(false)}
        />
      )}
      
      <div className="min-h-screen bg-gradient-bg p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm font-medium">
                    {currentProblem + 1} / {totalQuestions}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">{category} - Klasse {grade}</CardTitle>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                Aufgabe {currentProblem + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-xl font-medium mb-6">
                  {currentQuestionData.question}
                </p>
                
                <div className="max-w-sm mx-auto">
                  <Input
                    type={typeof currentQuestionData.answer === 'number' ? "number" : "text"}
                    inputMode={typeof currentQuestionData.answer === 'number' ? "numeric" : "text"}
                    pattern={typeof currentQuestionData.answer === 'number' ? "[0-9]*" : undefined}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Deine Antwort..."
                    className="text-center text-lg h-12"
                    disabled={feedback !== null}
                  />
                </div>
              </div>

              {feedback && (
                <div className={`text-center p-4 rounded-lg ${
                  feedback === 'correct' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {feedback === 'correct' ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                    <span className="font-medium">
                      {feedback === 'correct' ? 'Richtig!' : 'Falsch!'}
                    </span>
                  </div>
                  {currentQuestionData.explanation && (
                    <p className="text-sm">{currentQuestionData.explanation}</p>
                  )}
                </div>
              )}

              {!feedback && (
                <div className="text-center">
                  <Button 
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full max-w-sm"
                  >
                    Antwort prüfen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}