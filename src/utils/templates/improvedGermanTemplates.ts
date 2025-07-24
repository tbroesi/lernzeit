// Enhanced German question templates with better variety and duplicate protection

export interface QuestionTemplate {
  id: string;
  category: string;
  difficulty: string;
  questionType: string;
  template: string;
  parameters: Record<string, any>;
  answerCalculation: (params: any) => any;
  optionGeneration?: (params: any, answer: any) => string[];
  gradeRange: [number, number];
  explanation: string;
}

export const improvedGermanTemplates: QuestionTemplate[] = [
  // Plural Forms - More Variety
  {
    id: 'german_plural_1',
    category: 'deutsch',
    difficulty: 'easy',
    questionType: 'text-input',
    template: 'Wie heißt die Mehrzahl von "{word}"?',
    parameters: {
      word: { 
        type: 'select',
        options: ['Baum', 'Haus', 'Kind', 'Buch', 'Tisch', 'Stuhl', 'Blume', 'Auto', 'Hund', 'Katze', 'Vogel', 'Fisch', 'Apfel', 'Ball', 'Schuh']
      }
    },
    answerCalculation: (params) => {
      const pluralMap: { [key: string]: string } = {
        'Baum': 'Bäume',
        'Haus': 'Häuser', 
        'Kind': 'Kinder',
        'Buch': 'Bücher',
        'Tisch': 'Tische',
        'Stuhl': 'Stühle',
        'Blume': 'Blumen',
        'Auto': 'Autos',
        'Hund': 'Hunde',
        'Katze': 'Katzen',
        'Vogel': 'Vögel',
        'Fisch': 'Fische',
        'Apfel': 'Äpfel',
        'Ball': 'Bälle',
        'Schuh': 'Schuhe'
      };
      return pluralMap[params.word] || params.word + 'e';
    },
    gradeRange: [2, 6],
    explanation: 'Bei der Pluralbildung im Deutschen gibt es verschiedene Endungen und manchmal auch Umlaute.'
  },

  // Article Assignment
  {
    id: 'german_article_1',
    category: 'deutsch',
    difficulty: 'easy',
    questionType: 'multiple-choice',
    template: 'Welcher Artikel gehört zu "{noun}"?',
    parameters: {
      noun: {
        type: 'select',
        options: ['Sonne', 'Mond', 'Stern', 'Blume', 'Baum', 'Haus', 'Auto', 'Buch', 'Tisch', 'Stuhl']
      }
    },
    answerCalculation: (params) => {
      const articleMap: { [key: string]: string } = {
        'Sonne': 'die',
        'Mond': 'der',
        'Stern': 'der',
        'Blume': 'die',
        'Baum': 'der',
        'Haus': 'das',
        'Auto': 'das',
        'Buch': 'das',
        'Tisch': 'der',
        'Stuhl': 'der'
      };
      return articleMap[params.noun] || 'der';
    },
    optionGeneration: (params, answer) => {
      const articles = ['der', 'die', 'das'];
      return articles;
    },
    gradeRange: [1, 4],
    explanation: 'Deutsche Substantive haben drei Artikel: der (maskulin), die (feminin), das (neutrum).'
  },

  // Word Types - Expanded
  {
    id: 'german_word_types_1',
    category: 'deutsch',
    difficulty: 'medium',
    questionType: 'word-selection',
    template: 'Welche Wörter sind {wordType}?',
    parameters: {
      wordType: {
        type: 'select',
        options: ['Nomen', 'Verben', 'Adjektive']
      }
    },
    answerCalculation: (params) => {
      const wordSets: { [key: string]: string[] } = {
        'Nomen': ['Hund', 'Haus', 'Baum', 'Blume', 'Sonne', 'Auto'],
        'Verben': ['laufen', 'springen', 'essen', 'trinken', 'schlafen', 'spielen'],
        'Adjektive': ['groß', 'klein', 'schön', 'schnell', 'langsam', 'hell']
      };
      return wordSets[params.wordType] || ['Wort'];
    },
    optionGeneration: (params, correctWords) => {
      const allWords = ['Hund', 'laufen', 'groß', 'Haus', 'springen', 'klein', 'Baum', 'essen', 'schön', 'Auto', 'spielen', 'schnell'];
      return allWords;
    },
    gradeRange: [2, 5],
    explanation: 'Nomen sind Hauptwörter (Personen, Tiere, Dinge), Verben sind Tätigkeitswörter, Adjektive sind Eigenschaftswörter.'
  },

  // Sentence Structure
  {
    id: 'german_sentence_1',
    category: 'deutsch',
    difficulty: 'medium',
    questionType: 'multiple-choice',
    template: 'Was ist das Subjekt in diesem Satz: "{sentence}"?',
    parameters: {
      sentence: {
        type: 'select',
        options: [
          'Der Hund bellt laut.',
          'Die Katze schläft auf dem Sofa.',
          'Das Kind spielt im Garten.',
          'Der Lehrer erklärt die Aufgabe.',
          'Die Blumen blühen im Frühling.'
        ]
      }
    },
    answerCalculation: (params) => {
      const subjectMap: { [key: string]: string } = {
        'Der Hund bellt laut.': 'Der Hund',
        'Die Katze schläft auf dem Sofa.': 'Die Katze',
        'Das Kind spielt im Garten.': 'Das Kind',
        'Der Lehrer erklärt die Aufgabe.': 'Der Lehrer',
        'Die Blumen blühen im Frühling.': 'Die Blumen'
      };
      return subjectMap[params.sentence] || 'Der Hund';
    },
    optionGeneration: (params, answer) => {
      const sentence = params.sentence;
      const words = sentence.split(' ');
      const options = [answer];
      
      // Add some wrong options
      if (sentence.includes('bellt')) options.push('bellt', 'laut');
      if (sentence.includes('schläft')) options.push('schläft', 'Sofa');
      if (sentence.includes('spielt')) options.push('spielt', 'Garten');
      if (sentence.includes('erklärt')) options.push('erklärt', 'Aufgabe');
      if (sentence.includes('blühen')) options.push('blühen', 'Frühling');
      
      return options.slice(0, 4);
    },
    gradeRange: [3, 6],
    explanation: 'Das Subjekt ist der Satzgegenstand - wer oder was führt die Handlung aus?'
  },

  // Verb Conjugation
  {
    id: 'german_verb_conjugation_1',
    category: 'deutsch',
    difficulty: 'medium',
    questionType: 'text-input',
    template: 'Wie lautet die richtige Form von "{verb}" für "{pronoun}"?',
    parameters: {
      verb: {
        type: 'select',
        options: ['gehen', 'haben', 'sein', 'machen', 'kommen', 'sehen']
      },
      pronoun: {
        type: 'select',
        options: ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie']
      }
    },
    answerCalculation: (params) => {
      const conjugations: { [key: string]: { [key: string]: string } } = {
        'gehen': { 'ich': 'gehe', 'du': 'gehst', 'er/sie/es': 'geht', 'wir': 'gehen', 'ihr': 'geht', 'sie': 'gehen' },
        'haben': { 'ich': 'habe', 'du': 'hast', 'er/sie/es': 'hat', 'wir': 'haben', 'ihr': 'habt', 'sie': 'haben' },
        'sein': { 'ich': 'bin', 'du': 'bist', 'er/sie/es': 'ist', 'wir': 'sind', 'ihr': 'seid', 'sie': 'sind' },
        'machen': { 'ich': 'mache', 'du': 'machst', 'er/sie/es': 'macht', 'wir': 'machen', 'ihr': 'macht', 'sie': 'machen' },
        'kommen': { 'ich': 'komme', 'du': 'kommst', 'er/sie/es': 'kommt', 'wir': 'kommen', 'ihr': 'kommt', 'sie': 'kommen' },
        'sehen': { 'ich': 'sehe', 'du': 'siehst', 'er/sie/es': 'sieht', 'wir': 'sehen', 'ihr': 'seht', 'sie': 'sehen' }
      };
      return conjugations[params.verb]?.[params.pronoun] || params.verb;
    },
    gradeRange: [3, 6],
    explanation: 'Verben ändern ihre Form je nach Person (ich, du, er/sie/es, wir, ihr, sie).'
  },

  // Reading Comprehension
  {
    id: 'german_reading_1',
    category: 'deutsch',
    difficulty: 'hard',
    questionType: 'multiple-choice',
    template: 'Lies den Text: "{text}" Was ist die Hauptaussage?',
    parameters: {
      text: {
        type: 'select',
        options: [
          'Lisa geht jeden Tag in die Schule. Sie lernt gerne Deutsch und Mathematik. Am liebsten spielt sie aber in den Pausen mit ihren Freunden.',
          'Tom hat einen Hund namens Bello. Jeden Morgen geht er mit Bello spazieren. Der Hund ist sehr freundlich und spielt gerne.',
          'Im Frühling blühen die Blumen. Die Bäume bekommen neue Blätter. Die Vögel singen und bauen ihre Nester.'
        ]
      }
    },
    answerCalculation: (params) => {
      const mainIdeas: { [key: string]: string } = {
        'Lisa geht jeden Tag in die Schule. Sie lernt gerne Deutsch und Mathematik. Am liebsten spielt sie aber in den Pausen mit ihren Freunden.': 'Lisa geht gerne zur Schule',
        'Tom hat einen Hund namens Bello. Jeden Morgen geht er mit Bello spazieren. Der Hund ist sehr freundlich und spielt gerne.': 'Tom und sein Hund Bello',
        'Im Frühling blühen die Blumen. Die Bäume bekommen neue Blätter. Die Vögel singen und bauen ihre Nester.': 'Der Frühling erwacht'
      };
      return mainIdeas[params.text] || 'Hauptaussage';
    },
    optionGeneration: (params, answer) => {
      return [
        answer,
        'Lisa mag keine Schule',
        'Tom hat eine Katze',
        'Es ist Winter',
        'Die Tiere schlafen'
      ].slice(0, 4);
    },
    gradeRange: [4, 6],
    explanation: 'Bei der Textanalyse geht es darum, die wichtigste Aussage oder das Thema des Textes zu erkennen.'
  }
];