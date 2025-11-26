-- Separação de origem para contas a receber e a pagar
-- Executar este script no banco do Supabase

-- Contas a Receber: origem ('manual' | 'venda' | 'os') e referência
ALTER TABLE contas_receber
  ADD COLUMN IF NOT EXISTS origem TEXT CHECK (origem IN ('manual','venda','os')) DEFAULT 'manual';
ALTER TABLE contas_receber
  ADD COLUMN IF NOT EXISTS origem_ref_id uuid NULL;

-- Ajuste inicial de origem baseado em sale_id / os_id
UPDATE contas_receber SET origem = 'venda', origem_ref_id = sale_id WHERE sale_id IS NOT NULL;
UPDATE contas_receber SET origem = 'os', origem_ref_id = os_id WHERE os_id IS NOT NULL;
UPDATE contas_receber SET origem = 'manual', origem_ref_id = NULL WHERE sale_id IS NULL AND os_id IS NULL;

-- Contas a Pagar: origem ('manual' | 'compra') e referência
ALTER TABLE contas_pagar
  ADD COLUMN IF NOT EXISTS origem TEXT CHECK (origem IN ('manual','compra')) DEFAULT 'manual';
ALTER TABLE contas_pagar
  ADD COLUMN IF NOT EXISTS origem_ref_id uuid NULL;

-- Views para consultas separadas
CREATE OR REPLACE VIEW vw_contas_receber_vendas AS
SELECT cr.*, v.numero_venda
FROM contas_receber cr
LEFT JOIN vendas v ON v.id = cr.origem_ref_id
WHERE cr.origem = 'venda';

CREATE OR REPLACE VIEW vw_contas_receber_os AS
SELECT cr.*, os.numero_os
FROM contas_receber cr
LEFT JOIN ordens_servico os ON os.id = cr.origem_ref_id
WHERE cr.origem = 'os';

CREATE OR REPLACE VIEW vw_contas_receber_manuais AS
SELECT cr.*
FROM contas_receber cr
WHERE cr.origem = 'manual';

CREATE OR REPLACE VIEW vw_contas_pagar_manuais AS
SELECT cp.*
FROM contas_pagar cp
WHERE cp.origem = 'manual';

CREATE OR REPLACE VIEW vw_contas_pagar_compras AS
SELECT cp.*
FROM contas_pagar cp
WHERE cp.origem = 'compra';