-- Create billing/charges table for recurring payment tracking
CREATE TABLE public.billings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, month, year)
);

-- Enable RLS
ALTER TABLE public.billings ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_billings_user_id ON public.billings(user_id);
CREATE INDEX idx_billings_client_id ON public.billings(client_id);
CREATE INDEX idx_billings_month_year ON public.billings(month, year);
CREATE INDEX idx_billings_is_paid ON public.billings(is_paid);

-- RLS Policies for users
CREATE POLICY "Users can view their own billings"
ON public.billings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billings"
ON public.billings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billings"
ON public.billings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billings"
ON public.billings FOR DELETE
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all billings"
ON public.billings FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all billings"
ON public.billings FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete all billings"
ON public.billings FOR DELETE
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_billings_updated_at
BEFORE UPDATE ON public.billings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();