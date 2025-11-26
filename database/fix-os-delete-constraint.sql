-- =====================================================
-- FIX: Permitir exclusão de Ordens de Serviço
-- =====================================================
-- Problema: A tabela contas_receber tem FK sem ON DELETE
-- Solução: Alterar constraint para ON DELETE SET NULL

\c moto;

-- =====================================================
-- REMOVER CONSTRAINT ANTIGA
-- =====================================================

-- Primeiro, precisamos descobrir o nome da constraint
-- Ela foi criada automaticamente, então vamos removê-la e recriar

-- Remover a constraint antiga (se existir)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Buscar o nome da constraint
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'contas_receber'::regclass
    AND confrelid = 'ordens_servico'::regclass;
    
    -- Se encontrou, remover
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE contas_receber DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Constraint % removida', constraint_name;
    END IF;
END $$;

-- =====================================================
-- CRIAR NOVA CONSTRAINT COM ON DELETE SET NULL
-- =====================================================

ALTER TABLE contas_receber
ADD CONSTRAINT fk_contas_receber_os
FOREIGN KEY (os_id) 
REFERENCES ordens_servico(id) 
ON DELETE SET NULL;

\echo 'Constraint atualizada com sucesso!'
\echo 'Agora é possível excluir Ordens de Serviço sem erro.'
