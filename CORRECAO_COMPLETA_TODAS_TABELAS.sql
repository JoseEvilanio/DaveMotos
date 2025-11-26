-- =====================================================
-- CORREÇÃO COMPLETA - TODAS AS TABELAS
-- Execute este script ÚNICO no SQL Editor do Supabase
-- =====================================================
-- 
-- Este script resolve TODOS os problemas:
-- 1. Adiciona coluna 'tipo' na tabela produtos
-- 2. Cria/corrige tabela servicos com preco_base
-- 3. Cria tabela categorias_produtos se não existir
-- 4. Insere dados padrão
-- 5. Configura RLS
--
-- =====================================================

-- =====================================================
-- 1. ENUM produto_tipo
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
    RAISE NOTICE '✅ ENUM produto_tipo criado';
  ELSE
    RAISE NOTICE 'ℹ️  ENUM produto_tipo já existe';
  END IF;
END $$;

-- =====================================================
-- 2. TABELA categorias_produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_produtos_nome ON categorias_produtos(nome);

-- Habilitar RLS
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias_produtos
DROP POLICY IF EXISTS "Permitir leitura de categorias" ON categorias_produtos;
CREATE POLICY "Permitir leitura de categorias" ON categorias_produtos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de categorias" ON categorias_produtos;
CREATE POLICY "Permitir inserção de categorias" ON categorias_produtos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de categorias" ON categorias_produtos;
CREATE POLICY "Permitir atualização de categorias" ON categorias_produtos
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusão de categorias" ON categorias_produtos;
CREATE POLICY "Permitir exclusão de categorias" ON categorias_produtos
  FOR DELETE USING (true);

-- Inserir categorias padrão
INSERT INTO categorias_produtos (nome, descricao, is_active) VALUES
  ('Peças', 'Peças e componentes para motos', true),
  ('Acessórios', 'Acessórios para motos', true),
  ('Lubrificantes', 'Óleos e lubrificantes', true),
  ('Pneus', 'Pneus e câmaras', true),
  ('Elétrica', 'Componentes elétricos', true),
  ('Freios', 'Sistema de freios', true),
  ('Suspensão', 'Componentes de suspensão', true),
  ('Motor', 'Peças de motor', true),
  ('Transmissão', 'Componentes de transmissão', true),
  ('Filtros', 'Filtros de ar, óleo e combustível', true),
  ('Escapamento', 'Sistema de escapamento', true),
  ('Carroceria', 'Carenagem e peças de carroceria', true),
  ('Outros', 'Outros produtos', true)
ON CONFLICT (nome) DO NOTHING;

RAISE NOTICE '✅ Categorias de produtos configuradas';

-- =====================================================
-- 3. TABELA produtos - Adicionar coluna tipo
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'produtos' 
    AND column_name = 'tipo'
  ) THEN
    ALTER TABLE produtos ADD COLUMN tipo produto_tipo NOT NULL DEFAULT 'produto';
    
    -- Migrar dados existentes
    UPDATE produtos 
    SET tipo = CASE 
      WHEN is_servico = true THEN 'servico'::produto_tipo 
      ELSE 'produto'::produto_tipo 
    END;
    
    CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
    RAISE NOTICE '✅ Coluna tipo adicionada à tabela produtos';
  ELSE
    RAISE NOTICE 'ℹ️  Coluna tipo já existe na tabela produtos';
  END IF;
END $$;

-- =====================================================
-- 4. TABELA servicos - Criar/Corrigir
-- =====================================================
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_base NUMERIC(10,2) NOT NULL DEFAULT 0,
  tempo_estimado INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna preco_base se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'servicos' 
    AND column_name = 'preco_base'
  ) THEN
    ALTER TABLE servicos ADD COLUMN preco_base NUMERIC(10,2) NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Coluna preco_base adicionada à tabela servicos';
  ELSE
    RAISE NOTICE 'ℹ️  Coluna preco_base já existe na tabela servicos';
  END IF;
END $$;

-- Adicionar outras colunas necessárias
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'servicos' 
    AND column_name = 'tempo_estimado'
  ) THEN
    ALTER TABLE servicos ADD COLUMN tempo_estimado INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'servicos' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE servicos ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_servicos_nome ON servicos(nome);
CREATE INDEX IF NOT EXISTS idx_servicos_is_active ON servicos(is_active);

-- Habilitar RLS
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para servicos
DROP POLICY IF EXISTS "Permitir leitura de serviços" ON servicos;
CREATE POLICY "Permitir leitura de serviços" ON servicos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de serviços" ON servicos;
CREATE POLICY "Permitir inserção de serviços" ON servicos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de serviços" ON servicos;
CREATE POLICY "Permitir atualização de serviços" ON servicos
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusão de serviços" ON servicos;
CREATE POLICY "Permitir exclusão de serviços" ON servicos
  FOR DELETE USING (true);

-- Inserir serviços padrão
INSERT INTO servicos (nome, descricao, preco_base, tempo_estimado, is_active) VALUES
  ('Troca de Óleo', 'Troca de óleo do motor', 80.00, 30, true),
  ('Revisão Geral', 'Revisão completa da motocicleta', 150.00, 120, true),
  ('Troca de Pneu', 'Troca de pneu dianteiro ou traseiro', 50.00, 45, true),
  ('Regulagem de Freios', 'Regulagem e ajuste do sistema de freios', 60.00, 30, true),
  ('Limpeza de Carburador', 'Limpeza e regulagem do carburador', 100.00, 90, true),
  ('Troca de Corrente', 'Substituição da corrente de transmissão', 70.00, 60, true),
  ('Alinhamento', 'Alinhamento de rodas', 40.00, 30, true),
  ('Troca de Bateria', 'Substituição da bateria', 30.00, 15, true),
  ('Regulagem de Motor', 'Regulagem e ajuste do motor', 120.00, 90, true),
  ('Manutenção Preventiva', 'Manutenção preventiva completa', 200.00, 180, true)
ON CONFLICT (nome) DO NOTHING;

RAISE NOTICE '✅ Tabela servicos configurada';

-- =====================================================
-- 5. RECARREGAR SCHEMA CACHE
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 6. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar produtos
SELECT 
  '✅ PRODUTOS' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE tipo = 'produto') as produtos,
  COUNT(*) FILTER (WHERE tipo = 'servico') as servicos
FROM produtos;

-- Verificar categorias
SELECT 
  '✅ CATEGORIAS' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as ativas
FROM categorias_produtos;

-- Verificar serviços
SELECT 
  '✅ SERVIÇOS' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as ativos
FROM servicos;

-- Resumo final
SELECT 
  '🎉 CORREÇÃO COMPLETA APLICADA COM SUCESSO!' as status,
  'Aguarde 30-60 segundos para o cache atualizar' as observacao,
  'Depois recarregue a aplicação (Ctrl+Shift+R)' as proxima_acao;
