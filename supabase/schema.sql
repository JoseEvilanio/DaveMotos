-- =====================================================
-- SISTEMA DE GERENCIAMENTO DE OFICINAS DE MOTO
-- Schema do Banco de Dados - Supabase PostgreSQL
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'mecanico', 'atendente');
CREATE TYPE os_status AS ENUM ('aberta', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada');
CREATE TYPE payment_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');
CREATE TYPE payment_method AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'cheque');
CREATE TYPE transaction_type AS ENUM ('entrada', 'saida', 'ajuste');
CREATE TYPE appointment_status AS ENUM ('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado');
CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');

-- =====================================================
-- TABELA: profiles (extensão do auth.users do Supabase)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'atendente',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: clientes
-- =====================================================

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  telefone TEXT NOT NULL,
  celular TEXT,
  email TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  foto_url TEXT,
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);

-- =====================================================
-- TABELA: fornecedores
-- =====================================================

CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  inscricao_estadual TEXT,
  telefone TEXT NOT NULL,
  celular TEXT,
  email TEXT,
  site TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  contato_nome TEXT,
  contato_telefone TEXT,
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_fornecedores_razao_social ON fornecedores(razao_social);
CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj);

-- =====================================================
-- TABELA: mecanicos
-- =====================================================

CREATE TABLE mecanicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT NOT NULL,
  celular TEXT,
  email TEXT,
  especialidades TEXT[],
  data_admissao DATE,
  salario DECIMAL(10,2),
  comissao_percentual DECIMAL(5,2),
  foto_url TEXT,
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_mecanicos_nome ON mecanicos(nome);
CREATE INDEX idx_mecanicos_user_id ON mecanicos(user_id);

-- =====================================================
-- TABELA: veiculos
-- =====================================================

CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER,
  cor TEXT,
  placa TEXT UNIQUE NOT NULL,
  chassi TEXT,
  renavam TEXT,
  km_atual INTEGER,
  fotos_urls TEXT[],
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);

-- =====================================================
-- TABELA: categorias_produtos
-- =====================================================

CREATE TABLE categorias_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: produtos
-- =====================================================

CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias_produtos(id) ON DELETE SET NULL,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo produto_tipo NOT NULL DEFAULT 'produto',
  unidade TEXT DEFAULT 'UN',
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
  margem_lucro DECIMAL(5,2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  localizacao TEXT,
  foto_url TEXT,
  is_servico BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_tipo ON produtos(tipo);

-- =====================================================
-- TABELA: movimentacoes_estoque
-- =====================================================

CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo transaction_type NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  fornecedor_id UUID REFERENCES fornecedores(id),
  documento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(created_at);

-- =====================================================
-- TABELA: ordens_servico
-- =====================================================

CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_os SERIAL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  mecanico_id UUID REFERENCES mecanicos(id),
  status os_status DEFAULT 'aberta',
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  data_previsao DATE,
  data_conclusao TIMESTAMPTZ,
  km_entrada INTEGER,
  defeito_reclamado TEXT NOT NULL,
  defeito_constatado TEXT,
  servicos_executados TEXT,
  observacoes TEXT,
  fotos_urls TEXT[],
  valor_pecas DECIMAL(10,2) DEFAULT 0,
  valor_servicos DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  forma_pagamento payment_method,
  status_pagamento payment_status DEFAULT 'pendente',
  garantia_dias INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_os_numero ON ordens_servico(numero_os);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_veiculo ON ordens_servico(veiculo_id);
CREATE INDEX idx_os_status ON ordens_servico(status);
CREATE INDEX idx_os_data_abertura ON ordens_servico(data_abertura);

-- =====================================================
-- TABELA: os_itens
-- =====================================================

CREATE TABLE os_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'servico')),
  descricao TEXT NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_os_itens_os ON os_itens(os_id);
CREATE INDEX idx_os_itens_produto ON os_itens(produto_id);

-- =====================================================
-- TABELA: vendas
-- =====================================================

CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venda SERIAL UNIQUE,
  cliente_id UUID REFERENCES clientes(id),
  data_venda TIMESTAMPTZ DEFAULT NOW(),
  valor_produtos DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  forma_pagamento payment_method NOT NULL,
  status_pagamento payment_status DEFAULT 'pago',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_vendas_numero ON vendas(numero_venda);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);

-- =====================================================
-- TABELA: vendas_itens
-- =====================================================

CREATE TABLE vendas_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  descricao TEXT NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendas_itens_venda ON vendas_itens(venda_id);
CREATE INDEX idx_vendas_itens_produto ON vendas_itens(produto_id);

