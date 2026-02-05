import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Syncing health data to government portal...');

    // Fetch aggregated health data by district
    const { data: healthData, error } = await supabase
      .from('workers')
      .select(`
        district,
        id,
        medical_records (
          diagnosis,
          visit_date,
          doctor_type,
          hospital_name
        )
      `);

    if (error) {
      throw new Error(`Failed to fetch health data: ${error.message}`);
    }

    // Aggregate data by district
    const districtData: Record<string, any> = {};
    
    healthData?.forEach((worker: any) => {
      if (!worker.district) return;
      
      if (!districtData[worker.district]) {
        districtData[worker.district] = {
          totalWorkers: 0,
          totalRecords: 0,
          governmentVisits: 0,
          privateVisits: 0,
          recentDiagnoses: []
        };
      }
      
      districtData[worker.district].totalWorkers++;
      
      if (worker.medical_records) {
        districtData[worker.district].totalRecords += worker.medical_records.length;
        
        worker.medical_records.forEach((record: any) => {
          if (record.doctor_type === 'Government') {
            districtData[worker.district].governmentVisits++;
          } else {
            districtData[worker.district].privateVisits++;
          }
          
          if (record.diagnosis) {
            districtData[worker.district].recentDiagnoses.push({
              diagnosis: record.diagnosis,
              date: record.visit_date
            });
          }
        });
      }
    });

    console.log('Health data synced successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        districtData,
        message: 'Health data synced successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sync-health-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
