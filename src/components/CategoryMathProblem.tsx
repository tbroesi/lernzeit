import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, X, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useChildSettings } from '@/hooks/useChildSettings';
import { useScreenTimeLimit } from '@/hooks/useScreenTimeLimit';
import { useAchievements, NewAchievement } from '@/hooks/useAchievements';
import { AchievementPopup } from '@/components/AchievementPopup';
import { SelectionQuestion } from '@/types/questionTypes';
import { MultipleChoiceQuestion } from '@/components/question-types/MultipleChoiceQuestion';
import { WordSelectionQuestion } from '@/components/question-types/WordSelectionQuestion';
import { MatchingQuestion } from '@/components/question-types/MatchingQuestion';

interface CategoryMathProblemProps {
  category: string;
  grade: number;
  onComplete: (timeEarned: number, category: string) => void;
  onBack: () => void;
  userId: string;
}

// Global question tracking with persistent storage
const GLOBAL_QUESTIONS_KEY = (category: string, grade: number, userId: string) => 
  `global_questions_${category}_${grade}_${userId}`;

const SESSION_KEY = (category: string, grade: number, userId: string) => 
  `session_${category}_${grade}_${userId}`;

// Enhanced question storage
const getStoredQuestions = (category: string, grade: number, userId: string): Set<string> => {
  try {
    const stored = localStorage.getItem(GLOBAL_QUESTIONS_KEY(category, grade, userId));
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const storeQuestions = (category: string, grade: number, userId: string, questions: Set<string>) => {
  try {
    localStorage.setItem(GLOBAL_QUESTIONS_KEY(category, grade, userId), JSON.stringify(Array.from(questions)));
  } catch (e) {
    console.warn('Failed to store questions:', e);
  }
};

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
      explanation: "Das Subjekt besteht aus Artikel 'Der', Adjektiv 'große' und Nomen 'Hund'"
    },
    {
      id: 2,
      questionType: 'multiple-choice',
      question: "Welches Wort ist ein Verb im Satz: 'Die Kinder spielen fröhlich im Garten.'?",
      options: ["Kinder", "spielen", "fröhlich", "Garten"],
      correctAnswer: 1,
      type: 'german',
      explanation: "Das Verb 'spielen' beschreibt die Tätigkeit der Kinder."
    },
    {
      id: 3,
      questionType: 'word-selection',
      question: "Markiere alle Nomen im Satz:",
      sentence: "Die Katze liegt auf dem Sofa.",
      selectableWords: [
        { word: "Die", isCorrect: false, index: 0 },
        { word: "Katze", isCorrect: true, index: 1 },
        { word: "liegt", isCorrect: false, index: 2 },
        { word: "auf", isCorrect: false, index: 3 },
        { word: "dem", isCorrect: false, index: 4 },
        { word: "Sofa.", isCorrect: true, index: 5 }
      ],
      type: 'german',
      explanation: "Die Nomen sind 'Katze' und 'Sofa' - das sind Namen für Lebewesen und Gegenstände."
    },
    {
      id: 4,
      questionType: 'multiple-choice',
      question: "Wie schreibt man das Wort richtig?",
      options: ["schießen", "schiessen", "schieesen", "schisen"],
      correctAnswer: 0,
      type: 'german',
      explanation: "Nach langem 'i' schreibt man 'ie': schießen."
    },
    {
      id: 5,
      questionType: 'word-selection',
      question: "Was ist das Prädikat in diesem Satz?",
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
      explanation: "Das Prädikat ist das Verb 'liest', das aussagt, was die Schwester tut."
    },
    {
      id: 6,
      questionType: 'word-selection',
      question: "Finde die Adjektive im Satz:",
      sentence: "Das kleine blaue Auto fährt schnell.",
      selectableWords: [
        { word: "Das", isCorrect: false, index: 0 },
        { word: "kleine", isCorrect: true, index: 1 },
        { word: "blaue", isCorrect: true, index: 2 },
        { word: "Auto", isCorrect: false, index: 3 },
        { word: "fährt", isCorrect: false, index: 4 },
        { word: "schnell.", isCorrect: true, index: 5 }
      ],
      type: 'german',
      explanation: "Die Adjektive sind 'kleine', 'blaue' und 'schnell' - sie beschreiben Eigenschaften."
    },
    {
      id: 7,
      questionType: 'multiple-choice',
      question: "Welcher Artikel gehört zu 'Haus'?",
      options: ["der", "die", "das", "den"],
      correctAnswer: 2,
      type: 'german',
      explanation: "Das Wort 'Haus' ist neutral, daher verwendet man den Artikel 'das'."
    },
    {
      id: 8,
      questionType: 'word-selection',
      question: "Markiere alle Wörter mit 'ie':",
      sentence: "Die Biene fliegt zu den vier Blumen.",
      selectableWords: [
        { word: "Die", isCorrect: true, index: 0 },
        { word: "Biene", isCorrect: true, index: 1 },
        { word: "fliegt", isCorrect: true, index: 2 },
        { word: "zu", isCorrect: false, index: 3 },
        { word: "den", isCorrect: false, index: 4 },
        { word: "vier", isCorrect: true, index: 5 },
        { word: "Blumen.", isCorrect: false, index: 6 }
      ],
      type: 'german',
      explanation: "Die Wörter mit 'ie' sind: 'Die', 'Biene', 'fliegt' und 'vier'."
    }
  ];

  // Shuffle and return more problems for variety
  const shuffled = [...problems].sort(() => Math.random() - 0.5);
  return shuffled;
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
      const a = Math.floor(Math.random() * 900) + 100;
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
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
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
      return generateMathProblem(grade);
  }
};

