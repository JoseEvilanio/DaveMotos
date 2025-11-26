-- =====================================================
-- ADICIONAR COLUNA preco_base NA TABELA servicos
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Verificar se a tabela servicos existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'servicos'
  ) THEN
    RAISE NOTICE '✅ Tabela servicos existe';
  ELSE
    RAISE NOTICE '❌ Tabela servicos NÃO existe - será criada';
  END IF;
END $$;

-- Criar tabela servicos se não existir
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

-- Adicionar outras colunas necessárias se não existirem
DO $$
BEGIN
  -- Coluna tempo_estimado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'servicos' 
    AND column_name = 'tempo_estimado'
  ) THEN
    ALTER TABLE servicos ADD COLUMN tempo_estimado INTEGER;
    RAISE NOTICE '✅ Coluna tempo_estimado adicionada';
  END IF;

  -- Coluna is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'servicos' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE servicos ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Coluna is_active adicionada';
  END IF;
END $$;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_servicos_nome ON servicos(nome);
CREATE INDEX IF NOT EXISTS idx_servicos_is_active ON servicos(is_active);

-- Inserir serviços padrão (se a tabela estiver vazia)
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

-- Habilitar RLS (Row Level Security)
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso público para leitura)
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

-- Recarregar schema cache
NOTIFY pgrst, 'reload schema';

-- Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'servicos'
ORDER BY ordinal_position;

-- Verificar serviços cadastrados
SELECT 
  COUNT(*) as total_servicos,
  COUNT(*) FILTER (WHERE is_active = true) as servicos_ativos
FROM servicos;

-- Resumo
SELECT 
  '✅ TABELA servicos CONFIGURADA COM SUCESSO!' as status,
  'Aguarde 30 segundos para o cache atualizar' as observacao;
