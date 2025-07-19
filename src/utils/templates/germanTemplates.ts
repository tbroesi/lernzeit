
import { QuestionTemplate } from '../questionTemplates';

export const germanTemplates: QuestionTemplate[] = [
  // =================== GRADE 1 GERMAN TEMPLATES ===================
  
  // Basic Letter Recognition
  {
    id: 'german_1_letter_recognition_vowels',
    category: 'Deutsch',
    grade: 1,
    type: 'word-selection',
    template: 'Finde alle Wörter mit dem Vokal "{vowel}":',
    parameters: [
      { name: 'vowel', type: 'word', values: ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'] }
    ],
    explanation: 'Vokale in Wörtern erkennen',
    difficulty: 'easy',
    topics: ['letters', 'vowels', 'recognition']
  },
  {
    id: 'german_1_letter_recognition_consonants',
    category: 'Deutsch',
    grade: 1,
    type: 'word-selection',
    template: 'Finde alle Wörter mit dem Buchstaben "{consonant}":',
    parameters: [
      { name: 'consonant', type: 'word', values: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'] }
    ],
    explanation: 'Konsonanten in Wörtern erkennen',
    difficulty: 'easy',
    topics: ['letters', 'consonants', 'recognition']
  },

  // Syllable Counting - Extended
  {
    id: 'german_1_syllables_animals',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele Silben hat das Tierwort "{animal}"?',
    parameters: [
      { name: 'animal', type: 'word', values: ['Hund', 'Katze', 'Pferd', 'Vogel', 'Fisch', 'Kaninchen', 'Hamster', 'Schildkröte', 'Elefant', 'Giraffe'] }
    ],
    explanation: 'Silben in Tiernamen zählen',
    difficulty: 'easy',
    topics: ['syllables', 'animals', 'phonetics']
  },
  {
    id: 'german_1_syllables_family',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele Silben hat das Wort "{family}"?',
    parameters: [
      { name: 'family', type: 'word', values: ['Mama', 'Papa', 'Oma', 'Opa', 'Bruder', 'Schwester', 'Tante', 'Onkel', 'Cousin', 'Familie'] }
    ],
    explanation: 'Silben in Familienwörtern zählen',
    difficulty: 'easy',
    topics: ['syllables', 'family', 'phonetics']
  },
  {
    id: 'german_1_syllables_colors',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Wie viele Silben hat die Farbe "{color}"?',
    parameters: [
      { name: 'color', type: 'word', values: ['rot', 'blau', 'grün', 'gelb', 'orange', 'lila', 'rosa', 'braun', 'schwarz', 'weiß'] }
    ],
    explanation: 'Silben in Farbwörtern zählen',
    difficulty: 'easy',
    topics: ['syllables', 'colors', 'phonetics']
  },

  // Rhyming Words - Extended
  {
    id: 'german_1_rhymes_simple',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Welches Wort reimt sich auf "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['Haus', 'Ball', 'Buch', 'Stern', 'Hand', 'Baum', 'Maus', 'Katz', 'Hut', 'Boot'] }
    ],
    explanation: 'Reimwörter erkennen',
    difficulty: 'medium',
    topics: ['rhyming', 'phonetics', 'word_play']
  },
  {
    id: 'german_1_rhymes_body_parts',
    category: 'Deutsch',
    grade: 1,
    type: 'multiple-choice',
    template: 'Was reimt sich auf "{bodypart}"?',
    parameters: [
      { name: 'bodypart', type: 'word', values: ['Hand', 'Fuß', 'Kopf', 'Bauch', 'Bein', 'Arm', 'Ohr', 'Nase'] }
    ],
    explanation: 'Reime mit Körperteilen',
    difficulty: 'medium',
    topics: ['rhyming', 'body_parts', 'phonetics']
  },

  // First Writing - Letter Formation
  {
    id: 'german_1_letter_formation',
    category: 'Deutsch',
    grade: 1,
    type: 'text-input',
    template: 'Schreibe den Buchstaben "{letter}" groß auf:',
    parameters: [
      { name: 'letter', type: 'word', values: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] }
    ],
    explanation: 'Großbuchstaben schreiben',
    difficulty: 'easy',
    topics: ['writing', 'letters', 'uppercase']
  },

  // =================== GRADE 2 GERMAN TEMPLATES ===================
  
  // Sentence Building - Extended
  {
    id: 'german_2_sentence_subject_verb',
    category: 'Deutsch',
    grade: 2,
    type: 'matching',
    template: 'Ordne Subjekt und Prädikat richtig zu:',
    parameters: [
      { name: 'subjects', type: 'list', values: ['Der Hund', 'Die Katze', 'Das Kind', 'Der Lehrer'] },
      { name: 'verbs', type: 'list', values: ['rennt', 'schläft', 'spielt', 'erklärt'] }
    ],
    explanation: 'Satzteile richtig zuordnen',
    difficulty: 'medium',
    topics: ['sentence_structure', 'grammar', 'subject_predicate']
  },
  {
    id: 'german_2_sentence_completion',
    category: 'Deutsch',
    grade: 2,
    type: 'text-input',
    template: 'Vervollständige den Satz: "{incomplete_sentence}"',
    parameters: [
      { name: 'incomplete_sentence', type: 'word', values: [
        'Der Ball ist ___', 'Die Sonne ___', 'Ich gehe in die ___', 'Meine Mama ___'
      ]}
    ],
    explanation: 'Sätze sinnvoll ergänzen',
    difficulty: 'medium',
    topics: ['sentence_completion', 'vocabulary', 'context']
  },

  // Word Categories - Extended
  {
    id: 'german_2_categories_food',
    category: 'Deutsch',
    grade: 2,
    type: 'matching',
    template: 'Ordne die Lebensmittel den richtigen Kategorien zu:',
    parameters: [
      { name: 'foods', type: 'list', values: ['Apfel', 'Brot', 'Milch', 'Fleisch', 'Karotte', 'Käse'] }
    ],
    explanation: 'Lebensmittel kategorisieren',
    difficulty: 'medium',
    topics: ['categorization', 'food', 'vocabulary']
  },
  {
    id: 'german_2_categories_school',
    category: 'Deutsch',
    grade: 2,
    type: 'matching',
    template: 'Was gehört in die Schule?',
    parameters: [
      { name: 'items', type: 'list', values: ['Bleistift', 'Heft', 'Tafel', 'Auto', 'Lineal', 'Fernseher'] }
    ],
    explanation: 'Schulgegenstände erkennen',
    difficulty: 'easy',
    topics: ['categorization', 'school', 'vocabulary']
  },

  // Plural Forms
  {
    id: 'german_2_plural_simple',
    category: 'Deutsch',
    grade: 2,
    type: 'text-input',
    template: 'Wie lautet die Mehrzahl von "{singular}"?',
    parameters: [
      { name: 'singular', type: 'word', values: ['Hund', 'Katze', 'Buch', 'Auto', 'Haus', 'Kind', 'Baum', 'Ball'] }
    ],
    explanation: 'Mehrzahl bilden',
    difficulty: 'medium',
    topics: ['grammar', 'plural', 'nouns']
  },

  // Reading Comprehension - Simple
  {
    id: 'german_2_reading_simple_story',
    category: 'Deutsch',
    grade: 2,
    type: 'multiple-choice',
    template: 'Lisa geht in den Park. Sie spielt mit ihrem Ball. Wo spielt Lisa?',
    parameters: [],
    explanation: 'Einfache Textverständnis',
    difficulty: 'medium',
    topics: ['reading_comprehension', 'context', 'story']
  },

  // =================== GRADE 3 GERMAN TEMPLATES ===================
  
  // Grammar - Past Tense Extended
  {
    id: 'german_3_past_tense_regular',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Setze "{verb}" in die Vergangenheit: "Gestern {blank} ich..."',
    parameters: [
      { name: 'verb', type: 'word', values: ['spielen', 'lernen', 'machen', 'hören', 'schauen', 'kaufen', 'leben', 'arbeiten'] }
    ],
    explanation: 'Regelmäßige Vergangenheitsformen',
    difficulty: 'medium',
    topics: ['grammar', 'past_tense', 'regular_verbs']
  },
  {
    id: 'german_3_past_tense_irregular',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Wie lautet die Vergangenheit von "{irregular_verb}"?',
    parameters: [
      { name: 'irregular_verb', type: 'word', values: ['gehen', 'essen', 'trinken', 'fahren', 'sehen', 'kommen', 'nehmen', 'geben'] }
    ],
    explanation: 'Unregelmäßige Vergangenheitsformen',
    difficulty: 'hard',
    topics: ['grammar', 'past_tense', 'irregular_verbs']
  },

  // Adjective Comparison - Extended
  {
    id: 'german_3_adjective_comparative',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Steigere das Adjektiv "{adjective}": ___er',
    parameters: [
      { name: 'adjective', type: 'word', values: ['groß', 'klein', 'schnell', 'langsam', 'schön', 'hoch', 'tief', 'warm', 'kalt'] }
    ],
    explanation: 'Komparativ bilden',
    difficulty: 'medium',
    topics: ['grammar', 'adjectives', 'comparison']
  },
  {
    id: 'german_3_adjective_superlative',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Bilde den Superlativ von "{adjective}": am ___sten',
    parameters: [
      { name: 'adjective', type: 'word', values: ['groß', 'klein', 'schnell', 'schön', 'stark', 'schwach', 'jung', 'alt'] }
    ],
    explanation: 'Superlativ bilden',
    difficulty: 'hard',
    topics: ['grammar', 'adjectives', 'superlative']
  },

  // Sentence Types
  {
    id: 'german_3_sentence_types_question',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Verwandle in eine Frage: "{statement}"',
    parameters: [
      { name: 'statement', type: 'word', values: [
        'Du gehst nach Hause',
        'Er spielt Fußball',
        'Sie liest ein Buch',
        'Wir essen Mittag'
      ]}
    ],
    explanation: 'Aussagesätze in Fragesätze umwandeln',
    difficulty: 'medium',
    topics: ['sentence_types', 'questions', 'grammar']
  },

  // Word Formation
  {
    id: 'german_3_compound_words',
    category: 'Deutsch',
    grade: 3,
    type: 'text-input',
    template: 'Bilde ein zusammengesetztes Wort aus "{word1}" und "{word2}":',
    parameters: [
      { name: 'word1', type: 'word', values: ['Haus', 'Auto', 'Schul', 'Hand', 'Fuß'] },
      { name: 'word2', type: 'word', values: ['tür', 'bahn', 'hof', 'schuh', 'ball'] }
    ],
    explanation: 'Zusammengesetzte Wörter bilden',
    difficulty: 'medium',
    topics: ['word_formation', 'compounds', 'vocabulary']
  },

  // Reading Comprehension - Advanced
  {
    id: 'german_3_reading_main_idea',
    category: 'Deutsch',
    grade: 3,
    type: 'multiple-choice',
    template: 'Tom liebt es zu lesen. Jeden Tag nach der Schule geht er in die Bibliothek. Dort liest er Bücher über Tiere und Abenteuer. Was ist Toms Hobby?',
    parameters: [],
    explanation: 'Hauptidee eines Textes verstehen',
    difficulty: 'medium',
    topics: ['reading_comprehension', 'main_idea', 'context']
  },

  // =================== GRADE 4 GERMAN TEMPLATES ===================
  
  // Advanced Grammar - Cases
  {
    id: 'german_4_nominative_case',
    category: 'Deutsch',
    grade: 4,
    type: 'multiple-choice',
    template: 'Wer oder was? Finde das Subjekt: "{sentence}"',
    parameters: [
      { name: 'sentence', type: 'word', values: [
        'Der Hund bellt laut',
        'Die Katze schläft',
        'Das Kind spielt',
        'Die Lehrerin erklärt'
      ]}
    ],
    explanation: 'Nominativ (1. Fall) erkennen',
    difficulty: 'medium',
    topics: ['grammar', 'cases', 'nominative', 'subject']
  },
  {
    id: 'german_4_accusative_case',
    category: 'Deutsch',
    grade: 4,
    type: 'multiple-choice',
    template: 'Wen oder was? Finde das Objekt: "{sentence}"',
    parameters: [
      { name: 'sentence', type: 'word', values: [
        'Ich lese ein Buch',
        'Sie kauft einen Apfel',
        'Er wirft den Ball',
        'Wir besuchen die Oma'
      ]}
    ],
    explanation: 'Akkusativ (4. Fall) erkennen',
    difficulty: 'hard',
    topics: ['grammar', 'cases', 'accusative', 'object']
  },

  // Spelling Rules
  {
    id: 'german_4_spelling_double_consonants',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Schreibe richtig: "{misspelled_word}"',
    parameters: [
      { name: 'misspelled_word', type: 'word', values: ['komen', 'solen', 'wolen', 'kan', 'sol', 'wil'] }
    ],
    explanation: 'Doppelkonsonanten richtig schreiben',
    difficulty: 'medium',
    topics: ['spelling', 'consonants', 'orthography']
  },

  // Text Production
  {
    id: 'german_4_story_beginning',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Schreibe den ersten Satz einer Geschichte über "{topic}":',
    parameters: [
      { name: 'topic', type: 'word', values: ['einen magischen Wald', 'ein sprechendes Tier', 'eine Zeitreise', 'einen Superhelden'] }
    ],
    explanation: 'Geschichten beginnen',
    difficulty: 'hard',
    topics: ['creative_writing', 'story_telling', 'imagination']
  },

  // Advanced Reading
  {
    id: 'german_4_reading_inference',
    category: 'Deutsch',
    grade: 4,
    type: 'multiple-choice',
    template: 'Anna packt ihre Badesachen ein und nimmt Sonnencreme mit. Wohin geht Anna wahrscheinlich?',
    parameters: [],
    explanation: 'Schlussfolgerungen aus Texten ziehen',
    difficulty: 'hard',
    topics: ['reading_comprehension', 'inference', 'context_clues']
  },

  // Synonyms and Antonyms
  {
    id: 'german_4_synonyms',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Finde ein anderes Wort für "{word}":',
    parameters: [
      { name: 'word', type: 'word', values: ['schön', 'groß', 'schnell', 'sprechen', 'gehen', 'schauen', 'klein', 'gut'] }
    ],
    explanation: 'Synonyme finden',
    difficulty: 'medium',
    topics: ['vocabulary', 'synonyms', 'word_choice']
  },
  {
    id: 'german_4_antonyms',
    category: 'Deutsch',
    grade: 4,
    type: 'text-input',
    template: 'Was ist das Gegenteil von "{word}"?',
    parameters: [
      { name: 'word', type: 'word', values: ['groß', 'hell', 'warm', 'schnell', 'alt', 'reich', 'schwer', 'hoch'] }
    ],
    explanation: 'Antonyme (Gegenwörter) finden',
    difficulty: 'medium',
    topics: ['vocabulary', 'antonyms', 'opposites']
  }
];
