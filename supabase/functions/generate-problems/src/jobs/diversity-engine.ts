import { logger } from "../utils/logger.ts";

export class DiversityEngine {
  
  enhancePromptForDiversity(basePrompt: string, excludedQuestions: string[]): string {
    const diversityInstructions = this.createDiversityInstructions(excludedQuestions);
    const creativityBoost = this.createCreativityBoost(excludedQuestions.length);
    
    return `${basePrompt}

${diversityInstructions}

${creativityBoost}

WICHTIGE DIVERSITÄTS-REGELN:
- Verwende verschiedene Zahlen, Namen, Begriffe
- Variiere Fragestrukturen und Formulierungen  
- Nutze unterschiedliche Unterthemen
- Erstelle verschiedene Schwierigkeitsgrade
- ZWINGEND: Mindestens 50% Multiple-Choice Fragen für Mathematik
- FOKUS GEOMETRIE: Bei Mathe immer auch Geometrie-Aufgaben (Formen, Fläche, Umfang)
- Bevorzuge interaktive Fragetypen (multiple-choice, word-selection, matching)

ANTWORTFORMAT: Verwende JSON mit strukturiertem Format für bessere Verarbeitung.`;
  }

  private createDiversityInstructions(excludedQuestions: string[]): string {
    if (excludedQuestions.length === 0) {
      return '✨ Erstelle völlig neue und einzigartige Aufgaben!';
    }

    const sampleExcluded = excludedQuestions.slice(0, 5).map((q, i) => `${i+1}. "${q}"`).join('\n');
    
    return `🚫 VERMEIDE DIESE ${excludedQuestions.length} BEREITS GESTELLTEN FRAGEN:
${sampleExcluded}
${excludedQuestions.length > 5 ? `... und ${excludedQuestions.length - 5} weitere` : ''}

⚡ ERSTELLE KOMPLETT ANDERE FRAGEN MIT:
- Völlig unterschiedlichen Zahlen/Werten
- Anderen Themen/Unterthemen  
- Verschiedenen Formulierungen
- Neuen Beispielen und Begriffen`;
  }

  private createCreativityBoost(excludeCount: number): string {
    if (excludeCount <= 3) return '';
    
    return `🎨 MAXIMALE KREATIVITÄT ERFORDERLICH: 
Da bereits ${excludeCount} Fragen gestellt wurden, sei extrem kreativ und nutze völlig neue Ansätze, andere Themenbereiche und innovative Fragestellungen! KEINE WIEDERHOLUNGEN!`;
  }
}