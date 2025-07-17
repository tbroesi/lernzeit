
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Languages, GraduationCap, ArrowLeft } from 'lucide-react';

interface CategorySelectorProps {
  grade: number;
  onCategorySelect: (category: 'math' | 'german' | 'english') => void;
  onBack: () => void;
}

export function CategorySelector({ grade, onCategorySelect, onBack }: CategorySelectorProps) {
  const categories = [
    {
      id: 'math' as const,
      name: 'Mathematik',
      description: 'Rechnen und Zahlen',
      icon: BookOpen,
      color: 'bg-blue-500',
      emoji: '🔢'
    },
    {
      id: 'german' as const,
      name: 'Deutsch',
      description: 'Sprache und Wörter',
      icon: Languages,
      color: 'bg-green-500',
      emoji: '📚'
    },
    {
      id: 'english' as const,
      name: 'Englisch',
      description: 'English words',
      icon: GraduationCap,
      color: 'bg-purple-500',
      emoji: '🇬🇧'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-xl">
                Klasse {grade} - Wähle ein Fach
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => onCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                      {category.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                    <IconComponent className="w-6 h-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">Verdiene Handyzeit!</h3>
            <p className="text-sm text-muted-foreground">
              Löse 5 Aufgaben und verdiene wertvolle Bildschirmzeit
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
