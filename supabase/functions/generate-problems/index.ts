
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateConfig } from "./src/config.ts";
import { logger } from "./src/utils/logger.ts";
import { TemplateGenerator } from "./src/jobs/template-generator.ts";
import { validateProblemRequest } from "./src/utils/validator.ts";
import type { ProblemRequest } from "./src/types.ts";

// Validate configuration on startup
validateConfig();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Generate unique request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random()}`;
  
  try {
    // Parse and validate request
    const requestData = await req.json();
    const problemRequest: ProblemRequest = validateProblemRequest(requestData);
    
    // Initialize template generator with request ID
    const templateGenerator = new TemplateGenerator(requestId);
    
    // Generate problems using the new modular system
    const result = await templateGenerator.generateProblems(problemRequest);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logger.error('Request failed', { 
      requestId, 
      error: error.message,
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      problems: [] // Fallback empty array
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
    
