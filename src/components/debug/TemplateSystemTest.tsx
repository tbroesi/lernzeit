
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateValidator, ComprehensiveValidationResult } from '@/utils/templates/templateValidator';
import { QuestionGenerator } from '@/utils/templates/questionGenerator';
import { getTemplatesForCategory, questionTemplates } from '@/utils/questionTemplates';
import { Badge } from '@/components/ui/badge';

export function TemplateSystemTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{
    validationResults: ComprehensiveValidationResult;
    generationTests: any[];
    overallHealth: number;
    summary: string;
  } | null>(null);

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    console.log('🧪 Starting comprehensive template system test...');

    try {
      // Test 1: Validate all templates
      console.log('📋 Testing template validation...');
      const validationResults = TemplateValidator.runComprehensiveValidation(questionTemplates);
      
      // Test 2: Test question generation for each category/grade combination
      console.log('🎯 Testing question generation...');
      const generationTests = [];
      const categories = ['Mathematik', 'Deutsch'];
      const grades = [1, 2, 3, 4];
      
      for (const category of categories) {
        for (const grade of grades) {
          const templates = getTemplatesForCategory(category, grade);
          if (templates.length > 0) {
            console.log(`Testing ${category} Grade ${grade} (${templates.length} templates)`);
            
            const testResult = {
              category,
              grade,
              templateCount: templates.length,
              generatedQuestions: 0,
              errors: [] as string[]
            };

            // Try to generate 3 questions for this category/grade
            const usedCombinations = new Set<string>();
            for (let i = 0; i < Math.min(3, templates.length * 2); i++) {
              try {
                const question = QuestionGenerator.generateQuestionFromTemplate(
                  templates[Math.floor(Math.random() * templates.length)],
                  usedCombinations
                );
                if (question) {
                  testResult.generatedQuestions++;
                  console.log(`✅ Generated: ${question.question.substring(0, 40)}... = ${question.answer}`);
                } else {
                  testResult.errors.push(`Failed to generate question ${i + 1}`);
                }
              } catch (error) {
                testResult.errors.push(`Generation error: ${error instanceof Error ? error.message : 'Unknown'}`);
              }
            }
            
            generationTests.push(testResult);
          }
        }
      }

      // Test 3: Check specific multiplication bug fix
      console.log('🔍 Testing multiplication bug fix...');
      const mathTemplates = getTemplatesForCategory('Mathematik', 2);
      const multiplicationTemplates = mathTemplates.filter(t => t.id.includes('multiplication'));
      
      for (const template of multiplicationTemplates) {
        console.log(`Testing template: ${template.id}`);
        const usedCombinations = new Set<string>();
        
        for (let i = 0; i < 5; i++) {
          const question = QuestionGenerator.generateQuestionFromTemplate(template, usedCombinations);
          if (question) {
            console.log(`✅ ${template.id}: ${question.question} = ${question.answer}`);
          } else {
            console.log(`❌ Failed to generate from ${template.id}`);
          }
        }
      }

      const summary = `
Validation Summary:
- Total Templates: ${questionTemplates.length}
- Valid Templates: ${validationResults.validTemplates}
- Overall Health: ${Math.round(validationResults.overallHealth * 100)}%
- Critical Issues: ${validationResults.criticalIssues.length}
- Total Issues: ${validationResults.totalIssues}

Generation Summary:
- Categories Tested: ${generationTests.length}
- Successful Generations: ${generationTests.reduce((sum, t) => sum + t.generatedQuestions, 0)}
- Total Errors: ${generationTests.reduce((sum, t) => sum + t.errors.length, 0)}
      `.trim();

      setTestResults({
        validationResults,
        generationTests,
        overallHealth: validationResults.overallHealth,
        summary
      });

      console.log('🎉 Comprehensive test completed!');
      console.log(summary);

    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Template System Test & Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runComprehensiveTest}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? 'Running Tests...' : 'Run Comprehensive Test'}
          </Button>
          {testResults && (
            <Badge variant={testResults.overallHealth >= 0.8 ? 'default' : 'destructive'}>
              Health: {Math.round(testResults.overallHealth * 100)}%
            </Badge>
          )}
        </div>

        {testResults && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                  {testResults.summary}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testResults.generationTests.map((test, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-semibold">
                        {test.category} - Grade {test.grade}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Templates: {test.templateCount} | Generated: {test.generatedQuestions} | Errors: {test.errors.length}
                      </div>
                      {test.errors.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {test.errors.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Generation Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {QuestionGenerator.getAuditLog().slice(-10).map((entry, index) => (
                    <div key={index} className="text-xs border rounded p-2">
                      <div className="font-mono">
                        {entry.success ? '✅' : '❌'} {entry.templateId}
                      </div>
                      <div className="text-muted-foreground">
                        Answer: {entry.finalAnswer} | {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                      {entry.errors.length > 0 && (
                        <div className="text-red-600">
                          {entry.errors.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
