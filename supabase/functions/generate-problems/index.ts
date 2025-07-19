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
}

interface Problem {
  id: number;
  question: string;
  answer: string | number;
  type: string;
  explanation: string;
}

const getSubjectPrompt = (category: string, grade: number): string => {
  const prompts = {
    'Mathematik': `Erstelle ${grade <= 2 ? 'einfache Additions- und Subtraktionsaufgaben bis 20' : 
                            grade <= 4 ? 'Grundrechenarten (Addition, Subtraktion, Multiplikation, Division) bis 1000' :
                            grade <= 6 ? 'Brüche, Dezimalzahlen und Prozentrechnung' :
                            grade <= 8 ? 'Gleichungen, Geometrie und Flächenberechnung' :
                            'Funktionen, Trigonometrie und komplexere Gleichungen'} für Klasse ${grade}`,
    
    'Deutsch': `Erstelle ${grade <= 2 ? 'einfache Wortschatz- und Silbenaufgaben' :
                           grade <= 4 ? 'Rechtschreibung, Wortarten und einfache Grammatik' :
                           grade <= 6 ? 'Satzglieder, Zeitformen und Textverständnis' :
                           grade <= 8 ? 'Literatur, Stilmittel und komplexere Grammatik' :
                           'Interpretation, Analyse und gehobene Sprachbetrachtung'} für Klasse ${grade}`,
    
    'Englisch': `Erstelle ${grade <= 2 ? 'einfache englische Wörter (Farben, Zahlen, Familie)' :
                            grade <= 4 ? 'Grundwortschatz und einfache Sätze' :
                            grade <= 6 ? 'Grammatik (Simple Present/Past), Vokabeln' :
                            grade <= 8 ? 'Zeitformen, unregelmäßige Verben, Textverständnis' :
                            'komplexe Grammatik, Literatur und gehobener Wortschatz'} für Klasse ${grade}`,
    
    'Geographie': `Erstelle ${grade <= 2 ? 'einfache Fragen zu Deutschland und Nachbarländern' :
                              grade <= 4 ? 'Europa, Hauptstädte und Länder' :
                              grade <= 6 ? 'Kontinente, Ozeane und Klimazonen' :
                              grade <= 8 ? 'Wirtschaftsgeographie und Bevölkerung' :
                              'globale Zusammenhänge und Geopolitik'} für Klasse ${grade}`,
    
    'Geschichte': `Erstelle ${grade <= 4 ? 'einfache Fragen zur deutschen Geschichte' :
                             grade <= 6 ? 'Mittelalter, Entdeckungen und frühe Neuzeit' :
                             grade <= 8 ? 'Industrialisierung, Weltkriege' :
                             'moderne Geschichte, Politik und Gesellschaft'} für Klasse ${grade}`,
    
    'Physik': `Erstelle ${grade <= 6 ? 'einfache Naturphänomene (Wetter, Licht, Schall)' :
                         grade <= 8 ? 'Mechanik, Optik, Elektrizität (Grundlagen)' :
                         'komplexere Physik: Kräfte, Energie, Wellenlehre'} für Klasse ${grade}`,
    
    'Biologie': `Erstelle ${grade <= 4 ? 'Tiere, Pflanzen und menschlicher Körper (Grundlagen)' :
                            grade <= 6 ? 'Ökosysteme, Ernährung, Fortpflanzung' :
                            grade <= 8 ? 'Zellbiologie, Genetik (Grundlagen)' :
                            'Evolution, Molekularbiologie, Ökologie'} für Klasse ${grade}`,
    
    'Chemie': `Erstelle ${grade <= 6 ? 'einfache Stoffe und deren Eigenschaften' :
                         grade <= 8 ? 'chemische Reaktionen, Periodensystem (Grundlagen)' :
                         'Säuren/Basen, organische Chemie, komplexere Reaktionen'} für Klasse ${grade}`,
    
    'Latein': `Erstelle ${grade <= 6 ? 'einfache lateinische Grundwörter und Übersetzungen' :
                         grade <= 8 ? 'Grammatik (Fälle, Konjugation), Grundwortschatz' :
                         'komplexere Texte, Stilmittel, römische Kultur'} für Klasse ${grade}`
  };
  
  return prompts[category as keyof typeof prompts] || prompts['Mathematik'];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, grade, count = 5 }: ProblemRequest = await req.json();
    console.log(`Generating ${count} problems for ${category}, Grade ${grade}`);

    const subjectPrompt = getSubjectPrompt(category, grade);
    
    const systemPrompt = `Du bist ein Experte für altersgerechte Lernaufgaben. Erstelle genau ${count} Aufgaben.

WICHTIGE REGELN:
- Fragen müssen exakt für Klasse ${grade} geeignet sein
- Antworten MÜSSEN kurz und präzise sein (max. 2-3 Wörter)
- Für Zahlen: nur die Zahl als Antwort
- Für Wörter: nur das Wort, keine Sätze
- Deutsche Antworten in deutscher Sprache
- Englische Antworten in englischer Sprache

${subjectPrompt}

ANTWORTFORMAT (JSON):
{
  "problems": [
    {
      "question": "Frage hier",
      "answer": "Kurze Antwort",
      "explanation": "Kurze Erklärung"
    }
  ]
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini Response:', content);
    
    // Parse JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('JSON parsing failed, using fallback');
      parsedContent = { problems: [] };
    }

    // Transform to expected format
    const problems: Problem[] = parsedContent.problems?.map((problem: any, index: number) => ({
      id: Math.floor(Math.random() * 1000000),
      question: problem.question,
      answer: problem.answer,
      type: category.toLowerCase(),
      explanation: problem.explanation || `${problem.question} ${problem.answer}`
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