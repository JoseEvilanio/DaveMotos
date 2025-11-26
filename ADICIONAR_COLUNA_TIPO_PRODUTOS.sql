-- =====================================================
-- ADICIONAR COLUNA 'tipo' NA TABELA produtos
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Passo 1: Criar o ENUM produto_tipo se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
    RAISE NOTICE '✅ ENUM produto_tipo criado com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️  ENUM produto_tipo já existe';
  END IF;
END $$;

-- Passo 2: Adicionar a coluna tipo se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'produtos' 
    AND column_name = 'tipo'
  ) THEN
    -- Adicionar coluna tipo
    ALTER TABLE produtos ADD COLUMN tipo produto_tipo;
    RAISE NOTICE '✅ Coluna tipo adicionada à tabela produtos';
    
    -- Migrar dados existentes baseado no campo is_servico
    UPDATE produtos 
    SET tipo = CASE 
      WHEN is_servico = true THEN 'servico'::produto_tipo 
      ELSE 'produto'::produto_tipo 
    END
    WHERE tipo IS NULL;
    RAISE NOTICE '✅ Dados existentes migrados para a coluna tipo';
    
    -- Tornar a coluna NOT NULL e definir default
    ALTER TABLE produtos ALTER COLUMN tipo SET NOT NULL;
    ALTER TABLE produtos ALTER COLUMN tipo SET DEFAULT 'produto'::produto_tipo;
    RAISE NOTICE '✅ Coluna tipo configurada como NOT NULL com default';
    
    -- Criar índice para melhor performance
    CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
    RAISE NOTICE '✅ Índice criado para a coluna tipo';
  ELSE
    RAISE NOTICE 'ℹ️  Coluna tipo já existe na tabela produtos';
  END IF;
END $$;

-- Passo 3: Verificar a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'produtos'
AND column_name IN ('tipo', 'is_servico')
ORDER BY ordinal_position;

-- Passo 4: Verificar dados
SELECT 
  COUNT(*) as total_produtos,
  COUNT(*) FILTER (WHERE tipo = 'produto') as total_produtos_tipo,
  COUNT(*) FILTER (WHERE tipo = 'servico') as total_servicos_tipo,
  COUNT(*) FILTER (WHERE is_servico = true) as total_is_servico_true,
  COUNT(*) FILTER (WHERE is_servico = false) as total_is_servico_false
FROM produtos;

-- Passo 5: Limpar o cache do schema
NOTIFY pgrst, 'reload schema';

-- Resumo
SELECT 
  '✅ COLUNA tipo ADICIONADA COM SUCESSO!' as status,
  'Aguarde alguns segundos para o cache do schema ser atualizado' as observacao;
