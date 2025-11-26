-- =====================================================
-- SISTEMA DE OFICINA DE MOTOS - SCHEMA INICIAL
-- Progressive Web App com Supabase
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TIPOS ENUMERADOS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'mecanico', 'atendente');
CREATE TYPE os_status AS ENUM ('aberta', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada');
CREATE TYPE payment_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');
CREATE TYPE payment_method AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'cheque');
CREATE TYPE transaction_type AS ENUM ('entrada', 'saida', 'ajuste');
CREATE TYPE appointment_status AS ENUM ('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado');

-- =====================================================
-- TABELA: profiles (perfis de usuários)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'atendente',
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
  cpf TEXT,
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
  created_by UUID REFERENCES auth.users(id)
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
  cnpj TEXT,
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
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_fornecedores_razao_social ON fornecedores(razao_social);
CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj);

-- =====================================================
-- TABELA: mecanicos
-- =====================================================

CREATE TABLE mecanicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  cpf TEXT,
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
  created_by UUID REFERENCES auth.users(id)
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
  placa TEXT NOT NULL,
  chassi TEXT,
  renavam TEXT,
  km_atual INTEGER,
  fotos_urls TEXT[],
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
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
  categoria_id UUID REFERENCES categorias_produtos(id),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  unidade TEXT DEFAULT 'UN',
  preco_custo DECIMAL(10,2) DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL,
  margem_lucro DECIMAL(5,2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  localizacao TEXT,
  foto_url TEXT,
  is_servico BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);

-- =====================================================
-- TABELA: servicos
-- =====================================================

CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  tempo_estimado INTEGER, -- em minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_servicos_nome ON servicos(nome);

-- =====================================================
-- TABELA: ordens_servico
-- =====================================================

CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_os SERIAL UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  mecanico_id UUID REFERENCES mecanicos(id),
  status os_status DEFAULT 'aberta',
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  data_previsao TIMESTAMPTZ,
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
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_os_numero ON ordens_servico(numero_os);
CREATE INDEX idx_os_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX idx_os_veiculo_id ON ordens_servico(veiculo_id);
CREATE INDEX idx_os_mecanico_id ON ordens_servico(mecanico_id);
CREATE INDEX idx_os_status ON ordens_servico(status);
CREATE INDEX idx_os_data_abertura ON ordens_servico(data_abertura);

-- =====================================================
-- TABELA: os_itens (itens da ordem de serviço)
-- =====================================================

CREATE TABLE os_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'servico')),
  descricao TEXT NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_os_itens_os_id ON os_itens(os_id);
CREATE INDEX idx_os_itens_produto_id ON os_itens(produto_id);

-- =====================================================
-- TABELA: vendas
-- =====================================================

CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venda SERIAL UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  data_venda TIMESTAMPTZ DEFAULT NOW(),
  valor_produtos DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  forma_pagamento payment_method NOT NULL,
  status_pagamento payment_status DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);

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
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_agendamentos_cliente_id ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_mecanico_id ON agendamentos(mecanico_id);

-- =====================================================
-- TABELA: configuracoes
-- =====================================================

CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave TEXT NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
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

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular valor total da OS
CREATE OR REPLACE FUNCTION calculate_os_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ordens_servico
  SET valor_total = valor_pecas + valor_servicos - valor_desconto
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_os_total_trigger
AFTER INSERT OR UPDATE OF valor_pecas, valor_servicos, valor_desconto ON ordens_servico
FOR EACH ROW EXECUTE FUNCTION calculate_os_total();

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
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para clientes (todos usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem deletar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas similares para outras tabelas
CREATE POLICY "Usuários autenticados podem ver fornecedores"
  ON fornecedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar fornecedores"
  ON fornecedores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar fornecedores"
  ON fornecedores FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver mecânicos"
  ON mecanicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar mecânicos"
  ON mecanicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar mecânicos"
  ON mecanicos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver veículos"
  ON veiculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar veículos"
  ON veiculos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar veículos"
  ON veiculos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver categorias"
  ON categorias_produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins podem gerenciar categorias"
  ON categorias_produtos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Usuários autenticados podem ver produtos"
  ON produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar produtos"
  ON produtos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON produtos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver serviços"
  ON servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar serviços"
  ON servicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar serviços"
  ON servicos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver OS"
  ON ordens_servico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar OS"
  ON ordens_servico FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar OS"
  ON ordens_servico FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver itens OS"
  ON os_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar itens OS"
  ON os_itens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar itens OS"
  ON os_itens FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver vendas"
  ON vendas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar vendas"
  ON vendas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ver agendamentos"
  ON agendamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem criar agendamentos"
  ON agendamentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar agendamentos"
  ON agendamentos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins podem ver configurações"
  ON configuracoes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins podem gerenciar configurações"
  ON configuracoes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('oficina_nome', 'Oficina de Motos', 'Nome da oficina'),
  ('oficina_telefone', '', 'Telefone da oficina'),
  ('oficina_email', '', 'E-mail da oficina'),
  ('oficina_endereco', '', 'Endereço completo da oficina'),
  ('garantia_padrao_dias', '90', 'Garantia padrão em dias'),
  ('notificacao_push_enabled', 'true', 'Habilitar notificações push');

-- Inserir categorias de produtos padrão
INSERT INTO categorias_produtos (nome, descricao) VALUES
  ('Peças de Motor', 'Peças relacionadas ao motor'),
  ('Peças de Freio', 'Peças do sistema de freios'),
  ('Peças Elétricas', 'Componentes elétricos'),
  ('Pneus e Câmaras', 'Pneus, câmaras e acessórios'),
  ('Óleos e Lubrificantes', 'Óleos, graxas e lubrificantes'),
  ('Acessórios', 'Acessórios diversos');
