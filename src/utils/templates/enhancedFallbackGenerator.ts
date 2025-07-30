// DEPRECATED: Enhanced fallback generator - replaced by template-based system
// This file is kept for compatibility but should use TemplateBasedGenerator instead
import { SelectionQuestion } from '@/types/questionTypes';
import { TemplateBasedGenerator } from './templateBasedGenerator';

export class EnhancedFallbackGenerator {
  
  // Main entry point - delegates to new template-based system
  static generateMathProblems(grade: number, count: number): SelectionQuestion[] {
    console.log('⚠️ Using deprecated EnhancedFallbackGenerator - migrating to TemplateBasedGenerator');
    try {
      return TemplateBasedGenerator.generateProblems('math', grade, count);
    } catch (error) {
      console.warn('Template generator failed, using legacy fallback:', error);
      return this.generateLegacyMathProblems(grade, count);
    }
  }
  
  static generateGermanProblems(grade: number, count: number): SelectionQuestion[] {
    console.log('⚠️ Using deprecated EnhancedFallbackGenerator - migrating to TemplateBasedGenerator');
    try {
      return TemplateBasedGenerator.generateProblems('german', grade, count);
    } catch (error) {
      console.warn('Template generator failed, using legacy fallback:', error);
      return this.generateLegacyGermanProblems(grade, count);
    }
  }
  
  // Legacy methods kept for compatibility
  private static generateLegacyMathProblems(grade: number, count: number): SelectionQuestion[] {
    const problems: SelectionQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      const problemType = this.selectMathProblemType(grade);
      const problem = this.generateMathProblem(problemType, grade, i);
      problems.push(problem);
    }
    
