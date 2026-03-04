
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  whatsapp TEXT,
  notes TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada',
  had_sale BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON public.meetings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all meetings" ON public.meetings FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all meetings" ON public.meetings FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete all meetings" ON public.meetings FOR DELETE USING (is_admin(auth.uid()));
