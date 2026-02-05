-- Add contract_end_date to clients table to track when contract ends
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS contract_end_date date DEFAULT NULL;

-- Add status field to billings for cancelled/churn tracking
-- Status: pending, paid, cancelled, overdue
ALTER TABLE public.billings 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'overdue'));

-- Add cancelled_at timestamp for churn tracking
ALTER TABLE public.billings 
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone DEFAULT NULL;