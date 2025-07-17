
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, X, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useChildSettings } from '@/hooks/useChildSettings';

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
  onComplete: (timeEarned: number) => void;
  onBack: () => void;
  userId: string;
}

// Improved problem generators for each category
const generateMathProblem = (grade: number): Problem => {
  const problems: Problem[] = [];
  
  if (grade <= 2) {
    // Grade 1-2: Basic addition/subtraction up to 20
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === '+') {
      const a = Math.floor(Math.random() * 15) + 1;
      const b = Math.floor(Math.random() * (20 - a)) + 1;
      const answer = a + b;
      problems.push({
        id: 1,
        question: `${a} + ${b} = ?`,
        answer: answer,
        type: 'math'
      });
    } else {
      const answer = Math.floor(Math.random() * 15) + 1;
      const a = answer + Math.floor(Math.random() * 10) + 1;
      const b = a - answer;
      problems.push({
        id: 1,
        question: `${a} - ${b} = ?`,
        answer: answer,
        type: 'math'
      });
    }
  } else if (grade <= 4) {
    // Grade 3-4: Multiplication tables and division
    const operations = ['+', '-', '×', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === '+') {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      problems.push({
        id: 1,
        question: `${a} + ${b} = ?`,
        answer: a + b,
        type: 'math'
      });
    } else if (op === '-') {
      const b = Math.floor(Math.random() * 30) + 10;
      const a = b + Math.floor(Math.random() * 50) + 10;
      problems.push({
        id: 1,
        question: `${a} - ${b} = ?`,
        answer: a - b,
        type: 'math'
      });
    } else if (op === '×') {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      problems.push({
        id: 1,
        question: `${a} × ${b} = ?`,
        answer: a * b,
        type: 'math'
      });
    } else {
      const b = Math.floor(Math.random() * 9) + 2;
      const answer = Math.floor(Math.random() * 9) + 2;
      const a = b * answer;
      problems.push({
        id: 1,
        question: `${a} ÷ ${b} = ?`,
        answer: answer,
        type: 'math'
      });
    }
  } else {
    // Grade 5+: More complex operations
    const operations = ['+', '-', '×', '÷', 'fraction', 'percentage'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === 'fraction') {
      const numerator = Math.floor(Math.random() * 8) + 1;
      const denominator = Math.floor(Math.random() * 8) + 2;
      const whole = Math.floor(Math.random() * 5) + 1;
      const decimal = parseFloat((numerator / denominator).toFixed(2));
      problems.push({
        id: 1,
        question: `Was ist ${numerator}/${denominator} als Dezimalzahl? (auf 2 Stellen gerundet)`,
        answer: decimal,
        type: 'math'
      });
    } else if (op === 'percentage') {
      const percentage = Math.floor(Math.random() * 50) + 10;
      const value = Math.floor(Math.random() * 200) + 50;
      const answer = Math.round((percentage / 100) * value);
      problems.push({
        id: 1,
        question: `Was sind ${percentage}% von ${value}?`,
        answer: answer,
        type: 'math'
      });
    } else {
      // Standard operations with larger numbers
      const a = Math.floor(Math.random() * 500) + 100;
      const b = Math.floor(Math.random() * 200) + 50;
      
      if (op === '+') {
        problems.push({
          id: 1,
          question: `${a} + ${b} = ?`,
          answer: a + b,
          type: 'math'
        });
      } else if (op === '-') {
        problems.push({
          id: 1,
          question: `${a} - ${b} = ?`,
          answer: a - b,
          type: 'math'
        });
      } else if (op === '×') {
        const smallA = Math.floor(Math.random() * 20) + 5;
        const smallB = Math.floor(Math.random() * 20) + 5;
        problems.push({
          id: 1,
          question: `${smallA} × ${smallB} = ?`,
          answer: smallA * smallB,
          type: 'math'
        });
      } else {
        const divisor = Math.floor(Math.random() * 15) + 5;
        const quotient = Math.floor(Math.random() * 20) + 5;
        const dividend = divisor * quotient;
        problems.push({
          id: 1,
          question: `${dividend} ÷ ${divisor} = ?`,
          answer: quotient,
          type: 'math'
        });
      }
    }
  }
  
  return problems[0];
};

