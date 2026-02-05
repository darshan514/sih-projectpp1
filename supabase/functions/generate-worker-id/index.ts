import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workerData } = await req.json();
    console.log('Received worker data:', { ...workerData, aadhar_number: workerData.aadhar_number ? 'XXXX-XXXX-' + workerData.aadhar_number.slice(-4) : 'N/A' });

    // Validate required fields including Aadhar number
    if (!workerData.name || !workerData.mobile_number || !workerData.email || !workerData.address || !workerData.date_of_birth || !workerData.aadhar_number) {
      return new Response(
        JSON.stringify({ error: 'All worker data fields including Aadhar number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Aadhar number format (exactly 12 digits)
    if (!/^\d{12}$/.test(workerData.aadhar_number)) {
      return new Response(
        JSON.stringify({ error: 'Aadhar number must be exactly 12 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique health ID using first 2 letters of name + last 4 digits of Aadhar
    const firstName = workerData.name.trim().toUpperCase();
    const firstTwoLetters = firstName.replace(/[^A-Z]/g, '').substring(0, 2);
    const lastFourDigits = workerData.aadhar_number.slice(-4);
    let uniqueId = firstTwoLetters + lastFourDigits;

    // Ensure we have at least 2 letters, fallback if name has no letters
    if (firstTwoLetters.length < 2) {
      uniqueId = 'WK' + lastFourDigits; // Use 'WK' as fallback prefix
    }

    console.log('Generated unique health ID:', uniqueId);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if Aadhar number already exists
    const { data: existingAadhar } = await supabase
      .from('workers')
      .select('id')
      .eq('aadhar_number', workerData.aadhar_number)
      .single();

    if (existingAadhar) {
      return new Response(
        JSON.stringify({ error: 'Worker with this Aadhar number is already registered' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if unique_worker_id already exists (unlikely but possible)
    const { data: existingId } = await supabase
      .from('workers')
      .select('id')
      .eq('unique_worker_id', uniqueId)
      .single();

    if (existingId) {
      return new Response(
        JSON.stringify({ error: 'Generated health ID already exists. Please contact support.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert worker data
    const { data: worker, error: insertError } = await supabase
      .from('workers')
      .insert({
        unique_worker_id: uniqueId,
        name: workerData.name,
        mobile_number: workerData.mobile_number,
        email: workerData.email,
        address: workerData.address,
        date_of_birth: workerData.date_of_birth,
        aadhar_number: workerData.aadhar_number
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log('Worker registered successfully:', worker);

    return new Response(
      JSON.stringify({ 
        success: true, 
        worker: worker,
        uniqueId: uniqueId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-worker-id function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});