import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total registered workers count
    const { count: workersCount, error: workersError } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true });

    if (workersError) {
      console.error('Error fetching workers count:', workersError);
      throw workersError;
    }

    // Get total medical records count
    const { count: recordsCount, error: recordsError } = await supabase
      .from('medical_records')
      .select('*', { count: 'exact', head: true });

    if (recordsError) {
      console.error('Error fetching records count:', recordsError);
      throw recordsError;
    }

    // Get total medical documents count
    const { count: documentsCount, error: documentsError } = await supabase
      .from('medical_documents')
      .select('*', { count: 'exact', head: true });

    if (documentsError) {
      console.error('Error fetching documents count:', documentsError);
      throw documentsError;
    }

    // Use Gemini to generate health tracking percentage based on the data
    let healthTrackingPercentage = 95; // Default fallback

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Based on the following health system statistics, calculate a realistic health tracking percentage:
                - Total Registered Workers: ${workersCount || 0}
                - Total Medical Records: ${recordsCount || 0}
                - Total Medical Documents: ${documentsCount || 0}
                
                Calculate a percentage that represents how well the system is tracking health data. 
                Consider factors like:
                - Record-to-worker ratio
                - Document availability
                - Overall system engagement
                
                Return only a number between 80-99 (as an integer), nothing else.`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 1,
              topP: 1,
              maxOutputTokens: 10,
            },
          }),
        }
      );

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const percentage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        if (percentage && !isNaN(parseInt(percentage))) {
          healthTrackingPercentage = parseInt(percentage);
        }
      }
    } catch (geminiError) {
      console.error('Gemini API error for health tracking:', geminiError);
    }

    console.log('Portal stats retrieved successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        stats: {
          totalWorkers: workersCount || 0,
          totalRecords: recordsCount || 0,
          totalDocuments: documentsCount || 0,
          healthTracking: healthTrackingPercentage
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in get-portal-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);