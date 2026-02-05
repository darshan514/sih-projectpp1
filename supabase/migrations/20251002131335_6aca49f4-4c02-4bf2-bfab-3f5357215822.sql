-- Add district field to workers table
ALTER TABLE public.workers
ADD COLUMN district TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.workers.district IS 'District where the worker is registered (for heat map visualization)';

-- Create index for faster district-based queries
CREATE INDEX idx_workers_district ON public.workers(district);