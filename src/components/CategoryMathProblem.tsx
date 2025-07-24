
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdvancedQuestionGeneration } from '@/hooks/useAdvancedQuestionGeneration';
import { QuestionRenderer } from '@/components/game/QuestionRenderer';
import { GameProgress } from '@/components/game/GameProgress';
import { GameFeedback } from '@/components/game/GameFeedback';
import { QuestionGenerationInfo } from '@/components/game/QuestionGenerationInfo';
import { QuestionFeedbackDialog } from '@/components/game/QuestionFeedbackDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/lib/supabase';
import { useScreenTime } from '@/hooks/useScreenTime';
import { useChildSettings } from '@/hooks/useChildSettings';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementAnimation } from '@/components/game/AchievementAnimation';
import { GameTimeDisplay } from '@/components/game/GameTimeDisplay';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CategoryMathProblemProps {
  category: string;
  grade: number;
  onComplete: (minutes: number, category: string) => void;
  onBack?: () => void;
}

export function CategoryMathProblem({ category, grade, onComplete, onBack }: CategoryMathProblemProps) {
  const { user } = useAuth();
  const { addScreenTime } = useScreenTime();
  const { settings } = useChildSettings(user?.id || '');
  const { updateProgress } = useAchievements(user?.id);
  
  const { 
    problems, 
    isGenerating, 
    isInitialized,
    generationSource, 
    generationError,
    canRetry,
    manualRetry,
    refreshQuestions
  } = useAdvancedQuestionGeneration({
    category,
    grade,
    userId: user?.id || 'anonymous',
    totalQuestions: 5,
    autoGenerate: true
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedMultipleChoice, setSelectedMultipleChoice] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [currentPlacements, setCurrentPlacements] = useState<Record<string, string>>({});
  const [sessionStartTime] = useState(Date.now());
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentQuestion: SelectionQuestion | undefined = problems[currentQuestionIndex];

  useEffect(() => {
    console.log(`🔄 Game effect: gameStarted=${gameStarted}, problems.length=${problems.length}, isGenerating=${isGenerating}`);
    if (gameStarted && problems.length === 0 && !isGenerating && canRetry) {
      console.log('🔄 Regenerating problems because game started but no problems available');
      manualRetry();
    }
  }, [gameStarted, problems.length, isGenerating, canRetry, manualRetry]);

  // Reset question timer when starting new question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Enhanced session analysis and testing
  useEffect(() => {
    const analyzeAndTest = async () => {
      if (!user) return;
      
      try {
        // Analyze last session
        const { data: sessions, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }
        
        if (sessions && sessions.length > 0) {
          console.log('🔍 Last 2 sessions analysis:', sessions.map(session => ({
            session_id: session.id,
            question_source: session.question_source,
            category: session.category,
            grade: session.grade,
            score: session.score,
            created_at: session.created_at
          })));
          
          const aiSessions = sessions.filter(s => s.question_source === 'ai');
          const templateSessions = sessions.filter(s => s.question_source === 'template');
          
          console.log(`📊 Session Source Analysis: ${aiSessions.length} AI sessions, ${templateSessions.length} template sessions`);
        }

        // Test current generation system if problems exist
        if (problems.length > 0) {
          const { testDuplicateProtection, logTestResults, runGenerationTests } = await import('@/utils/questionGenerationTest');
          
          // Run comprehensive tests
          const testResults = await runGenerationTests(
            problems, 
            grade || 4, 
            user.id, 
            category, 
            []
          );
          
          console.log('🧪 Running automated generation tests...');
          logTestResults(testResults);
          
          // Test for specific duplicate issues
          const duplicateTest = testDuplicateProtection(problems);
          if (duplicateTest.hasDuplicates) {
            console.warn('⚠️ DUPLICATE DETECTION ALERT:', duplicateTest.duplicates);
          } else {
            console.log('✅ No duplicates detected in current question set');
          }
        }
        
      } catch (error) {
        console.error('Error in analysis and testing:', error);
      }
    };

    analyzeAndTest();
  }, [user, problems, category, grade]);

  // Auto-generate problems when component loads OR when grade/category changes  
  useEffect(() => {
    console.log('🚀 CategoryMathProblem loaded/changed - Auto-generating problems');
    console.log(`📊 Parameters: grade=${grade}, category=${category}, userId=${user?.id || 'anonymous'}`);
    console.log(`📊 Current problems.length: ${problems.length}, isGenerating: ${isGenerating}`);
    
    // Reset all game state when parameters change
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameStarted(false);
    setFeedback(null);
    setGameCompleted(false);
    setSessionEndTime(null);
    resetAnswers();
    
    // Problems will be auto-generated by the question manager hook
    console.log('✅ Component initialized - questions will be auto-generated');
  }, [grade, category, user?.id]);

  // Auto-complete when game is finished - this hook must always be called
  useEffect(() => {
    if (!gameCompleted || !sessionEndTime) return;
    
    const completeSession = async () => {
      const finalSessionDuration = sessionEndTime - sessionStartTime;
      let earnedSeconds = 0;
      let timePerTask = 30;
      
      if (settings) {
        const categoryKey = `${category.toLowerCase()}_seconds_per_task` as keyof typeof settings;
        timePerTask = settings[categoryKey] as number || 30;
        earnedSeconds = score * timePerTask;
      } else {
        earnedSeconds = score * 30;
      }

      // Save session data
      if (user) {
        try {
          await supabase.from('learning_sessions').insert({
            user_id: user.id,
            category: category.toLowerCase(),
            grade,
            correct_answers: score,
            total_questions: problems.length,
            time_spent: finalSessionDuration / 1000,
            time_earned: Math.floor(earnedSeconds / 60),
            session_date: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving session:', error);
        }
      }
      
      addScreenTime(earnedSeconds);
      
      // Add a small delay to ensure the screen time is updated
      setTimeout(() => {
        onComplete(Math.floor(earnedSeconds / 60), category);
      }, 100);
    };
    
    completeSession();
  }, [gameCompleted, sessionEndTime, sessionStartTime, score, category, grade, problems.length, user, settings, addScreenTime, onComplete]);

  const startGame = () => {
    setGameStarted(true);
    // Problems should already be generated at this point
  };

  const resetAnswers = () => {
    setUserAnswer('');
    setSelectedMultipleChoice(null);
    setSelectedWords([]);
    setCurrentPlacements({});
  };

  const validateAnswer = (question: SelectionQuestion): boolean => {
    console.log('🔍 Validating answer for question:', question.question);
    
    switch (question.questionType) {
      case 'text-input':
        // Normalize both user input and correct answer for comparison
        const userAnswerNormalized = userAnswer.trim().toLowerCase().replace(',', '.');
        const correctAnswerNormalized = question.answer.toString().toLowerCase().replace(',', '.');
        
        // Check exact match first
        if (userAnswerNormalized === correctAnswerNormalized) {
          return true;
        }
        
        // For numeric answers, parse and compare (support both , and . as decimal separator)
        const userNum = parseFloat(userAnswerNormalized);
        const correctNum = parseFloat(correctAnswerNormalized);
        
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          return Math.abs(userNum - correctNum) < 0.001;
        }
        
        return false;
        
      case 'multiple-choice':
        return selectedMultipleChoice === question.correctAnswer;
        
      case 'word-selection':
        const correctWordIndices = question.selectableWords
          ?.filter(word => word.isCorrect)
          ?.map(word => word.index) || [];
        
        return selectedWords.length === correctWordIndices.length && 
               selectedWords.every(index => correctWordIndices.includes(index));
               
      case 'matching':
      case 'drag-drop':
        const correctPlacements = question.categories?.reduce((acc, cat) => {
          cat.acceptsItems?.forEach(itemId => {
            acc[itemId] = cat.id;
          });
          return acc;
        }, {} as Record<string, string>) || {};
        
        return Object.keys(correctPlacements).every(itemId => 
          currentPlacements[itemId] === correctPlacements[itemId]
        );
        
      default:
        return false;
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || feedback) return;

    const isCorrect = validateAnswer(currentQuestion);
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      // Update achievements  
      if (user) {
        try {
          console.log('🎯 Calling updateProgress with:', {
            category: category.toLowerCase(),
            type: 'questions_solved',
            increment: 1
          });
          
          // Update question-solved achievements
          const achievementResult = await updateProgress(
            category.toLowerCase(),
            'questions_solved',
            1
          );
          
          // Update total questions achievement
          const totalQuestionsResult = await updateProgress(
            'general',
            'total_questions',
            1
          );

          // Update subjects mastered achievement
          const subjectsResult = await updateProgress(
            'general',
            'subjects_mastered',
            0 // Will be calculated by the function
          );
          
          console.log('🏆 Achievement results:', {
            regular: achievementResult,
            total: totalQuestionsResult,
            subjects: subjectsResult
          });
          
          // Combine all new achievements
          const allNewAchievements = [
            ...(achievementResult || []),
            ...(totalQuestionsResult || []),
            ...(subjectsResult || [])
          ];
          
          if (allNewAchievements.length > 0) {
            setNewAchievements(allNewAchievements);
            setShowAchievements(true);
          }
        } catch (error) {
          console.error('❌ Achievement error:', error);
        }
      }
    }

    // NO AUTOMATIC ADVANCEMENT - user must click continue
    console.log('✅ Feedback shown, waiting for user to continue manually');
  };

  const advanceToNextQuestion = () => {
    console.log('➡️ Advancing to next question manually');
    
    if (currentQuestionIndex < problems.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setFeedback(null);
      resetAnswers();
    } else {
      // Capture the end time once when the game completes - MUST be set before setGameCompleted
      const endTime = Date.now();
      setSessionEndTime(endTime);
      setGameCompleted(true);
      console.log('🏁 Game completed - session end time captured:', endTime);
    }
  };

  const handleWordToggle = (wordIndex: number) => {
    setSelectedWords(prev => 
      prev.includes(wordIndex) 
        ? prev.filter(i => i !== wordIndex)
        : [...prev, wordIndex]
    );
  };

  const handleItemMove = (itemId: string, categoryId: string) => {
    setCurrentPlacements(prev => ({
      ...prev,
      [itemId]: categoryId
    }));
  };

  const handleMatchingComplete = (isCorrect: boolean) => {
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // NO AUTOMATIC ADVANCEMENT - user must click continue
    console.log('✅ Matching feedback shown, waiting for user to continue manually');
  };

  const handleQuestionFeedback = async (feedbackType: string, details?: string) => {
    if (!currentQuestion || !user) return;

    try {
      await supabase.from('question_feedback').insert({
        user_id: user.id,
        question_content: currentQuestion.question,
        question_type: currentQuestion.questionType,
        feedback_type: feedbackType,
        feedback_details: details,
        category: category.toLowerCase(),
        grade
      });
      
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
    
    setShowFeedbackDialog(false);
  };

  const getCorrectAnswerText = (question: SelectionQuestion): string => {
    switch (question.questionType) {
      case 'text-input':
        return question.answer.toString();
      case 'multiple-choice':
        return question.options?.[question.correctAnswer] || 'Unbekannt';
      case 'word-selection':
        const correctWords = question.selectableWords
          ?.filter(word => word.isCorrect)
          ?.map(word => word.word) || [];
        return correctWords.join(', ');
      default:
        return 'Siehe Erklärung';
    }
  };

  const getUserAnswerText = (question: SelectionQuestion): string => {
    switch (question.questionType) {
      case 'text-input':
        return userAnswer || 'Keine Antwort';
      case 'multiple-choice':
        return selectedMultipleChoice !== null 
          ? question.options?.[selectedMultipleChoice] || 'Unbekannt'
          : 'Keine Antwort';
      case 'word-selection':
        const userWords = selectedWords
          .map(index => question.selectableWords?.find(word => word.index === index)?.word)
          .filter(Boolean);
        return userWords.join(', ') || 'Keine Auswahl';
      default:
        return 'Siehe Details';
    }
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-center flex-1">
              {category} - Klasse {grade}
            </CardTitle>
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                Zurück
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg">
            Bereit für 5 spannende Fragen? 🎯
          </p>
          <p className="text-sm text-muted-foreground">
            Du bekommst verschiedene Fragetypen: Textaufgaben, Multiple-Choice, Zuordnungen und mehr!
          </p>
          <Button onClick={startGame} size="lg" className="w-full">
            Spiel starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating || problems.length === 0) {
    console.log('🔄 RENDER: Loading state triggered', {
      isGenerating,
      problemsLength: problems.length,
      gameStarted,
      currentQuestion: !!currentQuestion
    });
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Generiere spannende Fragen...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Bereite verschiedene Fragetypen vor
          </p>
          <div className="mt-4 text-xs opacity-60">
            Debug: isGenerating={String(isGenerating)}, problems={problems.length}, gameStarted={String(gameStarted)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    console.log('❌ RENDER: No current question available', {
      problemsLength: problems.length,
      currentQuestionIndex,
      gameStarted,
      isGenerating,
      problems: problems.map(p => ({ id: p.id, question: p.question.substring(0, 50) }))
    });
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-lg">Keine Fragen verfügbar</p>
          <div className="mt-2 text-xs opacity-60">
            Debug: problems={problems.length}, index={currentQuestionIndex}, generating={String(isGenerating)}
          </div>
          <div className="space-y-2">
            {generationError && (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{generationError}</span>
              </div>
            )}
            {canRetry && (
              <Button onClick={manualRetry} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Erneut versuchen
              </Button>
            )}
            <Button onClick={refreshQuestions} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Neue Fragen laden
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                Zurück
              </Button>
            )}
            <CardTitle>{category} - Klasse {grade}</CardTitle>
          </div>
          <QuestionGenerationInfo 
            generationSource={generationSource} 
            isGenerating={isGenerating} 
          />
        </div>
        <GameProgress 
          currentQuestion={currentQuestionIndex + 1} 
          totalQuestions={problems.length} 
          score={score} 
          startTime={sessionStartTime}
          isActive={!gameCompleted}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <QuestionRenderer
          question={currentQuestion}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          selectedMultipleChoice={selectedMultipleChoice}
          setSelectedMultipleChoice={setSelectedMultipleChoice}
          selectedWords={selectedWords}
          setSelectedWords={setSelectedWords}
          onWordToggle={handleWordToggle}
          onMatchingComplete={handleMatchingComplete}
          currentPlacements={currentPlacements}
          onItemMove={handleItemMove}
          feedback={feedback}
        />

        <GameFeedback 
          feedback={feedback} 
          explanation={currentQuestion.explanation}
          correctAnswer={feedback === 'incorrect' ? getCorrectAnswerText(currentQuestion) : undefined}
          userAnswer={feedback === 'incorrect' ? getUserAnswerText(currentQuestion) : undefined}
          onReportIssue={() => setShowFeedbackDialog(true)}
          onSkipFeedback={feedback ? advanceToNextQuestion : undefined}
        />

        {!feedback && (
          <div className="text-center">
            <Button 
              onClick={submitAnswer}
              disabled={
                (currentQuestion.questionType === 'text-input' && !userAnswer.trim()) ||
                (currentQuestion.questionType === 'multiple-choice' && selectedMultipleChoice === null) ||
                (currentQuestion.questionType === 'word-selection' && selectedWords.length === 0)
              }
              size="lg"
              className="w-full"
            >
              Antwort abgeben
            </Button>
          </div>
        )}
      </CardContent>

      <QuestionFeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        onSubmit={handleQuestionFeedback}
      />

      <AchievementAnimation
        achievements={newAchievements}
        isVisible={showAchievements}
        onClose={() => {
          setShowAchievements(false);
          setNewAchievements([]);
        }}
      />
    </Card>
  );
}
