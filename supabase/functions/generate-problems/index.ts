
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProblemRequest {
  category: string;
  grade: number;
  count: number;
  excludeQuestions?: string[];
  sessionId?: string;
  globalQuestionCount?: number;
  requestId?: string;
}

interface BaseQuestion {
  id: number;
  question: string;
  type: string;
  explanation: string;
}

interface TextInputQuestion extends BaseQuestion {
  questionType: 'text-input';
  answer: string | number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  questionType: 'multiple-choice';
  options: string[];
  correctAnswer: number;
}

interface WordSelectionQuestion extends BaseQuestion {
  questionType: 'word-selection';
  sentence: string;
  selectableWords: Array<{
    word: string;
    isCorrect: boolean;
    index: number;
  }>;
}

interface MatchingQuestion extends BaseQuestion {
  questionType: 'matching';
  items: Array<{
    id: string;
    content: string;
    category: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    acceptsItems: string[];
  }>;
}

type SelectionQuestion = TextInputQuestion | MultipleChoiceQuestion | WordSelectionQuestion | MatchingQuestion;

const getSubjectPrompt = (category: string, grade: number): string => {
  const prompts = {
    'Mathematik': {
      1: 'Additions- und Subtraktionsaufgaben bis 20 (z.B. 7+5, 13-8). Einfache Zahlenreihen.',
      2: 'Additions- und Subtraktionsaufgaben bis 100 (z.B. 34+27, 68-19). Kleines Einmaleins bis 5.',
      3: 'Einmaleins bis 10 (z.B. 7×8, 56÷7). Addition/Subtraktion bis 1000 (z.B. 234+178).',
      4: 'Großes Einmaleins, schriftliche Division (z.B. 144÷12, 23×17). Tausenderraum komplett.',
      5: 'Brüche und Dezimalzahlen (z.B. 3/4 + 1/4, 2,5 × 4). Prozentrechnung Grundlagen.',
      6: 'Bruchrechnung komplett (z.B. 2/3 × 3/4). Prozentrechnung (z.B. 20% von 150).',
      7: 'Gleichungen lösen (z.B. 3x + 7 = 22). Geometrie: Flächen berechnen.',
      8: 'Lineare Gleichungssysteme. Pythagoras. Zinsrechnung.',
      9: 'Quadratische Gleichungen. Trigonometrie Grundlagen.',
      10: 'Funktionen. Exponentialrechnung. Komplexe Geometrie.'
    },
    'Deutsch': {
      1: 'Multiple Choice und Wortauswahl: Silben erkennen, Groß-/Kleinschreibung, einfache Wörter.',
      2: 'Multiple Choice: Satzzeichen, Wortarten (Nomen/Verben), Rechtschreibregeln.',
      3: 'Wortauswahl und Multiple Choice: Zeitformen, Adjektive, ck/tz-Regeln.',
      4: 'Interaktive Satzglied-Bestimmung, wörtliche Rede zuordnen, ie/ei/ai-Rechtschreibung.',
      5: 'Matching Fälle, Multiple Choice Konjunktionen, Wortauswahl Satzarten.',
      6: 'Multiple Choice Aktiv/Passiv, Matching indirekte Rede, Kommaregeln.',
      7: 'Satzgefüge-Analyse per Auswahl, Matching Stilmittel, Multiple Choice Textanalyse.',
      8: 'Multiple Choice Konjunktiv, Matching Argumentationsstrukturen, Textanalyse-Auswahl.',
      9: 'Epochen zuordnen per Matching, Multiple Choice rhetorische Mittel, Erörterungs-Strukturen.',
      10: 'Sprachgeschichte-Timeline, komplexe Textinterpretation-Auswahl, Literaturkritik-Kategorien.'
    },
    'Englisch': {
      1: 'Grundwortschatz: Farben, Zahlen 1-10, Familie (mother, father, sister).',
      2: 'Erweiterte Zahlen bis 100. Körperteile. Einfache Sätze (I am, You are).',
      3: 'Simple Present Tense (I go, He goes). Fragen mit Do/Does. Uhrzeiten.',
      4: 'Simple Past Tense (I went, I was). Regelmäßige und unregelmäßige Verben.',
      5: 'Present Perfect (I have done). Präpositionen (in, on, at). Conditional Type 1.',
      6: 'Past Perfect. Passive Voice Grundlagen. Relative Clauses (who, which).',
      7: 'Reported Speech. Conditional Type 2. Modal Verbs (might, should, could).',
      8: 'Gerund vs. Infinitive. Conditional Type 3. Advanced Grammar.',
      9: 'Subjunctive. Complex sentence structures. Literature analysis.',
      10: 'Advanced rhetoric. Academic writing. Literary criticism.'
    },
    'Geographie': {
      1: 'Deutschland: Bundesländer-Namen. Nachbarländer (Frankreich, Polen).',
      2: 'Deutsche Hauptstädte (Berlin, München). Flüsse (Rhein, Elbe).',
      3: 'Europa: Länder und Hauptstädte (Italien-Rom, Spanien-Madrid).',
      4: 'Kontinente benennen. Ozeane (Atlantik, Pazifik). Deutsche Gebirge.',
      5: 'Klimazonen der Erde. Längste Flüsse weltweit. Bevölkerungsdichte.',
      6: 'Wirtschaftsräume Europas. Rohstoffe und deren Vorkommen.',
      7: 'Globalisierung. Entwicklungsländer vs. Industrieländer. Migration.',
      8: 'Klimawandel Auswirkungen. Nachhaltigkeit. Stadtgeographie.',
      9: 'Geopolitik. Internationale Organisationen (EU, UN). Globale Konflikte.',
      10: 'Demographischer Wandel. Ressourcenkonflikte. Zukunft der Erde.'
    },
    'Geschichte': {
      1: 'Steinzeit: Wie lebten die Menschen? Erfindung des Feuers.',
      2: 'Römer in Deutschland. Mittelalter: Ritter und Burgen.',
      3: 'Erfindung des Buchdrucks. Entdeckung Amerikas durch Kolumbus.',
      4: 'Französische Revolution 1789. Napoleon Bonaparte.',
      5: 'Industrialisierung. Dampfmaschine. Erste Eisenbahn.',
      6: 'Erster Weltkrieg 1914-1918. Weimarer Republik.',
      7: 'Zweiter Weltkrieg 1939-1945. Holocaust. Nationalsozialismus.',
      8: 'Kalter Krieg. Teilung Deutschlands. Berliner Mauer.',
      9: 'Deutsche Wiedervereinigung 1990. Fall der Berliner Mauer.',
      10: 'Europäische Union. Globalisierung. Digitales Zeitalter.'
    },
    'Physik': {
      4: 'Aggregatzustände (fest, flüssig, gasförmig). Magnetismus Grundlagen.',
      5: 'Licht und Schatten. Schall: laut und leise. Stromkreis einfach.',
      6: 'Hebel und Rollen. Optik: Spiegel und Linsen. Elektrische Geräte.',
      7: 'Geschwindigkeit berechnen (v = s/t). Dichte. Auftrieb im Wasser.',
      8: 'Kraft und Beschleunigung. Ohmsches Gesetz (U = R × I). Wärmelehre.',
      9: 'Energie und Arbeit. Elektrische Leistung. Atombau Grundlagen.',
      10: 'Radioaktivität. Kernspaltung. Relativitätstheorie Einführung.'
    },
    'Biologie': {
      4: 'Säugetiere vs. Vögel. Photosynthese einfach. Körperteile des Menschen.',
      5: 'Nahrungskette (Produzent, Konsument). Atmung und Kreislauf.',
      6: 'Zelle: Zellkern, Zellwand. Fortpflanzung bei Tieren. Ökosystem Wald.',
      7: 'Genetik: Vererbung einfach. Evolution: Darwin. Immunsystem.',
      8: 'DNA und Chromosomen. Enzyme. Fotosynthese detailliert.',
      9: 'Mendel Gesetze. Mutation. Neurobiologie Grundlagen.',
      10: 'Gentechnik. Biotechnologie. Ökologie und Umweltschutz.'
    },
    'Chemie': {
      6: 'Elemente und Verbindungen. Chemische Reaktion erkennen.',
      7: 'Periodensystem: Gruppen und Perioden. Säuren und Basen.',
      8: 'Chemische Formeln (H2O, CO2). Oxidation und Reduktion.',
      9: 'Organische Chemie: Kohlenwasserstoffe. Alkohol und Säuren.',
      10: 'Biochemie: Proteine und Kohlenhydrate. Kunststoffe.'
    },
    'Latein': {
      6: 'Lateinische Grundwörter: familia, domus, schola. Nominativ und Akkusativ.',
      7: 'Deklination: a-Deklination (rosa, rosae). Präsens der Verben.',
      8: 'Imperfekt und Perfekt. Alle Fälle. Participium Perfectum Passiv.',
      9: 'AcI (Accusativus cum Infinitivo). Konjunktiv. Römische Geschichte.',
      10: 'Übersetzung komplexer Texte. Stilmittel. Römische Philosophie.'
    }
  };
  
  const categoryPrompts = prompts[category as keyof typeof prompts];
  const specificPrompt = categoryPrompts?.[grade as keyof typeof categoryPrompts] || 
                        categoryPrompts?.[Math.min(Object.keys(categoryPrompts).length, grade) as keyof typeof categoryPrompts] ||
                        'Altersgerechte Aufgaben erstellen';
  
  return `Erstelle Aufgaben für ${category}, Klasse ${grade}: ${specificPrompt}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      category, 
      grade, 
      count = 5, 
      excludeQuestions = [], 
      sessionId,
      globalQuestionCount = 0,
      requestId
    }: ProblemRequest = await req.json();
    
    console.log(`🎯 Request ID: ${requestId}`);
    console.log(`Generating ${count} problems for ${category}, Grade ${grade}, Session: ${sessionId}`);
    console.log(`Excluding ${excludeQuestions.length} questions from ${globalQuestionCount} total stored`);
    console.log(`Sample excluded:`, excludeQuestions.slice(0, 2).map(q => q.substring(0, 30) + '...'));

    const subjectPrompt = getSubjectPrompt(category, grade);
    
    // Enhanced exclusion text with stronger language
    const excludeText = excludeQuestions.length > 0 
      ? `\n\n🚫 ABSOLUT KRITISCH - VERMEIDE DIESE ${excludeQuestions.length} BEREITS GESTELLTEN FRAGEN:\n${excludeQuestions.slice(0, 15).map((q, i) => `${i+1}. "${q}"`).join('\n')}\n\n⚡ ERSTELLE KOMPLETT ANDERE FRAGEN MIT:\n- VÖLLIG unterschiedlichen Zahlen/Werten (keine ähnlichen wie ${excludeQuestions.filter(q => q.includes('+')).slice(0, 3).map(q => q.split(' ')[0] + '+' + q.split(' ')[2]).join(', ')})\n- Anderen Themen/Unterthemen\n- Verschiedenen Formulierungen\n- Neuen Beispielen und Begriffen\n- Anderen Operationen (nicht nur Addition bei Mathe)\n\n${excludeQuestions.length > 15 ? `... und ${excludeQuestions.length - 15} weitere bereits verwendete Fragen` : ''}`
      : '\n\n✨ Erste Sitzung - erstelle völlig neue und einzigartige Aufgaben!';

    const creativityBoost = excludeQuestions.length > 3 ? 
      '\n\n🎨 MAXIMALE KREATIVITÄT ERFORDERLICH: Da bereits Fragen gestellt wurden, sei extrem kreativ und nutze völlig neue Ansätze, andere Themenbereiche und innovative Fragestellungen! KEINE WIEDERHOLUNGEN!' : '';

    const enhancedPrompt = `Du bist ein erfahrener Lehrer für interaktives Lernen. Erstelle genau ${count} VÖLLIG NEUE UND EINZIGARTIGE Aufgaben mit verschiedenen Fragetypen.${excludeText}${creativityBoost}

NEUE FRAGETYPEN FÜR BESSERE UX:
1. "multiple-choice": 4 Antwortoptionen (A, B, C, D)
2. "word-selection": Klickbare Wörter in Sätzen auswählen
3. "matching": Zuordnungsaufgaben mit Klick-Interface (ersetzt drag-drop)
4. "text-input": Nur wenn andere Typen nicht passen

INTERAKTIVE AUFGABEN FÜR ALLE FÄCHER:
- MATHEMATIK: Zahlen nach Stellenwerten sortieren (matching), Geometrische Formen zuordnen (matching), Rechenarten per Multiple Choice
- DEUTSCH: Satzglieder per Klick markieren (word-selection), Wortarten per Multiple Choice, Rechtschreibregeln per Matching
- ALLE ANDEREN FÄCHER: Multiple Choice bevorzugen, bei Zuordnungsaufgaben matching verwenden

WICHTIG FÜR MATCHING FORMAT:
Verwende immer dieses exakte Format für matching:
{
  "questionType": "matching",
  "question": "Ordne die Elemente zu:",
  "items": [
    {"id": "item-1", "content": "Element1", "category": "Kategorie1"},
    {"id": "item-2", "content": "Element2", "category": "Kategorie2"}
  ],
  "categories": [
    {"id": "Kategorie1", "name": "Kategorie1", "acceptsItems": ["item-1"]},
    {"id": "Kategorie2", "name": "Kategorie2", "acceptsItems": ["item-2"]}
  ]
}

AUFGABENINHALT:
${subjectPrompt}

WICHTIGE REGELN FÜR EINDEUTIGKEIT:
- Verwende unterschiedliche Themen/Unterthemen pro Aufgabe
- Variiere die Fragestellungen stark
- Nutze verschiedene Zahlen, Namen, Begriffe
- Erstelle Aufgaben mit verschiedenen Schwierigkeitsgraden
- Für word-selection: Verwende unterschiedliche Sätze und Satzstrukturen

ANTWORTFORMAT (JSON):
{
  "problems": [
    {
      "questionType": "multiple-choice",
      "question": "Welche Wortart ist 'laufen'?",
      "options": ["Nomen", "Verb", "Adjektiv", "Artikel"],
      "correctAnswer": 1,
      "explanation": "Kurze Erklärung"
    },
    {
      "questionType": "word-selection",
      "question": "Markiere das Subjekt im Satz:",
      "sentence": "Der große Hund bellt laut",
      "selectableWords": [
        {"word": "Der", "isCorrect": true, "index": 0},
        {"word": "große", "isCorrect": true, "index": 1},
        {"word": "Hund", "isCorrect": true, "index": 2},
        {"word": "bellt", "isCorrect": false, "index": 3},
        {"word": "laut", "isCorrect": false, "index": 4}
      ],
      "explanation": "Das Subjekt besteht aus Artikel, Adjektiv und Nomen"
    }
  ]
}`;

    console.log('🚀 Making Gemini API request');
    
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY environment variable not set');
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${enhancedPrompt}\n\nErstelle ${count} Aufgaben für ${category}, Klasse ${grade}. Session ID: ${sessionId || 'unknown'}`
          }]
        }],
        generationConfig: {
          temperature: Math.min(1.2, 0.95 + (excludeQuestions.length * 0.05)), // Much higher temperature for creativity
          maxOutputTokens: 3000,
          topP: 0.98,
          topK: 50, // More diversity
          candidateCount: 1
        }
      }),
    });

    console.log('📡 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Raw Gemini response received');
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('📝 Content type:', typeof content);
    console.log('📝 Content length:', content?.length);
    
    // Parse JSON response with improved error handling
    let parsedContent;
    try {
      if (!content) {
        throw new Error('No content received from Gemini');
      }
      
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON boundaries more precisely
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd);
      }
      
      console.log('🧹 Cleaned content length:', cleanContent.length);
      parsedContent = JSON.parse(cleanContent);
      console.log('✅ JSON parsing successful:', parsedContent?.problems?.length || 0, 'problems');
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('❌ JSON parsing failed:', e);
      console.error('❌ Raw content that failed to parse:', content?.substring(0, 500));
      parsedContent = { problems: [] };
    }

    // Transform to expected format with proper IDs and types
    const problems: SelectionQuestion[] = parsedContent.problems?.map((problem: any, index: number) => ({
      id: Math.floor(Math.random() * 1000000),
      question: problem.question,
      type: category.toLowerCase(),
      explanation: problem.explanation || `${problem.question}`,
      questionType: problem.questionType || 'text-input',
      ...(problem.questionType === 'multiple-choice' && {
        options: problem.options || [],
        correctAnswer: problem.correctAnswer || 0
      }),
      ...(problem.questionType === 'word-selection' && {
        sentence: problem.sentence || '',
        selectableWords: problem.selectableWords || []
      }),
      ...(problem.questionType === 'matching' && {
        items: problem.items?.map((item: any, itemIndex: number) => ({
          id: item.id || `item-${itemIndex}`,
          content: item.content || item.word,
          category: item.category
        })) || [],
        categories: problem.categories?.map((category: any, catIndex: number) => ({
          id: category.id || category.name || `category-${catIndex}`,
          name: category.name,
          acceptsItems: category.acceptsItems || []
        })) || []
      }),
      ...(problem.questionType === 'text-input' && {
        answer: problem.answer || problem.correctAnswer || ''
      })
    })) || [];

    // Enhanced filtering with multiple similarity checks
    const filteredProblems = problems.filter(problem => {
      const questionLower = problem.question.toLowerCase();
      
      return !excludeQuestions.some(excluded => {
        const excludedLower = excluded.toLowerCase();
        
        // Check multiple similarity metrics
        const exactMatch = questionLower === excludedLower;
        const substringMatch = questionLower.includes(excludedLower.substring(0, 30)) || 
                              excludedLower.includes(questionLower.substring(0, 30));
        const wordOverlap = calculateWordOverlap(questionLower, excludedLower);
        const patternMatch = checkQuestionPattern(questionLower, excludedLower);
        
        const isSimilar = exactMatch || substringMatch || wordOverlap > 0.6 || patternMatch;
        
        if (isSimilar) {
          console.log(`🔄 Filtered similar question: "${problem.question.substring(0, 50)}..." (matched with: "${excluded.substring(0, 30)}...")`);
        }
        
        return isSimilar;
      });
    });

    // Helper functions for similarity detection
    function calculateWordOverlap(str1: string, str2: string): number {
      const words1 = str1.split(/\s+/).filter(w => w.length > 2);
      const words2 = str2.split(/\s+/).filter(w => w.length > 2);
      const intersection = words1.filter(w => words2.includes(w));
      return intersection.length / Math.max(words1.length, words2.length);
    }

    function checkQuestionPattern(str1: string, str2: string): boolean {
      // Check for mathematical patterns like "X + Y" or "was ist"
      const mathPattern1 = str1.match(/\d+\s*[+\-×÷]\s*\d+/);
      const mathPattern2 = str2.match(/\d+\s*[+\-×÷]\s*\d+/);
      
      if (mathPattern1 && mathPattern2) {
        return mathPattern1[0] === mathPattern2[0];
      }
      
      // Check for common question starters
      const starters1 = str1.match(/^(was ist|wie|welche|wo|wann|warum)/);
      const starters2 = str2.match(/^(was ist|wie|welche|wo|wann|warum)/);
      
      if (starters1 && starters2 && starters1[0] === starters2[0]) {
        return calculateWordOverlap(str1, str2) > 0.4;
      }
      
      return false;
    }

    console.log(`Generated ${filteredProblems.length} unique problems (filtered from ${problems.length})`);
    console.log(`🎯 Request ${requestId} completed with ${filteredProblems.length} problems`);

    return new Response(JSON.stringify({ problems: filteredProblems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-problems function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      problems: [] // Fallback empty array
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
