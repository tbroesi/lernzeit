
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';

interface QuestionFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedbackType: string, details?: string) => void;
}

export function QuestionFeedbackDialog({ isOpen, onClose, onSubmit }: QuestionFeedbackDialogProps) {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackType) {
      onSubmit(feedbackType, details.trim() || undefined);
      setFeedbackType('');
      setDetails('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Problem mit der Frage melden</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Was ist das Problem?</Label>
              <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="incorrect" id="incorrect" />
                  <Label htmlFor="incorrect">Falsche Antwort</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_easy" id="too_easy" />
                  <Label htmlFor="too_easy">Zu einfach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_hard" id="too_hard" />
                  <Label htmlFor="too_hard">Zu schwer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confusing" id="confusing" />
                  <Label htmlFor="confusing">Verwirrend</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duplicate" id="duplicate" />
                  <Label htmlFor="duplicate">Bereits gesehen</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="details" className="text-sm font-medium">
                Details (optional)
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Beschreibe das Problem genauer..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Abbrechen
              </Button>
              <Button type="submit" disabled={!feedbackType} className="flex-1">
                Melden
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
