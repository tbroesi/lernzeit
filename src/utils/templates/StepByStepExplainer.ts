/**
 * Step-by-Step Explanation Generator
 * Creates detailed, educational explanations for mathematical problems
 */

import { SelectionQuestion } from '@/types/questionTypes';

export interface ExplanationStep {
  stepNumber: number;
  description: string;
  calculation?: string;
  result?: string | number;
  reasoning?: string;
}

export interface DetailedExplanation {
  questionType: string;
  mainConcept: string;
  steps: ExplanationStep[];
  finalAnswer: string | number;
  additionalNotes?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  gradeLevel: number;
}

export class StepByStepExplainer {
  /**
   * Generate a comprehensive step-by-step explanation
   */
  static explain(question: SelectionQuestion, answer?: any): DetailedExplanation {
    console.log('📚 Generating step-by-step explanation for:', question.question.substring(0, 50) + '...');

    const questionText = question.question.toLowerCase();
    const questionType = this.identifyQuestionType(questionText);
    const gradeLevel = this.estimateGradeLevel(questionText);
    
    let explanation: DetailedExplanation;

    switch (questionType) {
      case 'arithmetic':
        explanation = this.explainArithmetic(question, answer);
        break;
      case 'word-problem':
        explanation = this.explainWordProblem(question, answer);
        break;
      case 'geometry':
        explanation = this.explainGeometry(question, answer);
        break;
      case 'fractions':
        explanation = this.explainFractions(question, answer);
        break;
      case 'decimals':
        explanation = this.explainDecimals(question, answer);
        break;
      case 'comparison':
        explanation = this.explainComparison(question, answer);
        break;
      case 'time':
        explanation = this.explainTime(question, answer);
        break;
      case 'money':
        explanation = this.explainMoney(question, answer);
        break;
      case 'german-language':
        explanation = this.explainGermanLanguage(question, answer);
        break;
      default:
        explanation = this.explainGeneric(question, answer);
    }

    explanation.gradeLevel = gradeLevel;
    explanation.difficulty = this.assessDifficulty(question, explanation.steps.length);

    console.log(`📚 Generated ${explanation.steps.length} steps for ${questionType} question`);
    return explanation;
  }

  /**
   * Arithmetic operations explanation
   */
  private static explainArithmetic(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const text = question.question;
    const numbers = this.extractNumbers(text);
    const operation = this.detectOperation(text);
    
    const steps: ExplanationStep[] = [];
    let finalAnswer = answer || (question as any).answer;

    // Step 1: Identify the operation
    steps.push({
      stepNumber: 1,
      description: `Erkenne die Rechenoperation`,
      reasoning: this.getOperationDescription(operation)
    });

    // Step 2: Identify the numbers
    if (numbers.length >= 2) {
      steps.push({
        stepNumber: 2,
        description: `Finde die Zahlen in der Aufgabe`,
        result: `Zahlen: ${numbers.join(', ')}`
      });
    }

    // Step 3: Perform the calculation
    if (numbers.length >= 2) {
      const calculation = this.buildCalculationString(numbers, operation);
      const result = this.performCalculation(numbers, operation);
      finalAnswer = result;

      steps.push({
        stepNumber: 3,
        description: `Führe die Berechnung durch`,
        calculation,
        result: result.toString()
      });
    }

    // Step 4: Verification (for complex operations)
    if (operation === 'division' || numbers.some(n => n > 100)) {
      steps.push({
        stepNumber: 4,
        description: `Prüfe das Ergebnis`,
        reasoning: this.generateVerification(numbers, operation, finalAnswer)
      });
    }

    return {
      questionType: 'arithmetic',
      mainConcept: this.getMainConcept(operation),
      steps,
      finalAnswer,
      additionalNotes: this.getArithmeticNotes(operation, numbers),
      difficulty: 'medium',
      gradeLevel: 2
    };
  }

