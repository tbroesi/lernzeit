
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Clock, 
  BookOpen, 
  Save, 
  Loader2,
  GraduationCap,
  Languages,
  Globe,
  Atom,
  Leaf,
  FlaskConical,
  Columns3,
  Eye,
  EyeOff
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  grade: number;
}

interface ChildSettings {
  id?: string;
  child_id: string;
  weekday_max_minutes: number;
  weekend_max_minutes: number;
  math_seconds_per_task: number;
  german_seconds_per_task: number;
  english_seconds_per_task: number;
  geography_seconds_per_task: number;
  history_seconds_per_task: number;
  physics_seconds_per_task: number;
  biology_seconds_per_task: number;
  chemistry_seconds_per_task: number;
  latin_seconds_per_task: number;
}

interface VisibleSubjects {
  [key: string]: boolean;
}

interface ChildManagementProps {
  linkedChildren: Child[];
  parentId: string;
  onChildUpdate?: () => void;
}

const subjects = [
  { key: 'math', name: 'Mathematik', icon: BookOpen },
  { key: 'german', name: 'Deutsch', icon: Languages },
  { key: 'english', name: 'Englisch', icon: GraduationCap },
  { key: 'geography', name: 'Geographie', icon: Globe },
  { key: 'history', name: 'Geschichte', icon: Clock },
  { key: 'physics', name: 'Physik', icon: Atom },
  { key: 'biology', name: 'Biologie', icon: Leaf },
  { key: 'chemistry', name: 'Chemie', icon: FlaskConical },
  { key: 'latin', name: 'Latein', icon: Columns3 },
];

