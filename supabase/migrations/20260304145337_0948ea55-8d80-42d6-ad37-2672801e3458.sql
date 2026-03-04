
-- Remove OR user_id IS NULL from SELECT policies on 6 tables

-- 1. coleta_analise_leads
DROP POLICY IF EXISTS "Users can view own coleta_analise_leads" ON public.coleta_analise_leads;
CREATE POLICY "Users can view own coleta_analise_leads"
  ON public.coleta_analise_leads FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. contatos_getmore
DROP POLICY IF EXISTS "Users can view own contatos_getmore" ON public.contatos_getmore;
CREATE POLICY "Users can view own contatos_getmore"
  ON public.contatos_getmore FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. ideias
DROP POLICY IF EXISTS "Users can view own ideias" ON public.ideias;
CREATE POLICY "Users can view own ideias"
  ON public.ideias FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4. mensagens
DROP POLICY IF EXISTS "Users can view own mensagens" ON public.mensagens;
CREATE POLICY "Users can view own mensagens"
  ON public.mensagens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5. vendas
DROP POLICY IF EXISTS "Users can view own vendas" ON public.vendas;
CREATE POLICY "Users can view own vendas"
  ON public.vendas FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6. documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
