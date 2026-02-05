import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  mobileNumber: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobileNumber }: SendOTPRequest = await req.json();
    console.log('Received OTP request for mobile:', mobileNumber);

    if (!mobileNumber) {
      return new Response(
        JSON.stringify({ error: 'Mobile number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the mobile number is registered
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('id, name')
      .eq('mobile_number', mobileNumber)
      .single();

    if (workerError || !worker) {
      console.log('Mobile number not registered:', mobileNumber);
      return new Response(
        JSON.stringify({ error: 'Number not registered. Please register first to use OTP login.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    // Clean up any existing OTPs for this mobile number
    await supabase
      .from('worker_otp')
      .delete()
      .eq('mobile_number', mobileNumber);

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('worker_otp')
      .insert({
        mobile_number: mobileNumber,
        otp_code: otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Send SMS with OTP
    // For now, we'll just log it (in production, integrate with SMS service like Twilio)
    console.log(`SMS: Your SwasthyaID OTP is: ${otp}. Valid for 10 minutes.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // In development, return OTP for testing (remove in production)
        otp: otp 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);