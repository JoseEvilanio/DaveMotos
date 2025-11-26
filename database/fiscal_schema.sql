-- ============================================================================
-- MÓDULO FISCAL - FOCUSNFE
-- Script de criação de tabelas para PostgreSQL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABELA: configuracao_fiscal
-- Armazena as configurações de integração com FocusNFe
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS configuracao_fiscal (
  id SERIAL PRIMARY KEY,
  token_focusnfe TEXT NOT NULL,
  ambiente VARCHAR(20) NOT NULL CHECK (ambiente IN ('homologacao', 'producao')),
  cnpj_emitente VARCHAR(18) NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  inscricao_estadual VARCHAR(20) NOT NULL,
  regime_tributario VARCHAR(1) NOT NULL CHECK (regime_tributario IN ('1', '2', '3')),
  endereco JSONB NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE configuracao_fiscal IS 'Configurações de integração com FocusNFe';
COMMENT ON COLUMN configuracao_fiscal.token_focusnfe IS 'Token de autenticação da API FocusNFe';
COMMENT ON COLUMN configuracao_fiscal.ambiente IS 'Ambiente: homologacao ou producao';
COMMENT ON COLUMN configuracao_fiscal.regime_tributario IS '1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal';
COMMENT ON COLUMN configuracao_fiscal.endereco IS 'JSON com dados completos do endereço do emitente';

-- ----------------------------------------------------------------------------
-- TABELA: notas_fiscais
-- Armazena todas as notas fiscais emitidas (NFe e NFC-e)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notas_fiscais (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('nfe', 'nfce')),
  referencia VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'processando', 'autorizada', 'cancelada', 'erro', 'rejeitada', 'denegada')),
  
  -- Dados da nota
  chave VARCHAR(44),
  numero VARCHAR(20),
  serie VARCHAR(10),
  protocolo VARCHAR(50),
  
  -- Cliente
  cliente_nome VARCHAR(255),
  cliente_cpf_cnpj VARCHAR(18),
  
  -- Valores
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_desconto DECIMAL(10, 2),
  
  -- Arquivos
  caminho_xml TEXT,
  caminho_pdf TEXT,
  qrcode TEXT,
  qrcode_url TEXT,
  url_consulta TEXT,
  
  -- JSON
  json_enviado TEXT NOT NULL,
  json_resposta TEXT,
  
  -- Cancelamento
  cancelada BOOLEAN DEFAULT false,
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMP,
  
  -- Datas
  data_emissao TIMESTAMP NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  
  -- Relacionamentos
  ordem_servico_id INTEGER REFERENCES ordens_servico(id) ON DELETE SET NULL,
  venda_id INTEGER
);

COMMENT ON TABLE notas_fiscais IS 'Registro de todas as notas fiscais emitidas';
COMMENT ON COLUMN notas_fiscais.tipo IS 'Tipo da nota: nfe ou nfce';
COMMENT ON COLUMN notas_fiscais.referencia IS 'Referência interna única para a nota';
COMMENT ON COLUMN notas_fiscais.status IS 'Status atual da nota fiscal';
COMMENT ON COLUMN notas_fiscais.chave IS 'Chave de acesso de 44 dígitos';
COMMENT ON COLUMN notas_fiscais.json_enviado IS 'JSON completo enviado para FocusNFe';
COMMENT ON COLUMN notas_fiscais.json_resposta IS 'JSON completo da resposta da FocusNFe';

-- ----------------------------------------------------------------------------
-- TABELA: logs_fiscais
-- Registro de eventos relacionados às notas fiscais
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS logs_fiscais (
  id SERIAL PRIMARY KEY,
  nota_fiscal_id INTEGER REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('emissao', 'consulta', 'cancelamento', 'erro', 'download')),
  descricao TEXT NOT NULL,
  dados_json TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE logs_fiscais IS 'Log de eventos das notas fiscais';
COMMENT ON COLUMN logs_fiscais.tipo_evento IS 'Tipo do evento: emissao, consulta, cancelamento, erro, download';
COMMENT ON COLUMN logs_fiscais.dados_json IS 'Dados adicionais do evento em formato JSON';

-- ----------------------------------------------------------------------------
-- ÍNDICES
-- ----------------------------------------------------------------------------

