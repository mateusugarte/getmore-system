-- =====================================================
-- FIX SECURITY ISSUES ON LEGACY TABLES
-- =====================================================

-- Fix documents table - add proper RLS policies
CREATE POLICY "Authenticated users can view documents"
    ON public.documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Drop overly permissive policies on legacy tables and recreate with proper security

-- COLETA_ANALISE_LEADS - Drop and recreate with authenticated check
DROP POLICY IF EXISTS "Authenticated users can delete leads " ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads " ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can update leads " ON public.coleta_analise_leads;
DROP POLICY IF EXISTS "Authenticated users can view all leads " ON public.coleta_analise_leads;

CREATE POLICY "Authenticated users can view coleta_analise_leads"
    ON public.coleta_analise_leads FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert coleta_analise_leads"
    ON public.coleta_analise_leads FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update coleta_analise_leads"
    ON public.coleta_analise_leads FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete coleta_analise_leads"
    ON public.coleta_analise_leads FOR DELETE
    TO authenticated
    USING (true);

-- CONTATOS_GETMORE - Drop and recreate with authenticated check
DROP POLICY IF EXISTS "Authenticated users can insert contacts " ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can update contacts " ON public.contatos_getmore;
DROP POLICY IF EXISTS "Authenticated users can view all contacts " ON public.contatos_getmore;

CREATE POLICY "Authenticated users can view contatos_getmore"
    ON public.contatos_getmore FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert contatos_getmore"
    ON public.contatos_getmore FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update contatos_getmore"
    ON public.contatos_getmore FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete contatos_getmore"
    ON public.contatos_getmore FOR DELETE
    TO authenticated
    USING (true);

-- IDEIAS - Drop and recreate with authenticated check
DROP POLICY IF EXISTS "Authenticated users can insert ideas " ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can view all ideas " ON public.ideias;

CREATE POLICY "Authenticated users can view ideias"
    ON public.ideias FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert ideias"
    ON public.ideias FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update ideias"
    ON public.ideias FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete ideias"
    ON public.ideias FOR DELETE
    TO authenticated
    USING (true);

-- MENSAGENS - Drop and recreate with authenticated check
DROP POLICY IF EXISTS "Authenticated users can insert messages " ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can update messages " ON public.mensagens;
DROP POLICY IF EXISTS "Authenticated users can view all messages " ON public.mensagens;

CREATE POLICY "Authenticated users can view mensagens"
    ON public.mensagens FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert mensagens"
    ON public.mensagens FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update mensagens"
    ON public.mensagens FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete mensagens"
    ON public.mensagens FOR DELETE
    TO authenticated
    USING (true);

-- VENDAS - Drop and recreate with authenticated check
DROP POLICY IF EXISTS "Authenticated users can insert sales " ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can update sales " ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can view all sales " ON public.vendas;

CREATE POLICY "Authenticated users can view vendas"
    ON public.vendas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert vendas"
    ON public.vendas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update vendas"
    ON public.vendas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete vendas"
    ON public.vendas FOR DELETE
    TO authenticated
    USING (true);