const generateGermanProblem = (grade: number): Problem => {
  const germanProblems = [
    // Grammar problems
    {
      question: "Welcher Artikel gehört zu 'Haus'?",
      answer: "das",
      explanation: "'Haus' ist neutral und bekommt den Artikel 'das'"
    },
    {
      question: "Wie lautet der Plural von 'Kind'?",
      answer: "Kinder",
      explanation: "Der Plural von 'Kind' ist 'Kinder'"
    },
    {
      question: "Setze das richtige Verb ein: 'Ich ___ zur Schule.' (gehen)",
      answer: "gehe",
      explanation: "Bei 'ich' wird das Verb mit '-e' konjugiert: gehe"
    },
    {
      question: "Welches Wort ist richtig geschrieben: 'Fahrrad' oder 'Farrad'?",
      answer: "Fahrrad",
      explanation: "'Fahrrad' wird mit 'h' geschrieben"
    },
    {
      question: "Was ist das Gegenteil von 'groß'?",
      answer: "klein",
      explanation: "Das Gegenteil von 'groß' ist 'klein'"
    },
    {
      question: "Vervollständige: 'Der Hund bellt ___.' (laut/Adverb)",
      answer: "laut",
      explanation: "'Laut' beschreibt, wie der Hund bellt"
    },
    {
      question: "Welche Zeitform: 'Ich bin gelaufen'?",
      answer: "Perfekt",
      explanation: "'Ich bin gelaufen' ist die Perfekt-Form"
    },
    {
      question: "Setze den richtigen Fall ein: 'Ich helfe ___ Freund.' (der)",
      answer: "dem",
      explanation: "Nach 'helfen' steht der Dativ: 'dem Freund'"
    }
  ];

  const randomIndex = Math.floor(Math.random() * germanProblems.length);
  return {
    id: randomIndex + 1,
    question: germanProblems[randomIndex].question,
    answer: germanProblems[randomIndex].answer,
    type: 'german',
    explanation: germanProblems[randomIndex].explanation
  };
};

const generateEnglishProblem = (grade: number): Problem => {
  const englishProblems = [
    {
      question: "What is the plural of 'mouse'?",
      answer: "mice",
      explanation: "The plural of 'mouse' is 'mice'"
    },
    {
      question: "Complete: 'I ___ to school every day.' (go)",
      answer: "go",
      explanation: "With 'I', we use the base form 'go'"
    },
    {
      question: "What is the past tense of 'run'?",
      answer: "ran",
      explanation: "The past tense of 'run' is 'ran'"
    },
    {
      question: "Choose the correct article: '___ apple' (a/an)",
      answer: "an",
      explanation: "Before vowel sounds, we use 'an': an apple"
    },
    {
      question: "What color do you get when you mix red and blue?",
      answer: "purple",
      explanation: "Red and blue make purple"
    },
    {
      question: "Complete: 'She ___ a book yesterday.' (read - past)",
      answer: "read",
      explanation: "Past tense of 'read' is also 'read' (pronounced 'red')"
    },
    {
      question: "What is the opposite of 'hot'?",
      answer: "cold",
      explanation: "The opposite of 'hot' is 'cold'"
    },
    {
      question: "How many days are in a week?",
      answer: "seven",
      explanation: "There are seven days in a week"
    },
    {
      question: "Complete: 'There ___ three cats in the garden.' (is/are)",
      answer: "are",
      explanation: "With plural 'cats', we use 'are'"
    },
    {
      question: "What do you call a baby dog?",
      answer: "puppy",
      explanation: "A baby dog is called a puppy"
    }
  ];

  const randomIndex = Math.floor(Math.random() * englishProblems.length);
  return {
    id: randomIndex + 1,
    question: englishProblems[randomIndex].question,
    answer: englishProblems[randomIndex].answer,
    type: 'english',
    explanation: englishProblems[randomIndex].explanation
  };
};