-- Índices para notas_fiscais
CREATE INDEX IF NOT EXISTS idx_notas_referencia ON notas_fiscais(referencia);
CREATE INDEX IF NOT EXISTS idx_notas_chave ON notas_fiscais(chave);
CREATE INDEX IF NOT EXISTS idx_notas_status ON notas_fiscais(status);
CREATE INDEX IF NOT EXISTS idx_notas_tipo ON notas_fiscais(tipo);
CREATE INDEX IF NOT EXISTS idx_notas_data_emissao ON notas_fiscais(data_emissao DESC);
CREATE INDEX IF NOT EXISTS idx_notas_cliente_cpf_cnpj ON notas_fiscais(cliente_cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_notas_ordem_servico ON notas_fiscais(ordem_servico_id);
CREATE INDEX IF NOT EXISTS idx_notas_cancelada ON notas_fiscais(cancelada);

-- Índices para logs_fiscais
CREATE INDEX IF NOT EXISTS idx_logs_nota_id ON logs_fiscais(nota_fiscal_id);
CREATE INDEX IF NOT EXISTS idx_logs_tipo_evento ON logs_fiscais(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_logs_criado_em ON logs_fiscais(criado_em DESC);

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_configuracao_fiscal
  BEFORE UPDATE ON configuracao_fiscal
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_notas_fiscais
  BEFORE UPDATE ON notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- ----------------------------------------------------------------------------
-- FUNÇÕES AUXILIARES
-- ----------------------------------------------------------------------------

-- Função para criar log fiscal
CREATE OR REPLACE FUNCTION criar_log_fiscal(
  p_nota_fiscal_id INTEGER,
  p_tipo_evento VARCHAR(50),
  p_descricao TEXT,
  p_dados_json TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_log_id INTEGER;
BEGIN
  INSERT INTO logs_fiscais (nota_fiscal_id, tipo_evento, descricao, dados_json)
  VALUES (p_nota_fiscal_id, p_tipo_evento, p_descricao, p_dados_json)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION criar_log_fiscal IS 'Cria um registro de log para uma nota fiscal';

-- Função para buscar notas por período
CREATE OR REPLACE FUNCTION buscar_notas_por_periodo(
  p_data_inicio TIMESTAMP,
  p_data_fim TIMESTAMP,
  p_tipo VARCHAR(10) DEFAULT NULL,
  p_status VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  tipo VARCHAR(10),
  referencia VARCHAR(100),
  status VARCHAR(20),
  chave VARCHAR(44),
  numero VARCHAR(20),
  cliente_nome VARCHAR(255),
  valor_total DECIMAL(10, 2),
  data_emissao TIMESTAMP,
  cancelada BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nf.id,
    nf.tipo,
    nf.referencia,
    nf.status,
    nf.chave,
    nf.numero,
    nf.cliente_nome,
    nf.valor_total,
    nf.data_emissao,
    nf.cancelada
  FROM notas_fiscais nf
  WHERE nf.data_emissao BETWEEN p_data_inicio AND p_data_fim
    AND (p_tipo IS NULL OR nf.tipo = p_tipo)
    AND (p_status IS NULL OR nf.status = p_status)
  ORDER BY nf.data_emissao DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_notas_por_periodo IS 'Busca notas fiscais em um período específico com filtros opcionais';

-- Função para obter estatísticas fiscais
CREATE OR REPLACE FUNCTION obter_estatisticas_fiscais(
  p_data_inicio TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  p_data_fim TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  total_notas BIGINT,
  total_nfe BIGINT,
  total_nfce BIGINT,
  total_autorizadas BIGINT,
  total_canceladas BIGINT,
  valor_total_periodo DECIMAL(10, 2),
  valor_total_nfe DECIMAL(10, 2),
  valor_total_nfce DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notas,
    COUNT(*) FILTER (WHERE tipo = 'nfe') as total_nfe,
    COUNT(*) FILTER (WHERE tipo = 'nfce') as total_nfce,
    COUNT(*) FILTER (WHERE status = 'autorizada') as total_autorizadas,
    COUNT(*) FILTER (WHERE cancelada = true) as total_canceladas,
    COALESCE(SUM(valor_total), 0) as valor_total_periodo,
    COALESCE(SUM(valor_total) FILTER (WHERE tipo = 'nfe'), 0) as valor_total_nfe,
    COALESCE(SUM(valor_total) FILTER (WHERE tipo = 'nfce'), 0) as valor_total_nfce
  FROM notas_fiscais
  WHERE data_emissao BETWEEN p_data_inicio AND p_data_fim;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obter_estatisticas_fiscais IS 'Retorna estatísticas das notas fiscais em um período';

-- ----------------------------------------------------------------------------
-- DADOS INICIAIS (OPCIONAL)
-- ----------------------------------------------------------------------------

-- Inserir configuração padrão (comentado - descomentar se necessário)
/*
INSERT INTO configuracao_fiscal (
  token_focusnfe,
  ambiente,
  cnpj_emitente,
  razao_social,
  nome_fantasia,
  inscricao_estadual,
  regime_tributario,
  endereco
) VALUES (
  'SEU_TOKEN_AQUI',
  'homologacao',
  '00.000.000/0000-00',
  'EMPRESA EXEMPLO LTDA',
  'Empresa Exemplo',
  '000.000.000.000',
  '1',
  '{
    "logradouro": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "municipio": "São Paulo",
    "uf": "SP",
    "cep": "00000-000",
    "codigo_municipio": "3550308"
  }'::jsonb
);
*/

-- ----------------------------------------------------------------------------
-- PERMISSÕES (AJUSTAR CONFORME NECESSÁRIO)
-- ----------------------------------------------------------------------------

-- GRANT SELECT, INSERT, UPDATE, DELETE ON configuracao_fiscal TO seu_usuario;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notas_fiscais TO seu_usuario;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON logs_fiscais TO seu_usuario;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO seu_usuario;

-- ----------------------------------------------------------------------------
-- FIM DO SCRIPT
-- ----------------------------------------------------------------------------

-- Verificar tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('configuracao_fiscal', 'notas_fiscais', 'logs_fiscais')
ORDER BY table_name;
