-- =====================================================
-- SCRIPT SIMPLES: Adicionar coluna tipo
-- Use este se o script completo der erro
-- =====================================================

-- Criar ENUM
CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');

-- Adicionar coluna
ALTER TABLE produtos ADD COLUMN tipo produto_tipo NOT NULL DEFAULT 'produto';

-- Atualizar dados existentes
UPDATE produtos 
SET tipo = CASE 
  WHEN is_servico = true THEN 'servico'::produto_tipo 
  ELSE 'produto'::produto_tipo 
END;

-- Criar índice
CREATE INDEX idx_produtos_tipo ON produtos(tipo);

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

-- Verificar
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'produtos' AND column_name = 'tipo';
