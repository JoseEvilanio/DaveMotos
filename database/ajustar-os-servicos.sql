-- =====================================================
-- AJUSTAR ORDENS DE SERVIÇO PARA INCLUIR SERVIÇOS E PEÇAS
-- =====================================================

\c moto;

-- =====================================================
-- REMOVER TABELAS ANTIGAS
-- =====================================================

-- Remover tabela de serviços (não será mais necessária)
DROP TABLE IF EXISTS servicos_pecas CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;

-- =====================================================
-- TABELA: os_servicos (tipos de serviços na OS)
-- =====================================================

CREATE TABLE IF NOT EXISTS os_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo_servico_id UUID NOT NULL REFERENCES tipos_servicos(id) ON DELETE RESTRICT,
  quantidade INTEGER DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: os_pecas (peças utilizadas na OS)
-- =====================================================

CREATE TABLE IF NOT EXISTS os_pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_os_servicos_os ON os_servicos(os_id);
CREATE INDEX IF NOT EXISTS idx_os_servicos_tipo ON os_servicos(tipo_servico_id);
CREATE INDEX IF NOT EXISTS idx_os_pecas_os ON os_pecas(os_id);
CREATE INDEX IF NOT EXISTS idx_os_pecas_produto ON os_pecas(produto_id);

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR VALORES DA OS
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_valores_os()
RETURNS TRIGGER AS $$
DECLARE
  v_os_id UUID;
  v_total_servicos DECIMAL(10,2);
  v_total_pecas DECIMAL(10,2);
  v_total DECIMAL(10,2);
BEGIN
  -- Determinar o ID da OS
  IF TG_OP = 'DELETE' THEN
    v_os_id := OLD.os_id;
  ELSE
    v_os_id := NEW.os_id;
  END IF;

  -- Calcular total de serviços
  SELECT COALESCE(SUM(subtotal), 0) INTO v_total_servicos
  FROM os_servicos
  WHERE os_id = v_os_id;

  -- Calcular total de peças
  SELECT COALESCE(SUM(subtotal), 0) INTO v_total_pecas
  FROM os_pecas
  WHERE os_id = v_os_id;

  -- Calcular total geral
  v_total := v_total_servicos + v_total_pecas;

  -- Atualizar ordem de serviço
  UPDATE ordens_servico
  SET 
    valor_servicos = v_total_servicos,
    valor_produtos = v_total_pecas,
    valor_total = v_total - COALESCE(valor_desconto, 0),
    updated_at = NOW()
  WHERE id = v_os_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ATUALIZAR VALORES AUTOMATICAMENTE
-- =====================================================

-- Trigger para os_servicos
DROP TRIGGER IF EXISTS trigger_atualizar_valores_os_servicos ON os_servicos;
CREATE TRIGGER trigger_atualizar_valores_os_servicos
  AFTER INSERT OR UPDATE OR DELETE ON os_servicos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_valores_os();

-- Trigger para os_pecas
DROP TRIGGER IF EXISTS trigger_atualizar_valores_os_pecas ON os_pecas;
CREATE TRIGGER trigger_atualizar_valores_os_pecas
  AFTER INSERT OR UPDATE OR DELETE ON os_pecas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_valores_os();

-- =====================================================
-- FUNÇÃO PARA DAR BAIXA NO ESTOQUE
-- =====================================================

CREATE OR REPLACE FUNCTION baixar_estoque_peca()
RETURNS TRIGGER AS $$
BEGIN
  -- Dar baixa no estoque quando peça é adicionada à OS
  IF TG_OP = 'INSERT' THEN
    UPDATE produtos
    SET estoque_atual = estoque_atual - NEW.quantidade
    WHERE id = NEW.produto_id;
    
    -- Registrar movimentação
    INSERT INTO estoque_movimentacoes (
      produto_id, tipo, quantidade, estoque_anterior, estoque_novo,
      motivo, referencia_id, referencia_tipo
    )
    SELECT 
      NEW.produto_id,
      'saida',
      NEW.quantidade,
      estoque_atual + NEW.quantidade,
      estoque_atual,
      'Utilizado na OS',
      NEW.os_id,
      'ordem_servico'
    FROM produtos
    WHERE id = NEW.produto_id;
  END IF;

  -- Devolver ao estoque quando peça é removida da OS
  IF TG_OP = 'DELETE' THEN
    UPDATE produtos
    SET estoque_atual = estoque_atual + OLD.quantidade
    WHERE id = OLD.produto_id;
    
    -- Registrar movimentação
    INSERT INTO estoque_movimentacoes (
      produto_id, tipo, quantidade, estoque_anterior, estoque_novo,
      motivo, referencia_id, referencia_tipo
    )
    SELECT 
      OLD.produto_id,
      'entrada',
      OLD.quantidade,
      estoque_atual - OLD.quantidade,
      estoque_atual,
      'Removido da OS',
      OLD.os_id,
      'ordem_servico'
    FROM produtos
    WHERE id = OLD.produto_id;
  END IF;

  -- Ajustar estoque quando quantidade é alterada
  IF TG_OP = 'UPDATE' AND OLD.quantidade != NEW.quantidade THEN
    UPDATE produtos
    SET estoque_atual = estoque_atual + OLD.quantidade - NEW.quantidade
    WHERE id = NEW.produto_id;
    
    -- Registrar movimentação
    INSERT INTO estoque_movimentacoes (
      produto_id, tipo, quantidade, estoque_anterior, estoque_novo,
      motivo, referencia_id, referencia_tipo
    )
    SELECT 
      NEW.produto_id,
      CASE WHEN NEW.quantidade > OLD.quantidade THEN 'saida' ELSE 'entrada' END,
      ABS(NEW.quantidade - OLD.quantidade),
      estoque_atual + OLD.quantidade - NEW.quantidade,
      estoque_atual,
      'Ajuste de quantidade na OS',
      NEW.os_id,
      'ordem_servico'
    FROM produtos
    WHERE id = NEW.produto_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER PARA CONTROLE DE ESTOQUE
-- =====================================================

DROP TRIGGER IF EXISTS trigger_baixar_estoque_peca ON os_pecas;
CREATE TRIGGER trigger_baixar_estoque_peca
  AFTER INSERT OR UPDATE OR DELETE ON os_pecas
  FOR EACH ROW
  EXECUTE FUNCTION baixar_estoque_peca();

\echo 'Tabelas de OS ajustadas com sucesso!'
\echo 'Triggers de cálculo automático criados!'
\echo 'Controle de estoque automático ativado!'
