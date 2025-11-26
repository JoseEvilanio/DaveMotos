-- =====================================================
-- ADICIONAR COLUNA 'tipo' NA TABELA produtos
-- =====================================================

\c moto;

-- Adicionar coluna tipo como ENUM
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
  END IF;
END $$;

-- Adicionar coluna tipo se não existir
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS tipo produto_tipo DEFAULT 'produto';

-- Atualizar registros existentes baseado no campo is_servico
UPDATE produtos 
SET tipo = CASE 
  WHEN is_servico = true THEN 'servico'::produto_tipo 
  ELSE 'produto'::produto_tipo 
END
WHERE tipo IS NULL;

-- Tornar a coluna NOT NULL após popular os dados
ALTER TABLE produtos 
ALTER COLUMN tipo SET NOT NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);

\echo 'Coluna tipo adicionada com sucesso na tabela produtos!'
