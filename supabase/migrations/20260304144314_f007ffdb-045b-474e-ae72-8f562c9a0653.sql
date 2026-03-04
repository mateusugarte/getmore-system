
-- ============================================================
-- FIX 1: Input validation constraints on core tables
-- ============================================================

-- leads
ALTER TABLE public.leads ADD CONSTRAINT chk_leads_name_len CHECK (char_length(name) <= 255);
ALTER TABLE public.leads ADD CONSTRAINT chk_leads_email_len CHECK (email IS NULL OR char_length(email) <= 255);
ALTER TABLE public.leads ADD CONSTRAINT chk_leads_phone_len CHECK (phone IS NULL OR char_length(phone) <= 50);
ALTER TABLE public.leads ADD CONSTRAINT chk_leads_notes_len CHECK (notes IS NULL OR char_length(notes) <= 5000);
ALTER TABLE public.leads ADD CONSTRAINT chk_leads_tags_len CHECK (tags IS NULL OR array_length(tags, 1) <= 20);

-- clients
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_name_len CHECK (char_length(name) <= 255);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_email_len CHECK (email IS NULL OR char_length(email) <= 255);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_phone_len CHECK (phone IS NULL OR char_length(phone) <= 50);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_notes_len CHECK (notes IS NULL OR char_length(notes) <= 5000);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_company_len CHECK (company IS NULL OR char_length(company) <= 255);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_recurrence_date CHECK (recurrence_date IS NULL OR recurrence_date BETWEEN 1 AND 31);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_sale_value_positive CHECK (sale_value IS NULL OR sale_value >= 0);
ALTER TABLE public.clients ADD CONSTRAINT chk_clients_recurrence_value_positive CHECK (recurrence_value IS NULL OR recurrence_value >= 0);

-- billings
ALTER TABLE public.billings ADD CONSTRAINT chk_billings_amount_positive CHECK (amount >= 0);
ALTER TABLE public.billings ADD CONSTRAINT chk_billings_notes_len CHECK (notes IS NULL OR char_length(notes) <= 5000);

-- meetings
ALTER TABLE public.meetings ADD CONSTRAINT chk_meetings_company_len CHECK (char_length(company_name) <= 255);
ALTER TABLE public.meetings ADD CONSTRAINT chk_meetings_whatsapp_len CHECK (whatsapp IS NULL OR char_length(whatsapp) <= 50);
ALTER TABLE public.meetings ADD CONSTRAINT chk_meetings_notes_len CHECK (notes IS NULL OR char_length(notes) <= 5000);
ALTER TABLE public.meetings ADD CONSTRAINT chk_meetings_tags_len CHECK (tags IS NULL OR array_length(tags, 1) <= 20);

-- profiles
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_name_len CHECK (full_name IS NULL OR char_length(full_name) <= 255);
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_email_len CHECK (email IS NULL OR char_length(email) <= 255);
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_phone_len CHECK (phone IS NULL OR char_length(phone) <= 50);

-- goals
ALTER TABLE public.goals ADD CONSTRAINT chk_goals_title_len CHECK (char_length(title) <= 255);
ALTER TABLE public.goals ADD CONSTRAINT chk_goals_target_positive CHECK (target_value >= 0);
ALTER TABLE public.goals ADD CONSTRAINT chk_goals_current_positive CHECK (current_value IS NULL OR current_value >= 0);

-- ============================================================
-- FIX 2: Documents table - add user_id and scope RLS
-- ============================================================

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
