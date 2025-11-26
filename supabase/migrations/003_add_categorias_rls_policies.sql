-- =====================================================
-- ADICIONAR POLÍTICAS RLS PARA categorias_produtos
-- Migration: 003_add_categorias_rls_policies
-- =====================================================

-- Políticas para categorias_produtos
-- Permitir leitura para todos os usuários autenticados
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ler categorias" 
  ON categorias_produtos 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem inserir categorias" 
  ON categorias_produtos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem atualizar categorias" 
  ON categorias_produtos 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem deletar categorias" 
  ON categorias_produtos 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
