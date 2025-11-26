-- =====================================================
-- ADICIONAR TABELAS PARA TIPOS DE SERVIÇOS
-- =====================================================

\c moto;

-- =====================================================
-- TABELA: tipos_servicos
-- =====================================================

CREATE TABLE IF NOT EXISTS tipos_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  preco_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  tempo_estimado INTEGER, -- em minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: servicos (serviços cadastrados)
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_servico_id UUID NOT NULL REFERENCES tipos_servicos(id) ON DELETE RESTRICT,
  codigo TEXT UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_servico DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: servicos_pecas (relação serviço-peças)
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos_pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servico_id, produto_id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tipos_servicos_nome ON tipos_servicos(nome);
CREATE INDEX IF NOT EXISTS idx_servicos_tipo ON servicos(tipo_servico_id);
CREATE INDEX IF NOT EXISTS idx_servicos_pecas_servico ON servicos_pecas(servico_id);
CREATE INDEX IF NOT EXISTS idx_servicos_pecas_produto ON servicos_pecas(produto_id);

-- =====================================================
-- TRIGGER para updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_tipos_servicos_updated_at ON tipos_servicos;
CREATE TRIGGER update_tipos_servicos_updated_at
    BEFORE UPDATE ON tipos_servicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_servicos_updated_at ON servicos;
CREATE TRIGGER update_servicos_updated_at
    BEFORE UPDATE ON servicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS - Tipos de Serviços Comuns
-- =====================================================

INSERT INTO tipos_servicos (nome, descricao, preco_base, tempo_estimado) VALUES
  ('Troca de Óleo', 'Troca de óleo do motor', 80.00, 30),
  ('Revisão Geral', 'Revisão completa da motocicleta', 150.00, 120),
  ('Troca de Pneu', 'Troca de pneu dianteiro ou traseiro', 50.00, 45),
  ('Regulagem de Freios', 'Regulagem e ajuste do sistema de freios', 60.00, 30),
  ('Limpeza de Carburador', 'Limpeza e regulagem do carburador', 100.00, 90),
  ('Troca de Corrente', 'Substituição da corrente de transmissão', 70.00, 60),
  ('Alinhamento', 'Alinhamento de rodas', 40.00, 30),
  ('Troca de Bateria', 'Substituição da bateria', 30.00, 15),
  ('Regulagem de Motor', 'Regulagem e ajuste do motor', 120.00, 90),
  ('Manutenção Preventiva', 'Manutenção preventiva completa', 200.00, 180)
ON CONFLICT (nome) DO NOTHING;

\echo 'Tabelas de tipos de serviços criadas com sucesso!'
