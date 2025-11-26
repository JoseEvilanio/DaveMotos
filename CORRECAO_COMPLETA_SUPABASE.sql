-- =====================================================
-- CORREÇÃO COMPLETA - SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================
-- 
-- Este script resolve:
-- 1. Adiciona coluna 'tipo' na tabela produtos
-- 2. Adiciona políticas RLS para categorias_produtos
-- 3. Verifica e corrige outros problemas comuns
--
-- =====================================================

-- =====================================================
-- 1. ADICIONAR COLUNA 'tipo' NA TABELA produtos
-- =====================================================

-- Criar tipo ENUM se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
    RAISE NOTICE 'ENUM produto_tipo criado com sucesso';
  ELSE
    RAISE NOTICE 'ENUM produto_tipo já existe';
  END IF;
END $$;

-- Adicionar coluna tipo se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE produtos ADD COLUMN tipo produto_tipo;
    RAISE NOTICE 'Coluna tipo adicionada à tabela produtos';
    
    -- Atualizar dados existentes baseado no campo is_servico
    UPDATE produtos 
    SET tipo = CASE 
      WHEN is_servico = true THEN 'servico'::produto_tipo 
      ELSE 'produto'::produto_tipo 
    END
    WHERE tipo IS NULL;
    RAISE NOTICE 'Dados existentes migrados para a coluna tipo';
    
    -- Tornar a coluna NOT NULL
    ALTER TABLE produtos ALTER COLUMN tipo SET NOT NULL;
    ALTER TABLE produtos ALTER COLUMN tipo SET DEFAULT 'produto'::produto_tipo;
    RAISE NOTICE 'Coluna tipo configurada como NOT NULL com default';
    
    -- Criar índice
    CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
    RAISE NOTICE 'Índice criado para a coluna tipo';
  ELSE
    RAISE NOTICE 'Coluna tipo já existe na tabela produtos';
  END IF;
END $$;

-- =====================================================
-- 2. ADICIONAR POLÍTICAS RLS PARA categorias_produtos
-- =====================================================

-- Verificar se RLS está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'categorias_produtos' AND rowsecurity = true
  ) THEN
    ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para categorias_produtos';
  ELSE
    RAISE NOTICE 'RLS já está habilitado para categorias_produtos';
  END IF;
END $$;

-- Criar políticas RLS
DO $$
BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categorias_produtos' 
    AND policyname = 'Usuários autenticados podem ler categorias'
  ) THEN
    CREATE POLICY "Usuários autenticados podem ler categorias" 
      ON categorias_produtos 
      FOR SELECT 
      USING (auth.role() = 'authenticated');
    RAISE NOTICE 'Política SELECT criada para categorias_produtos';
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categorias_produtos' 
    AND policyname = 'Usuários autenticados podem inserir categorias'
  ) THEN
    CREATE POLICY "Usuários autenticados podem inserir categorias" 
      ON categorias_produtos 
      FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Política INSERT criada para categorias_produtos';
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categorias_produtos' 
    AND policyname = 'Usuários autenticados podem atualizar categorias'
  ) THEN
    CREATE POLICY "Usuários autenticados podem atualizar categorias" 
      ON categorias_produtos 
      FOR UPDATE 
      USING (auth.role() = 'authenticated');
    RAISE NOTICE 'Política UPDATE criada para categorias_produtos';
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categorias_produtos' 
    AND policyname = 'Usuários autenticados podem deletar categorias'
  ) THEN
    CREATE POLICY "Usuários autenticados podem deletar categorias" 
      ON categorias_produtos 
      FOR DELETE 
      USING (auth.role() = 'authenticated');
    RAISE NOTICE 'Política DELETE criada para categorias_produtos';
  END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR E CRIAR CATEGORIAS PADRÃO
-- =====================================================

INSERT INTO categorias_produtos (nome, descricao) VALUES
  ('Peças Originais', 'Peças originais de fábrica'),
  ('Peças Paralelas', 'Peças alternativas'),
  ('Óleos e Lubrificantes', 'Óleos, graxas e lubrificantes'),
  ('Pneus', 'Pneus e câmaras'),
  ('Acessórios', 'Acessórios diversos'),
  ('Serviços', 'Mão de obra e serviços')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 4. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar coluna tipo
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns 
  WHERE table_name = 'produtos' AND column_name = 'tipo';
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ Coluna tipo existe na tabela produtos';
  ELSE
    RAISE WARNING '❌ Coluna tipo NÃO existe na tabela produtos';
  END IF;
END $$;

-- Verificar políticas RLS
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_policies 
  WHERE tablename = 'categorias_produtos';
  
  IF v_count >= 4 THEN
    RAISE NOTICE '✅ Políticas RLS configuradas para categorias_produtos (% políticas)', v_count;
  ELSE
    RAISE WARNING '⚠️  Apenas % políticas encontradas para categorias_produtos (esperado: 4)', v_count;
  END IF;
END $$;

-- Verificar categorias
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM categorias_produtos 
  WHERE is_active = true;
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ % categorias ativas encontradas', v_count;
  ELSE
    RAISE WARNING '⚠️  Nenhuma categoria ativa encontrada';
  END IF;
END $$;

-- =====================================================
-- RESUMO
-- =====================================================

SELECT 
  '✅ CORREÇÃO COMPLETA APLICADA COM SUCESSO!' as status,
  'Recarregue o schema cache e reinicie a aplicação' as proximos_passos;

-- Exibir estrutura da tabela produtos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

-- Exibir políticas de categorias_produtos
SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN 'Com condição'
    ELSE 'Sem condição'
  END as tipo
FROM pg_policies
WHERE tablename = 'categorias_produtos'
ORDER BY cmd;

-- Exibir categorias disponíveis
SELECT 
  id,
  nome,
  descricao,
  is_active
FROM categorias_produtos
ORDER BY nome;
