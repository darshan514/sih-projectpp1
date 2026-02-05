import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessDocumentRequest {
  filePath: string;
}

const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath }: ProcessDocumentRequest = await req.json();
    console.log('Processing document with OCR:', filePath);

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mistralApiKey) {
      return new Response(
        JSON.stringify({ error: 'Mistral API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download the document from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('medical-documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use Mistral Pixtral for OCR and summarization
    const mistralResponse = await fetch(
      'https://api.mistral.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'pixtral-12b-2409',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'You are analyzing a medical document. Extract ALL text using OCR, then provide:\n\n1. **Complete Text Extraction**: All readable text from the document\n2. **Summary** (2-3 sentences): Brief overview of the document\n3. **Key Medical Findings**: Important diagnoses, test results, or observations (bullet points)\n4. **Prescribed Treatments**: Medications, procedures, or recommendations (bullet points)\n\nFormat your response clearly with headings and bullet points for easy reading.'
                },
                {
                  type: 'image_url',
                  image_url: `data:application/pdf;base64,${base64Data}`
                }
              ]
            }
          ],
          max_tokens: 3000,
        }),
      }
    );

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text();
      console.error('Mistral API error:', mistralResponse.status, errorText);
      throw new Error(`Mistral API error: ${mistralResponse.status}`);
    }

    const mistralData = await mistralResponse.json();
    const extractedContent = mistralData.choices?.[0]?.message?.content;

    if (!extractedContent) {
      throw new Error('No content could be extracted from the document');
    }

    console.log('Document processed successfully with OCR');

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: extractedContent,
        summary: extractedContent,
        message: 'Document processed successfully with OCR'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-document-ocr function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
