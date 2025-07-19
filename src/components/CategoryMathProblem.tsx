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
import { SelectionQuestion } from '@/types/questionTypes';
import { MultipleChoiceQuestion } from '@/components/question-types/MultipleChoiceQuestion';
import { WordSelectionQuestion } from '@/components/question-types/WordSelectionQuestion';
import { DragDropQuestion } from '@/components/question-types/DragDropQuestion';

interface CategoryMathProblemProps {
  category: string;
  grade: number;
  onComplete: (timeEarned: number, category: string) => void;
  onBack: () => void;
  userId: string;
}

const generateGrade4DeutschProblems = (): SelectionQuestion[] => {
  const problems: SelectionQuestion[] = [
    {
      id: 1,
      questionType: 'word-selection',
      question: "Bestimme das Subjekt im Satz:",
      sentence: "Der große Hund bellte laut.",
      selectableWords: [
        { word: "Der", isCorrect: true, index: 0 },
        { word: "große", isCorrect: true, index: 1 },
        { word: "Hund", isCorrect: true, index: 2 },
        { word: "bellte", isCorrect: false, index: 3 },
        { word: "laut.", isCorrect: false, index: 4 }
      ],
      type: 'german',
      explanation: "Das Subjekt besteht aus Artikel, Adjektiv und Nomen"
    },
    {
      id: 2,
      questionType: 'multiple-choice',
      question: "Welches Wort ist ein Verb im Satz: 'Die Kinder spielen fröhlich im Garten.'?",
      options: ["Kinder", "spielen", "fröhlich", "Garten"],
      correctAnswer: 1,
      type: 'german',
      explanation: "Das Verb beschreibt die Tätigkeit oder Handlung."
    },
    {
      id: 3,
      questionType: 'multiple-choice',
      question: "Setze die richtige Form von 'sein' ein: 'Gestern ___ ich im Kino.' (war/bin)",
      options: ["war", "bin"],
      correctAnswer: 0,
      type: 'german',
      explanation: "Bei 'gestern' verwendet man die Vergangenheitsform 'war'."
    },
    {
      id: 4,
      questionType: 'multiple-choice',
      question: "Wie schreibt man das Wort richtig: 'sch___ssen' (ie oder ei)?",
      options: ["schießen", "scheissen"],
      correctAnswer: 0,
      type: 'german',
      explanation: "Nach langem 'i' schreibt man meistens 'ie'."
    },
    {
      id: 5,
      questionType: 'word-selection',
      question: "Was ist das Prädikat in: 'Meine Schwester liest ein spannendes Buch.'?",
      sentence: "Meine Schwester liest ein spannendes Buch.",
      selectableWords: [
        { word: "Meine", isCorrect: false, index: 0 },
        { word: "Schwester", isCorrect: false, index: 1 },
        { word: "liest", isCorrect: true, index: 2 },
        { word: "ein", isCorrect: false, index: 3 },
        { word: "spannendes", isCorrect: false, index: 4 },
        { word: "Buch.", isCorrect: false, index: 5 }
      ],
      type: 'german',
      explanation: "Das Prädikat ist das Verb, das aussagt, was jemand tut."
    },
    {
      id: 6,
      questionType: 'multiple-choice',
      question: "Welcher Artikel gehört zu 'Mädchen'? (der/die/das)",
      options: ["der", "die", "das"],
      correctAnswer: 2,
      type: 'german',
      explanation: "Trotz der Endung -chen ist 'Mädchen' sächlich: das Mädchen."
    },
    {
      id: 7,
      questionType: 'text-input',
      question: "Ergänze die wörtliche Rede: 'Tom sagte: ___ gehe nach Hause.___' (Ich/Anführungszeichen)",
      answer: "\"Ich gehe nach Hause.\"",
      type: 'german',
      explanation: "Wörtliche Rede steht in Anführungszeichen und beginnt mit Großbuchstabe."
    }
  ];

  // Shuffle and return 5 random problems
  const shuffled = [...problems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
};

const generateMathProblem = (grade: number): SelectionQuestion => {
  if (grade <= 2) {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];

    if (op === '+') {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * (20 - a)) + 1;
      return {
        id: 1,
        questionType: 'text-input',
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
        questionType: 'text-input',
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
      const a = Math.floor(Math.random() * 900) + 100; // 3-digit numbers
      const b = Math.floor(Math.random() * 900) + 100;
      return {
        id: 1,
        questionType: 'text-input',
        question: `${a} + ${b} = ?`,
        answer: a + b,
        type: 'math',
        explanation: `${a} + ${b} = ${a + b}`
      };
    } else if (op === '-') {
      const b = Math.floor(Math.random() * 500) + 100;
      const a = b + Math.floor(Math.random() * 900) + 100;
      return {
        id: 1,
        questionType: 'text-input',
        question: `${a} - ${b} = ?`,
        answer: a - b,
        type: 'math',
        explanation: `${a} - ${b} = ${a - b}`
      };
    } else if (op === '×') {
      const a = Math.floor(Math.random() * 9) + 2; // 2-10
      const b = Math.floor(Math.random() * 9) + 2; // 2-10
      return {
        id: 1,
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
        question: `${numerator}/${denominator} + ${whole} = ? (als Dezimalzahl)`,
        answer: parseFloat((numerator / denominator + whole).toFixed(2)),
        type: 'math',
        explanation: `${numerator}/${denominator} + ${whole} = ${(numerator / denominator).toFixed(2)} + ${whole} = ${(numerator / denominator + whole).toFixed(2)}`
      };
    }
  }
};

