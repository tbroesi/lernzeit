// Grade-specific curriculum alignment and learning objectives

export interface CurriculumObjective {
  grade: number;
  category: string;
  topics: string[];
  skills: string[];
  examples: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}

// Official curriculum learning objectives by grade and subject
export const CURRICULUM_OBJECTIVES: { [category: string]: { [grade: number]: CurriculumObjective } } = {
  'mathematik': {
    1: {
      grade: 1,
      category: 'mathematik',
      topics: ['Zahlen bis 20', 'Addition', 'Subtraktion', 'Zahlenreihen', 'Grundformen', 'Geometrische Figuren', 'Formen erkennen'],
      skills: ['Zählen', 'Vergleichen', 'Einfache Rechnungen', 'Mengen erfassen'],
      examples: ['7 + 5 = ?', 'Welche Zahl kommt nach 13?', '15 - 8 = ?'],
      complexity: 'basic'
    },
    2: {
      grade: 2,
      category: 'mathematik',
      topics: ['Zahlen bis 100', 'Einmaleins bis 5', 'Halbieren', 'Verdoppeln', 'Geld', 'Zeit', 'Messen', 'Rechteck und Quadrat'],
      skills: ['Bündeln', 'Schätzen', 'Messen', 'Kleine Multiplikation'],
      examples: ['34 + 27 = ?', '3 × 4 = ?', 'Doppelt so viel wie 15?'],
      complexity: 'basic'
    },
    3: {
      grade: 3,
      category: 'mathematik',
      topics: ['Einmaleins komplett', 'Division', 'Zahlen bis 1000', 'Brüche', 'Geometrie', 'Flächenberechnung', 'Umfang', 'Quadrat und Rechteck'],
      skills: ['Automatisierung', 'Strategien entwickeln', 'Sachaufgaben lösen'],
      examples: ['7 × 8 = ?', '56 ÷ 7 = ?', '234 + 178 = ?'],
      complexity: 'intermediate'
    },
    4: {
      grade: 4,
      category: 'mathematik',
      topics: ['Großes Einmaleins', 'Schriftliche Verfahren', 'Dezimalzahlen', 'Römische Zahlen', 'Geometrie erweitert', 'Fläche und Umfang', 'Würfel und Quader'],
      skills: ['Algorithmen verstehen', 'Kontrollieren', 'Überschlagen'],
      examples: ['144 ÷ 12 = ?', '23 × 17 = ?', '2,5 + 1,8 = ?'],
      complexity: 'intermediate'
    },
    5: {
      grade: 5,
      category: 'mathematik',
      topics: ['Bruchrechnung', 'Dezimalzahlen', 'Prozentrechnung Grundlagen', 'Geometrie'],
      skills: ['Brüche verstehen', 'Umwandeln', 'Erste Prozente'],
      examples: ['3/4 + 1/4 = ?', '2,5 × 4 = ?', '10% von 50 = ?'],
      complexity: 'intermediate'
    },
    6: {
      grade: 6,
      category: 'mathematik',
      topics: ['Bruchrechnung komplett', 'Prozentrechnung', 'Negative Zahlen', 'Flächeninhalt'],
      skills: ['Alle Grundrechenarten mit Brüchen', 'Prozentsatz berechnen'],
      examples: ['2/3 × 3/4 = ?', '20% von 150 = ?', 'Fläche Rechteck'],
      complexity: 'intermediate'
    },
    7: {
      grade: 7,
      category: 'mathematik',
      topics: ['Gleichungen', 'Proportionalität', 'Geometrie erweitert', 'Statistik'],
      skills: ['Variablen verwenden', 'Gleichungen lösen', 'Dreisatz'],
      examples: ['3x + 7 = 22', 'Wenn 3 Äpfel 2€ kosten...', 'Flächenberechnung'],
      complexity: 'advanced'
    },
    8: {
      grade: 8,
      category: 'mathematik',
      topics: ['Lineare Funktionen', 'Pythagoras', 'Zinsrechnung', 'Wahrscheinlichkeit'],
      skills: ['Funktionen verstehen', 'Rechtwinklige Dreiecke', 'Zinsformeln'],
      examples: ['y = 2x + 3', 'a² + b² = c²', 'Zinssatz berechnen'],
      complexity: 'advanced'
    },
    9: {
      grade: 9,
      category: 'mathematik',
      topics: ['Quadratische Gleichungen', 'Trigonometrie', 'Parabeln', 'Körperberechnungen'],
      skills: ['Quadratische Formeln', 'sin, cos, tan', 'Raumgeometrie'],
      examples: ['x² + 5x - 6 = 0', 'sin(30°) = ?', 'Volumen Zylinder'],
      complexity: 'advanced'
    },
    10: {
      grade: 10,
      category: 'mathematik',
      topics: ['Exponentialfunktionen', 'Logarithmen', 'Komplexe Geometrie', 'Integrale'],
      skills: ['Exponentialgesetze', 'Kurvendiskussion', 'Optimierung'],
      examples: ['2^x = 16', 'log₂(8) = ?', 'Extremwerte bestimmen'],
      complexity: 'advanced'
    }
  },
  'deutsch': {
    1: {
      grade: 1,
      category: 'deutsch',
      topics: ['Silben', 'Groß-/Kleinschreibung', 'Einfache Wörter', 'Grundwortschatz'],
      skills: ['Lesen lernen', 'Schreiben lernen', 'Silben erkennen'],
      examples: ['Silben klatschen', 'Nomen groß schreiben', 'Wörter lesen'],
      complexity: 'basic'
    },
    2: {
      grade: 2,
      category: 'deutsch',
      topics: ['Satzzeichen', 'Wortarten', 'Rechtschreibregeln', 'Texte lesen'],
      skills: ['Punkt und Komma', 'Nomen und Verben unterscheiden'],
      examples: ['Satz beenden mit Punkt', 'Nomen erkennen', 'Verb finden'],
      complexity: 'basic'
    },
    3: {
      grade: 3,
      category: 'deutsch',
      topics: ['Zeitformen', 'Adjektive', 'ck/tz-Regeln', 'Wörterbuch'],
      skills: ['Präsens und Präteritum', 'Eigenschaften beschreiben'],
      examples: ['ich laufe / ich lief', 'Das Auto ist schnell', 'Brücke mit ck'],
      complexity: 'basic'
    },
    4: {
      grade: 4,
      category: 'deutsch',
      topics: ['Satzglieder', 'Wörtliche Rede', 'ie/ei/ai', 'Aufsätze'],
      skills: ['Subjekt und Prädikat', 'Anführungszeichen', 'Geschichten schreiben'],
      examples: ['Der Hund bellt laut', '"Komm her!", rief er', 'spielen mit ie'],
      complexity: 'intermediate'
    },
    5: {
      grade: 5,
      category: 'deutsch',
      topics: ['Fälle', 'Konjunktionen', 'Satzarten', 'Berichte'],
      skills: ['Nominativ bis Dativ', 'Sätze verbinden', 'Sachlich schreiben'],
      examples: ['dem Mann (Dativ)', 'und, aber, denn', 'Unfallbericht'],
      complexity: 'intermediate'
    },
    6: {
      grade: 6,
      category: 'deutsch',
      topics: ['Aktiv/Passiv', 'Indirekte Rede', 'Kommaregeln', 'Argumentation'],
      skills: ['Formen unterscheiden', 'Konjunktiv verwenden', 'Meinung begründen'],
      examples: ['wird gebaut (Passiv)', 'Er sagte, dass...', 'Komma bei dass'],
      complexity: 'intermediate'
    },
    7: {
      grade: 7,
      category: 'deutsch',
      topics: ['Satzgefüge', 'Stilmittel', 'Textanalyse', 'Gedichte'],
      skills: ['Hauptsatz/Nebensatz', 'Metaphern erkennen', 'Texte untersuchen'],
      examples: ['Obwohl es regnet...', 'Der Wind flüstert', 'Aufbau analysieren'],
      complexity: 'advanced'
    },
    8: {
      grade: 8,
      category: 'deutsch',
      topics: ['Konjunktiv', 'Argumentation', 'Inhaltsangabe', 'Balladen'],
      skills: ['Möglichkeitsform', 'Erörtern', 'Zusammenfassen'],
      examples: ['Er würde kommen', 'Pro und Contra', 'Text zusammenfassen'],
      complexity: 'advanced'
    },
    9: {
      grade: 9,
      category: 'deutsch',
      topics: ['Epochen', 'Rhetorik', 'Erörterung', 'Drama'],
      skills: ['Literaturgeschichte', 'Rhetorische Mittel', 'Problemerörterung'],
      examples: ['Sturm und Drang', 'Anapher', 'Einleitung-Hauptteil-Schluss'],
      complexity: 'advanced'
    },
    10: {
      grade: 10,
      category: 'deutsch',
      topics: ['Sprachgeschichte', 'Interpretation', 'Literaturkritik', 'Essays'],
      skills: ['Sprachwandel', 'Textdeutung', 'Kritisch bewerten'],
      examples: ['Mittelhochdeutsch', 'Symbole deuten', 'Literatur bewerten'],
      complexity: 'advanced'
    }
  }
  // Add similar structures for other subjects...
};