const generateGeographyProblem = (grade: number): Problem => {
  const geographyProblems = [
    {
      question: "Was ist die Hauptstadt von Deutschland?",
      answer: "Berlin",
      explanation: "Berlin ist die Hauptstadt von Deutschland"
    },
    {
      question: "Welcher ist der längste Fluss in Deutschland?",
      answer: "Rhein",
      explanation: "Der Rhein ist mit 1.233 km der längste Fluss in Deutschland"
    },
    {
      question: "Auf welchem Kontinent liegt Ägypten?",
      answer: "Afrika",
      explanation: "Ägypten liegt in Afrika"
    },
    {
      question: "Was ist der höchste Berg in Deutschland?",
      answer: "Zugspitze",
      explanation: "Die Zugspitze ist mit 2.962 m der höchste Berg Deutschlands"
    },
    {
      question: "Welches Meer grenzt an die deutsche Nordseeküste?",
      answer: "Nordsee",
      explanation: "An der deutschen Nordseeküste liegt die Nordsee"
    },
    {
      question: "In welchem Bundesland liegt München?",
      answer: "Bayern",
      explanation: "München ist die Hauptstadt von Bayern"
    },
    {
      question: "Welcher Ozean ist der größte der Welt?",
      answer: "Pazifik",
      explanation: "Der Pazifische Ozean ist der größte Ozean der Welt"
    },
    {
      question: "Was ist die Hauptstadt von Frankreich?",
      answer: "Paris",
      explanation: "Paris ist die Hauptstadt von Frankreich"
    },
    {
      question: "Welcher Planet ist der Erde am nächsten?",
      answer: "Venus",
      explanation: "Die Venus ist der Erde am nächsten"
    },
    {
      question: "Wie viele Bundesländer hat Deutschland?",
      answer: "16",
      explanation: "Deutschland hat 16 Bundesländer"
    },
    {
      question: "Welche Stadt liegt am Rhein und ist bekannt für ihren Dom?",
      answer: "Köln",
      explanation: "Köln liegt am Rhein und ist berühmt für den Kölner Dom"
    },
    {
      question: "Was ist der kleinste Kontinent?",
      answer: "Australien",
      explanation: "Australien ist der kleinste Kontinent"
    }
  ];

  const randomIndex = Math.floor(Math.random() * geographyProblems.length);
  return {
    id: randomIndex + 1,
    question: geographyProblems[randomIndex].question,
    answer: geographyProblems[randomIndex].answer,
    type: 'geography',
    explanation: geographyProblems[randomIndex].explanation
  };
};

const generateHistoryProblem = (grade: number): Problem => {
  const historyProblems = [
    {
      question: "In welchem Jahr fiel die Berliner Mauer?",
      answer: "1989",
      explanation: "Die Berliner Mauer fiel am 9. November 1989"
    },
    {
      question: "Wie hieß der erste Bundeskanzler der Bundesrepublik Deutschland?",
      answer: "Konrad Adenauer",
      explanation: "Konrad Adenauer war der erste Bundeskanzler (1949-1963)"
    },
    {
      question: "In welchem Jahr wurde die Bundesrepublik Deutschland gegründet?",
      answer: "1949",
      explanation: "Die BRD wurde am 23. Mai 1949 gegründet"
    },
    {
      question: "Welcher römische Kaiser machte das Christentum zur Staatsreligion?",
      answer: "Konstantin",
      explanation: "Kaiser Konstantin I. machte das Christentum zur Staatsreligion"
    },
    {
      question: "Wann endete der Zweite Weltkrieg in Europa?",
      answer: "1945",
      explanation: "Der Zweite Weltkrieg endete in Europa am 8. Mai 1945"
    },
    {
      question: "Wie lange dauerte der Dreißigjährige Krieg?",
      answer: "30 Jahre",
      explanation: "Der Dreißigjährige Krieg dauerte von 1618 bis 1648, also 30 Jahre"
    },
    {
      question: "Welche Dynastie herrschte im alten Ägypten über die Pharaonen?",
      answer: "verschiedene",
      explanation: "Es gab verschiedene Dynastien, nicht nur eine"
    },
    {
      question: "In welchem Jahrhundert lebte Martin Luther?",
      answer: "16. Jahrhundert",
      explanation: "Martin Luther lebte von 1483 bis 1546 im 16. Jahrhundert"
    },
    {
      question: "Wer war der erste Kaiser des Heiligen Römischen Reiches?",
      answer: "Otto I",
      explanation: "Otto I. wurde 962 zum ersten Kaiser gekrönt"
    },
    {
      question: "In welchem Jahr begann der Erste Weltkrieg?",
      answer: "1914",
      explanation: "Der Erste Weltkrieg begann 1914"
    },
    {
      question: "Wie hieß die Hauptstadt des Römischen Reiches?",
      answer: "Rom",
      explanation: "Rom war die Hauptstadt des Römischen Reiches"
    },
    {
      question: "Welches Ereignis führte zur Französischen Revolution?",
      answer: "Finanzkrisen",
      explanation: "Finanzkrisen und soziale Ungerechtigkeiten führten zur Revolution 1789"
    }
  ];

  const randomIndex = Math.floor(Math.random() * historyProblems.length);
  return {
    id: randomIndex + 1,
    question: historyProblems[randomIndex].question,
    answer: historyProblems[randomIndex].answer,
    type: 'history',
    explanation: historyProblems[randomIndex].explanation
  };
};

