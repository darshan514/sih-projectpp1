import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  mobileNumber: string;
  otp: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobileNumber, otp }: VerifyOTPRequest = await req.json();
    console.log('Verifying OTP for mobile:', mobileNumber);

    if (!mobileNumber || !otp) {
      return new Response(
        JSON.stringify({ error: 'Mobile number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check OTP validity
    const { data: otpRecord, error: otpError } = await supabase
      .from('worker_otp')
      .select('*')
      .eq('mobile_number', mobileNumber)
      .eq('otp_code', otp)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      console.log('Invalid or expired OTP for mobile:', mobileNumber);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as used
    await supabase
      .from('worker_otp')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

    // Get worker details
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('mobile_number', mobileNumber)
      .single();

    if (workerError || !worker) {
      console.error('Worker not found:', workerError);
      return new Response(
        JSON.stringify({ error: 'Worker not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up used and expired OTPs
    await supabase.rpc('cleanup_expired_otp');

    console.log('OTP verified successfully for worker:', worker.name);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        worker: worker,
        message: 'OTP verified successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);