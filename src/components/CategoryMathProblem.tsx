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
  onComplete: (timeEarned: number, category: string) => void;
  onBack: () => void;
  userId: string;
}

const generateMathProblem = (grade: number): Problem => {
  if (grade <= 2) {
    // Klasse 1-2: Einfache Addition/Subtraktion bis 20
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
    // Klasse 3-4: Kleines Einmaleins und größere Zahlen
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
  } else if (grade <= 6) {
    // Klasse 5-6: Brüche und Dezimalzahlen
    const operations = ['fraction', 'decimal', 'percentage', 'multiply_large'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === 'fraction') {
      const numerator = Math.floor(Math.random() * 7) + 1;
      const denominator = Math.floor(Math.random() * 8) + 2;
      if (numerator < denominator) {
        const decimal = parseFloat((numerator / denominator).toFixed(2));
        return {
          id: 1,
          question: `Wandle den Bruch ${numerator}/${denominator} in eine Dezimalzahl um (2 Stellen):`,
          answer: decimal,
          type: 'math',
          explanation: `${numerator} ÷ ${denominator} = ${decimal}`
        };
      }
    } else if (op === 'percentage') {
      const percentage = Math.floor(Math.random() * 40) + 10;
      const value = Math.floor(Math.random() * 200) + 100;
      const answer = Math.round((percentage / 100) * value);
      return {
        id: 1,
        question: `Berechne ${percentage}% von ${value}:`,
        answer: answer,
        type: 'math',
        explanation: `${percentage}% von ${value} = ${answer}`
      };
    }
    
    // Fallback zu größeren Multiplikationen
    const a = Math.floor(Math.random() * 30) + 10;
    const b = Math.floor(Math.random() * 20) + 10;
    return {
      id: 1,
      question: `${a} × ${b} = ?`,
      answer: a * b,
      type: 'math',
      explanation: `${a} × ${b} = ${a * b}`
    };
  } else {
    // Klasse 7+: Komplexere Mathematik
    const operations = ['quadratic', 'root', 'percentage_complex', 'algebra'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === 'quadratic') {
      const base = Math.floor(Math.random() * 15) + 5;
      return {
        id: 1,
        question: `Was ist ${base}²?`,
        answer: base * base,
        type: 'math',
        explanation: `${base}² = ${base} × ${base} = ${base * base}`
      };
    } else if (op === 'root') {
      const squares = [16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
      const square = squares[Math.floor(Math.random() * squares.length)];
      const root = Math.sqrt(square);
      return {
        id: 1,
        question: `Was ist √${square}?`,
        answer: root,
        type: 'math',
        explanation: `√${square} = ${root}`
      };
    } else if (op === 'algebra') {
      const x = Math.floor(Math.random() * 10) + 2;
      const c = Math.floor(Math.random() * 20) + 5;
      const result = 3 * x + c;
      return {
        id: 1,
        question: `Löse: 3x + ${c} = ${result}. Was ist x?`,
        answer: x,
        type: 'math',
        explanation: `3x = ${result} - ${c} = ${result - c}, also x = ${x}`
      };
    }
    
    // Fallback
    const percentage = Math.floor(Math.random() * 50) + 25;
    const value = Math.floor(Math.random() * 500) + 200;
    const answer = Math.round((percentage / 100) * value);
    return {
      id: 1,
      question: `Berechne ${percentage}% von ${value}:`,
      answer: answer,
      type: 'math',
      explanation: `${percentage}% von ${value} = ${answer}`
    };
  }
};

const generateGermanProblem = (grade: number): Problem => {
  const germanProblems = grade <= 2 ? [
    {
      question: "Welcher Artikel gehört zu 'Hund'?",
      answer: "der",
      explanation: "'Hund' ist männlich und bekommt den Artikel 'der'"
    },
    {
      question: "Wie schreibt man das Tier, das 'Miau' macht?",
      answer: "Katze",
      explanation: "Das Tier, das 'Miau' macht, ist eine Katze"
    },
    {
      question: "Was ist das Gegenteil von 'groß'?",
      answer: "klein",
      explanation: "Das Gegenteil von 'groß' ist 'klein'"
    }
  ] : grade <= 4 ? [
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
    }
  ] : grade <= 6 ? [
    {
      question: "Welche Zeitform: 'Ich bin gelaufen'?",
      answer: "Perfekt",
      explanation: "'Ich bin gelaufen' ist die Perfekt-Form"
    },
    {
      question: "Setze den richtigen Fall ein: 'Ich helfe ___ Freund.' (der)",
      answer: "dem",
      explanation: "Nach 'helfen' steht der Dativ: 'dem Freund'"
    },
    {
      question: "Was ist ein Adjektiv? Nenne ein Beispiel.",
      answer: "schön",
      explanation: "Ein Adjektiv beschreibt Eigenschaften, z.B. 'schön', 'groß', 'schnell'"
    }
  ] : [
    {
      question: "Was ist ein Partizip II von 'lesen'?",
      answer: "gelesen",
      explanation: "Das Partizip II von 'lesen' ist 'gelesen'"
    },
    {
      question: "Erkläre den Unterschied zwischen 'dass' und 'das'.",
      answer: "dass ist Konjunktion",
      explanation: "'dass' ist eine Konjunktion, 'das' ist ein Artikel oder Pronomen"
    },
    {
      question: "Was ist ein Metapher? Nenne ein Beispiel.",
      answer: "Herz aus Stein",
      explanation: "Eine Metapher ist ein Vergleich ohne 'wie', z.B. 'Herz aus Stein'"
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
  const englishProblems = grade <= 2 ? [
    {
      question: "What color is the sun?",
      answer: "yellow",
      explanation: "The sun is yellow"
    },
    {
      question: "How do you say 'Hund' in English?",
      answer: "dog",
      explanation: "'Hund' in English is 'dog'"
    },
    {
      question: "Complete: 'I ___ happy.' (am/is/are)",
      answer: "am",
      explanation: "With 'I', we use 'am': I am happy"
    }
  ] : grade <= 4 ? [
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
    }
  ] : grade <= 6 ? [
    {
      question: "Choose the correct article: '___ apple' (a/an)",
      answer: "an",
      explanation: "Before vowel sounds, we use 'an': an apple"
    },
    {
      question: "Complete: 'She ___ a book yesterday.' (read - past)",
      answer: "read",
      explanation: "Past tense of 'read' is also 'read' (pronounced 'red')"
    },
    {
      question: "What do you call a baby dog?",
      answer: "puppy",
      explanation: "A baby dog is called a puppy"
    }
  ] : [
    {
      question: "What is the present perfect of 'write' with 'I'?",
      answer: "have written",
      explanation: "Present perfect: I have written"
    },
    {
      question: "Complete the conditional: 'If I ___ rich, I would travel.' (be)",
      answer: "were",
      explanation: "In conditionals, we use 'were' for all persons: If I were rich"
    },
    {
      question: "What is a synonym for 'big'?",
      answer: "large",
      explanation: "Large, huge, enormous are synonyms for 'big'"
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
  const geographyProblems = grade <= 2 ? [
    {
      question: "In welchem Land leben wir?",
      answer: "Deutschland",
      explanation: "Wir leben in Deutschland"
    },
    {
      question: "Wie heißt die größte Stadt in Deutschland?",
      answer: "Berlin",
      explanation: "Berlin ist die größte Stadt und Hauptstadt Deutschlands"
    },
    {
      question: "Welche Farbe hat das Meer?",
      answer: "blau",
      explanation: "Das Meer ist blau"
    }
  ] : grade <= 4 ? [
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
      question: "Auf welchem Kontinent liegt Deutschland?",
      answer: "Europa",
      explanation: "Deutschland liegt in Europa"
    }
  ] : grade <= 6 ? [
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
    }
  ] : [
    {
      question: "Welcher Ozean ist der größte der Welt?",
      answer: "Pazifik",
      explanation: "Der Pazifische Ozean ist der größte Ozean der Welt"
    },
    {
      question: "Wie viele Bundesländer hat Deutschland?",
      answer: "16",
      explanation: "Deutschland hat 16 Bundesländer"
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
  const historyProblems = grade <= 4 ? [
    {
      question: "Wer waren die Ritter?",
      answer: "Kämpfer im Mittelalter",
      explanation: "Ritter waren Kämpfer im Mittelalter mit Rüstung und Pferd"
    },
    {
      question: "Wie hießen die alten Ägypter-Könige?",
      answer: "Pharaonen",
      explanation: "Die Könige im alten Ägypten hießen Pharaonen"
    },
    {
      question: "Was bauten die Römer für Wasser?",
      answer: "Aquädukte",
      explanation: "Die Römer bauten Aquädukte, um Wasser zu transportieren"
    }
  ] : grade <= 6 ? [
    {
      question: "In welchem Jahr fiel die Berliner Mauer?",
      answer: "1989",
      explanation: "Die Berliner Mauer fiel am 9. November 1989"
    },
    {
      question: "Wann wurde die Bundesrepublik Deutschland gegründet?",
      answer: "1949",
      explanation: "Die BRD wurde am 23. Mai 1949 gegründet"
    },
    {
      question: "In welchem Jahrhundert lebte Martin Luther?",
      answer: "16. Jahrhundert",
      explanation: "Martin Luther lebte von 1483 bis 1546 im 16. Jahrhundert"
    }
  ] : [
    {
      question: "Wie hieß der erste Bundeskanzler der Bundesrepublik Deutschland?",
      answer: "Konrad Adenauer",
      explanation: "Konrad Adenauer war der erste Bundeskanzler (1949-1963)"
    },
    {
      question: "Wann endete der Zweite Weltkrieg in Europa?",
      answer: "1945",
      explanation: "Der Zweite Weltkrieg endete in Europa am 8. Mai 1945"
    },
    {
      question: "Wer war der erste Kaiser des Heiligen Römischen Reiches?",
      answer: "Otto I",
      explanation: "Otto I. wurde 962 zum ersten Kaiser gekrönt"
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
    physics: grade <= 6 ? [
      {
        question: "Was braucht Feuer zum Brennen?",
        answer: "Sauerstoff",
        explanation: "Feuer braucht Sauerstoff zum Brennen"
      },
      {
        question: "Bei welcher Temperatur gefriert Wasser?",
        answer: "0°C",
        explanation: "Wasser gefriert bei 0 Grad Celsius"
      },
      {
        question: "Was ist schwerer: Eisen oder Holz?",
        answer: "Eisen",
        explanation: "Eisen ist schwerer als Holz"
      }
    ] : [
      {
        question: "Was ist die Einheit für Kraft?",
        answer: "Newton",
        explanation: "Die Einheit für Kraft ist Newton (N)"
      },
      {
        question: "Wie schnell ist Licht im Vakuum? (in km/s, gerundet)",
        answer: "300000",
        explanation: "Lichtgeschwindigkeit beträgt etwa 300.000 km/s"
      },
      {
        question: "Was besagt das erste Newton'sche Gesetz?",
        answer: "Trägheitsgesetz",
        explanation: "Das erste Newton'sche Gesetz ist das Trägheitsgesetz"
      }
    ],
    biology: grade <= 6 ? [
      {
        question: "Wie viele Beine hat eine Spinne?",
        answer: "8",
        explanation: "Spinnen haben 8 Beine"
      },
      {
        question: "Was brauchen Pflanzen zum Wachsen?",
        answer: "Licht und Wasser",
        explanation: "Pflanzen brauchen Licht, Wasser und Nährstoffe zum Wachsen"
      },
      {
        question: "Wie nennt man Tiere, die nur Pflanzen fressen?",
        answer: "Pflanzenfresser",
        explanation: "Tiere, die nur Pflanzen fressen, nennt man Pflanzenfresser"
      }
    ] : [
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
        question: "Wie heißt der Prozess der Zellteilung?",
        answer: "Mitose",
        explanation: "Die normale Zellteilung heißt Mitose"
      }
    ],
    chemistry: grade <= 6 ? [
      {
        question: "Aus was besteht Wasser?",
        answer: "Wasserstoff und Sauerstoff",
        explanation: "Wasser besteht aus Wasserstoff und Sauerstoff"
      },
      {
        question: "Was passiert mit Eis bei Wärme?",
        answer: "schmilzt",
        explanation: "Eis schmilzt bei Wärme und wird zu Wasser"
      },
      {
        question: "Welche Farbe hat Kupfer?",
        answer: "rot",
        explanation: "Kupfer hat eine rötliche Farbe"
      }
    ] : [
      {
        question: "Was ist das chemische Symbol für Sauerstoff?",
        answer: "O",
        explanation: "Das chemische Symbol für Sauerstoff ist O"
      },
      {
        question: "Was entsteht, wenn man Säure und Base mischt?",
        answer: "Salz und Wasser",
        explanation: "Bei der Neutralisation entstehen Salz und Wasser"
      },
      {
        question: "Wie heißt die Verbindung NaCl?",
        answer: "Kochsalz",
        explanation: "NaCl ist die chemische Formel für Kochsalz"
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
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      const problem = questionGenerator();
      const questionKey = `${problem.question}-${problem.answer}`;
      
      if (!usedQuestions.has(questionKey)) {
        setUsedQuestions(prev => new Set(prev).add(questionKey));
        return problem;
      }
      attempts++;
    }
    
    const problem = questionGenerator();
    return problem;
  };

  const generateProblems = () => {
    console.log('🎯 Generating problems for category:', category, 'grade:', grade);
    const newProblems: Problem[] = [];
    setUsedQuestions(new Set());
    
    for (let i = 0; i < totalQuestions; i++) {
      let generatedProblem: Problem;
      
      // KORRIGIERT: Korrekte Zuordnung der deutschen Kategorien zu den Generatoren
      switch (category) {
        case 'Mathematik':
          generatedProblem = generateUniqueQuestion(() => generateMathProblem(grade));
          break;
        case 'Deutsch':
          generatedProblem = generateUniqueQuestion(() => generateGermanProblem(grade));
          break;
        case 'Englisch':
          generatedProblem = generateUniqueQuestion(() => generateEnglishProblem(grade));
          break;
        case 'Geographie':
          generatedProblem = generateUniqueQuestion(() => generateGeographyProblem(grade));
          break;
        case 'Geschichte':
          generatedProblem = generateUniqueQuestion(() => generateHistoryProblem(grade));
          break;
        case 'Physik':
          generatedProblem = generateUniqueQuestion(() => generateOtherSubjectProblem('physics', grade));
          break;
        case 'Biologie':
          generatedProblem = generateUniqueQuestion(() => generateOtherSubjectProblem('biology', grade));
          break;
        case 'Chemie':
          generatedProblem = generateUniqueQuestion(() => generateOtherSubjectProblem('chemistry', grade));
          break;
        case 'Latein':
          generatedProblem = generateUniqueQuestion(() => generateOtherSubjectProblem('latin', grade));
          break;
        default:
          console.warn('⚠️ Unknown category, falling back to math:', category);
          generatedProblem = generateUniqueQuestion(() => generateMathProblem(grade));
      }
      
      console.log(`📝 Generated problem ${i + 1}:`, generatedProblem.question, '| Type:', generatedProblem.type);
      newProblems.push(generatedProblem);
    }
    
    setProblems(newProblems);
    setGameStarted(true);
    console.log('✅ All problems generated:', newProblems.length);
  };

  const checkAnswer = () => {
    if (!problems[currentProblem]) return;

    const problem = problems[currentProblem];
    const userAnswerNormalized = userAnswer.toString().toLowerCase().trim();
    const correctAnswerNormalized = problem.answer.toString().toLowerCase().trim();
    
    const acceptableAnswers = [
      correctAnswerNormalized,
      ...(problem.type === 'german' ? [
        correctAnswerNormalized.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
      ] : []),
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
