-- Script para corrigir a coluna desconto na tabela vendas
-- Este script adiciona a coluna 'desconto' que está faltando

-- Verificar se a coluna desconto existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'desconto'
    ) THEN
        -- Adicionar a coluna desconto
        ALTER TABLE vendas 
        ADD COLUMN desconto DECIMAL(10,2) DEFAULT 0;
        
        RAISE NOTICE 'Coluna desconto adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna desconto já existe!';
    END IF;
END
$$;