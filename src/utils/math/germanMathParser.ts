/**
 * Phase 1: German Math Expression Parser
 * Handles German number formats, decimal commas, and mathematical expressions
 */

export interface MathParseResult {
  success: boolean;
  answer?: string | number;
  expression?: string;
  error?: string;
  steps?: string[];
}

export class GermanMathParser {
  
  /**
   * Main parsing function for German math expressions
   */
  static parse(content: string): MathParseResult {
    const steps: string[] = [];
    
    try {
      // Step 1: Try direct equation parsing (e.g., "6 × 6 = ?")
      const equationResult = this.parseDirectEquation(content);
      if (equationResult.success) {
        steps.push(`Direktes Gleichungsparsing: ${equationResult.expression}`);
        return { ...equationResult, steps };
      }
      
      // Step 2: Try geometry word problems
      const geometryResult = this.parseGeometryProblem(content);
      if (geometryResult.success) {
        steps.push(`Geometrieproblem erkannt: ${geometryResult.expression}`);
        return { ...geometryResult, steps };
      }
      
      // Step 3: Try time conversion problems
      const timeResult = this.parseTimeProblem(content);
      if (timeResult.success) {
        steps.push(`Zeitproblem erkannt: ${timeResult.expression}`);
        return { ...timeResult, steps };
      }
      
      // Step 4: Try word problems with math operations
      const wordResult = this.parseWordProblem(content);
      if (wordResult.success) {
        steps.push(`Textaufgabe erkannt: ${wordResult.expression}`);
        return { ...wordResult, steps };
      }
      
      // Step 5: Extract number comparison
      const comparisonResult = this.parseComparisonProblem(content);
      if (comparisonResult.success) {
        steps.push(`Vergleichsproblem erkannt: ${comparisonResult.expression}`);
        return { ...comparisonResult, steps };
      }
      
      return {
        success: false,
        error: 'Keine mathematische Struktur erkannt',
        steps
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Parserfehler',
        steps
      };
    }
  }
  
  /**
   * Parse direct equations like "6 × 6 = ?" or "2,5 + 1,8 = ?"
   */
  private static parseDirectEquation(content: string): MathParseResult {
    // Enhanced pattern to catch German decimal format and various operators
    const patterns = [
      /(\d+(?:[,\.]\d+)?)\s*([+\-×÷*/:×])\s*(\d+(?:[,\.]\d+)?)\s*=\s*\?/,
      /(\d+(?:[,\.]\d+)?)\s*([+\-×÷*/:×])\s*(\d+(?:[,\.]\d+)?)/,
      /(\d+)\s*×\s*(\d+)\s*=\s*\?/,
      /(\d+)\s*÷\s*(\d+)\s*=\s*\?\s*Rest\s*\?/
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const num1 = this.parseGermanNumber(match[1]);
        const operator = match[2];
        const num2 = this.parseGermanNumber(match[3] || match[2]);
        
        if (num1 !== null && num2 !== null) {
          const result = this.calculateOperation(num1, operator, num2);
          if (result !== null) {
            // Handle division with remainder
            if (content.includes('Rest')) {
              const quotient = Math.floor(num1 / num2);
              const remainder = num1 % num2;
              return {
                success: true,
                answer: `${quotient} Rest ${remainder}`,
                expression: `${num1} ${operator} ${num2}`
              };
            }
            
            return {
              success: true,
              answer: this.formatGermanNumber(result),
              expression: `${num1} ${operator} ${num2}`
            };
          }
        }
      }
    }
    
