-- Create storage buckets for medical documents
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-documents', 'medical-documents', false);

-- Create workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_worker_id VARCHAR(6) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescription TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_documents table for file uploads
CREATE TABLE public.medical_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for worker registration)
CREATE POLICY "Allow public read access to workers" 
ON public.workers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert for worker registration" 
ON public.workers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to medical records" 
ON public.medical_records 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update medical records" 
ON public.medical_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access to medical documents" 
ON public.medical_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert medical documents" 
ON public.medical_documents 
FOR INSERT 
WITH CHECK (true);

-- Create storage policies for medical documents
CREATE POLICY "Allow public read access to medical documents bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-documents');

CREATE POLICY "Allow upload medical documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-documents');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();