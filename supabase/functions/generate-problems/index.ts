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
  excludeQuestions?: string[]; // Array of question texts to exclude
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

interface DragDropQuestion extends BaseQuestion {
  questionType: 'drag-drop';
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

type SelectionQuestion = TextInputQuestion | MultipleChoiceQuestion | WordSelectionQuestion | DragDropQuestion;

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
      5: 'Drag-and-Drop Fälle, Multiple Choice Konjunktionen, Wortauswahl Satzarten.',
      6: 'Multiple Choice Aktiv/Passiv, Drag-and-Drop indirekte Rede, Kommaregeln.',
      7: 'Satzgefüge-Analyse per Auswahl, Drag-and-Drop Stilmittel, Multiple Choice Textanalyse.',
      8: 'Multiple Choice Konjunktiv, Drag-and-Drop Argumentationsstrukturen, Textanalyse-Auswahl.',
      9: 'Epochen zuordnen per Drag-and-Drop, Multiple Choice rhetorische Mittel, Erörterungs-Strukturen.',
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
    const { category, grade, count = 5, excludeQuestions = [] }: ProblemRequest = await req.json();
    console.log(`Generating ${count} problems for ${category}, Grade ${grade}`);

    const subjectPrompt = getSubjectPrompt(category, grade);
    
    const excludeText = excludeQuestions.length > 0 
      ? `\n\nWICHTIG: VERMEIDE diese bereits gestellten Fragen und erstelle VÖLLIG NEUE Aufgaben:\n${excludeQuestions.map(q => `- "${q}"`).join('\n')}\n`
      : '';

    const systemPrompt = `Du bist ein erfahrener Lehrer für interaktives Lernen. Erstelle genau ${count} VÖLLIG NEUE UND EINZIGARTIGE Aufgaben mit verschiedenen Fragetypen.${excludeText}

NEUE FRAGETYPEN FÜR BESSERE UX:
1. "multiple-choice": 4 Antwortoptionen (A, B, C, D)
2. "word-selection": Klickbare Wörter in Sätzen auswählen
3. "drag-drop": Elemente in Kategorien ziehen
4. "text-input": Nur wenn andere Typen nicht passen

INTERAKTIVE AUFGABEN FÜR ALLE FÄCHER:
- MATHEMATIK: Zahlen nach Stellenwerten sortieren (drag-drop), Geometrische Formen zuordnen (drag-drop), Rechenarten per Multiple Choice
- DEUTSCH: Satzglieder per Klick markieren (word-selection), Wortarten per Multiple Choice, Rechtschreibregeln per Drag-and-Drop
- ALLE ANDEREN FÄCHER: Multiple Choice bevorzugen, bei Zuordnungsaufgaben drag-drop verwenden

WICHTIG FÜR DRAG-DROP FORMAT:
Verwende immer dieses exakte Format für drag-drop:
{
  "questionType": "drag-drop",
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

    console.log('🚀 Making Gemini API request with prompt:', systemPrompt);
    console.log('🔑 Using Gemini API key exists:', !!geminiApiKey);
    console.log('🔑 API key length:', geminiApiKey?.length || 0);
    
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY environment variable not set');
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    console.log('🌐 Making request to Gemini API');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nErstelle ${count} Aufgaben für ${category}, Klasse ${grade}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2000,
        }
      }),
    });

    console.log('📡 Gemini API response status:', response.status);
    console.log('📡 Gemini API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Raw Gemini response data:', JSON.stringify(data, null, 2));
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('📝 Gemini Response content:', content);
    console.log('📝 Content type:', typeof content);
    console.log('📝 Content length:', content?.length);
    
    // Parse JSON response
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
      
      console.log('🧹 Cleaned content:', cleanContent);
      parsedContent = JSON.parse(cleanContent);
      console.log('✅ JSON parsing successful:', parsedContent);
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('❌ JSON parsing failed:', e);
      console.error('❌ Raw content that failed to parse:', content);
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
      ...(problem.questionType === 'drag-drop' && {
        items: problem.items?.map((item: any, itemIndex: number) => ({
          id: item.id || `item-${itemIndex}`,
          content: item.content || item.word,
          category: item.category
        })) || problem.words?.map((word: any, wordIndex: number) => ({
          id: `item-${wordIndex}`,
          content: word.word,
          category: word.category
        })) || [],
        categories: problem.categories?.map((category: any, catIndex: number) => ({
          id: category.id || category.name || `category-${catIndex}`,
          name: category.name,
          acceptsItems: category.acceptsItems || (problem.items || problem.words)
            ?.filter((item: any) => item.category === category.name)
            .map((item: any, itemIndex: number) => item.id || `item-${(problem.items || problem.words).findIndex((i: any) => i === item)}`) || []
        })) || []
      }),
      ...(problem.questionType === 'text-input' && {
        answer: problem.answer || problem.correctAnswer || ''
      })
    })) || [];

    console.log(`Generated ${problems.length} problems`);

    return new Response(JSON.stringify({ problems }), {
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
