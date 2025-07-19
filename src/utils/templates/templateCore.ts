
import { QuestionTemplate, GeneratedQuestion, TemplateParameter } from '../questionTemplates';

export class TemplateCore {
  
  static generateQuestionFromTemplate(
    template: QuestionTemplate, 
    usedCombinations: Set<string>
  ): GeneratedQuestion | null {
    const maxAttempts = 50;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      
      // Generate parameter values
      const params: Record<string, any> = {};
      let valid = true;

      for (const param of template.parameters) {
        if (param.type === 'number' && param.range) {
          const [min, max] = param.range;
          params[param.name] = Math.floor(Math.random() * (max - min + 1)) + min;
        } else if (param.type === 'word' && param.values) {
          params[param.name] = param.values[Math.floor(Math.random() * param.values.length)];
        } else if (param.type === 'list' && param.values) {
          params[param.name] = [...param.values];
        }

        // Check constraints
        if (param.constraints && !param.constraints(params[param.name], params)) {
          valid = false;
          break;
        }
      }

      if (!valid) continue;

      // Create combination key to check for duplicates
      const combinationKey = `${template.id}_${JSON.stringify(params)}`;
      if (usedCombinations.has(combinationKey)) {
        continue;
      }

      // Generate the question
      const question = this.generateQuestionFromParams(template, params);
      if (question) {
        usedCombinations.add(combinationKey);
        return question;
      }
    }

