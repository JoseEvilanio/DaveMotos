# Como Criar o Banco de Dados no Supabase

## ⚠️ IMPORTANTE
Você está recebendo erro **404 (Not Found)** porque as tabelas ainda não foram criadas no Supabase.

## Passo a Passo para Criar as Tabelas

### 1. Acesse o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto (URL: `https://axichcfsgzvzilrnowjl.supabase.co`)

### 2. Abra o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados)
2. Clique em **New Query** para criar uma nova query

### 3. Execute o Schema

1. Abra o arquivo `supabase/schema.sql` deste projeto
2. **Copie TODO o conteúdo** do arquivo (767 linhas)
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 4. Verifique se as Tabelas Foram Criadas

Após executar o schema, verifique se as tabelas foram criadas:

1. No menu lateral, clique em **Table Editor**
2. Você deve ver todas estas tabelas:
   - ✅ profiles
   - ✅ clientes
   - ✅ fornecedores
   - ✅ mecanicos
   - ✅ veiculos
   - ✅ categorias_produtos
   - ✅ produtos
   - ✅ movimentacoes_estoque
   - ✅ tipos_servicos
   - ✅ **ordens_servico** ← Esta é a que está faltando!
   - ✅ os_itens
   - ✅ vendas
   - ✅ vendas_itens
   - ✅ caixa
   - ✅ movimentacoes_caixa
   - ✅ contas_pagar
   - ✅ contas_receber
   - ✅ agendamentos
   - ✅ configuracoes

### 5. Configure as Variáveis de Ambiente

Se ainda não fez, crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://axichcfsgzvzilrnowjl.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**Para obter a chave:**
1. No Supabase Dashboard, vá em **Project Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie a **anon public** key (NÃO use a service_role key!)

### 6. Reinicie o Sistema

Após criar as tabelas e configurar o `.env`:

```bash
# Pare o servidor se estiver rodando (Ctrl+C)
# Inicie novamente
npm run dev
```

## Solução de Problemas

### Erro: "permission denied for schema public"

Se receber este erro, execute este comando no SQL Editor:

```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
```

### Erro: "extension uuid-ossp does not exist"

As extensões devem ser habilitadas automaticamente, mas se não funcionarem, execute:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Erro: "type already exists"

Se você já executou o schema parcialmente, pode precisar dropar os tipos primeiro:

```sql
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS os_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
```

Depois execute o schema completo novamente.

## Verificação Final

Após criar as tabelas, teste se está funcionando:

1. Abra o sistema no navegador
2. Vá para a página de **Ordens de Serviço**
3. O erro 404 deve desaparecer
4. A página deve carregar (mesmo que vazia, sem dados)

## Dados de Teste (Opcional)

Se quiser adicionar alguns dados de teste, execute no SQL Editor:

```sql
-- Inserir um cliente de teste
INSERT INTO clientes (nome, telefone, cpf, email, cidade)
VALUES ('João Silva', '(11) 98765-4321', '123.456.789-00', 'joao@email.com', 'São Paulo');

-- Inserir um veículo de teste
INSERT INTO veiculos (cliente_id, marca, modelo, ano, placa)
SELECT id, 'Honda', 'CG 160', 2023, 'ABC-1234'
FROM clientes WHERE nome = 'João Silva';

-- Inserir um mecânico de teste
INSERT INTO mecanicos (nome, cpf, telefone)
VALUES ('Carlos Mecânico', '987.654.321-00', '(11) 91234-5678');

-- Inserir uma OS de teste
INSERT INTO ordens_servico (cliente_id, veiculo_id, defeito_reclamado, status)
SELECT 
  c.id,
  v.id,
  'Revisão dos 10.000 km',
  'aberta'
FROM clientes c
JOIN veiculos v ON v.cliente_id = c.id
WHERE c.nome = 'João Silva';
```

## Próximos Passos

Após criar o banco:

1. ✅ Testar todas as páginas do sistema
2. ✅ Criar usuários no Supabase Auth
3. ✅ Configurar RLS (Row Level Security) para produção
4. ✅ Fazer backup regular dos dados

## Suporte

Se continuar com problemas:
1. Verifique o console do navegador (F12) para ver erros detalhados
2. Verifique os logs do Supabase em **Logs** > **Postgres Logs**
3. Certifique-se de que o arquivo `.env` está configurado corretamente
