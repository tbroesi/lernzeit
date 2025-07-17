import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Camera, User, Save } from 'lucide-react';

interface ProfileEditProps {
  user: any;
  profile: any;
  onBack: () => void;
  onUpdate: (updatedProfile: any) => void;
}

export function ProfileEdit({ user, profile, onBack, onUpdate }: ProfileEditProps) {
  const [name, setName] = useState(profile?.name || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Fehler",
          description: "Bitte wähle eine Bilddatei aus.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fehler", 
          description: "Das Bild ist zu groß. Maximale Größe: 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath && oldPath !== fileName) {
          await supabase.storage.from('profile-pictures').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new file
      const { error: uploadError, data } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onUpdate({ ...profile, avatar_url: publicUrl });
      
      toast({
        title: "Erfolgreich",
        description: "Profilbild wurde aktualisiert!",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Fehler",
        description: "Das Profilbild konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (error) throw error;

      onUpdate({ ...profile, name: name.trim() });
      
      toast({
        title: "Erfolgreich",
        description: "Profil wurde gespeichert!",
      });

      onBack();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Fehler",
        description: "Das Profil konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
              <CardTitle>Profil bearbeiten</CardTitle>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Picture */}
        <Card className="shadow-card">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                
                <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </label>
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                {uploading ? 'Lädt hoch...' : 'Klicke auf das Kamera-Symbol um dein Profilbild zu ändern'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Name Edit */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Dein Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Wie sollen dich alle nennen?"
                  className="mt-2"
                />
              </div>
              
              <Button 
                onClick={handleSave}
                disabled={saving || !name.trim() || name.trim() === profile?.name}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Speichert...' : 'Speichern'}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}