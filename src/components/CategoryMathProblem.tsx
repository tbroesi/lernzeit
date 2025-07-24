
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBalancedQuestionGeneration } from '@/hooks/useBalancedQuestionGeneration';
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
import { AlertTriangle } from 'lucide-react';

interface CategoryMathProblemProps {
  category: string;
  grade: number;
  onComplete: (minutes: number, category: string) => void;
}

export function CategoryMathProblem({ category, grade, onComplete }: CategoryMathProblemProps) {
  const { user } = useAuth();
  const { addScreenTime } = useScreenTime();
  
  const { 
    problems, 
    isGenerating, 
    generationSource, 
    generateProblems 
  } = useBalancedQuestionGeneration(category, grade, user?.id || 'anonymous', 5);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedMultipleChoice, setSelectedMultipleChoice] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [currentPlacements, setCurrentPlacements] = useState<Record<string, string>>({});
  const [sessionStartTime] = useState(Date.now());
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const currentQuestion: SelectionQuestion | undefined = problems[currentQuestionIndex];

  useEffect(() => {
    if (gameStarted && problems.length === 0) {
      generateProblems();
    }
  }, [gameStarted, problems.length, generateProblems]);

  // Analyze last session for AI-generated questions
  useEffect(() => {
    const analyzeLastSession = async () => {
      if (!user) return;
      
      try {
        const { data: sessions, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching last session:', error);
          return;
        }
        
        if (sessions && sessions.length > 0) {
          const lastSession = sessions[0];
          console.log('🔍 Last session analysis:', {
            session_id: lastSession.id,
            question_source: lastSession.question_source,
            category: lastSession.category,
            grade: lastSession.grade,
            score: lastSession.score,
            total_questions: lastSession.total_questions,
            created_at: lastSession.created_at
          });
          
          if (lastSession.question_source === 'ai') {
            console.log('✅ AI-generated questions were used in the last session');
          } else {
            console.log(`📝 Template/Simple questions were used (source: ${lastSession.question_source})`);
          }
        } else {
          console.log('No previous sessions found');
        }
      } catch (error) {
        console.error('Error analyzing last session:', error);
      }
    };

    analyzeLastSession();
  }, [user]);

  const startGame = () => {
    setGameStarted(true);
    generateProblems();
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
        const userAnswerNormalized = userAnswer.trim().toLowerCase();
        const correctAnswerNormalized = question.answer.toString().toLowerCase();
        
        // Check exact match first
        if (userAnswerNormalized === correctAnswerNormalized) {
          return true;
        }
        
        // For numeric answers, parse and compare
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
          await supabase.rpc('update_achievement_progress', {
            p_user_id: user.id,
            p_category: category.toLowerCase(),
            p_type: 'questions_solved',
            p_increment: 1
          });
        } catch (error) {
          console.error('Error updating achievements:', error);
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
      completeGame();
    }
  };

  const completeGame = async () => {
    const sessionDuration = Date.now() - sessionStartTime;
    const earnedMinutes = Math.max(1, Math.floor((score / problems.length) * 5));
    
    addScreenTime(earnedMinutes * 60);
    
    // Save enhanced session data
    if (user) {
      try {
        await supabase.from('game_sessions').insert({
          user_id: user.id,
          category: category.toLowerCase(),
          grade,
          score,
          total_questions: problems.length,
          duration_seconds: Math.floor(sessionDuration / 1000),
          question_source: generationSource || 'unknown',
          correct_answers: score,
          time_earned: earnedMinutes,
          time_spent: sessionDuration / 1000
        });
        
        console.log('📊 Session saved with source:', generationSource);
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
    
    onComplete(earnedMinutes, category);
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

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {category} - Klasse {grade}
          </CardTitle>
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
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Generiere spannende Fragen...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Bereite verschiedene Fragetypen vor
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-lg">Keine Fragen verfügbar</p>
          <Button onClick={generateProblems} className="mt-4">
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{category} - Klasse {grade}</CardTitle>
          <QuestionGenerationInfo 
            generationSource={generationSource} 
            isGenerating={isGenerating} 
          />
        </div>
        <GameProgress 
          currentQuestion={currentQuestionIndex + 1} 
          totalQuestions={problems.length} 
          score={score} 
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
    </Card>
  );
}
