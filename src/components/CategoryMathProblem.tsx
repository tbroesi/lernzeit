
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MathProblem {
  question: string;
  answer: number;
  options?: number[];
}

interface CategoryMathProblemProps {
  grade: number;
  category: 'math' | 'german' | 'english';
  onBack: () => void;
  onComplete: (timeEarned: number, category: string) => void;
  userId?: string;
}

export function CategoryMathProblem({ grade, category, onBack, onComplete, userId }: CategoryMathProblemProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);
  const [rewardMinutes, setRewardMinutes] = useState(5);
  
  const { toast } = useToast();
  const totalQuestions = 5;

  useEffect(() => {
    generateProblem();
    loadRewardSettings();
  }, [grade, category]);

  const loadRewardSettings = async () => {
    if (!userId) return;

    try {
      // Try to get individual child settings first
      const { data: childSettings } = await supabase
        .from('child_settings')
        .select('*')
        .eq('child_id', userId)
        .single();

      if (childSettings) {
        const minutes = childSettings[`${category}_minutes_per_task`];
        setRewardMinutes(minutes || 5);
        return;
      }

      // Fall back to parent settings by finding the parent
      const { data: relationship } = await supabase
        .from('parent_child_relationships')
        .select('parent_id')
        .eq('child_id', userId)
        .single();

      if (relationship) {
        const { data: parentSettings } = await supabase
          .from('parent_settings')
          .select('*')
          .eq('user_id', relationship.parent_id)
          .single();

        if (parentSettings) {
          const minutes = parentSettings[`${category}_minutes_per_task`];
          setRewardMinutes(minutes || 5);
        }
      }
    } catch (error) {
      console.error('Error loading reward settings:', error);
    }
  };

  const generateMathProblem = (): MathProblem => {
    let num1: number, num2: number, operation: string, answer: number, question: string;

    switch (grade) {
      case 1:
      case 2:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
        question = `${num1} ${operation} ${num2} = ?`;
        break;

      case 3:
      case 4:
        const ops = ['+', '-', '×'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        if (operation === '×') {
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 * num2;
        } else {
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
          answer = operation === '+' ? num1 + num2 : num1 - num2;
        }
        question = `${num1} ${operation} ${num2} = ?`;
        break;

      default:
        const allOps = ['+', '-', '×', '÷'];
        operation = allOps[Math.floor(Math.random() * allOps.length)];
        if (operation === '÷') {
          num2 = Math.floor(Math.random() * 9) + 2;
          answer = Math.floor(Math.random() * 10) + 1;
          num1 = num2 * answer;
        } else if (operation === '×') {
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          answer = num1 * num2;
        } else {
          num1 = Math.floor(Math.random() * 100) + 1;
          num2 = Math.floor(Math.random() * 100) + 1;
          if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
          answer = operation === '+' ? num1 + num2 : num1 - num2;
        }
        question = `${num1} ${operation} ${num2} = ?`;
        break;
    }

    return { question, answer };
  };

  const generateGermanProblem = (): MathProblem => {
    const words = {
      1: [
        { word: 'Hund', options: ['Hun_', 'Hu_d', 'H_nd'], correct: 2, answer: 'Hund' },
        { word: 'Katze', options: ['Ka_ze', 'K_tze', 'Kat_e'], correct: 1, answer: 'Katze' },
        { word: 'Haus', options: ['Ha_s', 'H_us', 'Hau_'], correct: 1, answer: 'Haus' },
      ],
      2: [
        { word: 'Schule', options: ['Schu_e', 'Sch_le', 'S_hule'], correct: 0, answer: 'Schule' },
        { word: 'Freund', options: ['Freu_d', 'Fr_und', 'F_eund'], correct: 0, answer: 'Freund' },
        { word: 'Familie', options: ['Fami_ie', 'Fam_lie', 'F_milie'], correct: 1, answer: 'Familie' },
      ],
      3: [
        { word: 'Geburtstag', options: ['Geburt_tag', 'Gebur_stag', 'G_burtstag'], correct: 1, answer: 'Geburtstag' },
        { word: 'Spielplatz', options: ['Spiel_latz', 'Sp_elplatz', 'Spielp_atz'], correct: 2, answer: 'Spielplatz' },
      ],
    };

    const gradeWords = words[Math.min(grade, 3) as keyof typeof words] || words[3];
    const problem = gradeWords[Math.floor(Math.random() * gradeWords.length)];
    
    return {
      question: `Vervollständige das Wort: ${problem.options[problem.correct]}`,
      answer: problem.correct,
      options: problem.options
    };
  };

  const generateEnglishProblem = (): MathProblem => {
    const words = {
      1: [
        { word: 'cat', german: 'Katze', options: ['dog', 'cat', 'bird'], correct: 1 },
        { word: 'dog', german: 'Hund', options: ['cat', 'fish', 'dog'], correct: 2 },
        { word: 'house', german: 'Haus', options: ['house', 'tree', 'car'], correct: 0 },
      ],
      2: [
        { word: 'school', german: 'Schule', options: ['home', 'school', 'park'], correct: 1 },
        { word: 'friend', german: 'Freund', options: ['friend', 'enemy', 'stranger'], correct: 0 },
        { word: 'family', german: 'Familie', options: ['group', 'family', 'team'], correct: 1 },
      ],
      3: [
        { word: 'birthday', german: 'Geburtstag', options: ['holiday', 'birthday', 'weekend'], correct: 1 },
        { word: 'playground', german: 'Spielplatz', options: ['playground', 'classroom', 'library'], correct: 0 },
      ],
    };

    const gradeWords = words[Math.min(grade, 3) as keyof typeof words] || words[3];
    const problem = gradeWords[Math.floor(Math.random() * gradeWords.length)];
    
    return {
      question: `Was heißt "${problem.german}" auf Englisch?`,
      answer: problem.correct,
      options: problem.options
    };
  };

  const generateProblem = () => {
    let problem: MathProblem;
    
    switch (category) {
      case 'math':
        problem = generateMathProblem();
        break;
      case 'german':
        problem = generateGermanProblem();
        break;
      case 'english':
        problem = generateEnglishProblem();
        break;
      default:
        problem = generateMathProblem();
    }
    
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowFeedback(false);
  };

  const handleAnswer = async (answer: string | number) => {
    if (!currentProblem) return;

    const userAnswerNum = typeof answer === 'string' ? parseInt(answer) : answer;
    const correct = userAnswerNum === currentProblem.answer;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < totalQuestions) {
        setCurrentQuestion(prev => prev + 1);
        generateProblem();
      } else {
        completeSession();
      }
    }, 1500);
  };

  const completeSession = async () => {
    const endTime = Date.now();
    const timeSpent = (endTime - startTime) / 1000; // in seconds
    const earnedMinutes = Math.round((correctAnswers / totalQuestions) * rewardMinutes);

    setLoading(true);

    try {
      if (userId) {
        await supabase.from('learning_sessions').insert({
          user_id: userId,
          category: category,
          grade: grade,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          time_spent: timeSpent,
          time_earned: earnedMinutes,
        });
      }

      toast({
        title: "Runde abgeschlossen!",
        description: `Du hast ${correctAnswers}/${totalQuestions} Aufgaben richtig gelöst und ${earnedMinutes} Minuten verdient!`,
      });

      onComplete(earnedMinutes, category);
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Session gespeichert",
        description: `${correctAnswers}/${totalQuestions} richtig - ${earnedMinutes} Min verdient!`,
      });
      onComplete(earnedMinutes, category);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = () => {
    switch (category) {
      case 'math':
        return { name: 'Mathematik', icon: '🔢', color: 'bg-blue-500' };
      case 'german':
        return { name: 'Deutsch', icon: '📚', color: 'bg-green-500' };
      case 'english':
        return { name: 'Englisch', icon: '🇬🇧', color: 'bg-purple-500' };
      default:
        return { name: 'Lernen', icon: '📖', color: 'bg-gray-500' };
    }
  };

  const categoryInfo = getCategoryInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Session wird gespeichert...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Aufgabe wird geladen...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <Badge variant="secondary" className={`${categoryInfo.color} text-white`}>
                {categoryInfo.icon} {categoryInfo.name}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Klasse {grade} - Aufgabe {currentQuestion}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">+{rewardMinutes} Min</span>
              </div>
            </div>
            <Progress value={(currentQuestion - 1) / totalQuestions * 100} className="h-2" />
          </CardHeader>
        </Card>

        {/* Problem Card */}
        <Card className="shadow-card">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-primary">
                {currentProblem.question}
              </h2>

              {currentProblem.options ? (
                <div className="space-y-3">
                  {currentProblem.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full p-4 text-lg"
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Deine Antwort"
                    className="text-center text-xl font-bold"
                    disabled={showFeedback}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userAnswer) {
                        handleAnswer(userAnswer);
                      }
                    }}
                  />
                  
                  <Button 
                    onClick={() => handleAnswer(userAnswer)}
                    disabled={!userAnswer || showFeedback}
                    size="lg"
                    className="w-full"
                  >
                    Antwort senden
                  </Button>
                </div>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center justify-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-semibold">Richtig! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6" />
                        <span className="font-semibold">
                          Nicht ganz. Die richtige Antwort ist: {currentProblem.answer}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{correctAnswers}</div>
                <div className="text-xs text-muted-foreground">Richtig</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{currentQuestion - 1}</div>
                <div className="text-xs text-muted-foreground">Beantwortet</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{totalQuestions - currentQuestion + 1}</div>
                <div className="text-xs text-muted-foreground">Noch zu gehen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((correctAnswers / Math.max(currentQuestion - 1, 1)) * rewardMinutes)}
                </div>
                <div className="text-xs text-muted-foreground">Min verdient</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
