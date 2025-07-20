import { QuestionTemplate } from '../questionTemplates';

export const extendedGermanTemplates: QuestionTemplate[] = [
  // =================== GRADE 1 EXTENDED GERMAN TEMPLATES ===================
  
  {
    id: 'german_1_alphabet_order',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welcher Buchstabe kommt nach {letter}?',
    parameters: [
      { name: 'letter', type: 'word', values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'] }
    ],
    explanation: 'Alphabetische Reihenfolge',
    difficulty: 'easy',
    topics: ['alphabet', 'order', 'letters']
  },

  {
    id: 'german_1_vowel_consonant',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Ist der Buchstabe {letter} ein Vokal oder ein Konsonant?',
    parameters: [
      { name: 'letter', type: 'word', values: ['A', 'E', 'I', 'O', 'U', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'] }
    ],
    explanation: 'Vokale und Konsonanten unterscheiden',
    difficulty: 'medium',
    topics: ['vowels', 'consonants', 'letters']
  },

  {
    id: 'german_1_word_length',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele Buchstaben hat das Wort "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Hund', 'Katze', 'Auto', 'Haus', 'Blume', 'Schule', 'Buch', 'Tisch'] }
    ],
    explanation: 'Buchstaben zählen',
    difficulty: 'easy',
    topics: ['counting', 'letters', 'words']
  },

  {
    id: 'german_1_rhyming_words',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welches Wort reimt sich auf "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Haus', 'Ball', 'Boot', 'Hund', 'Katz'] }
    ],
    explanation: 'Reimwörter finden',
    difficulty: 'medium',
    topics: ['rhyming', 'sounds', 'words']
  },

  {
    id: 'german_1_beginning_sounds',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Mit welchem Laut beginnt das Wort "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Apfel', 'Ball', 'Katze', 'Hund', 'Elefant', 'Fisch', 'Giraffe'] }
    ],
    explanation: 'Anlaute erkennen',
    difficulty: 'easy',
    topics: ['phonics', 'beginning_sounds', 'letters']
  },

  // =================== GRADE 2 EXTENDED GERMAN TEMPLATES ===================
  
  {
    id: 'german_2_compound_words',
    category: 'Deutsch',
    grade: 2,
    type: 'text-input',
    template: 'Setze die Wörter "{word1}" und "{word2}" zu einem zusammengesetzten Wort zusammen.',
    parameters: [
      { name: 'word1', type: 'word', values: ['Haus', 'Auto', 'Schul', 'Fuß', 'Hand'] },
      { name: 'word2', type: 'word', values: ['tür', 'bahn', 'hof', 'ball', 'schuh'] }
    ],
    explanation: 'Zusammengesetzte Wörter bilden',
    difficulty: 'medium',
    topics: ['compound_words', 'word_formation']
  },

  {
    id: 'german_2_singular_plural',
    category: 'Deutsch',
    grade: 2,
    type: 'text-input',
    template: 'Wie lautet die Mehrzahl von "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Hund', 'Katze', 'Auto', 'Kind', 'Baum', 'Haus', 'Buch', 'Tisch'] }
    ],
    explanation: 'Einzahl und Mehrzahl',
    difficulty: 'medium',
    topics: ['singular', 'plural', 'grammar']
  },

  {
    id: 'german_2_article_assignment',
    category: 'Deutsch',
    grade: 2,
    type: 'multiple-choice',
    template: 'Welcher Artikel gehört zu "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Hund', 'Katze', 'Auto', 'Sonne', 'Mond', 'Stern', 'Baum', 'Blume'] }
    ],
    explanation: 'Bestimmte Artikel zuordnen',
    difficulty: 'medium',
    topics: ['articles', 'der_die_das', 'grammar']
  },

  {
    id: 'german_2_sentence_completion',
    category: 'Deutsch',
    grade: 2,
    type: 'multiple-choice',
    template: 'Vervollständige den Satz: "Der Hund {verb} im Garten."',
    parameters: [
      { name: 'verb', type: 'word', values: ['spielt', 'läuft', 'schläft', 'gräbt', 'bellt'] }
    ],
    explanation: 'Sätze sinnvoll vervollständigen',
    difficulty: 'medium',
    topics: ['sentences', 'verbs', 'completion']
  },

  {
    id: 'german_2_word_categories',
    category: 'Deutsch',
    grade: 2,
    type: 'multiple-choice',
    template: 'Zu welcher Wortart gehört das Wort "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['laufen', 'schön', 'Hund', 'schnell', 'klein', 'Auto', 'spielen', 'groß'] }
    ],
    explanation: 'Wortarten bestimmen',
    difficulty: 'hard',
    topics: ['word_types', 'grammar', 'classification']
  },

  // =================== GRADE 3 EXTENDED GERMAN TEMPLATES ===================
  
  {
    id: 'german_3_synonyms',
    category: 'Deutsch',
    grade: 3,
    type: 'multiple-choice',
    template: 'Welches Wort bedeutet dasselbe wie "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['groß', 'klein', 'schnell', 'schön', 'alt', 'neu', 'hell', 'dunkel'] }
    ],
    explanation: 'Synonyme finden',
    difficulty: 'medium',
    topics: ['synonyms', 'vocabulary', 'meaning']
  },

  {
    id: 'german_3_antonyms',
    category: 'Deutsch',
    grade: 3,
    type: 'multiple-choice',
    template: 'Was ist das Gegenteil von "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['groß', 'hell', 'warm', 'schnell', 'laut', 'hart', 'neu', 'oben'] }
    ],
    explanation: 'Antonyme (Gegenwörter) finden',
    difficulty: 'medium',
    topics: ['antonyms', 'vocabulary', 'opposites']
  },

  {
    id: 'german_3_verb_conjugation',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Setze das Verb "{verb}" in die richtige Form: "Ich {blank} gerne."',
    parameters: [
      { name: 'verb', type: 'word', values: ['spielen', 'lesen', 'schwimmen', 'singen', 'tanzen', 'malen', 'schreiben'] }
    ],
    explanation: 'Verben konjugieren',
    difficulty: 'hard',
    topics: ['verbs', 'conjugation', 'grammar']
  },

  {
    id: 'german_3_adjective_comparison',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Wie lautet die Steigerung von "{adjective}"? (Beispiel: schön, schöner, am schönsten)',
    parameters: [
      { name: 'adjective', type: 'word', values: ['groß', 'klein', 'schnell', 'langsam', 'hell', 'dunkel'] }
    ],
    explanation: 'Adjektive steigern',
    difficulty: 'hard',
    topics: ['adjectives', 'comparison', 'grammar']
  },

  {
    id: 'german_3_sentence_types',
    category: 'Deutsch',
    grade: 3,
    type: 'multiple-choice',
    template: 'Welche Art von Satz ist das: "{sentence}"?',
    parameters: [
      { name: 'sentence', type: 'word', values: ['Wie geht es dir?', 'Das ist schön!', 'Komm bitte her.', 'Der Hund bellt.'] }
    ],
    explanation: 'Satzarten unterscheiden',
    difficulty: 'medium',
    topics: ['sentence_types', 'grammar', 'punctuation']
  },

  // =================== GRADE 4 EXTENDED GERMAN TEMPLATES ===================
  
  {
    id: 'german_4_direct_indirect_speech',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Wandle die direkte Rede in indirekte Rede um: Max sagt: "{direct_speech}"',
    parameters: [
      { name: 'direct_speech', type: 'word', values: ['Ich bin müde.', 'Es regnet.', 'Ich gehe nach Hause.', 'Das Wetter ist schön.'] }
    ],
    explanation: 'Direkte und indirekte Rede',
    difficulty: 'hard',
    topics: ['direct_speech', 'indirect_speech', 'grammar']
  },

  {
    id: 'german_4_text_comprehension',
    category: 'Deutsch',
    grade: 4,
    type: 'multiple-choice',
    template: 'Lies den Text: "{text}" Was ist die Hauptaussage?',
    parameters: [
      { name: 'text', type: 'word', values: [
        'Die Sonne scheint. Die Kinder spielen im Park. Sie haben viel Spaß.',
        'Es regnet stark. Lisa nimmt einen Regenschirm mit. Sie geht zur Schule.',
        'Der Hund bellt laut. Er sieht eine Katze. Die Katze läuft weg.'
      ] }
    ],
    explanation: 'Textverständnis',
    difficulty: 'hard',
    topics: ['reading_comprehension', 'main_idea', 'text_analysis']
  },

  {
    id: 'german_4_word_formation',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Bilde aus dem Verb "{verb}" ein Substantiv (Hauptwort).',
    parameters: [
      { name: 'verb', type: 'word', values: ['lesen', 'schreiben', 'spielen', 'arbeiten', 'lernen', 'fahren', 'gehen'] }
    ],
    explanation: 'Wortbildung: Verb zu Substantiv',
    difficulty: 'hard',
    topics: ['word_formation', 'verbs', 'nouns']
  },

  {
    id: 'german_4_passive_voice',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Wandle den Aktivsatz in einen Passivsatz um: "{active_sentence}"',
    parameters: [
      { name: 'active_sentence', type: 'word', values: [
        'Der Junge liest das Buch.',
        'Die Mutter kocht das Essen.',
        'Der Lehrer erklärt die Aufgabe.'
      ] }
    ],
    explanation: 'Aktiv und Passiv',
    difficulty: 'hard',
    topics: ['passive_voice', 'active_voice', 'grammar']
  },

  {
    id: 'german_4_spelling_rules',
    category: 'Deutsch',
    grade: 4,
    type: 'multiple-choice',
    template: 'Welche Schreibweise ist richtig?',
    parameters: [
      { name: 'word_variant', type: 'word', values: ['dass/das', 'seid/seit', 'wider/wieder', 'weg/weck'] }
    ],
    explanation: 'Rechtschreibregeln anwenden',
    difficulty: 'hard',
    topics: ['spelling', 'rules', 'homophones']
  }
];