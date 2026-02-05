-- First, add aadhar_number field as nullable
ALTER TABLE public.workers 
ADD COLUMN aadhar_number character varying(12);

-- Set default aadhar numbers for existing workers (using random 12 digit numbers)
UPDATE public.workers 
SET aadhar_number = LPAD((RANDOM() * 999999999999)::BIGINT::TEXT, 12, '0')
WHERE aadhar_number IS NULL;

-- Now make it NOT NULL
ALTER TABLE public.workers 
ALTER COLUMN aadhar_number SET NOT NULL;

-- Add constraints
ALTER TABLE public.workers 
ADD CONSTRAINT aadhar_number_length CHECK (char_length(aadhar_number) = 12);

ALTER TABLE public.workers 
ADD CONSTRAINT aadhar_number_digits CHECK (aadhar_number ~ '^[0-9]{12}$');

ALTER TABLE public.workers 
ADD CONSTRAINT unique_aadhar_number UNIQUE (aadhar_number);

-- Add appointments table for next appointment feature
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id),
  medical_record_id UUID REFERENCES public.medical_records(id),
  doctor_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  purpose TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments
CREATE POLICY "Allow public read access to appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update appointments" 
ON public.appointments 
FOR UPDATE 
USING (true);

-- Add trigger for appointments updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add new fields to medical_records table for suggested tests and test by worker
ALTER TABLE public.medical_records 
ADD COLUMN suggested_tests TEXT,
ADD COLUMN test_by_worker TEXT;