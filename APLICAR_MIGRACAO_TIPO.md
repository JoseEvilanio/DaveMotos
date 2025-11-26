# Como Aplicar a Migração - Coluna 'tipo' na Tabela produtos

## Problema Identificado

O erro `Could not find the 'tipo' column of 'produtos' in the schema cache` ocorre porque:
- O código TypeScript espera uma coluna `tipo` (enum: 'produto' | 'servico')
- O banco de dados atual só tem a coluna `is_servico` (boolean)

## Solução

Adicionar a coluna `tipo` ao banco de dados Supabase.

---

## Opção 1: Aplicar via SQL Editor do Supabase (RECOMENDADO)

### Passo 1: Acessar o SQL Editor
1. Acesse o dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar a Migration
1. Clique em **New Query**
2. Cole o conteúdo do arquivo: `supabase/migrations/002_add_tipo_column_produtos.sql`
3. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Verificar
Execute esta query para confirmar:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'produtos' 
AND column_name = 'tipo';
```

Deve retornar:
```
column_name | data_type
------------|----------
tipo        | USER-DEFINED
```

---

## Opção 2: Aplicar via Supabase CLI

### Pré-requisitos
```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase
```

### Passos
```bash
# 1. Login no Supabase
supabase login

# 2. Link com seu projeto
supabase link --project-ref axichcfsgzvzilrnowjl

# 3. Aplicar a migração
supabase db push

# 4. Verificar status
supabase db diff
```

---

## Opção 3: Executar SQL Direto (Rápido)

Copie e execute este SQL no SQL Editor do Supabase:

```sql
-- Criar tipo ENUM
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
  END IF;
END $$;

-- Adicionar coluna
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS tipo produto_tipo;

-- Atualizar dados existentes
UPDATE produtos 
SET tipo = CASE 
  WHEN is_servico = true THEN 'servico'::produto_tipo 
  ELSE 'produto'::produto_tipo 
END
WHERE tipo IS NULL;

-- Tornar NOT NULL
ALTER TABLE produtos 
ALTER COLUMN tipo SET NOT NULL;

-- Definir padrão
ALTER TABLE produtos 
ALTER COLUMN tipo SET DEFAULT 'produto'::produto_tipo;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);
```

---

## Após Aplicar a Migração

### 1. Limpar Cache do Supabase
No dashboard do Supabase:
- Vá em **Settings** > **API**
- Role até **Schema Cache**
- Clique em **Reload schema**

### 2. Reiniciar a Aplicação
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 3. Testar
- Acesse a página de Produtos
- Tente criar/editar um produto
- O erro não deve mais aparecer

---

## Verificação de Sucesso

Execute no SQL Editor:
```sql
-- Ver estrutura da tabela produtos
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'produtos'
ORDER BY ordinal_position;
```

A coluna `tipo` deve aparecer na lista.

---

## Rollback (Se Necessário)

Se algo der errado, você pode reverter:
```sql
-- Remover coluna tipo
ALTER TABLE produtos DROP COLUMN IF EXISTS tipo;

-- Remover tipo ENUM
DROP TYPE IF EXISTS produto_tipo;
```

---

## Notas Importantes

1. **Backup**: O Supabase faz backup automático, mas é sempre bom ter certeza
2. **Downtime**: Esta migração é rápida e não causa downtime
3. **Dados Existentes**: Todos os produtos existentes serão automaticamente classificados:
   - `is_servico = true` → `tipo = 'servico'`
   - `is_servico = false` → `tipo = 'produto'`
4. **Compatibilidade**: A coluna `is_servico` permanece no banco (não é removida)

---

## Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Confirme que você tem permissões de admin no projeto
3. Tente recarregar o schema cache
4. Reinicie a aplicação
