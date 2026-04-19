
-- 1. Add missing company_name column to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS company_name text;

-- 2. Add missing client_email column to proposals (saw it in the builder UI)
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_email text;

-- 3. Add signature columns to proposals for Esign
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_signature_name text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_signed_at timestamptz;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_signed_ip text;

-- 4. Add invoice link to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id);

-- 5. Add created_date alias/trigger to support the existing code that expects it
-- Or better, we fix the code to use created_at. 
-- For now, let's add the column as a generated column if possible, or just a default.
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS created_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS created_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.employee_agreements ADD COLUMN IF NOT EXISTS created_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.offer_letters ADD COLUMN IF NOT EXISTS created_date date DEFAULT CURRENT_DATE;

-- 6. Ensure indexes for sorting
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);
