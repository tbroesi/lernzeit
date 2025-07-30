/**
 * Verbesserter Hook für Mathematik-Fragengenerierung
 * Integriert alle Phase-1-Verbesserungen
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SelectionQuestion } from '@/types/questionTypes';
import { supabase } from '@/integrations/supabase/client';
import { ImprovedGermanMathParser } from '@/utils/math/ImprovedGermanMathParser';
import { SemanticDuplicateDetector } from '@/utils/math/SemanticDuplicateDetector';
import { StepByStepExplainer } from '@/utils/math/StepByStepExplainer';

export interface MathGenerationConfig {
  grade: number;
  totalQuestions: number;
  enableDuplicateDetection: boolean;
  enableEnhancedExplanations: boolean;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface GenerationStats {
  totalGenerated: number;
  duplicatesAvoided: number;
  parseErrors: number;
  explanationQuality: number;
  generationTime: number;
}

export function useImprovedMathGeneration(
  userId: string,
  config: MathGenerationConfig
) {
  const [problems, setProblems] = useState<SelectionQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GenerationStats>({
    totalGenerated: 0,
    duplicatesAvoided: 0,
    parseErrors: 0,
    explanationQuality: 0,
    generationTime: 0
  });

  // Verwende useRef für die Instanz des Duplicate Detectors
  const duplicateDetectorRef = useRef<SemanticDuplicateDetector | null>(null);

  // Initialisiere Duplikaterkennung
  useEffect(() => {
    if (config.enableDuplicateDetection) {
      const detector = new SemanticDuplicateDetector();
      duplicateDetectorRef.current = detector;
      detector.initialize(userId, config.grade);
    }
  }, [userId, config.grade, config.enableDuplicateDetection]);

  /**
   * Generiert eine einzelne Mathematik-Frage
   */
  const generateSingleQuestion = useCallback(async (
    existingQuestions: string[]
  ): Promise<SelectionQuestion | null> => {
    const startTime = Date.now();
    
    // Bestimme Zahlenbereich basierend auf Klassenstufe
    const ranges = {
      1: { min: 1, max: 20, operations: ['+', '-'] },
      2: { min: 1, max: 100, operations: ['+', '-'] },
      3: { min: 1, max: 1000, operations: ['+', '-', '×'] },
      4: { min: 1, max: 10000, operations: ['+', '-', '×', '÷'] }
    };
    
    const gradeConfig = ranges[config.grade as keyof typeof ranges] || ranges[4];
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Generiere Zahlen und Operation
      const a = Math.floor(Math.random() * (gradeConfig.max - gradeConfig.min + 1)) + gradeConfig.min;
      const b = Math.floor(Math.random() * Math.min(gradeConfig.max / 2, 50)) + 1;
      const operation = gradeConfig.operations[Math.floor(Math.random() * gradeConfig.operations.length)];
      
      // Spezialbehandlung für Subtraktion und Division
      let num1 = a;
      let num2 = b;
      
      if (operation === '-' && num2 > num1) {
        [num1, num2] = [num2, num1]; // Tausche für positive Ergebnisse
      }
      
      if (operation === '÷') {
        // Stelle sicher, dass Division aufgeht
        num1 = num2 * Math.floor(Math.random() * 10 + 1);
      }
      
      // Erstelle verschiedene Frageformate
      const formats = [
        `${num1} ${operation} ${num2} = ?`,
        `Was ist ${num1} ${operation} ${num2}?`,
        `Berechne: ${num1} ${operation} ${num2}`,
        `Rechne aus: ${num1} ${operation} ${num2}`
      ];
      
      const questionText = formats[Math.floor(Math.random() * formats.length)];
      
      // Prüfe auf Duplikate
      if (config.enableDuplicateDetection && duplicateDetectorRef.current) {
        const duplicateCheck = duplicateDetectorRef.current.checkDuplicate(
          questionText,
          userId,
          config.grade,
          existingQuestions
        );
        
        if (duplicateCheck.isDuplicate) {
          continue; // Versuche erneut
        }
      }
      
      // Parse und berechne die Antwort
      const parseResult = ImprovedGermanMathParser.parse(questionText);
      
      if (!parseResult.success || parseResult.answer === undefined) {
        setStats(prev => ({ ...prev, parseErrors: prev.parseErrors + 1 }));
        continue;
      }
      
      // Generiere Erklärung
      const answer = parseResult.answer;
      let explanation = '';
      
      if (config.enableEnhancedExplanations) {
        const detailedExplanation = StepByStepExplainer.generateExplanation(
          { question: questionText, type: 'math' } as SelectionQuestion,
          answer,
          config.grade
        );
        
        // Formatiere die Erklärung
        explanation = detailedExplanation.summary + '\n\n';
        explanation += detailedExplanation.steps
          .map(step => `${step.step}. ${step.description}${step.calculation ? ': ' + step.calculation : ''}`)
          .join('\n');
        
        if (detailedExplanation.tips && detailedExplanation.tips.length > 0) {
          explanation += '\n\n💡 Tipp: ' + detailedExplanation.tips[0];
        }
      } else {
        explanation = parseResult.steps ? parseResult.steps.join('\n') : `${questionText.replace('?', '')}${answer}`;
      }
      
      // Erstelle die Frage
      const question: SelectionQuestion = {
        id: Math.floor(Math.random() * 1000000),
        question: questionText,
        questionType: 'text-input',
        type: 'math',
        answer: answer.toString(),
        explanation
      };
      
      // Speichere in Duplikaterkennung
      if (config.enableDuplicateDetection && duplicateDetectorRef.current) {
        await duplicateDetectorRef.current.saveQuestion(questionText, userId, config.grade);
      }
      
      const generationTime = Date.now() - startTime;
      setStats(prev => ({
        ...prev,
        totalGenerated: prev.totalGenerated + 1,
        duplicatesAvoided: prev.duplicatesAvoided + (attempts - 1),
        generationTime: prev.generationTime + generationTime
      }));
      
      return question;
    }
    
    return null;
  }, [config, userId]);

  /**
   * Generiert Multiple-Choice-Fragen
   */
  const generateMultipleChoiceQuestion = useCallback(async (
    existingQuestions: string[]
  ): Promise<SelectionQuestion | null> => {
    const baseQuestion = await generateSingleQuestion(existingQuestions);
    
    if (!baseQuestion || baseQuestion.questionType !== 'text-input') {
      return null;
    }
    
    const correctAnswer = parseInt(baseQuestion.answer as string);
    if (isNaN(correctAnswer)) {
      return baseQuestion; // Fallback zu Text-Input
    }
    
    // Generiere falsche Antworten
    const wrongAnswers = new Set<number>();
    const variations = [-10, -5, -2, -1, 1, 2, 5, 10];
    
    // Füge Variationen hinzu
    variations.forEach(delta => {
      const wrong = correctAnswer + delta;
      if (wrong > 0 && wrong !== correctAnswer) {
        wrongAnswers.add(wrong);
      }
    });
    
    // Füge zufällige Antworten hinzu
    while (wrongAnswers.size < 3) {
      const range = Math.max(20, correctAnswer * 0.5);
      const wrong = correctAnswer + Math.floor(Math.random() * range * 2 - range);
      if (wrong > 0 && wrong !== correctAnswer) {
        wrongAnswers.add(wrong);
      }
    }
    
    // Wähle 3 falsche Antworten
    const options = [correctAnswer];
    const wrongArray = Array.from(wrongAnswers);
    for (let i = 0; i < 3 && i < wrongArray.length; i++) {
      options.push(wrongArray[i]);
    }
    
    // Mische die Optionen
    const shuffled = options.sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctAnswer);
    
    return {
      id: Math.floor(Math.random() * 1000000),
      question: questionText,
      questionType: 'text-input',
      type: 'math',
      answer: answer.toString(),
      explanation: explanation.summary + '\n\n' + explanation.steps.map(s => 
        `${s.step}. ${s.description}${s.calculation ? ': ' + s.calculation : ''}`
      ).join('\n')
    };
  }, [config]);

  /**
   * Hauptfunktion zum Generieren aller Fragen
   */
  const generateProblems = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      const generatedProblems: SelectionQuestion[] = [];
      const existingQuestions: string[] = problems.map(p => p.question);
      
      // Mischung verschiedener Fragetypen
      const questionTypes = {
        'text-input': 0.5,
        'multiple-choice': 0.3,
        'word-problem': 0.2
      };
      
      for (let i = 0; i < config.totalQuestions; i++) {
        const rand = Math.random();
        let question: SelectionQuestion | null = null;
        
        if (rand < questionTypes['word-problem'] && config.grade >= 2) {
          question = await generateWordProblem(existingQuestions);
        } else if (rand < questionTypes['word-problem'] + questionTypes['multiple-choice']) {
          question = await generateMultipleChoiceQuestion(existingQuestions);
        } else {
          question = await generateSingleQuestion(existingQuestions);
        }
        
        if (question) {
          generatedProblems.push(question);
          existingQuestions.push(question.question);
        } else {
          // Fallback bei Generierungsfehler
          console.warn(`Failed to generate question ${i + 1}`);
        }
      }
      
      setProblems(generatedProblems);
      
      // Berechne finale Statistiken
      const totalTime = Date.now() - startTime;
      setStats(prev => ({
        ...prev,
        generationTime: totalTime,
        explanationQuality: config.enableEnhancedExplanations ? 0.9 : 0.5
      }));
      
      console.log(`✅ Generated ${generatedProblems.length} math problems in ${totalTime}ms`);
      console.log(`📊 Stats:`, stats);
      
    } catch (err) {
      console.error('Error generating problems:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsGenerating(false);
    }
  }, [config, problems, stats, generateSingleQuestion, generateMultipleChoiceQuestion, generateWordProblem]);

  /**
   * Lädt Templates aus der Datenbank
   */
  const loadDatabaseTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('generated_templates')
        .select('*')
        .eq('category', 'Mathematik')
        .eq('grade', config.grade)
        .eq('is_active', true)
        .gte('quality_score', 0.7)
        .order('quality_score', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error loading templates:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Database error:', err);
      return [];
    }
  }, [config.grade]);

  /**
   * Generiert eine Frage aus einem Template
   */
  const generateFromTemplate = useCallback(async (
    template: any,
    existingQuestions: string[]
  ): Promise<SelectionQuestion | null> => {
    try {
      // Parse Template-Parameter
      const params = JSON.parse(template.parameters || '{}');
      
      // Generiere neue Werte für Parameter
      const values: Record<string, number> = {};
      for (const [key, range] of Object.entries(params)) {
        if (typeof range === 'object' && 'min' in range && 'max' in range) {
          values[key] = Math.floor(
            Math.random() * (range.max - range.min + 1) + range.min
          );
        }
      }
      
      // Ersetze Platzhalter im Template
      let questionText = template.template;
      for (const [key, value] of Object.entries(values)) {
        questionText = questionText.replace(new RegExp(`\\{${key}\\}`, 'g'), value.toString());
      }
      
      // Prüfe auf Duplikate
      if (config.enableDuplicateDetection && duplicateDetectorRef.current) {
        const duplicateCheck = duplicateDetectorRef.current.checkDuplicate(
          questionText,
          userId,
          config.grade,
          existingQuestions
        );
        
        if (duplicateCheck.isDuplicate) {
          return null;
        }
      }
      
      // Parse und berechne Antwort
      const parseResult = ImprovedGermanMathParser.parse(questionText);
      
      if (!parseResult.success || parseResult.answer === undefined) {
        return null;
      }
      
      // Generiere Erklärung
      const explanation = StepByStepExplainer.generateExplanation(
        { question: questionText, type: 'math' } as SelectionQuestion,
        parseResult.answer,
        config.grade
      );
      
      return {
        id: Math.floor(Math.random() * 1000000),
        question: questionText,
        questionType: template.question_type || 'text-input',
        type: 'math',
        answer: parseResult.answer.toString(),
        explanation: explanation.summary + '\n\n' + 
          explanation.steps.map(s => `${s.step}. ${s.description}`).join('\n')
      };
      
    } catch (err) {
      console.error('Error generating from template:', err);
      return null;
    }
  }, [config, userId]);

  /**
   * Regeneriert eine einzelne Frage
   */
  const regenerateQuestion = useCallback(async (index: number) => {
    if (index < 0 || index >= problems.length) return;
    
    const existingQuestions = problems.map(p => p.question);
    const newQuestion = await generateSingleQuestion(existingQuestions);
    
    if (newQuestion) {
      const newProblems = [...problems];
      newProblems[index] = newQuestion;
      setProblems(newProblems);
    }
  }, [problems, generateSingleQuestion]);

  /**
   * Exportiert die generierten Fragen
   */
  const exportProblems = useCallback(() => {
    const exportData = {
      metadata: {
        userId,
        grade: config.grade,
        generatedAt: new Date().toISOString(),
        totalQuestions: problems.length,
        stats
      },
      problems: problems.map(p => ({
        question: p.question,
        answer: p.answer,
        type: p.questionType,
        explanation: p.explanation
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-problems-grade${config.grade}-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [problems, config, userId, stats]);

  return {
    problems,
    isGenerating,
    error,
    stats,
    generateProblems,
    regenerateQuestion,
    exportProblems,
    loadDatabaseTemplates,
    generateFromTemplate
  };
}
      ...baseQuestion,
      questionType: 'multiple-choice',
      options: shuffled.map(n => n.toString()),
      correctAnswer: correctIndex
    };
  }, [generateSingleQuestion]);

  /**
   * Generiert Textaufgaben
   */
  const generateWordProblem = useCallback(async (
    existingQuestions: string[]
  ): Promise<SelectionQuestion | null> => {
    const templates = [
      {
        template: "{name} hat {a} {item}. {pronoun} bekommt {b} weitere dazu. Wie viele {item} hat {pronoun} jetzt?",
        operation: '+',
        names: ['Lisa', 'Max', 'Anna', 'Tom'],
        items: ['Äpfel', 'Bonbons', 'Murmeln', 'Stifte'],
        pronouns: { 'Lisa': 'Sie', 'Anna': 'Sie', 'Max': 'Er', 'Tom': 'Er' }
      },
      {
        template: "Im Bus sitzen {a} Personen. An der Haltestelle steigen {b} Personen ein. Wie viele Personen sind jetzt im Bus?",
        operation: '+'
      },
      {
        template: "{name} hat {a} Euro gespart. {pronoun} kauft sich etwas für {b} Euro. Wie viel Geld hat {pronoun} noch?",
        operation: '-',
        names: ['Sarah', 'Paul', 'Emma', 'Leon'],
        pronouns: { 'Sarah': 'Sie', 'Emma': 'Sie', 'Paul': 'Er', 'Leon': 'Er' }
      }
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const name = template.names ? template.names[Math.floor(Math.random() * template.names.length)] : '';
    const item = template.items ? template.items[Math.floor(Math.random() * template.items.length)] : '';
    const pronoun = template.pronouns ? template.pronouns[name as keyof typeof template.pronouns] : '';
    
    // Generiere passende Zahlen
    const ranges = {
      1: { max: 20 },
      2: { max: 50 },
      3: { max: 100 },
      4: { max: 500 }
    };
    
    const maxNum = ranges[config.grade as keyof typeof ranges]?.max || 100;
    let a = Math.floor(Math.random() * maxNum) + 1;
    let b = Math.floor(Math.random() * Math.min(maxNum / 2, 50)) + 1;
    
    if (template.operation === '-') {
      // Stelle sicher, dass a > b
      if (b > a) [a, b] = [b, a];
    }
    
    let questionText = template.template
      .replace(/\{name\}/g, name)
      .replace(/\{pronoun\}/g, pronoun)
      .replace(/\{a\}/g, a.toString())
      .replace(/\{b\}/g, b.toString())
      .replace(/\{item\}/g, item);
    
    // Berechne Antwort
    const answer = template.operation === '+' ? a + b : a - b;
    
    // Generiere Erklärung
    const explanation = StepByStepExplainer.generateExplanation(
      { question: questionText, type: 'math' } as SelectionQuestion,
      answer,
      config.grade
    );
    
    return {