    return { success: false };
  }
  
  /**
   * Parse geometry problems (area, perimeter, etc.)
   */
  private static parseGeometryProblem(content: string): MathParseResult {
    // Rectangle area: "Ein Rechteck hat die Länge 6 cm und die Breite 6 cm. Wie groß ist die Fläche?"
    const areaMatch = content.match(/Länge\s+(\d+(?:[,\.]\d+)?)\s*cm.*?Breite\s+(\d+(?:[,\.]\d+)?)\s*cm.*?Fläche/i);
    if (areaMatch) {
      const length = this.parseGermanNumber(areaMatch[1]);
      const width = this.parseGermanNumber(areaMatch[2]);
      if (length !== null && width !== null) {
        const area = length * width;
        return {
          success: true,
          answer: area.toString(),
          expression: `Fläche = ${length} × ${width}`
        };
      }
    }
    
    // Rectangle perimeter
    const perimeterMatch = content.match(/Länge\s+(\d+(?:[,\.]\d+)?)\s*cm.*?Breite\s+(\d+(?:[,\.]\d+)?)\s*cm.*?Umfang/i);
    if (perimeterMatch) {
      const length = this.parseGermanNumber(perimeterMatch[1]);
      const width = this.parseGermanNumber(perimeterMatch[2]);
      if (length !== null && width !== null) {
        const perimeter = 2 * (length + width);
        return {
          success: true,
          answer: perimeter.toString(),
          expression: `Umfang = 2 × (${length} + ${width})`
        };
      }
    }
    
    // Square area
    const squareMatch = content.match(/(?:Quadrat|quadratisch).*?Seite.*?(\d+(?:[,\.]\d+)?)\s*cm.*?Fläche/i);
    if (squareMatch) {
      const side = this.parseGermanNumber(squareMatch[1]);
      if (side !== null) {
        const area = side * side;
        return {
          success: true,
          answer: area.toString(),
          expression: `Fläche = ${side} × ${side}`
        };
      }
    }
    
    return { success: false };
  }
  
  /**
   * Parse time conversion problems
   */
  private static parseTimeProblem(content: string): MathParseResult {
    // Minutes to hours conversion: "Ein Film dauert 90 Minuten. Wie viele Stunden und Minuten sind das?"
    const minutesMatch = content.match(/(\d+)\s*Minuten.*?Stunden.*?Minuten/i);
    if (minutesMatch) {
      const totalMinutes = parseInt(minutesMatch[1]);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return {
        success: true,
        answer: minutes === 0 ? `${hours} Stunden` : `${hours} Stunden ${minutes} Minuten`,
        expression: `${totalMinutes} Minuten = ${hours}h ${minutes}min`
      };
    }
    
    return { success: false };
  }
  
  /**
   * Parse word problems with math operations
   */
  private static parseWordProblem(content: string): MathParseResult {
    // Money problems: "Anna hat 15 Euro und bekommt 8 Euro dazu"
    const moneyAddMatch = content.match(/(\d+(?:[,\.]\d+)?)\s*Euro.*?(?:bekommt|erhält).*?(\d+(?:[,\.]\d+)?)\s*Euro/i);
    if (moneyAddMatch) {
      const amount1 = this.parseGermanNumber(moneyAddMatch[1]);
      const amount2 = this.parseGermanNumber(moneyAddMatch[2]);
      if (amount1 !== null && amount2 !== null) {
        const total = amount1 + amount2;
        return {
          success: true,
          answer: this.formatGermanNumber(total),
          expression: `${amount1} + ${amount2} Euro`
        };
      }
    }
    
    // Division word problems: "24 Äpfel sollen gleichmäßig auf 4 Kinder verteilt werden"
    const divisionMatch = content.match(/(\d+)\s*\w+.*?auf\s*(\d+)\s*\w+.*?verteilt/i);
    if (divisionMatch) {
      const total = parseInt(divisionMatch[1]);
      const groups = parseInt(divisionMatch[2]);
      if (total > 0 && groups > 0) {
        const perGroup = Math.floor(total / groups);
        return {
          success: true,
          answer: perGroup.toString(),
          expression: `${total} ÷ ${groups}`
        };
      }
    }
    
    return { success: false };
  }
  
  /**
   * Parse number comparison problems
   */
  private static parseComparisonProblem(content: string): MathParseResult {
    // "Welche Zahl ist größer: 15 oder 23?"
    const comparisonMatch = content.match(/größer.*?(\d+(?:[,\.]\d+)?).*?(?:oder|und).*?(\d+(?:[,\.]\d+)?)/i);
    if (comparisonMatch) {
      const num1 = this.parseGermanNumber(comparisonMatch[1]);
      const num2 = this.parseGermanNumber(comparisonMatch[2]);
      if (num1 !== null && num2 !== null) {
        const greater = num1 > num2 ? num1 : num2;
        return {
          success: true,
          answer: greater.toString(),
          expression: `max(${num1}, ${num2})`
        };
      }
    }
    
    return { success: false };
  }
  
  /**
   * Parse German number format (comma as decimal separator)
   */
  private static parseGermanNumber(numStr: string): number | null {
    if (!numStr) return null;
    
    // Handle German decimal format (comma) and international format (dot)
    const normalized = numStr.replace(',', '.');
    const parsed = parseFloat(normalized);
    
    return isNaN(parsed) ? null : parsed;
  }
  
  /**
   * Format number for German output
   */
  private static formatGermanNumber(num: number): string {
    // If it's a whole number, return as integer
    if (Number.isInteger(num)) {
      return num.toString();
    }
    
    // For decimals, use German format (comma) if more than 2 decimal places
    const formatted = num.toFixed(2);
    
    // Remove trailing zeros and convert dot to comma for German format
    return formatted.replace(/\.?0+$/, '').replace('.', ',');
  }
  
  /**
   * Calculate mathematical operation
   */
  private static calculateOperation(num1: number, operator: string, num2: number): number | null {
    switch (operator) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '×':
      case '*':
        return num1 * num2;
      case '÷':
      case '/':
      case ':':
        return num2 !== 0 ? num1 / num2 : null;
      default:
        return null;
    }
  }
}