-- =====================================================
-- TABELA: caixa
-- =====================================================

CREATE TABLE caixa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  data_fechamento TIMESTAMPTZ,
  saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_final DECIMAL(10,2),
  total_entradas DECIMAL(10,2) DEFAULT 0,
  total_saidas DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  observacoes TEXT,
  aberto_por UUID REFERENCES profiles(id),
  fechado_por UUID REFERENCES profiles(id)
);

CREATE INDEX idx_caixa_data_abertura ON caixa(data_abertura);
CREATE INDEX idx_caixa_status ON caixa(status);

-- =====================================================
-- TABELA: movimentacoes_caixa
-- =====================================================

CREATE TABLE movimentacoes_caixa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caixa_id UUID NOT NULL REFERENCES caixa(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento payment_method,
  os_id UUID REFERENCES ordens_servico(id),
  venda_id UUID REFERENCES vendas(id),
  data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_movimentacoes_caixa_caixa ON movimentacoes_caixa(caixa_id);
CREATE INDEX idx_movimentacoes_caixa_data ON movimentacoes_caixa(data_movimentacao);

-- =====================================================
-- TABELA: contas_pagar
-- =====================================================

CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fornecedor_id UUID REFERENCES fornecedores(id),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_pago DECIMAL(10,2),
  forma_pagamento payment_method,
  status payment_status DEFAULT 'pendente',
  documento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_contas_pagar_fornecedor ON contas_pagar(fornecedor_id);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);

-- =====================================================
-- TABELA: contas_receber
-- =====================================================

CREATE TABLE contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id),
  os_id UUID REFERENCES ordens_servico(id),
  venda_id UUID REFERENCES vendas(id),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  valor_recebido DECIMAL(10,2),
  forma_pagamento payment_method,
  status payment_status DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_contas_receber_cliente ON contas_receber(cliente_id);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);

-- =====================================================
-- TABELA: agendamentos
-- =====================================================

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  veiculo_id UUID REFERENCES veiculos(id),
  mecanico_id UUID REFERENCES mecanicos(id),
  data_agendamento TIMESTAMPTZ NOT NULL,
  duracao_estimada INTEGER DEFAULT 60, -- em minutos
  servico_descricao TEXT NOT NULL,
  status appointment_status DEFAULT 'agendado',
  observacoes TEXT,
  lembrete_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- =====================================================
-- TABELA: configuracoes
-- =====================================================

CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('logo_url', '', 'URL do logotipo da oficina'),
  ('background_url', '', 'URL do fundo de tela personalizado'),
  ('nome_oficina', 'Oficina de Motos', 'Nome da oficina'),
  ('telefone_oficina', '', 'Telefone de contato'),
  ('email_oficina', '', 'Email de contato'),
  ('endereco_oficina', '', 'Endereço completo'),
  ('cnpj_oficina', '', 'CNPJ da oficina'),
  ('dias_garantia_padrao', '90', 'Dias de garantia padrão para serviços'),
  ('alerta_estoque_minimo', 'true', 'Ativar alertas de estoque mínimo');

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mecanicos_updated_at BEFORE UPDATE ON mecanicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON veiculos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS PARA ATUALIZAR ESTOQUE
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE produtos SET estoque_atual = estoque_atual + NEW.quantidade
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'saida' THEN
    UPDATE produtos SET estoque_atual = estoque_atual - NEW.quantidade
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'ajuste' THEN
    UPDATE produtos SET estoque_atual = NEW.quantidade
    WHERE id = NEW.produto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_estoque
  AFTER INSERT ON movimentacoes_estoque
  FOR EACH ROW EXECUTE FUNCTION atualizar_estoque_produto();

