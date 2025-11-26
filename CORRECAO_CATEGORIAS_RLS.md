# Correção: Categorias Não Carregam - Problema de RLS

## 🔴 Problema Identificado

**Sintomas:**
- Dropdown de categorias aparece vazio no formulário de produtos
- Nenhum erro visível no console do navegador
- A requisição ao Supabase retorna vazio ou erro 403

**Causa Raiz:**
A tabela `categorias_produtos` tem **Row Level Security (RLS) habilitado** mas **não possui políticas RLS definidas**. Isso bloqueia todo o acesso à tabela, mesmo para usuários autenticados.

```sql
-- RLS está habilitado
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;

-- ❌ MAS NÃO HÁ POLÍTICAS! Isso bloqueia tudo!
```

## ✅ Solução

Adicionar políticas RLS para permitir que usuários autenticados acessem as categorias.

---

## 🚀 Como Resolver (Escolha uma opção)

### Opção 1: SQL Direto no Supabase (MAIS RÁPIDO - 2 minutos)

1. **Acesse o Supabase Dashboard:**
   - https://app.supabase.com
   - Selecione seu projeto
   - Vá em **SQL Editor**

2. **Execute este SQL:**

```sql
-- Adicionar políticas RLS para categorias_produtos

-- Permitir leitura (SELECT)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ler categorias" 
  ON categorias_produtos 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Permitir inserção (INSERT)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem inserir categorias" 
  ON categorias_produtos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização (UPDATE)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem atualizar categorias" 
  ON categorias_produtos 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Permitir exclusão (DELETE)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem deletar categorias" 
  ON categorias_produtos 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
```

3. **Clique em "Run"** ou pressione `Ctrl+Enter`

4. **Verifique se funcionou:**
```sql
-- Deve retornar as categorias
SELECT * FROM categorias_produtos;
```

5. **Teste no frontend:**
   - Recarregue a página de produtos
   - O dropdown de categorias deve aparecer preenchido

---

### Opção 2: Aplicar Migration via Arquivo

1. **O arquivo de migração já foi criado:**
   - `supabase/migrations/003_add_categorias_rls_policies.sql`

2. **Copie o conteúdo e execute no SQL Editor do Supabase**

---

## 🔍 Verificação

### 1. Verificar Políticas RLS

Execute no SQL Editor:

```sql
-- Ver todas as políticas da tabela categorias_produtos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'categorias_produtos';
```

**Resultado esperado:** Deve retornar 4 políticas (SELECT, INSERT, UPDATE, DELETE)

### 2. Testar Acesso

```sql
-- Como usuário autenticado, deve retornar as categorias
SELECT * FROM categorias_produtos WHERE is_active = true;
```

### 3. Verificar no Frontend

1. Abra a página de Produtos
2. Clique em "Novo Item"
3. O dropdown "Categoria" deve mostrar as opções:
   - Peças Originais
   - Peças Paralelas
   - Óleos e Lubrificantes
   - Pneus
   - Acessórios
   - Serviços

---

## 📊 Diagnóstico Completo

### Verificar se o problema é RLS:

```sql
-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'categorias_produtos';
-- rowsecurity deve ser 't' (true)

-- 2. Contar políticas existentes
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'categorias_produtos';
-- Deve retornar 4 (ou mais)

-- 3. Verificar dados na tabela
SELECT COUNT(*) as total_categorias
FROM categorias_produtos;
-- Deve retornar 6 (categorias padrão)

-- 4. Testar acesso com RLS
SET ROLE authenticated;
SELECT * FROM categorias_produtos;
-- Deve retornar as categorias (não vazio)
```

---

## 🎯 Entendendo o Problema

### O que é RLS (Row Level Security)?

RLS é um recurso de segurança do PostgreSQL/Supabase que controla quem pode acessar quais linhas de uma tabela.

### Como funciona:

```
┌─────────────────────────────────────┐
│  Usuário tenta acessar a tabela    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  RLS está habilitado?               │
├─────────────────────────────────────┤
│  ✅ SIM                             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Existem políticas RLS?             │
├─────────────────────────────────────┤
│  ❌ NÃO → BLOQUEIA TUDO!            │
│  ✅ SIM → Verifica políticas        │
└─────────────────────────────────────┘
```

### No nosso caso:

```sql
-- ✅ RLS habilitado
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;

-- ❌ Sem políticas = Ninguém acessa!
-- (nem mesmo usuários autenticados)

-- ✅ Solução: Adicionar políticas
CREATE POLICY "..." ON categorias_produtos ...
```

---

## 🔧 Outras Tabelas Afetadas

Verifique se outras tabelas também estão sem políticas:

```sql
-- Listar tabelas com RLS mas sem políticas
SELECT 
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.tablename, t.rowsecurity
HAVING COUNT(p.policyname) = 0;
```

Se encontrar outras tabelas, aplique políticas similares.

---

## 📝 Políticas Aplicadas

### SELECT (Leitura)
```sql
CREATE POLICY "Usuários autenticados podem ler categorias" 
  ON categorias_produtos 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
```
**Permite:** Qualquer usuário autenticado pode ler as categorias

### INSERT (Criação)
```sql
CREATE POLICY "Usuários autenticados podem inserir categorias" 
  ON categorias_produtos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
```
**Permite:** Qualquer usuário autenticado pode criar categorias

### UPDATE (Atualização)
```sql
CREATE POLICY "Usuários autenticados podem atualizar categorias" 
  ON categorias_produtos 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');
```
**Permite:** Qualquer usuário autenticado pode atualizar categorias

### DELETE (Exclusão)
```sql
CREATE POLICY "Usuários autenticados podem deletar categorias" 
  ON categorias_produtos 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
```
**Permite:** Qualquer usuário autenticado pode deletar categorias

---

## ⚠️ Segurança

As políticas criadas permitem acesso total para **usuários autenticados**. 

Se precisar de controle mais granular (ex: apenas admins podem criar/editar):

```sql
-- Exemplo: Apenas admins podem modificar
CREATE POLICY "Apenas admins podem modificar categorias" 
  ON categorias_produtos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 🎉 Resultado Esperado

Após aplicar a correção:

1. ✅ Dropdown de categorias carrega normalmente
2. ✅ Produtos podem ser cadastrados com categoria
3. ✅ Filtros por categoria funcionam
4. ✅ Relatórios por categoria funcionam

---

## 🆘 Troubleshooting

### Problema: Ainda não carrega

**Verifique:**
1. Você está logado no sistema?
2. O token de autenticação é válido?
3. Execute no console do navegador:
```javascript
const { data, error } = await supabase
  .from('categorias_produtos')
  .select('*')
console.log('Data:', data)
console.log('Error:', error)
```

### Problema: Erro 403 Forbidden

**Causa:** Políticas não foram aplicadas corretamente

**Solução:**
1. Verifique se as políticas existem (query acima)
2. Reaplique o SQL
3. Faça logout e login novamente

### Problema: Erro "relation does not exist"

**Causa:** Tabela não existe no banco

**Solução:**
```sql
-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados padrão
INSERT INTO categorias_produtos (nome, descricao) VALUES
  ('Peças Originais', 'Peças originais de fábrica'),
  ('Peças Paralelas', 'Peças alternativas'),
  ('Óleos e Lubrificantes', 'Óleos, graxas e lubrificantes'),
  ('Pneus', 'Pneus e câmaras'),
  ('Acessórios', 'Acessórios diversos'),
  ('Serviços', 'Mão de obra e serviços')
ON CONFLICT (nome) DO NOTHING;
```

---

**Status:** 🔴 Correção pendente - Execute o SQL acima
**Tempo estimado:** 2 minutos
**Complexidade:** Baixa
**Impacto:** Alto (bloqueia cadastro de produtos)