const generateOtherSubjectProblem = (category: string, grade: number): Problem => {
  const problems: { [key: string]: any[] } = {
    physics: [
      {
        question: "Was ist die Einheit für Kraft?",
        answer: "Newton",
        explanation: "Die Einheit für Kraft ist Newton (N)"
      },
      {
        question: "Bei welcher Temperatur gefriert Wasser?",
        answer: "0°C",
        explanation: "Wasser gefriert bei 0 Grad Celsius"
      },
      {
        question: "Wie schnell ist Licht im Vakuum? (in km/s, gerundet)",
        answer: "300000",
        explanation: "Lichtgeschwindigkeit beträgt etwa 300.000 km/s"
      }
    ],
    biology: [
      {
        question: "Wie viele Herzkammern hat ein menschliches Herz?",
        answer: "4",
        explanation: "Das menschliche Herz hat vier Kammern"
      },
      {
        question: "Welches Gas atmen Pflanzen bei der Photosynthese ein?",
        answer: "Kohlendioxid",
        explanation: "Pflanzen nehmen CO₂ auf und geben Sauerstoff ab"
      },
      {
        question: "Wie nennt man Tiere, die nur Pflanzen fressen?",
        answer: "Pflanzenfresser",
        explanation: "Tiere, die nur Pflanzen fressen, nennt man Pflanzenfresser oder Herbivoren"
      }
    ],
    chemistry: [
      {
        question: "Was ist das chemische Symbol für Sauerstoff?",
        answer: "O",
        explanation: "Das chemische Symbol für Sauerstoff ist O"
      },
      {
        question: "Aus welchen Elementen besteht Wasser?",
        answer: "Wasserstoff und Sauerstoff",
        explanation: "Wasser (H₂O) besteht aus Wasserstoff und Sauerstoff"
      },
      {
        question: "Was entsteht, wenn man Säure und Base mischt?",
        answer: "Salz und Wasser",
        explanation: "Bei der Neutralisation entstehen Salz und Wasser"
      }
    ],
    latin: [
      {
        question: "Was bedeutet 'aqua' auf Deutsch?",
        answer: "Wasser",
        explanation: "'Aqua' ist das lateinische Wort für Wasser"
      },
      {
        question: "Wie heißt 'Frieden' auf Lateinisch?",
        answer: "pax",
        explanation: "'Pax' bedeutet Frieden auf Lateinisch"
      },
      {
        question: "Was bedeutet 'amare'?",
        answer: "lieben",
        explanation: "'Amare' bedeutet lieben"
      }
    ]
  };

  const categoryProblems = problems[category] || problems.physics;
  const randomIndex = Math.floor(Math.random() * categoryProblems.length);
  
  return {
    id: randomIndex + 1,
    question: categoryProblems[randomIndex].question,
    answer: categoryProblems[randomIndex].answer,
    type: category as any,
    explanation: categoryProblems[randomIndex].explanation
  };
};

