
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Languages, GraduationCap, ArrowLeft, Globe, Clock, Atom, Leaf, FlaskConical, Columns3 } from 'lucide-react';

interface CategorySelectorProps {
  grade: number;
  onCategorySelect: (category: 'math' | 'german' | 'english' | 'geography' | 'history' | 'physics' | 'biology' | 'chemistry' | 'latin') => void;
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
    },
    {
      id: 'geography' as const,
      name: 'Geographie',
      description: 'Länder und Kontinente',
      icon: Globe,
      color: 'bg-teal-500',
      emoji: '🌍'
    },
    {
      id: 'history' as const,
      name: 'Geschichte',
      description: 'Vergangene Ereignisse',
      icon: Clock,
      color: 'bg-amber-500',
      emoji: '🏛️'
    },
    {
      id: 'physics' as const,
      name: 'Physik',
      description: 'Naturgesetze',
      icon: Atom,
      color: 'bg-cyan-500',
      emoji: '⚡'
    },
    {
      id: 'biology' as const,
      name: 'Biologie',
      description: 'Lebewesen',
      icon: Leaf,
      color: 'bg-emerald-500',
      emoji: '🌱'
    },
    {
      id: 'chemistry' as const,
      name: 'Chemie',
      description: 'Stoffe und Reaktionen',
      icon: FlaskConical,
      color: 'bg-orange-500',
      emoji: '🧪'
    },
    {
      id: 'latin' as const,
      name: 'Latein',
      description: 'Lateinische Sprache',
      icon: Columns3,
      color: 'bg-rose-500',
      emoji: '🏺'
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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => onCategorySelect(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center text-white text-xl`}>
                      {category.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
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
