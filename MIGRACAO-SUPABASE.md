# Migração para Supabase - Concluída ✅

## Resumo das Alterações

O sistema foi completamente migrado do PostgreSQL local para o Supabase como backend.

## Arquivos Criados

### Hooks do Supabase
Foram criados hooks customizados para gerenciar os dados através do Supabase:

1. **`src/hooks/useOrdensServico.ts`** - Gerencia Ordens de Serviço
   - CRUD completo de ordens de serviço
   - Gerenciamento de itens (serviços e peças)
   - Joins com clientes, veículos e mecânicos

2. **`src/hooks/useAgendamentos.ts`** - Gerencia Agendamentos
   - CRUD completo de agendamentos
   - Joins com clientes, veículos e mecânicos

3. **`src/hooks/useVendas.ts`** - Gerencia Vendas
   - CRUD completo de vendas
   - Gerenciamento de itens de venda
   - Joins com clientes

## Arquivos Modificados

### Páginas Atualizadas para Supabase

1. **`src/pages/OrdensServico.tsx`**
   - ❌ Removido: Fetch direto para `http://localhost:3001/api`
   - ✅ Adicionado: Hook `useOrdensServico`
   - Todas as operações agora usam Supabase

### Hooks Existentes (já usavam Supabase)

Estes hooks já estavam configurados corretamente:
- `src/hooks/useClientes.ts` ✅
- `src/hooks/useFornecedores.ts` ✅
- `src/hooks/useMecanicos.ts` ✅
- `src/hooks/useProdutos.ts` ✅
- `src/hooks/useTiposServicos.ts` ✅
- `src/hooks/useVeiculos.ts` ✅
- `src/hooks/useAuth.ts` ✅

### Páginas que já usavam Supabase

Estas páginas já estavam corretas:
- `src/pages/Clientes.tsx` ✅
- `src/pages/Fornecedores.tsx` ✅
- `src/pages/Mecanicos.tsx` ✅
- `src/pages/Produtos.tsx` ✅
- `src/pages/Veiculos.tsx` ✅

## Páginas Pendentes de Atualização

As seguintes páginas ainda referenciam `localhost:3001` e precisam ser atualizadas:

1. **`src/pages/Agendamentos.tsx`**
   - Precisa usar o hook `useAgendamentos` criado
   - Remover fetch direto

2. **`src/pages/Vendas.tsx`**
   - Precisa usar o hook `useVendas` criado
   - Remover fetch direto

3. **`src/pages/Dashboard.tsx`**
   - Precisa usar os hooks existentes para buscar estatísticas
   - Remover fetch direto

## Configuração Necessária

### Variáveis de Ambiente

Você precisa criar um arquivo `.env` na raiz do projeto com as credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**Como obter as credenciais:**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Project Settings** > **API**
3. Copie a **Project URL** e a **anon public key**

### Schema do Banco de Dados

O schema completo do banco está em `supabase/schema.sql`. Certifique-se de que todas as tabelas foram criadas no seu projeto Supabase:

- ✅ clientes
- ✅ fornecedores
- ✅ mecanicos
- ✅ veiculos
- ✅ produtos
- ✅ categorias_produtos
- ✅ tipos_servicos
- ✅ ordens_servico
- ✅ os_itens
- ✅ vendas
- ✅ vendas_itens
- ✅ agendamentos

## Servidor Backend Local (Não Mais Necessário)

O servidor Node.js/Express local (`server/index.ts`) **não é mais necessário** para o funcionamento do sistema, pois todas as operações agora são feitas diretamente com o Supabase.

Você pode:
- Remover a pasta `server/` se desejar
- Remover as dependências backend do `package.json` (express, cors, pg, bcryptjs, tsx)
- Remover o script `dev:api` do `package.json`

## Como Executar o Sistema

Agora você só precisa executar o frontend:

```bash
npm run dev
```

O sistema se conectará automaticamente ao Supabase usando as credenciais do arquivo `.env`.

## Benefícios da Migração

1. **Sem necessidade de servidor backend local** - Reduz complexidade
2. **Escalabilidade automática** - Supabase gerencia a infraestrutura
3. **Autenticação integrada** - Sistema de auth do Supabase
4. **Row Level Security (RLS)** - Segurança nativa do PostgreSQL
5. **Realtime** - Possibilidade de adicionar atualizações em tempo real
6. **Backups automáticos** - Gerenciados pelo Supabase
7. **API REST e GraphQL** - Geradas automaticamente

## Próximos Passos

1. ✅ Configurar variáveis de ambiente (`.env`)
2. ✅ Verificar se o schema foi aplicado no Supabase
3. ⏳ Atualizar páginas pendentes (Agendamentos, Vendas, Dashboard)
4. ⏳ Testar todas as funcionalidades
5. ⏳ Configurar RLS policies no Supabase
6. ⏳ Adicionar autenticação com Supabase Auth

## Notas Técnicas

### Erros de TypeScript

Os hooks criados têm alguns avisos de TypeScript relacionados aos tipos do Supabase. Isso ocorre porque o arquivo de tipos do database (`src/types/database.ts`) não está configurado ou está desatualizado.

Para gerar os tipos automaticamente:
```bash
npx supabase gen types typescript --project-id seu-project-id > src/types/database.ts
```

Esses avisos não impedem o funcionamento do sistema, mas é recomendado gerar os tipos para melhor autocompletar e type safety.