export function ChildManagement({ linkedChildren, parentId, onChildUpdate }: ChildManagementProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childSettings, setChildSettings] = useState<ChildSettings | null>(null);
  const [visibleSubjects, setVisibleSubjects] = useState<VisibleSubjects>({});
  const [pendingGrades, setPendingGrades] = useState<{[key: string]: number}>({});
  const [savingGrade, setSavingGrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  // Set first child as selected by default
  useEffect(() => {
    if (linkedChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(linkedChildren[0].id);
    }
  }, [linkedChildren, selectedChildId]);

  // Load settings when child is selected
  useEffect(() => {
    if (selectedChildId) {
      loadChildData();
    }
  }, [selectedChildId]);

  const selectedChild = linkedChildren.find(child => child.id === selectedChildId);

  const loadChildData = async () => {
    if (!selectedChildId || !parentId) return;
    
    try {
      setLoading(true);
      
      // Load child-specific settings
      const { data: settings, error: settingsError } = await supabase
        .from('child_settings')
        .select('*')
        .eq('child_id', selectedChildId)
        .eq('parent_id', parentId)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (settings) {
        setChildSettings(settings);
      } else {
        // Use default settings if none exist
        const defaultSettings: ChildSettings = {
          child_id: selectedChildId,
          weekday_max_minutes: 0,
          weekend_max_minutes: 0,
          math_seconds_per_task: 0,
          german_seconds_per_task: 0,
          english_seconds_per_task: 0,
          geography_seconds_per_task: 0,
          history_seconds_per_task: 0,
          physics_seconds_per_task: 0,
          biology_seconds_per_task: 0,
          chemistry_seconds_per_task: 0,
          latin_seconds_per_task: 0,
        };
        setChildSettings(defaultSettings);
      }

      // Load visible subjects from database
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('child_subject_visibility')
        .select('subject, is_visible')
        .eq('child_id', selectedChildId)
        .eq('parent_id', parentId);

      if (visibilityError && visibilityError.code !== 'PGRST116') {
        console.error('Error loading subject visibility:', visibilityError);
      }

      // Set up visible subjects - default to all visible, then apply saved settings
      const defaultVisible: VisibleSubjects = {};
      subjects.forEach(subject => {
        defaultVisible[subject.key] = true;
      });

      if (visibilityData) {
        visibilityData.forEach(item => {
          defaultVisible[item.subject] = item.is_visible;
        });
      }

      setVisibleSubjects(defaultVisible);

    } catch (error: any) {
      console.error('Error loading child data:', error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveChildSettings = async () => {
    if (!childSettings || !selectedChildId || !parentId) return;

    try {
      setSaving(true);
      
      const upsertData = {
        parent_id: parentId,
        child_id: selectedChildId,
        weekday_max_minutes: childSettings.weekday_max_minutes,
        weekend_max_minutes: childSettings.weekend_max_minutes,
        math_seconds_per_task: childSettings.math_seconds_per_task,
        german_seconds_per_task: childSettings.german_seconds_per_task,
        english_seconds_per_task: childSettings.english_seconds_per_task,
        geography_seconds_per_task: childSettings.geography_seconds_per_task,
        history_seconds_per_task: childSettings.history_seconds_per_task,
        physics_seconds_per_task: childSettings.physics_seconds_per_task,
        biology_seconds_per_task: childSettings.biology_seconds_per_task,
        chemistry_seconds_per_task: childSettings.chemistry_seconds_per_task,
        latin_seconds_per_task: childSettings.latin_seconds_per_task,
        ...(childSettings.id && { id: childSettings.id })
      };

      const { error } = await supabase
        .from('child_settings')
        .upsert(upsertData, {
          onConflict: 'parent_id,child_id'
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich gespeichert",
        description: `Einstellungen für ${selectedChild?.name} wurden aktualisiert.`,
      });

      // Reload data to get the updated settings with id
      await loadChildData();
    } catch (error: any) {
      console.error('Error saving child settings:', error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveGradeChange = async (childId: string, newGrade: number) => {
    console.log(`🎓 Attempting to save grade change for child ${childId} to grade ${newGrade}`);
    
    if (!selectedChild) {
      console.error('❌ No selected child found');
      toast({
        title: "Fehler",
        description: "Kein Kind ausgewählt.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingGrade(childId);
      console.log(`🔄 Starting grade update process...`);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ grade: newGrade })
        .eq('id', childId)
        .select('id, name, grade')
        .maybeSingle();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ No data returned from update');
        throw new Error('Profile not found or update failed');
      }

      console.log('✅ Database update successful:', data);

      // Clear pending grade
      setPendingGrades(prev => {
        const updated = { ...prev };
        delete updated[childId];
        return updated;
      });

      // Show success toast
      toast({
        title: "Klasse aktualisiert",
        description: `${selectedChild.name} ist jetzt in Klasse ${newGrade}.`,
      });

      console.log('🔄 Calling onChildUpdate to refresh data...');
      // Refresh parent data
      if (onChildUpdate) {
        onChildUpdate();
      }

    } catch (error: any) {
      console.error('❌ Error saving grade change:', error);
      toast({
        title: "Fehler beim Speichern",
        description: `Die Klasse für ${selectedChild.name} konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSavingGrade(null);
    }
  };

  const updateChildSetting = (field: keyof ChildSettings, value: number) => {
    if (!childSettings) return;
    
    setChildSettings({
      ...childSettings,
      [field]: value
    });
  };

  const toggleSubjectVisibility = async (subjectKey: string) => {
    const newVisibility = !visibleSubjects[subjectKey];
    
    // Update local state immediately
    setVisibleSubjects(prev => ({
      ...prev,
      [subjectKey]: newVisibility
    }));

    // Save to database
    try {
      const { error } = await supabase
        .from('child_subject_visibility')
        .upsert({
          parent_id: parentId,
          child_id: selectedChildId,
          subject: subjectKey,
          is_visible: newVisibility
        }, {
          onConflict: 'parent_id,child_id,subject'
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving subject visibility:', error);
      // Revert local state if save failed
      setVisibleSubjects(prev => ({
        ...prev,
        [subjectKey]: !newVisibility
      }));
      toast({
        title: "Fehler",
        description: "Fach-Sichtbarkeit konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (linkedChildren.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Noch keine Kinder verknüpft</h3>
          <p className="text-muted-foreground">
            Erstellen Sie einen Einladungscode, um Kinder zu verknüpfen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Selection Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Kind auswählen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {linkedChildren.map((child) => (
              <Button
                key={child.id}
                variant={selectedChildId === child.id ? "default" : "outline"}
                onClick={() => setSelectedChildId(child.id)}
                className="flex items-center gap-2"
              >
                {selectedChildId === child.id ? child.name : child.name.slice(0, 2).toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Child Settings */}
      {selectedChild && (
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Grundlagen</TabsTrigger>
            <TabsTrigger value="time-limits">Zeitlimits</TabsTrigger>
            <TabsTrigger value="subjects">Fächer</TabsTrigger>
            <TabsTrigger value="rewards">Belohnungen</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grundeinstellungen für {selectedChild.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Klassenstufe</Label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={pendingGrades[selectedChild.id]?.toString() || selectedChild.grade.toString()}
                      onValueChange={(value) => {
                        const newGrade = parseInt(value);
                        console.log(`📝 Grade selection changed to: ${newGrade} for child: ${selectedChild.name}`);
                        setPendingGrades(prev => ({
                          ...prev,
                          [selectedChild.id]: newGrade
                        }));
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Klasse {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {pendingGrades[selectedChild.id] && (
                      <Button
                        size="sm"
                        disabled={savingGrade === selectedChild.id}
                        onClick={() => saveGradeChange(selectedChild.id, pendingGrades[selectedChild.id])}
                      >
                        {savingGrade === selectedChild.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichere...
                          </>
                        ) : (
                          'Klasse speichern'
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {pendingGrades[selectedChild.id] && (
                    <div className="text-sm text-muted-foreground">
                      Aktuelle Klasse: {selectedChild.grade} → Neue Klasse: {pendingGrades[selectedChild.id]}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time-limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tägliche Bildschirmzeit-Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : childSettings && (
                  <>
                    <div className="space-y-2">
                      <Label>Wochentage (Montag - Freitag)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="480"
                          value={childSettings.weekday_max_minutes}
                          onChange={(e) => updateChildSetting('weekday_max_minutes', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">Minuten</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Wochenende (Samstag - Sonntag)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="480"
                          value={childSettings.weekend_max_minutes}
                          onChange={(e) => updateChildSetting('weekend_max_minutes', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">Minuten</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sichtbare Fächer</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Bestimmen Sie, welche Fächer {selectedChild.name} lernen kann.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject) => {
                    const IconComponent = subject.icon;
                    const isVisible = visibleSubjects[subject.key];
                    
                    return (
                      <div
                        key={subject.key}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isVisible ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                          <Switch
                            checked={isVisible}
                            onCheckedChange={() => toggleSubjectVisibility(subject.key)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Belohnungen pro richtige Antwort</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Legen Sie fest, wie viele Sekunden {selectedChild.name} pro richtig gelöster Aufgabe bekommt.
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : childSettings && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map((subject) => {
                      const IconComponent = subject.icon;
                      const fieldKey = `${subject.key}_seconds_per_task` as keyof ChildSettings;
                      const value = childSettings[fieldKey] as number;
                      
                      return (
                        <div key={subject.key} className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {subject.name}
                          </Label>
                           <div className="flex items-center gap-2">
                             <Input
                               type="number"
                               min="0"
                               max="60"
                               value={value === 0 ? '' : value}
                               onChange={(e) => {
                                 const inputValue = e.target.value;
                                 if (inputValue === '') {
                                   updateChildSetting(fieldKey, 0);
                                 } else {
                                   updateChildSetting(fieldKey, parseInt(inputValue) || 0);
                                 }
                               }}
                               placeholder="0"
                               className="w-20"
                             />
                             <span className="text-sm text-muted-foreground">Sek/Aufgabe</span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Save Button */}
      {selectedChild && childSettings && (
        <div className="flex justify-end">
          <Button onClick={saveChildSettings} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="w-4 w-4 mr-2 animate-spin" />
                Speichere...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Änderungen speichern
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
