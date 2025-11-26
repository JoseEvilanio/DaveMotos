-- =====================================================
-- ADICIONAR COLUNA 'tipo' NA TABELA produtos
-- Migration: 002_add_tipo_column_produtos
-- =====================================================

-- Criar tipo ENUM para tipo de produto
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
  END IF;
END $$;

-- Adicionar coluna tipo se não existir
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS tipo produto_tipo;

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

-- Definir valor padrão para novos registros
ALTER TABLE produtos 
ALTER COLUMN tipo SET DEFAULT 'produto'::produto_tipo;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);

-- Comentário na coluna
COMMENT ON COLUMN produtos.tipo IS 'Tipo do item: produto (peça) ou servico (mão de obra)';