-- =====================================================
-- TRIGGERS PARA CALCULAR TOTAIS DE OS
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_total_os()
RETURNS TRIGGER AS $$
DECLARE
  v_valor_pecas DECIMAL(10,2);
  v_valor_servicos DECIMAL(10,2);
  v_valor_total DECIMAL(10,2);
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'produto' THEN subtotal ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tipo = 'servico' THEN subtotal ELSE 0 END), 0)
  INTO v_valor_pecas, v_valor_servicos
  FROM os_itens
  WHERE os_id = COALESCE(NEW.os_id, OLD.os_id);
  
  UPDATE ordens_servico
  SET 
    valor_pecas = v_valor_pecas,
    valor_servicos = v_valor_servicos,
    valor_total = v_valor_pecas + v_valor_servicos - COALESCE(valor_desconto, 0)
  WHERE id = COALESCE(NEW.os_id, OLD.os_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_total_os_insert
  AFTER INSERT ON os_itens
  FOR EACH ROW EXECUTE FUNCTION calcular_total_os();

CREATE TRIGGER trigger_calcular_total_os_update
  AFTER UPDATE ON os_itens
  FOR EACH ROW EXECUTE FUNCTION calcular_total_os();

CREATE TRIGGER trigger_calcular_total_os_delete
  AFTER DELETE ON os_itens
  FOR EACH ROW EXECUTE FUNCTION calcular_total_os();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mecanicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (usuários podem ver e atualizar seu próprio perfil)
CREATE POLICY "Usuários podem ver todos os perfis" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas gerais (todos os usuários autenticados podem ler)
CREATE POLICY "Usuários autenticados podem ler clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir clientes" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar clientes" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Replicar políticas similares para outras tabelas
CREATE POLICY "Usuários autenticados podem ler fornecedores" ON fornecedores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler mecanicos" ON mecanicos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler veiculos" ON veiculos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler categorias" ON categorias_produtos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler produtos" ON produtos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler ordens_servico" ON ordens_servico
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler vendas" ON vendas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler agendamentos" ON agendamentos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de inserção/atualização para todas as tabelas
CREATE POLICY "Usuários autenticados podem inserir em todas as tabelas" ON fornecedores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir mecanicos" ON mecanicos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir veiculos" ON veiculos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir categorias" ON categorias_produtos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir produtos" ON produtos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir ordens_servico" ON ordens_servico
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir vendas" ON vendas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View de produtos com baixo estoque
CREATE OR REPLACE VIEW produtos_baixo_estoque AS
SELECT 
  p.*,
  c.nome as categoria_nome
FROM produtos p
LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
WHERE p.estoque_atual <= p.estoque_minimo
  AND p.is_active = true
  AND p.is_servico = false;

-- View de contas vencidas
CREATE OR REPLACE VIEW contas_pagar_vencidas AS
SELECT *
FROM contas_pagar
WHERE status = 'pendente'
  AND data_vencimento < CURRENT_DATE;

CREATE OR REPLACE VIEW contas_receber_vencidas AS
SELECT *
FROM contas_receber
WHERE status = 'pendente'
  AND data_vencimento < CURRENT_DATE;

-- View de aniversariantes do mês
CREATE OR REPLACE VIEW aniversariantes_mes AS
SELECT 
  id,
  nome,
  telefone,
  celular,
  email,
  data_nascimento,
  EXTRACT(DAY FROM data_nascimento) as dia_aniversario
FROM clientes
WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND is_active = true
ORDER BY EXTRACT(DAY FROM data_nascimento);

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para buscar histórico de serviços de um cliente
CREATE OR REPLACE FUNCTION buscar_historico_cliente(cliente_uuid UUID)
RETURNS TABLE (
  os_id UUID,
  numero_os INTEGER,
  data_abertura TIMESTAMPTZ,
  veiculo_placa TEXT,
  defeito_reclamado TEXT,
  valor_total DECIMAL,
  status os_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    os.id,
    os.numero_os,
    os.data_abertura,
    v.placa,
    os.defeito_reclamado,
    os.valor_total,
    os.status
  FROM ordens_servico os
  JOIN veiculos v ON os.veiculo_id = v.id
  WHERE os.cliente_id = cliente_uuid
  ORDER BY os.data_abertura DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para reajuste de preços em bloco
CREATE OR REPLACE FUNCTION reajustar_precos_produtos(
  categoria_uuid UUID,
  percentual DECIMAL
)
RETURNS INTEGER AS $$
DECLARE
  registros_atualizados INTEGER;
BEGIN
  UPDATE produtos
  SET 
    preco_venda = preco_venda * (1 + percentual / 100),
    updated_at = NOW()
  WHERE (categoria_uuid IS NULL OR categoria_id = categoria_uuid)
    AND is_active = true;
  
  GET DIAGNOSTICS registros_atualizados = ROW_COUNT;
  RETURN registros_atualizados;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Categorias de produtos padrão
INSERT INTO categorias_produtos (nome, descricao) VALUES
  ('Peças Originais', 'Peças originais de fábrica'),
  ('Peças Paralelas', 'Peças alternativas'),
  ('Óleos e Lubrificantes', 'Óleos, graxas e lubrificantes'),
  ('Pneus', 'Pneus e câmaras'),
  ('Acessórios', 'Acessórios diversos'),
  ('Serviços', 'Mão de obra e serviços');

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