  /**
   * Word problem explanation
   */
  private static explainWordProblem(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const text = question.question;
    const numbers = this.extractNumbers(text);
    const operation = this.detectOperationFromContext(text);
    
    const steps: ExplanationStep[] = [];

    // Step 1: Understand the problem
    steps.push({
      stepNumber: 1,
      description: `Verstehe die Aufgabe`,
      reasoning: `Lies die Aufgabe sorgfältig und erkenne was gefragt ist`
    });

    // Step 2: Identify relevant information
    steps.push({
      stepNumber: 2,
      description: `Finde wichtige Informationen`,
      result: `Zahlen: ${numbers.join(', ')}`
    });

    // Step 3: Determine the operation
    steps.push({
      stepNumber: 3,
      description: `Bestimme die Rechenart`,
      reasoning: this.getWordProblemOperationReasoning(text, operation)
    });

    // Step 4: Calculate
    if (numbers.length >= 2) {
      const result = this.performCalculation(numbers, operation);
      const calculation = this.buildCalculationString(numbers, operation);
      
      steps.push({
        stepNumber: 4,
        description: `Berechne das Ergebnis`,
        calculation,
        result: result.toString()
      });
    }

    // Step 5: Answer in context
    const finalAnswer = answer || (question as any).answer;
    steps.push({
      stepNumber: 5,
      description: `Gib die Antwort im Zusammenhang`,
      reasoning: this.contextualizeAnswer(text, finalAnswer)
    });

    return {
      questionType: 'word-problem',
      mainConcept: `Textaufgaben mit ${this.getMainConcept(operation)}`,
      steps,
      finalAnswer,
      additionalNotes: [`Textaufgaben erfordern sorgfältiges Lesen und Verstehen`]
    };
  }

  /**
   * Geometry explanation
   */
  private static explainGeometry(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const text = question.question.toLowerCase();
    const numbers = this.extractNumbers(question.question);
    const steps: ExplanationStep[] = [];
    
    let geometryType = 'unknown';
    let formula = '';
    let concept = '';

    if (text.includes('fläche') || text.includes('flächeninhalt')) {
      if (text.includes('rechteck')) {
        geometryType = 'rectangle-area';
        formula = 'Fläche = Länge × Breite';
        concept = 'Flächenberechnung Rechteck';
      } else if (text.includes('quadrat')) {
        geometryType = 'square-area';
        formula = 'Fläche = Seitenlänge²';
        concept = 'Flächenberechnung Quadrat';
      }
    } else if (text.includes('umfang')) {
      if (text.includes('rechteck')) {
        geometryType = 'rectangle-perimeter';
        formula = 'Umfang = 2 × (Länge + Breite)';
        concept = 'Umfang Rechteck';
      } else if (text.includes('quadrat')) {
        geometryType = 'square-perimeter';
        formula = 'Umfang = 4 × Seitenlänge';
        concept = 'Umfang Quadrat';
      }
    }

    // Step 1: Identify the geometric shape and what to calculate
    steps.push({
      stepNumber: 1,
      description: `Erkenne die geometrische Form und was berechnet werden soll`,
      reasoning: concept
    });

    // Step 2: Write down the formula
    steps.push({
      stepNumber: 2,
      description: `Schreibe die Formel auf`,
      result: formula
    });

    // Step 3: Identify the measurements
    if (numbers.length > 0) {
      steps.push({
        stepNumber: 3,
        description: `Finde die gegebenen Maße`,
        result: this.identifyMeasurements(geometryType, numbers)
      });
    }

    // Step 4: Substitute values
    if (numbers.length >= 1) {
      const substitution = this.substituteGeometryValues(geometryType, numbers);
      steps.push({
        stepNumber: 4,
        description: `Setze die Werte in die Formel ein`,
        calculation: substitution
      });
    }

    // Step 5: Calculate
    const result = this.calculateGeometry(geometryType, numbers);
    steps.push({
      stepNumber: 5,
      description: `Berechne das Ergebnis`,
      result: `${result} ${this.getGeometryUnit(geometryType)}`
    });

    return {
      questionType: 'geometry',
      mainConcept: concept,
      steps,
      finalAnswer: result,
      additionalNotes: [
        `Achte auf die richtigen Einheiten`,
        `Bei Flächen ist das Ergebnis in Quadrateinheiten`,
        `Bei Umfang ist das Ergebnis in Längeneinheiten`
      ]
    };
  }

