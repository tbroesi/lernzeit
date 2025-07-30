/**
 * Erweiterte Datenbank-Typdefinitionen
 */

// Ergänzen Sie diese zu Ihren bestehenden Database Types
export interface Database {
  public: {
    Tables: {
      // ... andere Tabellen ...
      
      question_history: {
        Row: {
          id: string;
          user_id: string;
          question_fingerprint: string;
          question_text: string | null;
          grade: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_fingerprint: string;
          question_text?: string | null;
          grade: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_fingerprint?: string;
          question_text?: string | null;
          grade?: number;
          created_at?: string;
        };
      };
      
      generated_templates: {
        Row: {
          id: string;
          template: string;
          category: string;
          grade: number;
          parameters: string | null;
          question_type: string;
          is_active: boolean;
          quality_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template: string;
          category: string;
          grade: number;
          parameters?: string | null;
          question_type?: string;
          is_active?: boolean;
          quality_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template?: string;
          category?: string;
          grade?: number;
          parameters?: string | null;
          question_type?: string;
          is_active?: boolean;
          quality_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}