    return problems;
  }
  
  private static generateLegacyGermanProblems(grade: number, count: number): SelectionQuestion[] {
    const problems: SelectionQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      const problemType = this.selectGermanProblemType(grade);
      const problem = this.generateGermanProblem(problemType, grade, i);
      problems.push(problem);
    }
    
    return problems;
  }
  
  private static selectMathProblemType(grade: number): string {
    const basicTypes = ['addition', 'subtraction'];
    const advancedTypes = ['multiplication', 'division', 'geometry', 'word_problem', 'decimals'];
    
    // Weight problem types by grade level
    const typePool = [
      ...basicTypes,
      ...(grade >= 2 ? ['multiplication'] : []),
      ...(grade >= 3 ? ['division', 'geometry'] : []),
      ...(grade >= 4 ? advancedTypes : [])
    ];
    
    return typePool[Math.floor(Math.random() * typePool.length)];
  }
  
  private static generateMathProblem(type: string, grade: number, seed: number): SelectionQuestion {
    const id = Math.floor(Math.random() * 1000000);
    
    switch (type) {
      case 'addition':
        return this.generateAdditionProblem(id, grade);
      case 'subtraction':
        return this.generateSubtractionProblem(id, grade);
      case 'multiplication':
        return this.generateMultiplicationProblem(id, grade);
      case 'division':
        return this.generateDivisionProblem(id, grade);
      case 'geometry':
        return this.generateGeometryProblem(id, grade);
      case 'word_problem':
        return this.generateWordProblem(id, grade);
      case 'decimals':
        return this.generateDecimalProblem(id, grade);
      default:
        return this.generateAdditionProblem(id, grade);
    }
  }
  
  private static generateAdditionProblem(id: number, grade: number): SelectionQuestion {
    const maxNum = Math.min(100, 10 + (grade * 20));
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = Math.floor(Math.random() * maxNum) + 1;
    const answer = a + b;
    
    // 30% chance for multiple choice
    if (Math.random() < 0.3) {
      const correctAnswer = answer;
      const options = [
        correctAnswer,
        correctAnswer + Math.floor(Math.random() * 5) + 1,
        correctAnswer - Math.floor(Math.random() * 5) - 1,
        correctAnswer + Math.floor(Math.random() * 10) + 5
      ].sort(() => Math.random() - 0.5);
      
      const correctIndex = options.indexOf(correctAnswer);
      
      return {
        id,
        questionType: 'multiple-choice',
        question: `Was ist ${a} + ${b}?`,
        options: options.map(String),
        correctAnswer: correctIndex,
        type: 'math',
        explanation: `${a} + ${b} = ${answer}. Addition bedeutet zusammenzählen.`
      };
    }
    
    return {
      id,
      questionType: 'text-input',
      question: `${a} + ${b} = ?`,
      answer: answer.toString(),
      type: 'math',
      explanation: `${a} + ${b} = ${answer}. Addition bedeutet zusammenzählen.`
    };
  }
  
  private static generateSubtractionProblem(id: number, grade: number): SelectionQuestion {
    const maxNum = Math.min(100, 10 + (grade * 20));
    let a = Math.floor(Math.random() * maxNum) + 10;
    let b = Math.floor(Math.random() * a) + 1; // Ensure positive result
    const answer = a - b;
    
    return {
      id,
      questionType: 'text-input',
      question: `${a} - ${b} = ?`,
      answer: answer.toString(),
      type: 'math',
      explanation: `${a} - ${b} = ${answer}. Subtraktion bedeutet abziehen.`
    };
  }
  
  private static generateMultiplicationProblem(id: number, grade: number): SelectionQuestion {
    const table = Math.floor(Math.random() * 10) + 2; // 2-10 times table
    const multiplier = Math.floor(Math.random() * 10) + 1;
    const answer = table * multiplier;
    
    // Word selection variant (20% chance)
    if (Math.random() < 0.2) {
      const selectableWords = ['Mal', 'Plus', 'Geteilt', 'Minus'];
      return {
        id,
        questionType: 'word-selection',
        question: `${table} ___ ${multiplier} = ${answer}. Welches Rechenzeichen gehört in die Lücke?`,
        sentence: `${table} ___ ${multiplier} = ${answer}`,
        selectableWords: selectableWords.map((word, index) => ({ 
          word, 
          isCorrect: word === 'Mal', 
          index 
        })),
        type: 'math',
        explanation: `${table} × ${multiplier} = ${answer}. Das ist Multiplikation (Mal-Rechnung).`
      };
    }
    
    return {
      id,
      questionType: 'text-input',
      question: `${table} × ${multiplier} = ?`,
      answer: answer.toString(),
      type: 'math',
      explanation: `${table} × ${multiplier} = ${answer}. Das ist das ${table}er Einmaleins.`
    };
  }
  
  private static generateDivisionProblem(id: number, grade: number): SelectionQuestion {
    const divisor = Math.floor(Math.random() * 8) + 2; // 2-9
    const quotient = Math.floor(Math.random() * 12) + 1;
    const dividend = divisor * quotient;
    
    return {
      id,
      questionType: 'text-input',
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient.toString(),
      type: 'math',
      explanation: `${dividend} ÷ ${divisor} = ${quotient}. Division bedeutet teilen.`
    };
  }
  
  private static generateGeometryProblem(id: number, grade: number): SelectionQuestion {
    const geometryTypes = ['rectangle_area', 'rectangle_perimeter', 'square_area'];
    const type = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    
    switch (type) {
      case 'rectangle_area': {
        const length = Math.floor(Math.random() * 8) + 3;
        const width = Math.floor(Math.random() * 6) + 2;
        const area = length * width;
        
        return {
          id,
          questionType: 'text-input',
          question: `Ein Rechteck ist ${length} cm lang und ${width} cm breit. Wie groß ist die Fläche?`,
          answer: area.toString(),
          type: 'math',
          explanation: `Fläche = Länge × Breite = ${length} × ${width} = ${area} cm²`
        };
      }
      
      case 'rectangle_perimeter': {
        const length = Math.floor(Math.random() * 8) + 3;
        const width = Math.floor(Math.random() * 6) + 2;
        const perimeter = 2 * (length + width);
        
        return {
          id,
          questionType: 'text-input',
          question: `Ein Rechteck ist ${length} cm lang und ${width} cm breit. Wie groß ist der Umfang?`,
          answer: perimeter.toString(),
          type: 'math',
          explanation: `Umfang = 2 × (Länge + Breite) = 2 × (${length} + ${width}) = ${perimeter} cm`
        };
      }
      
      case 'square_area':
      default: {
        const side = Math.floor(Math.random() * 8) + 2;
        const area = side * side;
        
        return {
          id,
          questionType: 'text-input',
          question: `Ein Quadrat hat die Seitenlänge ${side} cm. Wie groß ist die Fläche?`,
          answer: area.toString(),
          type: 'math',
          explanation: `Fläche = Seitenlänge × Seitenlänge = ${side} × ${side} = ${area} cm²`
        };
      }
    }
  }
  
  private static generateWordProblem(id: number, grade: number): SelectionQuestion {
    const wordProblemTypes = ['shopping', 'animals', 'classroom', 'sports'];
    const type = wordProblemTypes[Math.floor(Math.random() * wordProblemTypes.length)];
    
    switch (type) {
      case 'shopping': {
        const items = Math.floor(Math.random() * 5) + 3;
        const pricePerItem = Math.floor(Math.random() * 8) + 2;
        const total = items * pricePerItem;
        
        return {
          id,
          questionType: 'text-input',
          question: `Anna kauft ${items} Äpfel für je ${pricePerItem} Euro. Wie viel kostet das insgesamt?`,
          answer: total.toString(),
          type: 'math',
          explanation: `${items} × ${pricePerItem} = ${total} Euro. Anzahl mal Preis pro Stück.`
        };
      }
      
      case 'animals': {
        const groups = Math.floor(Math.random() * 4) + 2;
        const animalsPerGroup = Math.floor(Math.random() * 6) + 3;
        const total = groups * animalsPerGroup;
        
        return {
          id,
          questionType: 'text-input',
          question: `Im Zoo gibt es ${groups} Gehege mit je ${animalsPerGroup} Tieren. Wie viele Tiere sind das insgesamt?`,
          answer: total.toString(),
          type: 'math',
          explanation: `${groups} × ${animalsPerGroup} = ${total} Tiere. Anzahl Gehege mal Tiere pro Gehege.`
        };
      }
      
      default: {
        const students = Math.floor(Math.random() * 20) + 15;
        const absent = Math.floor(Math.random() * 5) + 1;
        const present = students - absent;
        
        return {
          id,
          questionType: 'text-input',
          question: `In der Klasse sind ${students} Schüler. Heute fehlen ${absent}. Wie viele sind da?`,
          answer: present.toString(),
          type: 'math',
          explanation: `${students} - ${absent} = ${present} Schüler sind anwesend.`
        };
      }
    }
  }
  
  private static generateDecimalProblem(id: number, grade: number): SelectionQuestion {
    if (grade < 4) {
      return this.generateAdditionProblem(id, grade); // Fallback for lower grades
    }
    
    const whole1 = Math.floor(Math.random() * 20) + 5;
    const decimal1 = Math.floor(Math.random() * 9) + 1;
    const whole2 = Math.floor(Math.random() * 15) + 3;
    const decimal2 = Math.floor(Math.random() * 9) + 1;
    
    const num1 = whole1 + (decimal1 / 10);
    const num2 = whole2 + (decimal2 / 10);
    const answer = num1 + num2;
    
    return {
      id,
      questionType: 'text-input',
      question: `${num1.toFixed(1)} + ${num2.toFixed(1)} = ?`,
      answer: answer.toFixed(1),
      type: 'math',
      explanation: `${num1.toFixed(1)} + ${num2.toFixed(1)} = ${answer.toFixed(1)}. Addition mit Dezimalzahlen.`
    };
  }
  
  
  private static selectGermanProblemType(grade: number): string {
    const basicTypes = ['spelling', 'word_recognition'];
    const advancedTypes = ['grammar', 'word_types', 'sentence_structure'];
    
    const typePool = [
      ...basicTypes,
      ...(grade >= 3 ? advancedTypes : [])
    ];
    
    return typePool[Math.floor(Math.random() * typePool.length)];
  }
  
  private static generateGermanProblem(type: string, grade: number, seed: number): SelectionQuestion {
    const id = Math.floor(Math.random() * 1000000);
    
    switch (type) {
      case 'spelling':
        return this.generateSpellingProblem(id, grade);
      case 'word_recognition':
        return this.generateWordRecognitionProblem(id, grade);
      case 'grammar':
        return this.generateGrammarProblem(id, grade);
      case 'word_types':
        return this.generateWordTypeProblem(id, grade);
      default:
        return this.generateSpellingProblem(id, grade);
    }
  }
  
  private static generateSpellingProblem(id: number, grade: number): SelectionQuestion {
    const words = [
      { correct: 'Hund', wrong: ['Hunt', 'Hundt', 'Huntd'] },
      { correct: 'Katze', wrong: ['Kaze', 'Katse', 'Katzse'] },
      { correct: 'Schule', wrong: ['Shule', 'Schuhle', 'Schuele'] },
      { correct: 'Freund', wrong: ['Freunt', 'Froind', 'Freindt'] }
    ];
    
    const word = words[Math.floor(Math.random() * words.length)];
    const options = [word.correct, ...word.wrong].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(word.correct);
    
    return {
      id,
      questionType: 'multiple-choice',
      question: 'Welches Wort ist richtig geschrieben?',
      options,
      correctAnswer: correctIndex,
      type: 'german',
      explanation: `Das Wort "${word.correct}" ist richtig geschrieben.`
    };
  }
  
  private static generateWordRecognitionProblem(id: number, grade: number): SelectionQuestion {
    const animals = ['Hund', 'Katze', 'Vogel', 'Pferd', 'Kuh'];
    const colors = ['rot', 'blau', 'grün', 'gelb', 'schwarz'];
    const foods = ['Brot', 'Milch', 'Apfel', 'Käse', 'Fleisch'];
    
    const categories = [
      { name: 'Tiere', words: animals },
      { name: 'Farben', words: colors },
      { name: 'Essen', words: foods }
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const correctWord = category.words[Math.floor(Math.random() * category.words.length)];
    
    // Create distractors from other categories
    const otherWords = categories
      .filter(c => c.name !== category.name)
      .flatMap(c => c.words);
    
    const options = [
      correctWord,
      ...otherWords.slice(0, 3).sort(() => Math.random() - 0.5)
    ].slice(0, 4).sort(() => Math.random() - 0.5);
    
    const correctIndex = options.indexOf(correctWord);
    
    return {
      id,
      questionType: 'multiple-choice',
      question: `Welches Wort gehört zu "${category.name}"?`,
      options,
      correctAnswer: correctIndex,
      type: 'german',
      explanation: `"${correctWord}" gehört zur Kategorie "${category.name}".`
    };
  }
  
  private static generateGrammarProblem(id: number, grade: number): SelectionQuestion {
    const problems = [
      {
        question: 'Welche Wortart ist "schnell"?',
        options: ['Nomen', 'Verb', 'Adjektiv', 'Artikel'],
        correct: 2,
        explanation: '"Schnell" ist ein Adjektiv (Eigenschaftswort).'
      },
      {
        question: 'Welche Wortart ist "laufen"?',
        options: ['Nomen', 'Verb', 'Adjektiv', 'Artikel'],
        correct: 1,
        explanation: '"Laufen" ist ein Verb (Tunwort).'
      }
    ];
    
    const problem = problems[Math.floor(Math.random() * problems.length)];
    
    return {
      id,
      questionType: 'multiple-choice',
      question: problem.question,
      options: problem.options,
      correctAnswer: problem.correct,
      type: 'german',
      explanation: problem.explanation
    };
  }
  
  private static generateWordTypeProblem(id: number, grade: number): SelectionQuestion {
    const nouns = ['Baum', 'Haus', 'Auto', 'Schule'];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return {
      id,
      questionType: 'text-input',
      question: `Wie lautet die Mehrzahl von "${noun}"?`,
      answer: this.getPluralForm(noun),
      type: 'german',
      explanation: `Die Mehrzahl von "${noun}" ist "${this.getPluralForm(noun)}".`
    };
  }
  
  private static getPluralForm(noun: string): string {
    const plurals: { [key: string]: string } = {
      'Baum': 'Bäume',
      'Haus': 'Häuser',
      'Auto': 'Autos',
      'Schule': 'Schulen'
    };
    
    return plurals[noun] || noun + 'e';
  }
}