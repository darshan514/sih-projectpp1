-- Create enum for doctor type
CREATE TYPE public.doctor_type AS ENUM ('government', 'private');

-- Create doctors table for hospital authentication
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile_number VARCHAR(15),
  hospital_name TEXT NOT NULL,
  aadhar_number VARCHAR(12),
  nmr_id VARCHAR(50),
  unique_doctor_id VARCHAR(50) UNIQUE NOT NULL,
  doctor_type public.doctor_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Allow public registration and login
CREATE POLICY "Allow public insert for doctor registration"
  ON public.doctors
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to doctors"
  ON public.doctors
  FOR SELECT
  USING (true);

-- Add new fields to medical_records table
ALTER TABLE public.medical_records
ADD COLUMN next_appointment_date DATE,
ADD COLUMN hospital_name TEXT,
ADD COLUMN doctor_type TEXT;

-- Add comment
COMMENT ON COLUMN public.medical_records.next_appointment_date IS 'Next appointment date suggested by doctor';
COMMENT ON COLUMN public.medical_records.hospital_name IS 'Hospital name of the doctor who added this record';
COMMENT ON COLUMN public.medical_records.doctor_type IS 'Type of doctor (Government/Private)';

-- Create trigger for updating doctors updated_at
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();