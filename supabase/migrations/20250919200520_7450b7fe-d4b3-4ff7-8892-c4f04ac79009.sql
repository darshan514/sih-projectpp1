-- Create table to store OTP codes temporarily
CREATE TABLE public.worker_otp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number varchar NOT NULL,
  otp_code varchar(6) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  is_used boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.worker_otp ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP table (temporary storage, so more permissive)
CREATE POLICY "Allow insert OTP" 
ON public.worker_otp 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow select OTP for verification" 
ON public.worker_otp 
FOR SELECT 
USING (true);

CREATE POLICY "Allow update OTP for marking as used" 
ON public.worker_otp 
FOR UPDATE 
USING (true);

-- Create function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.worker_otp 
  WHERE expires_at < now() OR is_used = true;
END;
$$;