export function getCurriculumObjectives(category: string, grade: number): CurriculumObjective | null {
  if (!category || typeof category !== 'string') {
    console.error('Invalid category provided to getCurriculumObjectives:', category);
    return null;
  }
  
  const categoryObj = CURRICULUM_OBJECTIVES[category.toLowerCase()];
  if (!categoryObj) {
    console.warn(`No curriculum found for category: ${category}`);
    return null;
  }
  
  return categoryObj[grade] || null;
}

export function generateCurriculumPrompt(category: string, grade: number): string {
  const objectives = getCurriculumObjectives(category, grade);
  
  if (!objectives) {
    return `Erstelle altersgerechte Aufgaben für ${category}, Klasse ${grade}.`;
  }
  
  const topicsText = objectives.topics.join(', ');
  const skillsText = objectives.skills.join(', ');
  const examplesText = objectives.examples.join(' | ');
  
  // Ensure variety of question types, especially for mathematics
  const questionTypeRequirement = category.toLowerCase() === 'mathematik' ? 
    `
WICHTIG - FRAGETYPEN-VIELFALT:
- Mindestens 40% Multiple-Choice Fragen für bessere Interaktivität
- Text-Input Fragen für offene Antworten
- Bei Geometrie: Immer Flächenberechnung, Umfang, Formen erkennen
- Verschiedene Kontexte: Sachaufgaben, reine Rechnung, Textverständnis

GEOMETRIE-FOKUS für Klasse ${grade}:
- Klasse 1-2: Formen erkennen (Dreieck, Quadrat, Rechteck, Kreis)
- Klasse 3-4: Umfang und Flächenberechnung, Würfel und Quader
- Klasse 5+: Erweiterte geometrische Berechnungen
` : '';

  return `Erstelle Aufgaben für ${category}, Klasse ${grade} basierend auf dem offiziellen Lehrplan:

THEMEN: ${topicsText}
FÄHIGKEITEN: ${skillsText}
BEISPIELE: ${examplesText}
SCHWIERIGKEIT: ${objectives.complexity}
${questionTypeRequirement}

Die Aufgaben müssen strikt dem Curriculum entsprechen und dem Entwicklungsstand von Klasse ${grade} angemessen sein.`;
}