    return null;
  }

  private static generateQuestionFromParams(
    template: QuestionTemplate, 
    params: Record<string, any>
  ): GeneratedQuestion | null {
    try {
      let questionText = template.template;
      let answer: string | number = '';

      // Replace parameters in template
      for (const [key, value] of Object.entries(params)) {
        questionText = questionText.replace(new RegExp(`{${key}}`, 'g'), value.toString());
      }

      // Calculate answer based on template type
      if (template.type === 'text-input') {
        answer = this.calculateAnswer(template, params);
      }

      const baseQuestion: GeneratedQuestion = {
        id: Math.floor(Math.random() * 1000000),
        questionType: template.type,
        question: questionText,
        answer: answer,
        type: template.category.toLowerCase(),
        explanation: template.explanation
      };

      // Add type-specific properties
      if (template.type === 'multiple-choice') {
        const correctAnswer = this.calculateAnswer(template, params);
        const options = this.generateMultipleChoiceOptions(correctAnswer, template, params);
        baseQuestion.options = options;
        baseQuestion.correctAnswer = options.indexOf(correctAnswer.toString());
      } else if (template.type === 'word-selection') {
        baseQuestion.selectableWords = this.generateWordSelection(template, params);
      } else if (template.type === 'matching') {
        const { items, categories } = this.generateMatchingQuestion(template, params);
        baseQuestion.items = items;
        baseQuestion.categories = categories;
      }

      return baseQuestion;
    } catch (error) {
      console.error('Error generating question from template:', error);
      return null;
    }
  }

  private static calculateAnswer(template: QuestionTemplate, params: Record<string, any>): string | number {
    // Math calculations
    if (template.id.includes('addition')) {
      return params.a + params.b;
    } else if (template.id.includes('subtraction')) {
      return params.a - params.b;
    } else if (template.id.includes('multiplication')) {
      return params.a * (params.b || 2); // Handle single factor multiplication
    } else if (template.id.includes('division')) {
      if (template.id.includes('remainder')) {
        const quotient = Math.floor(params.dividend / params.divisor);
        const remainder = params.dividend % params.divisor;
        return `${quotient} Rest ${remainder}`;
      }
      const dividend = params.divisor * params.quotient;
      params.dividend = dividend;
      return params.quotient;
    } else if (template.id.includes('counting_sequence')) {
      return params.number + 1;
    } else if (template.id.includes('counting_backwards')) {
      return params.number - 1;
    } else if (template.id.includes('perimeter_rectangle')) {
      return 2 * (params.length + params.width);
    } else if (template.id.includes('area_rectangle')) {
      return params.length * params.width;
    }
    
    // German language calculations
    else if (template.id.includes('syllables')) {
      return this.countSyllables(params.word || params.animal || params.family || params.color);
    } else if (template.id.includes('plural')) {
      return this.getPlural(params.singular);
    } else if (template.id.includes('past_tense')) {
      return this.getPastTenseForm(params.verb || params.irregular_verb);
    } else if (template.id.includes('comparative')) {
      return this.getComparativeForm(params.adjective);
    } else if (template.id.includes('superlative')) {
      return this.getSuperlativeForm(params.adjective);
    } else if (template.id.includes('letter_formation')) {
      return params.letter.toUpperCase();
    } else if (template.id.includes('compound_words')) {
      return params.word1 + params.word2;
    } else if (template.id.includes('synonyms')) {
      return this.getSynonym(params.word);
    } else if (template.id.includes('antonyms')) {
      return this.getAntonym(params.word);
    }
    
    return '';
  }

  private static countSyllables(word: string): number {
    const vowels = 'aeiouäöü';
    let count = 0;
    let previousWasVowel = false;
    
    for (const char of word.toLowerCase()) {
      const isVowel = vowels.includes(char);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    return Math.max(1, count);
  }

  private static getPlural(singular: string): string {
    const pluralMap: Record<string, string> = {
      'Hund': 'Hunde',
      'Katze': 'Katzen',
      'Buch': 'Bücher',
      'Auto': 'Autos',
      'Haus': 'Häuser',
      'Kind': 'Kinder',
      'Baum': 'Bäume',
      'Ball': 'Bälle'
    };
    return pluralMap[singular] || singular + 'e';
  }

  private static getPastTenseForm(verb: string): string {
    const pastTenseMap: Record<string, string> = {
      'spielen': 'spielte',
      'lernen': 'lernte',
      'machen': 'machte',
      'hören': 'hörte',
      'schauen': 'schaute',
      'kaufen': 'kaufte',
      'leben': 'lebte',
      'arbeiten': 'arbeitete',
      'gehen': 'ging',
      'essen': 'aß',
      'trinken': 'trank',
      'fahren': 'fuhr',
      'sehen': 'sah',
      'kommen': 'kam',
      'nehmen': 'nahm',
      'geben': 'gab'
    };
    return pastTenseMap[verb] || verb.replace('en', 'te');
  }

  private static getComparativeForm(adjective: string): string {
    const comparativeMap: Record<string, string> = {
      'groß': 'größer',
      'klein': 'kleiner',
      'schnell': 'schneller',
      'langsam': 'langsamer',
      'schön': 'schöner',
      'hoch': 'höher',
      'tief': 'tiefer',
      'warm': 'wärmer',
      'kalt': 'kälter'
    };
    return comparativeMap[adjective] || adjective + 'er';
  }

  private static getSuperlativeForm(adjective: string): string {
    const superlativeMap: Record<string, string> = {
      'groß': 'größten',
      'klein': 'kleinsten',
      'schnell': 'schnellsten',
      'schön': 'schönsten',
      'stark': 'stärksten',
      'schwach': 'schwächsten',
      'jung': 'jüngsten',
      'alt': 'ältesten'
    };
    return superlativeMap[adjective] || adjective + 'sten';
  }

  private static getSynonym(word: string): string {
    const synonymMap: Record<string, string> = {
      'schön': 'hübsch',
      'groß': 'riesig',
      'schnell': 'flink',
      'sprechen': 'reden',
      'gehen': 'laufen',
      'schauen': 'blicken',
      'klein': 'winzig',
      'gut': 'toll'
    };
    return synonymMap[word] || word;
  }

  private static getAntonym(word: string): string {
    const antonymMap: Record<string, string> = {
      'groß': 'klein',
      'hell': 'dunkel',
      'warm': 'kalt',
      'schnell': 'langsam',
      'alt': 'jung',
      'reich': 'arm',
      'schwer': 'leicht',
      'hoch': 'niedrig'
    };
    return antonymMap[word] || word;
  }

  private static generateMultipleChoiceOptions(
    correctAnswer: string | number, 
    template: QuestionTemplate, 
    params: Record<string, any>
  ): string[] {
    const options = [correctAnswer.toString()];
    
    // Generate context-appropriate wrong answers
    if (template.id.includes('rhymes')) {
      const rhymeOptions = ['Maus', 'Klaus', 'Haus', 'raus', 'Ball', 'Fall', 'Wall', 'all'];
      rhymeOptions.forEach(option => {
        if (options.length < 4 && !options.includes(option)) {
          options.push(option);
        }
      });
    } else if (template.id.includes('reading')) {
      // Add context-specific options based on the reading comprehension question
      const readingOptions = ['Park', 'Schule', 'Haus', 'Garten', 'lesen', 'spielen', 'schlafen'];
      readingOptions.forEach(option => {
        if (options.length < 4 && !options.includes(option)) {
          options.push(option);
        }
      });
    }
    
    // Fill remaining slots with generic variations
    while (options.length < 4) {
      let wrongAnswer;
      if (typeof correctAnswer === 'number') {
        const variation = Math.floor(Math.random() * 10) - 5;
        wrongAnswer = Math.max(0, (correctAnswer as number) + variation);
      } else {
        wrongAnswer = (Math.floor(Math.random() * 20) + 1).toString();
      }
      
      if (!options.includes(wrongAnswer.toString())) {
        options.push(wrongAnswer.toString());
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  private static generateWordSelection(
    template: QuestionTemplate, 
    params: Record<string, any>
  ): Array<{word: string; isCorrect: boolean; index: number}> {
    if (template.id.includes('letter_recognition')) {
      const words = ['Maus', 'Auto', 'Haus', 'Baum', 'Mond', 'Sonne', 'Katze', 'Hund', 'Lampe', 'Tisch'];
      const targetLetter = params.vowel || params.consonant;
      
      return words.map((word, index) => ({
        word,
        isCorrect: word.toLowerCase().includes(targetLetter.toLowerCase()),
        index
      }));
    }
    
    // Default word selection
    const words = ['Wort1', 'Wort2', 'Wort3', 'Wort4', 'Wort5', 'Wort6'];
    return words.map((word, index) => ({
      word,
      isCorrect: index < 2,
      index
    }));
  }

  private static generateMatchingQuestion(
    template: QuestionTemplate, 
    params: Record<string, any>
  ) {
    if (template.id.includes('categories_food')) {
      const foodCategories = [
        { food: 'Apfel', category: 'Obst' },
        { food: 'Brot', category: 'Getreide' },
        { food: 'Milch', category: 'Milchprodukt' },
        { food: 'Fleisch', category: 'Fleisch' },
        { food: 'Karotte', category: 'Gemüse' },
        { food: 'Käse', category: 'Milchprodukt' }
      ];
      
      const items = foodCategories.map((pair, index) => ({
        id: `food_${index}`,
        content: pair.food,
        category: pair.category.toLowerCase()
      }));
      
      const categories = [
        { id: 'obst', name: 'Obst', acceptsItems: items.filter(i => i.category === 'obst').map(i => i.id) },
        { id: 'getreide', name: 'Getreide', acceptsItems: items.filter(i => i.category === 'getreide').map(i => i.id) },
        { id: 'milchprodukt', name: 'Milchprodukt', acceptsItems: items.filter(i => i.category === 'milchprodukt').map(i => i.id) }
      ];
      
      return { items, categories };
    }
    
    // Default matching structure
    const items = [
      { id: 'item1', content: 'Item 1', category: 'category1' },
      { id: 'item2', content: 'Item 2', category: 'category2' }
    ];
    
    const categories = [
      { id: 'category1', name: 'Kategorie 1', acceptsItems: ['item1'] },
      { id: 'category2', name: 'Kategorie 2', acceptsItems: ['item2'] }
    ];
    
    return { items, categories };
  }
}
