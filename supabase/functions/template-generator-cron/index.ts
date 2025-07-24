import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
const SUBJECTS = ['Mathematik', 'Deutsch', 'Englisch', 'Geographie', 'Geschichte', 'Physik', 'Biologie', 'Chemie', 'Latein'];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const TEMPLATES_PER_SUBJECT_GRADE = 50;
const MAX_TEMPLATES_TO_KEEP = 75; // Keep more than needed for rotation and diversity

interface TemplateGenerationRequest {
  category: string;
  grade: number;
  count: number;
  excludeQuestions?: string[];
  sessionId?: string;
  requestId?: string;
  gradeRequirement?: string;
  qualityThreshold?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const requestId = `cron_${Date.now()}_${Math.random()}`;
  
  try {
    console.log(`🔄 [${requestId}] Starting template generation cron job`);
    
    const results = {
      generated: 0,
      errors: 0,
      subjects: [] as string[],
      duration: 0
    };
    
    const startTime = Date.now();

    // Process each subject and grade combination
    for (const subject of SUBJECTS) {
      console.log(`📚 [${requestId}] Processing subject: ${subject}`);
      
      for (const grade of GRADES) {
        try {
          // Check current template count for this subject/grade
          const { data: existingTemplates, error: countError } = await supabase
            .from('generated_templates')
            .select('id')
            .eq('category', subject)
            .eq('grade', grade)
            .eq('is_active', true);

          if (countError) {
            console.error(`❌ [${requestId}] Error counting templates for ${subject} Grade ${grade}:`, countError);
            results.errors++;
            continue;
          }

          const existingCount = existingTemplates?.length || 0;
          
          // Skip if we already have enough templates
          if (existingCount >= TEMPLATES_PER_SUBJECT_GRADE) {
            console.log(`✅ [${requestId}] ${subject} Grade ${grade}: ${existingCount} templates already exist, skipping`);
            continue;
          }

          const neededTemplates = TEMPLATES_PER_SUBJECT_GRADE - existingCount;
          console.log(`🎯 [${requestId}] ${subject} Grade ${grade}: Need ${neededTemplates} templates (${existingCount} existing)`);

          // Generate new templates by calling the existing generate-problems function
          const generateRequest: TemplateGenerationRequest = {
            category: subject,
            grade: grade,
            count: neededTemplates,
            sessionId: `cron_${requestId}`,
            requestId: `${requestId}_${subject}_${grade}`,
            gradeRequirement: `grade_${grade}_appropriate`,
            qualityThreshold: 0.7
          };

          const response = await supabase.functions.invoke('generate-problems', {
            body: generateRequest
          });

          if (response.error) {
            console.error(`❌ [${requestId}] Error generating templates for ${subject} Grade ${grade}:`, response.error);
            results.errors++;
            continue;
          }

          const generatedCount = response.data?.problems?.length || 0;
          console.log(`✅ [${requestId}] Generated ${generatedCount} templates for ${subject} Grade ${grade}`);
          
          results.generated += generatedCount;
          results.subjects.push(`${subject}-${grade}`);

          // Add diversity factor - don't generate too many similar templates in one batch
          if (generatedCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for diversity
          }
          
          // Clean up old templates if we have too many
          if (existingCount + generatedCount > MAX_TEMPLATES_TO_KEEP) {
            const { error: deleteError } = await supabase
              .from('generated_templates')
              .delete()
              .eq('category', subject)
              .eq('grade', grade)
              .order('created_at', { ascending: true })
              .limit((existingCount + generatedCount) - MAX_TEMPLATES_TO_KEEP);

            if (deleteError) {
              console.error(`⚠️ [${requestId}] Error cleaning up old templates for ${subject} Grade ${grade}:`, deleteError);
            } else {
              console.log(`🧹 [${requestId}] Cleaned up old templates for ${subject} Grade ${grade}`);
            }
          }

          // Add small delay between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ [${requestId}] Error processing ${subject} Grade ${grade}:`, error);
          results.errors++;
        }
      }
    }

    results.duration = Date.now() - startTime;

    console.log(`🏁 [${requestId}] Cron job completed:`, {
      generated: results.generated,
      errors: results.errors,
      subjects: results.subjects.length,
      duration: `${results.duration}ms`
    });

    return new Response(JSON.stringify({
      success: true,
      requestId,
      results,
      message: `Generated ${results.generated} templates across ${results.subjects.length} subject-grade combinations`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`💥 [${requestId}] Cron job failed:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      requestId,
      error: error.message,
      message: 'Template generation cron job failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});