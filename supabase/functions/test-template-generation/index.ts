import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test simple math problem generation for grade 4
    const testRequest = {
      category: 'math',
      grade: 4,
      count: 3,
      excludeQuestions: [],
      sessionId: 'test-session-' + Date.now()
    };

    console.log('🧪 Testing template generation with request:', testRequest);

    // Call the generate-problems function
    const { data, error } = await supabase.functions.invoke('generate-problems', {
      body: testRequest
    });

    if (error) {
      console.error('❌ Error calling generate-problems:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Generate-problems response:', data);

    // Check if we have valid problems
    if (!data || !data.problems || data.problems.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No problems generated',
        response: data
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      problemsGenerated: data.problems.length,
      problems: data.problems,
      message: 'Template generation test successful'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});