export function validateCurriculumCompliance(question: string, category: string, grade: number): number {
  const objectives = getCurriculumObjectives(category, grade);
  if (!objectives) return 0.5; // Default score if no objectives found
  
  const questionLower = question.toLowerCase();
  let score = 0;
  let checks = 0;
  
  // Check topic alignment
  const topicMatches = objectives.topics.filter(topic => 
    questionLower.includes(topic.toLowerCase())
  ).length;
  score += (topicMatches / objectives.topics.length) * 0.4;
  checks++;
  
  // Check skill alignment
  const skillMatches = objectives.skills.filter(skill => 
    questionLower.includes(skill.toLowerCase())
  ).length;
  score += (skillMatches / objectives.skills.length) * 0.3;
  checks++;
  
  // Check complexity appropriateness
  const complexityScore = validateComplexityAlignment(question, objectives.complexity);
  score += complexityScore * 0.3;
  checks++;
  
  return Math.min(1, score);
}

function validateComplexityAlignment(question: string, expectedComplexity: string): number {
  const wordCount = question.split(/\s+/).length;
  const hasComplexStructure = /[;:,]/.test(question);
  const hasComplexVocabulary = /\w{8,}/.test(question);
  
  switch (expectedComplexity) {
    case 'basic':
      // Simple questions, short sentences, basic vocabulary
      if (wordCount <= 15 && !hasComplexStructure && !hasComplexVocabulary) {
        return 1.0;
      }
      return Math.max(0, 1 - ((wordCount - 15) * 0.05));
      
    case 'intermediate':
      // Moderate complexity allowed
      if (wordCount >= 10 && wordCount <= 25) {
        return 1.0;
      }
      return Math.max(0, 1 - Math.abs(wordCount - 17.5) * 0.03);
      
    case 'advanced':
      // Complex questions expected
      if (wordCount >= 15 && (hasComplexStructure || hasComplexVocabulary)) {
        return 1.0;
      }
      return Math.max(0, 0.5 + (wordCount - 10) * 0.03);
      
    default:
      return 0.5;
  }
}

// System prompt templates for diversity
export const SYSTEM_PROMPT_TEMPLATES = [
  `Du bist ein erfahrener Pädagoge, der innovative und abwechslungsreiche Lernaufgaben erstellt. Fokussiere dich auf kreative Fragestellungen, die Schüler motivieren und verschiedene Lerntypen ansprechen.`,
  
  `Du bist ein Curriculum-Experte, der strikt lehrplankonform arbeitet. Erstelle präzise Aufgaben, die exakt den Bildungsstandards entsprechen und den aktuellen Wissensstand der Schüler berücksichtigen.`,
  
  `Du bist ein interaktiver Lerndesigner, der moderne, technology-enhanced Aufgaben entwickelt. Bevorzuge interaktive Formate wie Multiple Choice, Matching und Wortauswahl für bessere Nutzererfahrung.`
];

export function getRandomSystemPrompt(): string {
  const randomIndex = Math.floor(Math.random() * SYSTEM_PROMPT_TEMPLATES.length);
  return SYSTEM_PROMPT_TEMPLATES[randomIndex];
}