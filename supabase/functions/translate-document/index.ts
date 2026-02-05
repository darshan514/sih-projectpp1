import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateDocumentRequest {
  documentText: string;
}

const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText }: TranslateDocumentRequest = await req.json();
    console.log('Translating medical document text');

    if (!documentText) {
      return new Response(
        JSON.stringify({ error: 'Document text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Gemini API to translate medical document to simple language
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
              text: `Please translate this medical document text into simple, easy-to-understand language that a common person can comprehend. Use simple words, explain medical terms in plain language, and structure the information clearly with bullet points where appropriate. Make it friendly and reassuring while maintaining accuracy:

${documentText}

Format the response with clear headings and use **bold text** for important points instead of asterisks (*). Make it conversational and easy to read.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const translatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!translatedText) {
      throw new Error('No translation received from Gemini API');
    }

    console.log('Document translation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        translatedText: translatedText,
        message: 'Document translated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in translate-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);