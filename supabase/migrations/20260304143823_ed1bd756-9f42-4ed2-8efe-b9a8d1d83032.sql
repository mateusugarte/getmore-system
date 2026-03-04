
-- ============================================================
-- FIX 1: Add user_id to 5 shared tables and tighten RLS
-- ============================================================

-- 1a) coleta_analise_leads
ALTER TABLE public.coleta_analise_leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Authenticated users can delete coleta_analise_leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can insert coleta_analise_leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can update coleta_analise_leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can view all leads" ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can view coleta_analise_leads" ON public.coleta_analise_leads;

CREATE POLICY "Users can view own coleta_analise_leads" ON public.coleta_analise_leads FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own coleta_analise_leads" ON public.coleta_analise_leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coleta_analise_leads" ON public.coleta_analise_leads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own coleta_analise_leads" ON public.coleta_analise_leads FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage coleta_analise_leads" ON public.coleta_analise_leads FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 1b) contatos_getmore
ALTER TABLE public.contatos_getmore ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Authenticated users can delete contatos_getmore" ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can insert contatos_getmore" ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can update contatos_getmore" ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can view all contacts" ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can view contatos_getmore" ON public.contatos_getmore;

CREATE POLICY "Users can view own contatos_getmore" ON public.contatos_getmore FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own contatos_getmore" ON public.contatos_getmore FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contatos_getmore" ON public.contatos_getmore FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contatos_getmore" ON public.contatos_getmore FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage contatos_getmore" ON public.contatos_getmore FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 1c) ideias
ALTER TABLE public.ideias ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Authenticated users can delete ideias" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can insert ideas" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can insert ideias" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can update ideias" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can view all ideas" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can view ideias" ON public.ideias;

CREATE POLICY "Users can view own ideias" ON public.ideias FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own ideias" ON public.ideias FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideias" ON public.ideias FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideias" ON public.ideias FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage ideias" ON public.ideias FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 1d) mensagens
ALTER TABLE public.mensagens ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Authenticated users can delete mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can insert mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can update mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can view all messages" ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can view mensagens" ON public.mensagens;

CREATE POLICY "Users can view own mensagens" ON public.mensagens FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own mensagens" ON public.mensagens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mensagens" ON public.mensagens FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mensagens" ON public.mensagens FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage mensagens" ON public.mensagens FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 1e) vendas
ALTER TABLE public.vendas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Authenticated users can delete vendas" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can insert vendas" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can update vendas" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can view all sales" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can view vendas" ON public.vendas;

CREATE POLICY "Users can view own vendas" ON public.vendas FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own vendas" ON public.vendas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vendas" ON public.vendas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vendas" ON public.vendas FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage vendas" ON public.vendas FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- FIX 2: Tighten event_registrations RLS
-- ============================================================

DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Authenticated users can view registrations" ON public.event_registrations;

-- Public can still register (form submission)
CREATE POLICY "Anyone can register for events" ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Only admins can view registrations
CREATE POLICY "Admins can view event registrations" ON public.event_registrations FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
-- Only admins can delete
CREATE POLICY "Admins can delete event registrations" ON public.event_registrations FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