const generateCategoryProblem = (category: string, grade: number): SelectionQuestion => {
  const problemId = Math.floor(Math.random() * 1000000);

  switch (category) {
    case 'Deutsch':
      if (grade === 4) {
        const grade4Problems = generateGrade4DeutschProblems();
        return grade4Problems[Math.floor(Math.random() * grade4Problems.length)];
      }
      // Fallback simple text-input problem for other grades
      const germanWords = ['Haus', 'Auto', 'Schule', 'Buch', 'Freund', 'Familie', 'Garten', 'Wasser', 'Sonne', 'Mond'];
      const word = germanWords[Math.floor(Math.random() * germanWords.length)];
      return {
        id: problemId,
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
        questionType: 'text-input',
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
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedMultipleChoice, setSelectedMultipleChoice] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [dragDropPlacements, setDragDropPlacements] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
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
  }, [category, grade]);

  const generateProblems = async () => {
    try {
      console.log(`🔄 Generating problems for ${category}, Grade ${grade}`);

      // Try to generate AI problems first
      const aiProblems = await generateAIProblems();
      if (aiProblems.length >= totalQuestions) {
        const selectedProblems = aiProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        // Track used questions to avoid repetition
        setUsedQuestions(prev => [...prev, ...selectedProblems.map(p => p.question)]);
        setGameStarted(true);
        return;
      }

      // Fallback to manual problems if AI fails
      console.log('⚠️ AI generation failed, using fallback problems');
      const fallbackProblems = generateFallbackProblems();
      setProblems(fallbackProblems);
      setGameStarted(true);
    } catch (error) {
      console.error('Error generating problems:', error);
      // Use fallback problems
      const fallbackProblems = generateFallbackProblems();
      setProblems(fallbackProblems);
      setGameStarted(true);
    }
  };

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    try {
      console.log('🤖 Calling AI edge function via supabase.functions.invoke');

      const { data, error } = await supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions,
          excludeQuestions: usedQuestions
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      console.log('✅ AI Problems generated:', data?.problems?.length || 0);
      return data?.problems || [];
    } catch (error) {
      console.error('❌ AI problem generation failed:', error);
      return [];
    }
  };

  const generateFallbackProblems = (): SelectionQuestion[] => {
    const newProblems: SelectionQuestion[] = [];
    for (let i = 0; i < totalQuestions; i++) {
      // Generate problems based on category - convert legacy format to new format
      if (category === 'Mathematik') {
        const mathProblem = generateMathProblem(grade);
        newProblems.push({
          ...mathProblem,
          questionType: 'text-input',
          id: i + 1
        } as SelectionQuestion);
      } else {
        const categoryProblem = generateCategoryProblem(category, grade);
        newProblems.push({
          ...categoryProblem,
          questionType: 'text-input',
          id: i + 1
        } as SelectionQuestion);
      }
    }
    return newProblems;
  };

  const resetAnswerState = () => {
    setUserAnswer('');
    setSelectedMultipleChoice(null);
    setSelectedWords([]);
    setDragDropPlacements({});
  };

  const checkAnswer = () => {
    if (!problems[currentProblem]) return;

    const problem = problems[currentProblem];
    let isCorrect = false;

    switch (problem.questionType) {
      case 'multiple-choice':
        isCorrect = selectedMultipleChoice === problem.correctAnswer;
        break;
      case 'word-selection':
        const correctWordIndices = problem.selectableWords
          .filter(word => word.isCorrect)
          .map(word => word.index);
        isCorrect = selectedWords.length === correctWordIndices.length &&
                   selectedWords.every(index => correctWordIndices.includes(index));
        break;
      case 'drag-drop':
        isCorrect = problem.categories.every(category => {
          const expectedItems = category.acceptsItems;
          const actualItems = Object.entries(dragDropPlacements)
            .filter(([_, categoryId]) => categoryId === category.id)
            .map(([itemId, _]) => itemId);
          return expectedItems.length === actualItems.length &&
                 expectedItems.every(itemId => actualItems.includes(itemId));
        });
        break;
      case 'text-input':
      default:
        const userValue = parseFloat(userAnswer.trim());
        const correctValue = typeof problem.answer === 'number' ? problem.answer : parseFloat(problem.answer.toString());
        isCorrect = typeof problem.answer === 'number' 
          ? Math.abs(userValue - correctValue) < 0.01
          : userAnswer.trim().toLowerCase() === problem.answer.toString().toLowerCase();
        break;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentProblem + 1 >= totalQuestions) {
        completeGame();
      } else {
        setCurrentProblem(prev => prev + 1);
        resetAnswerState();
        setFeedback(null);
      }
    }, 1500);
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

    const secondsPerTask = settings?.[categoryMapping[category]] || 30;
    let timeEarned = 0;

    if (canEarnMoreTime) {
      // Calculate the theoretical time earned based on correct answers
      const theoreticalTimeEarned = correctAnswers * secondsPerTask;
      
      // Prevent negative bonus: earned time minus spent time should not be negative
      // If the user took longer than they earned, they get 0 seconds as bonus
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

      // Track daily activity (just being called once per session)
      const dailyAchievements = await updateProgress('general', 'daily_activity', 1);
      achievements.push(...dailyAchievements);

      // Process each answer for accuracy streak and efficiency
      for (let i = 0; i < totalQuestions; i++) {
        const isCorrect = i < correctAnswers;
        
        // Track accuracy streak
        const accuracyAchievements = await updateProgress(
          'general', 
          'accuracy_streak', 
          1, 
          isCorrect, 
          false, 
          averageTimePerQuestion
        );
        achievements.push(...accuracyAchievements);

        // Track learning efficiency for correct answers
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

        // Track subject mastery
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

      // Check if user continued beyond time limit (persistence)
      const dailyLimit = getDailyLimit();
      const currentTime = timeElapsed / 60; // Convert to minutes
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

  const categoryMappingFix: { [key: string]: keyof typeof settings } = {
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

  const canSubmit = () => {
    const currentQuestionData = problems[currentProblem];
    if (!currentQuestionData) return false;

    switch (currentQuestionData.questionType) {
      case 'multiple-choice':
        return selectedMultipleChoice !== null;
      case 'word-selection':
        return selectedWords.length > 0;
      case 'drag-drop':
        return Object.keys(dragDropPlacements).length > 0;
      case 'text-input':
      default:
        return userAnswer.trim() !== '';
    }
  };

  const renderQuestionInput = () => {
    const currentQuestionData = problems[currentProblem];
    if (!currentQuestionData) return null;

    switch (currentQuestionData.questionType) {
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            question={currentQuestionData}
            selectedAnswer={selectedMultipleChoice}
            onAnswerSelect={setSelectedMultipleChoice}
            disabled={feedback !== null}
          />
        );
      case 'word-selection':
        return (
          <WordSelectionQuestion
            question={currentQuestionData}
            selectedWords={selectedWords}
            onWordToggle={(wordIndex) => {
              if (selectedWords.includes(wordIndex)) {
                setSelectedWords(prev => prev.filter(i => i !== wordIndex));
              } else {
                setSelectedWords(prev => [...prev, wordIndex]);
              }
            }}
            disabled={feedback !== null}
          />
        );
      case 'drag-drop':
        return (
          <DragDropQuestion
            question={currentQuestionData}
            currentPlacements={dragDropPlacements}
            onItemMove={(itemId, categoryId) => {
              setDragDropPlacements(prev => ({ ...prev, [itemId]: categoryId }));
            }}
            disabled={feedback !== null}
          />
        );
      case 'text-input':
      default:
        return (
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim() && !feedback) {
                    checkAnswer();
                  }
                }}
                placeholder="Deine Antwort..."
                className="text-center text-lg h-12"
                autoFocus
                disabled={feedback !== null}
              />
            </div>
          </div>
        );
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
              {renderQuestionInput()}

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
