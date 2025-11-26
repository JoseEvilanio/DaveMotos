# Configurar PostgreSQL Local

## 📋 Pré-requisitos

- PostgreSQL instalado (versão 12 ou superior)
- Credenciais fornecidas:
  - **Database**: moto
  - **Host**: localhost
  - **Port**: 5432
  - **Username**: postgres
  - **Password**: N1e2t3o4@2106

---

## 🚀 Passo a Passo

### 1. Executar o Script de Criação

Abra o PowerShell na pasta do projeto e execute:

```powershell
cd c:\Users\TIDesigner\Moto
.\criar-banco.ps1
```

O script irá:
- ✅ Criar o banco de dados `moto`
- ✅ Criar todas as tabelas necessárias
- ✅ Criar triggers e índices
- ✅ Inserir usuário admin padrão
- ✅ Inserir configurações iniciais

### 2. Atualizar o arquivo .env

Edite o arquivo `.env` e atualize com as credenciais do PostgreSQL local:

```env
# PostgreSQL Local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Configurações do PostgreSQL (para referência)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=moto
# DB_USER=postgres
# DB_PASSWORD=N1e2t3o4@2106
```

**IMPORTANTE**: Como estamos usando o Supabase JS Client, ele espera uma API REST. Para usar PostgreSQL local diretamente, precisamos de uma das seguintes opções:

### Opção A: Usar Supabase Local (RECOMENDADO)

1. Instalar Supabase CLI:
```bash
npm install -g supabase
```

2. Inicializar Supabase local:
```bash
supabase init
supabase start
```

3. O Supabase local criará uma API REST em `http://localhost:54321`

### Opção B: Usar pg (Node-Postgres) Diretamente

Se preferir conectar diretamente ao PostgreSQL sem Supabase:

1. Instalar dependência:
```bash
npm install pg
```

2. Criar novo arquivo de conexão:
```typescript
// src/lib/db.ts
import { Pool } from 'pg'

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'moto',
  user: 'postgres',
  password: 'N1e2t3o4@2106',
})
```

3. Atualizar os hooks para usar `pg` ao invés de Supabase client

---

## ✅ Verificar Instalação

Após executar o script, você pode verificar se tudo foi criado corretamente:

### Via psql:

```bash
psql -h localhost -p 5432 -U postgres -d moto
```

Depois execute:

```sql
-- Listar todas as tabelas
\dt

-- Ver usuário admin
SELECT * FROM users;

-- Ver configurações
SELECT * FROM configuracoes;
```

### Via pgAdmin:

1. Abra o pgAdmin
2. Conecte ao servidor localhost
3. Navegue até: Servers > PostgreSQL > Databases > moto > Schemas > public > Tables

---

## 🔐 Credenciais de Login

Após criar o banco, use estas credenciais para fazer login no sistema:

- **Email**: admin@oficina.com
- **Senha**: senha123

---

## 📊 Tabelas Criadas

O script cria as seguintes tabelas:

1. **users** - Usuários do sistema
2. **clientes** - Cadastro de clientes
3. **veiculos** - Veículos dos clientes
4. **fornecedores** - Fornecedores de peças
5. **mecanicos** - Mecânicos da oficina
6. **categorias_produtos** - Categorias de produtos
7. **produtos** - Produtos e serviços
8. **ordens_servico** - Ordens de serviço
9. **os_itens** - Itens das OS
10. **vendas** - Vendas de balcão
11. **vendas_itens** - Itens das vendas
12. **estoque_movimentacoes** - Movimentações de estoque
13. **caixa** - Caixa diário
14. **caixa_movimentacoes** - Movimentações do caixa
15. **contas_pagar** - Contas a pagar
16. **contas_receber** - Contas a receber
17. **agendamentos** - Agendamentos de serviços
18. **configuracoes** - Configurações do sistema

---

## 🔧 Troubleshooting

### Erro: "psql não é reconhecido"

O PostgreSQL não está no PATH. Adicione ao PATH:

1. Abra "Variáveis de Ambiente"
2. Edite a variável PATH
3. Adicione: `C:\Program Files\PostgreSQL\16\bin` (ajuste a versão)
4. Reinicie o PowerShell

### Erro: "senha incorreta"

Verifique se a senha está correta: `N1e2t3o4@2106`

### Erro: "banco de dados já existe"

Tudo bem! O script detecta e continua a execução.

### Erro ao conectar no sistema

Se o sistema não conectar ao banco:

1. Verifique se o PostgreSQL está rodando
2. Confirme que o banco `moto` foi criado
3. Verifique as credenciais no `.env`

---

## 🎯 Próximos Passos

Após configurar o banco:

1. ✅ Reinicie o servidor: `npm run dev`
2. ✅ Acesse: http://localhost:3002
3. ✅ Faça login com: admin@oficina.com / senha123
4. ✅ Teste o módulo de Clientes

---

**Última atualização**: 27/10/2025
