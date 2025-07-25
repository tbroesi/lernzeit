import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target, Brain, BookOpen, Zap } from 'lucide-react';

interface EnhancedGenerationDisplayProps {
  metadata?: {
    sessionId: string;
    generationTime: number;
    source: 'database' | 'ai' | 'template' | 'hybrid';
    qualityMetrics: {
      difficulty_appropriateness: number;
      curriculum_alignment: number;
      language_quality: number;
      pedagogical_value: number;
      uniqueness: number;
      overall_score: number;
    };
    curriculumAlignment: Array<{
      id: string;
      subject: string;
      grade: number;
      topic: string;
      learningObjectives: string[];
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
    difficultyProgression: boolean;
    topicCoverage: string[];
  };
  qualityReport?: {
    averageQuality: number;
    topicDistribution: Record<string, number>;
    difficultyDistribution: Record<string, number>;
    curriculumCoverage: number;
  };
  enhancedMode?: boolean;
}

export function EnhancedGenerationDisplay({ 
  metadata, 
  qualityReport, 
  enhancedMode 
}: EnhancedGenerationDisplayProps) {
  if (!enhancedMode || !metadata || !qualityReport) {
    return null;
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'database': return <CheckCircle className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'hybrid': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'database': return 'bg-green-500';
      case 'ai': return 'bg-blue-500';
      case 'hybrid': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Enhanced Curriculum Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generation Source & Performance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSourceIcon(metadata.source)}
              <span className="text-sm font-medium capitalize">{metadata.source} Generation</span>
              <Badge 
                variant="secondary" 
                className={`${getSourceColor(metadata.source)} text-white border-0`}
              >
                {metadata.generationTime}ms
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Session: {metadata.sessionId.slice(-8)}
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Overall Quality</span>
                <span className="text-xs font-medium">
                  {Math.round(metadata.qualityMetrics.overall_score * 100)}%
                </span>
              </div>
              <Progress value={metadata.qualityMetrics.overall_score * 100} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Curriculum Align</span>
                <span className="text-xs font-medium">
                  {Math.round(metadata.qualityMetrics.curriculum_alignment * 100)}%
                </span>
              </div>
              <Progress value={metadata.qualityMetrics.curriculum_alignment * 100} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Difficulty Match</span>
                <span className="text-xs font-medium">
                  {Math.round(metadata.qualityMetrics.difficulty_appropriateness * 100)}%
                </span>
              </div>
              <Progress value={metadata.qualityMetrics.difficulty_appropriateness * 100} className="h-2" />
            </div>
          </div>

          {/* Curriculum Standards */}
          {metadata.curriculumAlignment.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Curriculum Standards</h4>
              <div className="flex flex-wrap gap-2">
                {metadata.curriculumAlignment.map((standard, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className={getDifficultyColor(standard.difficulty)}
                  >
                    {standard.topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Topic Coverage */}
          {metadata.topicCoverage.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Topic Coverage</h4>
              <div className="flex flex-wrap gap-1">
                {metadata.topicCoverage.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quality Indicators */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Difficulty Progression: {metadata.difficultyProgression ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Coverage: {Math.round(qualityReport.curriculumCoverage)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}