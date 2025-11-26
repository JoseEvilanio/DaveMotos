-- Adiciona colunas usadas pelo formulário de Receita para que o modal de edição
-- carregue corretamente os dados de Cliente e Descrição, independentemente do
-- schema (PT: cliente_id/descricao | EN: customer_id/description)

BEGIN;

-- Tabela principal: contas_receber
ALTER TABLE public.contas_receber
  ADD COLUMN IF NOT EXISTS cliente_id uuid,
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS description text;

-- Índices para melhorar filtros/joins
CREATE INDEX IF NOT EXISTS idx_contas_receber_cliente_id ON public.contas_receber (cliente_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_customer_id ON public.contas_receber (customer_id);

-- FKs opcionais para clientes (apenas se a tabela existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'clientes'
  ) THEN
    -- FK para cliente_id (PT)
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'contas_receber_cliente_id_fkey'
    ) THEN
      ALTER TABLE public.contas_receber
        ADD CONSTRAINT contas_receber_cliente_id_fkey
        FOREIGN KEY (cliente_id)
        REFERENCES public.clientes (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;

    -- FK para customer_id (EN)
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'contas_receber_customer_id_fkey'
    ) THEN
      ALTER TABLE public.contas_receber
        ADD CONSTRAINT contas_receber_customer_id_fkey
        FOREIGN KEY (customer_id)
        REFERENCES public.clientes (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

COMMIT;

-- carregue os dados preenchidos na criação.

alter table if exists public.contas_receber
  add column if not exists cliente_id uuid null,
  add column if not exists descricao text null,
  add column if not exists data_emissao date null,
  add column if not exists forma_pagamento text null,
  add column if not exists observacoes text null,
  add column if not exists data_recebimento date null,
  add column if not exists valor_recebido numeric(12,2) null;

-- Índices opcionais para melhorar consultas por cliente e status
create index if not exists idx_contas_receber_cliente on public.contas_receber (cliente_id);
create index if not exists idx_contas_receber_status on public.contas_receber (status);
