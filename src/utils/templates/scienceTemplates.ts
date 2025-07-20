import { QuestionTemplate } from '../questionTemplates';

export const scienceTemplates: QuestionTemplate[] = [
  // =================== GRADE 1 SCIENCE TEMPLATES ===================
  
  {
    id: 'science_1_body_parts',
    category: 'Sachunterricht',
    grade: 1,
    type: 'multiple-choice',
    template: 'Womit {action}?',
    parameters: [
      { name: 'action', type: 'word', values: ['siehst du', 'hörst du', 'riechst du', 'schmeckst du', 'fühlst du'] }
    ],
    explanation: 'Die fünf Sinne',
    difficulty: 'easy',
    topics: ['senses', 'body', 'perception']
  },

  {
    id: 'science_1_animals_homes',
    category: 'Sachunterricht',
    grade: 1,
    type: 'multiple-choice',
    template: 'Wo lebt {animal}?',
    parameters: [
      { name: 'animal', type: 'word', values: ['der Fisch', 'der Vogel', 'die Biene', 'der Fuchs', 'die Kuh'] }
    ],
    explanation: 'Tiere und ihre Lebensräume',
    difficulty: 'easy',
    topics: ['animals', 'habitats', 'nature']
  },

  {
    id: 'science_1_seasons',
    category: 'Sachunterricht',
    grade: 1,
    type: 'multiple-choice',
    template: 'In welcher Jahreszeit {activity}?',
    parameters: [
      { name: 'activity', type: 'word', values: ['blühen die Blumen', 'fällt Schnee', 'werden Äpfel geerntet', 'schwimmen wir im See'] }
    ],
    explanation: 'Die vier Jahreszeiten',
    difficulty: 'easy',
    topics: ['seasons', 'weather', 'nature']
  },

  {
    id: 'science_1_day_night',
    category: 'Sachunterricht',
    grade: 1,
    type: 'multiple-choice',
    template: 'Wann {activity}?',
    parameters: [
      { name: 'activity', type: 'word', values: ['scheint die Sonne', 'sehen wir Sterne', 'essen wir Frühstück', 'gehen wir schlafen'] }
    ],
    explanation: 'Tag und Nacht',
    difficulty: 'easy',
    topics: ['day_night', 'time', 'sun_moon']
  },

  {
    id: 'science_1_healthy_food',
    category: 'Sachunterricht',
    grade: 1,
    type: 'multiple-choice',
    template: 'Was ist gesund für deinen Körper?',
    parameters: [
      { name: 'food_choice', type: 'word', values: ['Apfel oder Süßigkeiten', 'Wasser oder Limonade', 'Gemüse oder Chips'] }
    ],
    explanation: 'Gesunde Ernährung',
    difficulty: 'easy',
    topics: ['health', 'nutrition', 'food']
  },

  // =================== GRADE 2 SCIENCE TEMPLATES ===================
  
  {
    id: 'science_2_animal_groups',
    category: 'Sachunterricht',
    grade: 2,
    type: 'multiple-choice',
    template: 'Zu welcher Tiergruppe gehört {animal}?',
    parameters: [
      { name: 'animal', type: 'word', values: ['der Hund', 'der Adler', 'der Goldfisch', 'die Schlange', 'der Frosch'] }
    ],
    explanation: 'Tiergruppen unterscheiden',
    difficulty: 'medium',
    topics: ['animals', 'classification', 'vertebrates']
  },

  {
    id: 'science_2_plant_parts',
    category: 'Sachunterricht',
    grade: 2,
    type: 'multiple-choice',
    template: 'Welcher Teil der Pflanze {function}?',
    parameters: [
      { name: 'function', type: 'word', values: ['nimmt Wasser auf', 'macht Photosynthese', 'produziert Samen', 'stützt die Pflanze'] }
    ],
    explanation: 'Pflanzenteile und ihre Funktionen',
    difficulty: 'medium',
    topics: ['plants', 'parts', 'functions']
  },

  {
    id: 'science_2_water_cycle',
    category: 'Sachunterricht',
    grade: 2,
    type: 'multiple-choice',
    template: 'Was passiert mit Wasser, wenn die Sonne darauf scheint?',
    parameters: [
      { name: 'process', type: 'word', values: ['es verdunstet', 'es gefriert', 'es wird zu Eis', 'es verschwindet'] }
    ],
    explanation: 'Der Wasserkreislauf',
    difficulty: 'medium',
    topics: ['water_cycle', 'evaporation', 'weather']
  },

  {
    id: 'science_2_materials',
    category: 'Sachunterricht',
    grade: 2,
    type: 'multiple-choice',
    template: 'Aus welchem Material ist {object} gemacht?',
    parameters: [
      { name: 'object', type: 'word', values: ['ein Glas', 'ein Pullover', 'ein Tisch', 'eine Münze', 'ein Fenster'] }
    ],
    explanation: 'Materialien erkennen',
    difficulty: 'medium',
    topics: ['materials', 'properties', 'objects']
  },

  {
    id: 'science_2_teeth_care',
    category: 'Sachunterricht',
    grade: 2,
    type: 'multiple-choice',
    template: 'Wie oft solltest du deine Zähne putzen?',
    parameters: [
      { name: 'frequency', type: 'word', values: ['zweimal am Tag', 'einmal pro Woche', 'nur wenn sie weh tun', 'nur nach Süßigkeiten'] }
    ],
    explanation: 'Zahnpflege und Gesundheit',
    difficulty: 'easy',
    topics: ['health', 'teeth', 'hygiene']
  },

  // =================== GRADE 3 SCIENCE TEMPLATES ===================
  
  {
    id: 'science_3_magnets',
    category: 'Sachunterricht',
    grade: 3,
    type: 'multiple-choice',
    template: 'Welches Material wird von einem Magneten angezogen?',
    parameters: [
      { name: 'material', type: 'word', values: ['Eisen', 'Holz', 'Plastik', 'Glas', 'Papier'] }
    ],
    explanation: 'Magnetismus verstehen',
    difficulty: 'medium',
    topics: ['magnetism', 'materials', 'physics']
  },

  {
    id: 'science_3_light_shadow',
    category: 'Sachunterricht',
    grade: 3,
    type: 'multiple-choice',
    template: 'Wann entsteht ein Schatten?',
    parameters: [
      { name: 'condition', type: 'word', values: ['wenn Licht auf einen Gegenstand fällt', 'nur bei Sonnenschein', 'nur bei Vollmond', 'nur in der Nacht'] }
    ],
    explanation: 'Licht und Schatten',
    difficulty: 'medium',
    topics: ['light', 'shadow', 'physics']
  },

  {
    id: 'science_3_states_of_matter',
    category: 'Sachunterricht',
    grade: 3,
    type: 'multiple-choice',
    template: 'In welchem Zustand ist Wasser bei {temperature}?',
    parameters: [
      { name: 'temperature', type: 'word', values: ['0°C', '20°C', '100°C', '-10°C'] }
    ],
    explanation: 'Aggregatzustände des Wassers',
    difficulty: 'medium',
    topics: ['states_of_matter', 'temperature', 'water']
  },

  {
    id: 'science_3_food_chain',
    category: 'Sachunterricht',
    grade: 3,
    type: 'multiple-choice',
    template: 'Was steht am Anfang jeder Nahrungskette?',
    parameters: [
      { name: 'start', type: 'word', values: ['Pflanzen', 'Fleischfresser', 'Allesfresser', 'Menschen'] }
    ],
    explanation: 'Nahrungsketten in der Natur',
    difficulty: 'medium',
    topics: ['food_chain', 'ecology', 'plants_animals']
  },

  {
    id: 'science_3_germany_geography',
    category: 'Sachunterricht',
    grade: 3,
    type: 'multiple-choice',
    template: 'In welcher Himmelsrichtung liegt {direction} von Deutschland?',
    parameters: [
      { name: 'direction', type: 'word', values: ['die Nordsee', 'die Alpen', 'Polen', 'Frankreich'] }
    ],
    explanation: 'Deutschland und seine Nachbarn',
    difficulty: 'medium',
    topics: ['geography', 'germany', 'directions']
  },

  // =================== GRADE 4 SCIENCE TEMPLATES ===================
  
  {
    id: 'science_4_electricity',
    category: 'Sachunterricht',
    grade: 4,
    type: 'multiple-choice',
    template: 'Was passiert in einem Stromkreis, wenn er unterbrochen wird?',
    parameters: [
      { name: 'result', type: 'word', values: ['das Lämpchen geht aus', 'es wird heller', 'es wird gefährlich', 'nichts ändert sich'] }
    ],
    explanation: 'Stromkreise verstehen',
    difficulty: 'medium',
    topics: ['electricity', 'circuits', 'physics']
  },

  {
    id: 'science_4_planets',
    category: 'Sachunterricht',
    grade: 4,
    type: 'multiple-choice',
    template: 'Welcher Planet ist {characteristic}?',
    parameters: [
      { name: 'characteristic', type: 'word', values: ['der größte in unserem Sonnensystem', 'der nächste zur Sonne', 'der rote Planet', 'der mit den Ringen'] }
    ],
    explanation: 'Unser Sonnensystem',
    difficulty: 'hard',
    topics: ['space', 'planets', 'solar_system']
  },

  {
    id: 'science_4_recycling',
    category: 'Sachunterricht',
    grade: 4,
    type: 'multiple-choice',
    template: 'In welche Tonne gehört {waste}?',
    parameters: [
      { name: 'waste', type: 'word', values: ['eine Glasflasche', 'eine Zeitung', 'eine Bananenschale', 'eine Plastikflasche'] }
    ],
    explanation: 'Mülltrennung und Recycling',
    difficulty: 'medium',
    topics: ['recycling', 'environment', 'waste_separation']
  },

  {
    id: 'science_4_germany_states',
    category: 'Sachunterricht',
    grade: 4,
    type: 'multiple-choice',
    template: 'Welches ist die Hauptstadt von {state}?',
    parameters: [
      { name: 'state', type: 'word', values: ['Bayern', 'Nordrhein-Westfalen', 'Baden-Württemberg', 'Niedersachsen'] }
    ],
    explanation: 'Deutsche Bundesländer und Hauptstädte',
    difficulty: 'hard',
    topics: ['geography', 'germany', 'states', 'capitals']
  },

  {
    id: 'science_4_european_countries',
    category: 'Sachunterricht',
    grade: 4,
    type: 'multiple-choice',
    template: 'Welches Land grenzt an Deutschland?',
    parameters: [
      { name: 'neighbor', type: 'word', values: ['Frankreich', 'Polen', 'Österreich', 'Niederlande', 'Dänemark'] }
    ],
    explanation: 'Europäische Nachbarländer',
    difficulty: 'medium',
    topics: ['geography', 'europe', 'neighboring_countries']
  },

  {
    id: 'science_4_medieval_times',
    category: 'Sachunterricht',
    grade: 4,
    type: 'multiple-choice',
    template: 'Wer lebte im Mittelalter auf einer Burg?',
    parameters: [
      { name: 'person', type: 'word', values: ['der Ritter', 'der Bauer', 'der Handwerker', 'der Kaufmann'] }
    ],
    explanation: 'Leben im Mittelalter',
    difficulty: 'medium',
    topics: ['history', 'medieval', 'castle', 'society']
  }
];