export function CategoryMathProblem({ category, grade, onComplete, onBack, userId }: CategoryMathProblemProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { settings } = useChildSettings(userId);

  const totalQuestions = 5;

  useEffect(() => {
    generateProblems();
    const timer = setInterval(() => {
      if (gameStarted) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, category, grade]);

  const generateUniqueQuestion = (questionGenerator: () => Problem): Problem => {
    let attempts = 0;
    const maxAttempts = 20; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      const problem = questionGenerator();
      const questionKey = `${problem.question}-${problem.answer}`;
      
      if (!usedQuestions.has(questionKey)) {
        setUsedQuestions(prev => new Set(prev).add(questionKey));
        return problem;
      }
      attempts++;
    }
    
    // If we can't find a unique question, generate a new one anyway
    const problem = questionGenerator();
    return problem;
  };

  const generateProblems = () => {
    const newProblems: Problem[] = [];
    setUsedQuestions(new Set()); // Reset used questions for new session
    
    for (let i = 0; i < totalQuestions; i++) {
      let problem: Problem;
      
      switch (category) {
        case 'Mathematik':
          problem = generateUniqueQuestion(() => generateMathProblem(grade));
          break;
        case 'Deutsch':
          problem = generateUniqueQuestion(() => generateGermanProblem(grade));
          break;
        case 'Englisch':
          problem = generateUniqueQuestion(() => generateEnglishProblem(grade));
          break;
        case 'Geographie':
          problem = generateUniqueQuestion(() => generateGeographyProblem(grade));
          break;
        case 'Geschichte':
          problem = generateUniqueQuestion(() => generateHistoryProblem(grade));
          break;
        case 'Physik':
          problem = generateUniqueQuestion(() => generateOtherSubjectProblem('physics', grade));
          break;
        case 'Biologie':
          problem = generateUniqueQuestion(() => generateOtherSubjectProblem('biology', grade));
          break;
        case 'Chemie':
          problem = generateUniqueQuestion(() => generateOtherSubjectProblem('chemistry', grade));
          break;
        case 'Latein':
          problem = generateUniqueQuestion(() => generateOtherSubjectProblem('latin', grade));
          break;
        default:
          problem = generateUniqueQuestion(() => generateMathProblem(grade));
      }
      
      newProblems.push(problem);
    }
    
    setProblems(newProblems);
    setGameStarted(true);
  };

  const checkAnswer = () => {
    if (!problems[currentProblem]) return;

    const problem = problems[currentProblem];
    const userAnswerNormalized = userAnswer.toString().toLowerCase().trim();
    const correctAnswerNormalized = problem.answer.toString().toLowerCase().trim();
    
    // Check for multiple acceptable answers
    const acceptableAnswers = [
      correctAnswerNormalized,
      // For German subjects, accept common variations
      ...(problem.type === 'german' ? [
        correctAnswerNormalized.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
      ] : []),
      // For numbers, accept both string and number format
      ...(typeof problem.answer === 'number' ? [problem.answer.toString()] : [])
    ];

    const isCorrect = acceptableAnswers.includes(userAnswerNormalized) || 
                     userAnswerNormalized === correctAnswerNormalized;

    if (isCorrect) {
      setFeedback('correct');
      setCorrectAnswers(prev => prev + 1);
      toast({
        title: "Richtig! 🎉",
        description: problem.explanation || "Gut gemacht!",
      });
    } else {
      setFeedback('incorrect');
      toast({
        title: "Nicht ganz richtig 📚",
        description: `Die richtige Antwort ist: ${problem.answer}. ${problem.explanation || ''}`,
        variant: "destructive",
      });
    }

    setTimeout(() => {
      if (currentProblem < totalQuestions - 1) {
        setCurrentProblem(prev => prev + 1);
        setUserAnswer('');
        setFeedback(null);
      } else {
        completeGame();
      }
    }, 2000);
  };

  const completeGame = async () => {
    if (!settings) return;

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

    const minutesPerTask = settings[categoryMapping[category]] || 5;
    const timeEarned = correctAnswers * minutesPerTask;

    try {
      const { error } = await supabase.from('learning_sessions').insert({
        user_id: userId,
        category: category,
        grade: grade,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_spent: timeElapsed,
        time_earned: timeEarned,
      });

      if (error) throw error;

      onComplete(timeEarned);
    } catch (error: any) {
      console.error('Fehler beim Speichern der Lernsession:', error);
      toast({
        title: "Fehler",
        description: "Die Lernsession konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Problem Card */}
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
                  type="text"
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
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {feedback === 'correct' ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    feedback === 'correct' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {feedback === 'correct' ? 'Richtig!' : 'Nicht richtig'}
                  </span>
                </div>
                {feedback === 'incorrect' && (
                  <p className="text-red-700">
                    Die richtige Antwort ist: <strong>{currentQuestionData.answer}</strong>
                  </p>
                )}
                {currentQuestionData.explanation && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentQuestionData.explanation}
                  </p>
                )}
              </div>
            )}

            {!feedback && (
              <div className="text-center">
                <Button 
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="h-12 px-8"
                >
                  Antwort prüfen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm">
              <span>Richtige Antworten:</span>
              <span className="font-medium">{correctAnswers} / {currentProblem + (feedback ? 1 : 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