  /**
   * Fractions explanation
   */
  private static explainFractions(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const text = question.question;
    const steps: ExplanationStep[] = [];

    // Extract fractions
    const fractions = this.extractFractions(text);
    
    steps.push({
      stepNumber: 1,
      description: `Erkenne die Brüche in der Aufgabe`,
      result: fractions.map(f => `${f.numerator}/${f.denominator}`).join(', ')
    });

    if (text.includes('vergleich') || text.includes('größer') || text.includes('kleiner')) {
      // Fraction comparison
      steps.push({
        stepNumber: 2,
        description: `Wandle Brüche in Dezimalzahlen um`,
        reasoning: `So kann man sie leichter vergleichen`
      });

      const decimals = fractions.map(f => ({
        fraction: `${f.numerator}/${f.denominator}`,
        decimal: (f.numerator / f.denominator).toFixed(3)
      }));

      for (const decimal of decimals) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Berechne ${decimal.fraction}`,
          calculation: `${decimal.fraction} = ${decimal.decimal}`
        });
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Vergleiche die Dezimalzahlen`,
        reasoning: `Der größere Dezimalwert entspricht dem größeren Bruch`
      });
    }

    return {
      questionType: 'fractions',
      mainConcept: 'Bruchrechnung',
      steps,
      finalAnswer: answer || (question as any).answer,
      additionalNotes: [
        `Brüche mit kleineren Nennern sind bei gleichen Zählern größer`,
        `Dezimalumwandlung hilft beim Vergleichen`
      ]
    };
  }

  /**
   * Decimals explanation
   */
  private static explainDecimals(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const text = question.question;
    const numbers = this.extractDecimalNumbers(text);
    const operation = this.detectOperation(text);
    const steps: ExplanationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: `Erkenne die Dezimalzahlen`,
      result: numbers.join(', ')
    });

    steps.push({
      stepNumber: 2,
      description: `Achte auf die Kommaposition`,
      reasoning: `Bei Dezimalrechnungen ist die Position des Kommas wichtig`
    });

    if (operation === 'addition' || operation === 'subtraction') {
      steps.push({
        stepNumber: 3,
        description: `Schreibe die Zahlen untereinander`,
        reasoning: `Kommas müssen untereinander stehen`
      });
    }

    const calculation = this.buildDecimalCalculation(numbers, operation);
    const result = this.performDecimalCalculation(numbers, operation);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Führe die Berechnung durch`,
      calculation,
      result: result.toString()
    });

    return {
      questionType: 'decimals',
      mainConcept: 'Dezimalrechnung',
      steps,
      finalAnswer: result,
      additionalNotes: [
        `Bei der Addition/Subtraktion: Kommas untereinander`,
        `Bei der Multiplikation: Kommas am Ende richtig setzen`
      ]
    };
  }

  /**
   * German language explanation
   */
  private static explainGermanLanguage(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const text = question.question;
    const steps: ExplanationStep[] = [];

    if (text.includes('silbe')) {
      return this.explainSyllables(question, answer);
    } else if (text.includes('plural') || text.includes('mehrzahl')) {
      return this.explainPlural(question, answer);
    } else if (text.includes('groß') || text.includes('klein')) {
      return this.explainCapitalization(question, answer);
    }

    return this.explainGeneric(question, answer);
  }

  /**
   * Syllable counting explanation
   */
  private static explainSyllables(question: SelectionQuestion, answer?: any): DetailedExplanation {
    const word = this.extractWordForSyllables(question.question);
    const steps: ExplanationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: `Identifiziere das Wort`,
      result: word
    });

    steps.push({
      stepNumber: 2,
      description: `Spreche das Wort langsam aus`,
      reasoning: `Jeder Vokal oder Vokalgruppe bildet meist eine Silbe`
    });

    const syllables = this.countSyllables(word);
    const syllableBreakdown = this.breakWordIntoSyllables(word);

    steps.push({
      stepNumber: 3,
      description: `Teile das Wort in Silben`,
      result: syllableBreakdown.join(' - ')
    });

    steps.push({
      stepNumber: 4,
      description: `Zähle die Silben`,
      result: `${syllables} Silben`
    });

    return {
      questionType: 'german-language',
      mainConcept: 'Silbentrennung',
      steps,
      finalAnswer: syllables,
      additionalNotes: [
        `Jeder Vokal bildet meist eine Silbe`,
        `Doppelkonsonanten werden getrennt`
      ]
    };
  }

  /**
   * Helper methods for calculations and analysis
   */
  private static identifyQuestionType(text: string): string {
    if (text.includes('silbe') || text.includes('plural') || text.includes('groß')) return 'german-language';
    if (text.includes('bruch')) return 'fractions';
    if (text.includes(',') && /\d+,\d+/.test(text)) return 'decimals';
    if (text.includes('fläche') || text.includes('umfang')) return 'geometry';
    if (text.includes('euro') || text.includes('cent')) return 'money';
    if (text.includes('stunde') || text.includes('minute')) return 'time';
    if (text.includes('größer') || text.includes('kleiner')) return 'comparison';
    if (/\d+\s*[+\-×÷*\/]\s*\d+/.test(text)) return 'arithmetic';
    if (this.hasWordProblemIndicators(text)) return 'word-problem';
    
    return 'general';
  }

  private static extractNumbers(text: string): number[] {
    const matches = text.match(/\d+(?:[,.]\d+)?/g);
    return matches ? matches.map(m => parseFloat(m.replace(',', '.'))) : [];
  }

  private static extractDecimalNumbers(text: string): string[] {
    const matches = text.match(/\d+,\d+/g);
    return matches || [];
  }

  private static detectOperation(text: string): string {
    if (text.includes('+') || text.includes('addier') || text.includes('plus')) return 'addition';
    if (text.includes('-') || text.includes('subtrah') || text.includes('minus')) return 'subtraction';
    if (text.includes('×') || text.includes('*') || text.includes('mal')) return 'multiplication';
    if (text.includes('÷') || text.includes('/') || text.includes('teil')) return 'division';
    return 'unknown';
  }

  private static performCalculation(numbers: number[], operation: string): number {
    if (numbers.length < 2) return numbers[0] || 0;
    
    switch (operation) {
      case 'addition': return numbers.reduce((a, b) => a + b, 0);
      case 'subtraction': return numbers[0] - numbers[1];
      case 'multiplication': return numbers[0] * numbers[1];
      case 'division': return numbers[1] !== 0 ? numbers[0] / numbers[1] : 0;
      default: return numbers[0];
    }
  }

  private static buildCalculationString(numbers: number[], operation: string): string {
    if (numbers.length < 2) return '';
    
    const symbols = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };
    
    const symbol = symbols[operation as keyof typeof symbols] || '?';
    return `${numbers[0]} ${symbol} ${numbers[1]} = ${this.performCalculation(numbers, operation)}`;
  }

  private static getOperationDescription(operation: string): string {
    const descriptions = {
      addition: 'Plus-Rechnung (zusammenzählen)',
      subtraction: 'Minus-Rechnung (abziehen)',
      multiplication: 'Mal-Rechnung (vervielfachen)',
      division: 'Geteilt-Rechnung (aufteilen)'
    };
    
    return descriptions[operation as keyof typeof descriptions] || 'Unbekannte Operation';
  }

  private static getMainConcept(operation: string): string {
    const concepts = {
      addition: 'Addition',
      subtraction: 'Subtraktion',
      multiplication: 'Multiplikation',
      division: 'Division'
    };
    
    return concepts[operation as keyof typeof concepts] || 'Grundrechenart';
  }

  private static estimateGradeLevel(text: string): number {
    const numbers = this.extractNumbers(text);
    const maxNumber = Math.max(...numbers, 0);
    
    if (maxNumber <= 20) return 1;
    if (maxNumber <= 100) return 2;
    if (maxNumber <= 1000) return 3;
    return 4;
  }

  private static assessDifficulty(question: SelectionQuestion, stepCount: number): 'easy' | 'medium' | 'hard' {
    const text = question.question.toLowerCase();
    const numbers = this.extractNumbers(text);
    const maxNumber = Math.max(...numbers, 0);
    
    if (stepCount <= 3 && maxNumber <= 50) return 'easy';
    if (stepCount <= 5 && maxNumber <= 500) return 'medium';
    return 'hard';
  }

  // Additional helper methods would continue here...
  private static explainComparison(question: SelectionQuestion, answer?: any): DetailedExplanation {
    // Implementation for comparison explanations
    return this.explainGeneric(question, answer);
  }

  private static explainTime(question: SelectionQuestion, answer?: any): DetailedExplanation {
    // Implementation for time explanations
    return this.explainGeneric(question, answer);
  }

  private static explainMoney(question: SelectionQuestion, answer?: any): DetailedExplanation {
    // Implementation for money explanations
    return this.explainGeneric(question, answer);
  }

  private static explainGeneric(question: SelectionQuestion, answer?: any): DetailedExplanation {
    return {
      questionType: 'general',
      mainConcept: 'Allgemeine Aufgabe',
      steps: [
        {
          stepNumber: 1,
          description: 'Lies die Aufgabe sorgfältig',
          reasoning: 'Verstehe was gefragt ist'
        },
        {
          stepNumber: 2,
          description: 'Überlege welche Informationen wichtig sind',
          reasoning: 'Sammle alle relevanten Daten'
        },
        {
          stepNumber: 3,
          description: 'Löse die Aufgabe Schritt für Schritt',
          result: answer || (question as any).answer || 'Siehe Lösung'
        }
      ],
      finalAnswer: answer || (question as any).answer,
      additionalNotes: ['Nimm dir Zeit zum Verstehen der Aufgabe']
    };
  }

  // More helper methods...
  private static hasWordProblemIndicators(text: string): boolean {
    const indicators = ['hat', 'kauft', 'verkauft', 'zusammen', 'insgesamt', 'weniger', 'mehr'];
    return indicators.some(indicator => text.includes(indicator));
  }

  private static extractFractions(text: string): Array<{numerator: number, denominator: number}> {
    const fractionMatches = text.match(/(\d+)\/(\d+)/g);
    if (!fractionMatches) return [];
    
    return fractionMatches.map(match => {
      const [numerator, denominator] = match.split('/').map(Number);
      return { numerator, denominator };
    });
  }

  private static extractWordForSyllables(text: string): string {
    const wordMatch = text.match(/"([^"]+)"/);
    return wordMatch ? wordMatch[1] : 'Wort';
  }

  private static countSyllables(word: string): number {
    // Simple syllable counting - could be enhanced
    const vowels = word.toLowerCase().match(/[aeiouäöü]/g);
    return vowels ? vowels.length : 1;
  }

  private static breakWordIntoSyllables(word: string): string[] {
    // Simple syllable breaking - could be enhanced with more sophisticated rules
    return [word]; // Placeholder - would need more complex implementation
  }

  // Geometry helper methods
  private static identifyMeasurements(geometryType: string, numbers: number[]): string {
    switch (geometryType) {
      case 'rectangle-area':
      case 'rectangle-perimeter':
        return `Länge: ${numbers[0]}, Breite: ${numbers[1]}`;
      case 'square-area':
      case 'square-perimeter':
        return `Seitenlänge: ${numbers[0]}`;
      default:
        return numbers.join(', ');
    }
  }

  private static substituteGeometryValues(geometryType: string, numbers: number[]): string {
    switch (geometryType) {
      case 'rectangle-area':
        return `${numbers[0]} × ${numbers[1]}`;
      case 'square-area':
        return `${numbers[0]}²`;
      case 'rectangle-perimeter':
        return `2 × (${numbers[0]} + ${numbers[1]})`;
      case 'square-perimeter':
        return `4 × ${numbers[0]}`;
      default:
        return '';
    }
  }

  private static calculateGeometry(geometryType: string, numbers: number[]): number {
    switch (geometryType) {
      case 'rectangle-area':
        return numbers[0] * numbers[1];
      case 'square-area':
        return numbers[0] * numbers[0];
      case 'rectangle-perimeter':
        return 2 * (numbers[0] + numbers[1]);
      case 'square-perimeter':
        return 4 * numbers[0];
      default:
        return 0;
    }
  }

  private static getGeometryUnit(geometryType: string): string {
    if (geometryType.includes('area')) return 'cm²';
    if (geometryType.includes('perimeter')) return 'cm';
    return '';
  }

  // More helper implementations would continue...
  private static detectOperationFromContext(text: string): string {
    // Enhanced operation detection for word problems
    if (text.includes('zusammen') || text.includes('insgesamt')) return 'addition';
    if (text.includes('weniger') || text.includes('verliert')) return 'subtraction';
    if (text.includes('mal') || text.includes('vervielfach')) return 'multiplication';
    if (text.includes('aufgeteilt') || text.includes('teil')) return 'division';
    return this.detectOperation(text);
  }

  private static getWordProblemOperationReasoning(text: string, operation: string): string {
    const reasonings = {
      addition: 'Wörter wie "zusammen" oder "insgesamt" zeigen Addition an',
      subtraction: 'Wörter wie "weniger" oder "verliert" zeigen Subtraktion an',
      multiplication: 'Wörter wie "mal" oder "vervielfachen" zeigen Multiplikation an',
      division: 'Wörter wie "aufteilen" oder "verteilen" zeigen Division an'
    };
    
    return reasonings[operation as keyof typeof reasonings] || 'Bestimme die Operation aus dem Kontext';
  }

  private static contextualizeAnswer(text: string, answer: any): string {
    // Provide context-appropriate answer format
    if (text.includes('euro')) return `Die Antwort ist ${answer} Euro`;
    if (text.includes('stück')) return `Es sind ${answer} Stück`;
    if (text.includes('kinder')) return `Es sind ${answer} Kinder`;
    return `Die Antwort ist ${answer}`;
  }

  private static generateVerification(numbers: number[], operation: string, result: any): string {
    switch (operation) {
      case 'addition':
        return `Probe: ${result} - ${numbers[1]} = ${numbers[0]}`;
      case 'subtraction':
        return `Probe: ${result} + ${numbers[1]} = ${numbers[0]}`;
      case 'multiplication':
        return `Probe: ${result} ÷ ${numbers[1]} = ${numbers[0]}`;
      case 'division':
        return `Probe: ${result} × ${numbers[1]} = ${numbers[0]}`;
      default:
        return 'Das Ergebnis sollte logisch sinnvoll sein';
    }
  }

  private static getArithmeticNotes(operation: string, numbers: number[]): string[] {
    const notes: string[] = [];
    
    if (operation === 'division' && numbers[1] === 0) {
      notes.push('Division durch Null ist nicht möglich');
    }
    
    if (numbers.some(n => n > 1000)) {
      notes.push('Bei großen Zahlen kann es hilfreich sein, schrittweise zu rechnen');
    }
    
    return notes;
  }

  private static performDecimalCalculation(numbers: string[], operation: string): string {
    const nums = numbers.map(n => parseFloat(n.replace(',', '.')));
    const result = this.performCalculation(nums, operation);
    return result.toString().replace('.', ',');
  }

  private static buildDecimalCalculation(numbers: string[], operation: string): string {
    if (numbers.length < 2) return '';
    
    const symbols = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };
    
    const symbol = symbols[operation as keyof typeof symbols] || '?';
    return `${numbers[0]} ${symbol} ${numbers[1]}`;
  }

  private static explainPlural(question: SelectionQuestion, answer?: any): DetailedExplanation {
    // Implementation for plural explanations
    return this.explainGeneric(question, answer);
  }

  private static explainCapitalization(question: SelectionQuestion, answer?: any): DetailedExplanation {
    // Implementation for capitalization explanations  
    return this.explainGeneric(question, answer);
  }
}