export function CategoryMathProblem({ category, grade, onComplete, onBack, userId }: CategoryMathProblemProps) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
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
  const [globalQuestions, setGlobalQuestions] = useState<Set<string>>(new Set());
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [sessionId] = useState(() => {
    // Create persistent session ID
    const storageKey = SESSION_KEY(category, grade, userId);
    let existingSessionId = localStorage.getItem(storageKey);
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random()}`;
      localStorage.setItem(storageKey, existingSessionId);
    }
    return existingSessionId;
  });
  const [debugInfo, setDebugInfo] = useState<any>({});
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
    // Load stored questions on component mount
    const storedQuestions = getStoredQuestions(category, grade, userId);
    setGlobalQuestions(storedQuestions);
    console.log(`🔄 Loaded ${storedQuestions.size} previously asked questions for ${category} Grade ${grade}`);
    generateProblems();
  }, [category, grade, userId]);

  const generateProblems = async () => {
    try {
      console.log(`🔄 Generating problems for ${category}, Grade ${grade}`);
      console.log(`📝 Global questions stored: ${globalQuestions.size}`);
      console.log(`🔍 Previously asked questions:`, Array.from(globalQuestions).slice(0, 5).map(q => q.substring(0, 50) + '...'));

      // Enhanced debug info
      const debugData = {
        category,
        grade,
        userId,
        sessionId,
        globalQuestionsCount: globalQuestions.size,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(debugData);

      // Try to generate AI problems with enhanced exclusion
      const aiProblems = await generateAIProblems();
      
      if (aiProblems.length >= totalQuestions) {
        const selectedProblems = aiProblems.slice(0, totalQuestions);
        setProblems(selectedProblems);
        
        // Update global question tracking
        const updatedGlobalQuestions = new Set(globalQuestions);
        selectedProblems.forEach(problem => {
          updatedGlobalQuestions.add(problem.question);
        });
        setGlobalQuestions(updatedGlobalQuestions);
        storeQuestions(category, grade, userId, updatedGlobalQuestions);
        
        console.log(`✅ Using AI-generated problems: ${selectedProblems.length}`);
        console.log(`📊 Total questions now stored: ${updatedGlobalQuestions.size}`);
        setGameStarted(true);
        return;
      } else {
        console.log(`⚠️ AI generated insufficient problems (${aiProblems.length}/${totalQuestions}), using enhanced fallback`);
      }
    } catch (error) {
      console.error('❌ AI generation failed:', error);
      toast({
        title: "Problem Generation",
        description: "Using backup questions due to generation issue",
        duration: 3000,
      });
    }

    // Enhanced fallback with better variety
    console.log('🔄 Using enhanced fallback problems...');
    const fallbackProblems = generateFallbackProblems();
    setProblems(fallbackProblems);
    setGameStarted(true);
  };

  const generateAIProblems = async (): Promise<SelectionQuestion[]> => {
    try {
      console.log('🤖 Attempting AI generation via Supabase Edge Function...');
      
      // Enhanced exclusion with both global and recent questions
      const excludeQuestions = Array.from(globalQuestions);
      console.log(`📝 Excluding ${excludeQuestions.length} global questions`);
      
      // Add debug logging for question exclusion
      if (excludeQuestions.length > 0) {
        console.log('🚫 Sample excluded questions:', excludeQuestions.slice(0, 3).map(q => q.substring(0, 40) + '...'));
      }
      
      const response = await supabase.functions.invoke('generate-problems', {
        body: {
          category,
          grade,
          count: totalQuestions + 5, // Generate more for better filtering
          excludeQuestions,
          sessionId,
          globalQuestionCount: globalQuestions.size,
          requestId: `${Date.now()}_${Math.random()}` // Unique request ID
        }
      });

      if (response.error) {
        console.error('❌ Supabase function error:', response.error);
        return [];
      }

      const problems = response.data?.problems || [];
      console.log(`🎯 AI generated ${problems.length} problems`);
      
      if (problems.length === 0) {
        console.warn('⚠️ AI returned empty problems array');
        return [];
      }

      // Additional client-side duplicate detection
      const uniqueProblems = problems.filter((problem: SelectionQuestion) => {
        const isDuplicate = Array.from(globalQuestions).some(existingQ => 
          similarity(problem.question.toLowerCase(), existingQ.toLowerCase()) > 0.7
        );
        if (isDuplicate) {
          console.log(`🔄 Filtered duplicate: "${problem.question.substring(0, 50)}..."`);
        }
        return !isDuplicate;
      });

      console.log(`✅ Final unique problems after filtering: ${uniqueProblems.length}`);
      return uniqueProblems;
    } catch (error) {
      console.error('❌ Error calling AI generation:', error);
      return [];
    }
  };

  // Simple string similarity function
  const similarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const generateFallbackProblems = (): SelectionQuestion[] => {
    console.log('🔄 Generating enhanced fallback problems...');
    const fallbackProblems: SelectionQuestion[] = [];
    
    if (category === 'Deutsch' && grade === 4) {
      // Enhanced German problems with more variety
      const allGrade4Problems = generateGrade4DeutschProblems();
      const availableProblems = allGrade4Problems.filter(problem => 
        !Array.from(globalQuestions).some(existingQ => 
          similarity(problem.question.toLowerCase(), existingQ.toLowerCase()) > 0.7
        )
      );
      
      if (availableProblems.length >= totalQuestions) {
        return availableProblems.slice(0, totalQuestions);
      } else {
        // Mix with generated problems if not enough unique ones
        fallbackProblems.push(...availableProblems);
        for (let i = availableProblems.length; i < totalQuestions; i++) {
          fallbackProblems.push(generateCategoryProblem(category, grade));
        }
      }
    } else {
      // Generate varied problems for other categories
      const problemTypes = ['basic', 'intermediate', 'advanced'];
      for (let i = 0; i < totalQuestions; i++) {
        const problemType = problemTypes[i % problemTypes.length];
        fallbackProblems.push(generateCategoryProblem(category, grade));
      }
    }
    
    console.log(`📝 Generated ${fallbackProblems.length} fallback problems`);
    return fallbackProblems.slice(0, totalQuestions);
  };

  const resetAnswerState = () => {
    setUserAnswer('');
    setSelectedMultipleChoice(null);
    setSelectedWords([]);
    setIsQuestionComplete(false);
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
        console.log('🔤 Word selection validation:');
        console.log('Selected words (indices):', selectedWords);
        console.log('Available words:', problem.selectableWords);
        
        const correctWordIndices = problem.selectableWords
          .filter(word => word.isCorrect)
          .map(word => word.index);
        
        console.log('Correct word indices:', correctWordIndices);
        
        // Sort both arrays for comparison
        const sortedSelected = [...selectedWords].sort((a, b) => a - b);
        const sortedCorrect = [...correctWordIndices].sort((a, b) => a - b);
        
        console.log('Sorted selected:', sortedSelected);
        console.log('Sorted correct:', sortedCorrect);
        
        // Check if arrays are equal
        isCorrect = sortedSelected.length === sortedCorrect.length &&
                   sortedSelected.every((index, i) => index === sortedCorrect[i]);
        
        console.log('Word selection result:', isCorrect);
        break;
        
      case 'matching':
        // Matching completion is handled by the MatchingQuestion component
        return;
        
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

      const dailyLimit = getDailyLimit();
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
              console.log('🔤 Word toggle:', wordIndex, 'Current selection:', selectedWords);
              if (selectedWords.includes(wordIndex)) {
                setSelectedWords(prev => prev.filter(i => i !== wordIndex));
              } else {
                setSelectedWords(prev => [...prev, wordIndex]);
              }
            }}
            disabled={feedback !== null}
          />
        );
      case 'matching':
        return (
          <MatchingQuestion
            question={currentQuestionData}
            onComplete={handleMatchingComplete}
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
                type={currentQuestionData.questionType === 'text-input' && typeof currentQuestionData.answer === 'number' ? "number" : "text"}
                inputMode={currentQuestionData.questionType === 'text-input' && typeof currentQuestionData.answer === 'number' ? "numeric" : "text"}
                pattern={currentQuestionData.questionType === 'text-input' && typeof currentQuestionData.answer === 'number' ? "[0-9]*" : undefined}
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
                    <p className="text-sm mb-4">{currentQuestionData.explanation}</p>
                  )}
                  
                  {feedback === 'incorrect' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">Richtige Antwort:</p>
                      <div className="text-sm text-blue-700">
                        {(() => {
                          switch (currentQuestionData.questionType) {
                            case 'multiple-choice':
                              return currentQuestionData.options[currentQuestionData.correctAnswer];
                            case 'word-selection':
                              const correctWords = currentQuestionData.selectableWords
                                .filter(word => word.isCorrect)
                                .map(word => word.word);
                              return correctWords.join(', ');
                            case 'text-input':
                              return (currentQuestionData as any).answer?.toString();
                            case 'matching':
                              return 'Siehe die richtige Zuordnung oben';
                            case 'drag-drop':
                              return 'Siehe die richtige Zuordnung oben';
                            default:
                              return 'Antwort nicht verfügbar';
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleNextQuestion}
                    className="w-full max-w-sm"
                    variant="default"
                  >
                    {currentProblem + 1 >= totalQuestions ? 'Fertig' : 'Weiter'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

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
