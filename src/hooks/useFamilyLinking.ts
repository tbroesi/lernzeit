import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface InvitationCode {
  id: string;
  code: string;
  child_id: string | null;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

interface ChildProfile {
  id: string;
  name: string;
  grade: number;
}

export function useFamilyLinking() {
  const [loading, setLoading] = useState(false);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [linkedChildren, setLinkedChildren] = useState<ChildProfile[]>([]);
  const { toast } = useToast();

  // Load invitation codes and linked children
  const loadFamilyData = async (userId: string) => {
    try {
      // Load invitation codes
      const { data: codes, error: codesError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('parent_id', userId)
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;
      setInvitationCodes(codes || []);

      // Load linked children
      const { data: relationships, error: relationshipsError } = await supabase
        .from('parent_child_relationships')
        .select(`
          child_id,
          profiles!parent_child_relationships_child_id_fkey (
            id,
            name,
            grade
          )
        `)
        .eq('parent_id', userId);

      if (relationshipsError) throw relationshipsError;
      
      const children = relationships?.map(rel => rel.profiles).filter(Boolean) || [];
      setLinkedChildren(children as ChildProfile[]);

    } catch (error: any) {
      console.error('Error loading family data:', error);
    }
  };

  // Generate new invitation code
  const generateInvitationCode = async (parentId: string): Promise<string | null> => {
    setLoading(true);
    try {
      // Call database function to generate unique code
      const { data, error } = await supabase.rpc('generate_invitation_code');
      
      if (error) throw error;
      
      const newCode = data;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

      // Insert the code into the database
      const { error: insertError } = await supabase
        .from('invitation_codes')
        .insert({
          code: newCode,
          parent_id: parentId,
          expires_at: expiresAt.toISOString()
        });

      if (insertError) throw insertError;

      toast({
        title: "Einladungscode erstellt!",
        description: `Code: ${newCode} (30 Min gültig)`,
      });

      await loadFamilyData(parentId);
      return newCode;

    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Code konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Use invitation code (for children) - NEUE EINFACHE LOGIK
  const useInvitationCode = async (code: string, childId: string): Promise<boolean> => {
    setLoading(true);
    console.log('🔗 Starting invitation code claim:', { code, childId });
    
    try {
      // SCHRITT 1: Einfach den Code direkt beanspruchen (eine einzige Operation)
      console.log('⚡ Claiming code directly...');
      const { data: updatedCode, error: claimError } = await supabase
        .from('invitation_codes')
        .update({
          child_id: childId,
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('code', code)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .select('*')
        .single();

      console.log('📝 Claim result:', { updatedCode, claimError });

      if (claimError) {
        console.log('❌ Claim failed:', claimError.message);
        toast({
          title: "Ungültiger Code",
          description: "Der Code ist nicht gültig, bereits verwendet oder abgelaufen.",
          variant: "destructive",
        });
        return false;
      }

      if (!updatedCode) {
        console.log('❌ No code updated - probably invalid');
        toast({
          title: "Ungültiger Code",
          description: "Der Code wurde nicht gefunden oder ist nicht mehr verfügbar.",
          variant: "destructive",
        });
        return false;
      }

      // SCHRITT 2: Parent-Child Beziehung erstellen
      console.log('🔗 Creating parent-child relationship...');
      const { error: relationshipError } = await supabase
        .from('parent_child_relationships')
        .insert({
          parent_id: updatedCode.parent_id,
          child_id: childId
        });

      if (relationshipError) {
        console.error('❌ Relationship creation failed:', relationshipError);
        
        // Rollback: Code wieder freigeben
        await supabase
          .from('invitation_codes')
          .update({
            child_id: null,
            is_used: false,
            used_at: null
          })
          .eq('id', updatedCode.id);

        throw relationshipError;
      }

      console.log('🎉 Successfully linked!');
      toast({
        title: "Erfolgreich verknüpft!",
        description: "Du bist jetzt mit einem Elternteil verbunden.",
      });

      return true;

    } catch (error: any) {
      console.error('❌ Full error details:', error);
      toast({
        title: "Fehler",
        description: `Verknüpfung fehlgeschlagen: ${error?.message || 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove child link
  const removeChildLink = async (parentId: string, childId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('parent_child_relationships')
        .delete()
        .eq('parent_id', parentId)
        .eq('child_id', childId);

      if (error) throw error;

      toast({
        title: "Verknüpfung entfernt",
        description: "Die Verbindung wurde getrennt.",
      });

      await loadFamilyData(parentId);
      return true;

    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Verknüpfung konnte nicht entfernt werden.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clean up expired codes
  const cleanupExpiredCodes = async () => {
    try {
      await supabase.rpc('cleanup_expired_codes');
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  };

  useEffect(() => {
    // Cleanup expired codes on mount
    cleanupExpiredCodes();
  }, []);

  return {
    loading,
    invitationCodes,
    linkedChildren,
    loadFamilyData,
    generateInvitationCode,
    useInvitationCode,
    removeChildLink,
  };
}