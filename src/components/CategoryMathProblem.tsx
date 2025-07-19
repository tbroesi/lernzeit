import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useChildSettings } from '@/hooks/useChildSettings';
import { useScreenTimeLimit } from '@/hooks/useScreenTimeLimit';
import { useAchievements, NewAchievement } from '@/hooks/useAchievements';
import { AchievementPopup } from '@/components/AchievementPopup';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { DebugInfo } from '@/components/game/DebugInfo';
import { GameProgress } from '@/components/game/GameProgress';
import { QuestionRenderer } from '@/components/game/QuestionRenderer';
import { GameFeedback } from '@/components/game/GameFeedback';

interface CategoryMathProblemProps {
  category: string;
  grade: number;
  onComplete: (timeEarned: number, category: string) => void;
  onBack: () => void;
  userId: string;
}

export function CategoryMathProblem({ category, grade, onComplete, onBack, userId }: CategoryMathProblemProps) {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedMultipleChoice, setSelectedMultipleChoice] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);

  const { toast } = useToast();
  const { settings } = useChildSettings(userId);
  const { canEarnMoreTime } = useScreenTimeLimit(userId);
  const { updateProgress } = useAchievements(userId);

  const totalQuestions = 5;
  const { 
    problems, 
    globalQuestions, 
    sessionId, 
    isGenerating,
    generationSource,
    generateProblems 
  } = useQuestionGeneration(category, grade, userId, totalQuestions);

  console.log('🎯 CategoryMathProblem render:', {
    currentProblem,
    problemsLength: problems.length,
    currentQuestionType: problems[currentProblem]?.questionType,
    gameStarted,
    isGenerating
  });

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  useEffect(() => {
    generateProblems().then(() => {
      setGameStarted(true);
    });
  }, []);

  const resetAnswerState = () => {
    setUserAnswer('');
    setSelectedMultipleChoice(null);
    setSelectedWords([]);
    setIsQuestionComplete(false);
  };

  const handleWordToggle = (wordIndex: number) => {
    console.log('🔤 Word toggle:', wordIndex, 'Current selection:', selectedWords);
    if (selectedWords.includes(wordIndex)) {
      setSelectedWords(prev => prev.filter(i => i !== wordIndex));
    } else {
      setSelectedWords(prev => [...prev, wordIndex]);
    }
  };

  const handleMatchingComplete = (isCorrect: boolean) => {
    console.log('🎯 Matching game completed:', isCorrect);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setIsQuestionComplete(true);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentProblem + 1 >= totalQuestions) {
      completeGame();
    } else {
      setCurrentProblem(prev => prev + 1);
      resetAnswerState();
      setFeedback(null);
    }
  };

  const checkAnswer = () => {
    if (!problems[currentProblem]) return;

    const problem = problems[currentProblem];
    let isCorrect = false;

    console.log('🔍 Checking answer for question type:', problem.questionType);

    switch (problem.questionType) {
      case 'multiple-choice':
        isCorrect = selectedMultipleChoice === problem.correctAnswer;
        console.log('✅ Multiple choice - Selected:', selectedMultipleChoice, 'Correct:', problem.correctAnswer);
        break;
        
      case 'word-selection':
        const correctWordIndices = problem.selectableWords
          .filter(word => word.isCorrect)
          .map(word => word.index);
        
        const sortedSelected = [...selectedWords].sort((a, b) => a - b);
        const sortedCorrect = [...correctWordIndices].sort((a, b) => a - b);
        
        isCorrect = sortedSelected.length === sortedCorrect.length &&
                   sortedSelected.every((index, i) => index === sortedCorrect[i]);
        
        console.log('Word selection result:', isCorrect);
        break;
        
      case 'matching':
        return; // Handled by MatchingQuestion component
        
      case 'text-input':
      default:
        if (problem.questionType === 'text-input') {
          const userValue = parseFloat(userAnswer.trim());
          const correctValue = typeof problem.answer === 'number' ? problem.answer : parseFloat(problem.answer.toString());
          isCorrect = typeof problem.answer === 'number' 
            ? Math.abs(userValue - correctValue) < 0.01
            : userAnswer.trim().toLowerCase() === problem.answer.toString().toLowerCase();
        }
        break;
    }

    console.log('Final answer result:', isCorrect);

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setIsQuestionComplete(true);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const completeGame = async () => {
    const categoryMapping: { [key: string]: keyof typeof settings } = {
      'Mathematik': 'math_seconds_per_task',
      'Deutsch': 'german_seconds_per_task',
      'Englisch': 'english_seconds_per_task',
      'Geographie': 'geography_seconds_per_task',
      'Geschichte': 'history_seconds_per_task',
      'Physik': 'physics_seconds_per_task',
      'Biologie': 'biology_seconds_per_task',
      'Chemie': 'chemistry_seconds_per_task',
      'Latein': 'latin_seconds_per_task'
    };

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

    const secondsPerTask = settings?.[categoryMapping[category]] || 30;
    let timeEarned = 0;

    if (canEarnMoreTime) {
      const theoreticalTimeEarned = correctAnswers * secondsPerTask;
      timeEarned = Math.max(0, theoreticalTimeEarned - timeElapsed);
      console.log(`🎯 Time calculation: ${correctAnswers} correct × ${secondsPerTask}s = ${theoreticalTimeEarned}s theoretical, spent ${timeElapsed}s, final bonus: ${timeEarned}s`);
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
      const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
      const averageTimePerQuestion = totalQuestions > 0 ? timeElapsed / totalQuestions : 0;

      const dailyAchievements = await updateProgress('general', 'daily_activity', 1);
      achievements.push(...dailyAchievements);

      for (let i = 0; i < totalQuestions; i++) {
        const isCorrect = i < correctAnswers;
        
        const accuracyAchievements = await updateProgress(
          'general', 
          'accuracy_streak', 
          1, 
          isCorrect, 
          false, 
          averageTimePerQuestion
        );
        achievements.push(...accuracyAchievements);

        if (isCorrect) {
          const efficiencyAchievements = await updateProgress(
            'general', 
            'learning_efficiency', 
            1, 
            true, 
            false, 
            averageTimePerQuestion
          );
          achievements.push(...efficiencyAchievements);
        }

        const masteryAchievements = await updateProgress(
          achievementCategory, 
          'subject_mastery', 
          1, 
          isCorrect, 
          false, 
          averageTimePerQuestion
        );
        achievements.push(...masteryAchievements);
      }

      const dailyLimit = useScreenTimeLimit(userId).getDailyLimit();
      const currentTime = timeElapsed / 60;
      if (currentTime > dailyLimit) {
        const persistenceAchievements = await updateProgress(
          'general', 
          'persistence', 
          1, 
          true, 
          true, 
          0
        );
        achievements.push(...persistenceAchievements);
      }

      if (achievements.length > 0) {
        setNewAchievements(achievements);
        setShowAchievementPopup(true);
      }
    } catch (error) {
      console.error('Error updating achievements:', error);
    }
  };

  const canSubmit = () => {
    const currentQuestionData = problems[currentProblem];
    if (!currentQuestionData) return false;

    switch (currentQuestionData.questionType) {
      case 'multiple-choice':
        return selectedMultipleChoice !== null;
      case 'word-selection':
        return selectedWords.length > 0;
      case 'matching':
        return false; // Matching questions handle their own completion
      case 'text-input':
      default:
        return userAnswer.trim() !== '';
    }
  };

  const currentQuestionData = problems[currentProblem];

  if (isGenerating || !currentQuestionData) {
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
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">{category} - Klasse {grade}</CardTitle>
                <GameProgress 
                  currentProblem={currentProblem}
                  totalQuestions={totalQuestions}
                  timeElapsed={timeElapsed}
                  feedback={feedback}
                />
              </div>
            </CardHeader>
          </Card>

          <DebugInfo
            currentProblem={currentProblem}
            totalQuestions={totalQuestions}
            globalQuestionsCount={globalQuestions.size}
            sessionId={sessionId}
            category={category}
            grade={grade}
            problemsLength={problems.length}
            currentQuestionType={currentQuestionData?.questionType}
            generationSource={generationSource}
          />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                Aufgabe {currentProblem + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionRenderer
                question={currentQuestionData}
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                selectedMultipleChoice={selectedMultipleChoice}
                setSelectedMultipleChoice={setSelectedMultipleChoice}
                selectedWords={selectedWords}
                setSelectedWords={setSelectedWords}
                onWordToggle={handleWordToggle}
                onMatchingComplete={handleMatchingComplete}
                feedback={feedback}
              />

              <GameFeedback
                feedback={feedback}
                currentQuestion={currentQuestionData}
                currentProblem={currentProblem}
                totalQuestions={totalQuestions}
                onNext={handleNextQuestion}
              />

              {!feedback && currentQuestionData.questionType !== 'matching' && (
                <div className="text-center">
                  <Button 
                    onClick={checkAnswer}
                    disabled={!canSubmit()}
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
