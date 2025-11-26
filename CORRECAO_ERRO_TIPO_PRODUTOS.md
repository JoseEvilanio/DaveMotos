# Correção do Erro: "Could not find the 'tipo' column"

## 🔴 Problema Identificado

**Erro:**
```
POST https://axichcfsgzvzilrnowjl.supabase.co/rest/v1/produtos 400 (Bad Request)
{code: 'PGRST204', details: null, hint: null, 
 message: "Could not find the 'tipo' column of 'produtos' in the schema cache"}
```

**Causa Raiz:**
- O código TypeScript (`src/hooks/useProdutos.ts`) define a interface `Produto` com uma coluna `tipo: 'produto' | 'servico'`
- O banco de dados Supabase atual **não possui** essa coluna
- O banco só tem a coluna `is_servico: boolean`

## ✅ Solução Implementada

### Arquivos Criados/Modificados:

1. **`supabase/migrations/002_add_tipo_column_produtos.sql`**
   - Migration para adicionar a coluna `tipo` ao banco de dados
   - Cria o ENUM `produto_tipo` com valores 'produto' e 'servico'
   - Migra dados existentes de `is_servico` para `tipo`

2. **`supabase/schema.sql`** (atualizado)
   - Schema principal atualizado com a nova coluna
   - Para referência futura e novos ambientes

3. **`APLICAR_MIGRACAO_TIPO.md`**
   - Guia completo de como aplicar a migração
   - Três opções diferentes (SQL Editor, CLI, SQL direto)

4. **`database/add-tipo-column-produtos.sql`**
   - Versão para PostgreSQL local (se aplicável)

## 🚀 Como Resolver AGORA

### Opção Rápida (5 minutos):

1. **Acesse o Supabase Dashboard:**
   - https://app.supabase.com
   - Selecione seu projeto
   - Vá em **SQL Editor**

2. **Execute este SQL:**
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

3. **Recarregar o Schema Cache:**
   - No Supabase: **Settings** > **API** > **Reload schema**

4. **Reiniciar a Aplicação:**
   ```bash
   # Parar o servidor (Ctrl+C)
   npm run dev
   ```

## 📋 Verificação

Após aplicar, execute no SQL Editor:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'produtos' AND column_name = 'tipo';
```

**Resultado esperado:**
```
column_name | data_type    | is_nullable | column_default
------------|--------------|-------------|----------------
tipo        | USER-DEFINED | NO          | 'produto'::produto_tipo
```

## 🎯 O Que Foi Corrigido

### Antes:
```typescript
// Interface TypeScript
interface Produto {
  tipo: 'produto' | 'servico'  // ❌ Coluna não existe no banco
  is_servico: boolean           // ✅ Existe no banco
}
```

### Depois:
```typescript
// Interface TypeScript
interface Produto {
  tipo: 'produto' | 'servico'  // ✅ Agora existe no banco
  is_servico: boolean           // ✅ Mantido para compatibilidade
}
```

### Banco de Dados:
```sql
-- Antes
CREATE TABLE produtos (
  ...
  is_servico BOOLEAN DEFAULT false,  -- Apenas boolean
  ...
);

-- Depois
CREATE TABLE produtos (
  ...
  tipo produto_tipo NOT NULL DEFAULT 'produto',  -- ENUM adicionado
  is_servico BOOLEAN DEFAULT false,               -- Mantido
  ...
);
```

## 📝 Notas Importantes

1. **Sem Perda de Dados:** Todos os produtos existentes são migrados automaticamente
2. **Sem Downtime:** A migração é instantânea
3. **Compatibilidade:** A coluna `is_servico` é mantida para compatibilidade
4. **Indexação:** Índice criado para melhor performance

## 🔄 Migração de Dados

A migração converte automaticamente:
- `is_servico = true` → `tipo = 'servico'`
- `is_servico = false` → `tipo = 'produto'`

## 📚 Documentação Adicional

Para mais detalhes, consulte:
- `APLICAR_MIGRACAO_TIPO.md` - Guia completo com todas as opções
- `supabase/migrations/002_add_tipo_column_produtos.sql` - Código da migração

## ⚠️ Rollback (Se Necessário)

Se algo der errado:
```sql
ALTER TABLE produtos DROP COLUMN IF EXISTS tipo;
DROP TYPE IF EXISTS produto_tipo;
```

## ✨ Próximos Passos

Após aplicar a migração:
1. ✅ Erro "Could not find the 'tipo' column" será resolvido
2. ✅ Cadastro de produtos funcionará normalmente
3. ✅ Filtros por tipo (produto/serviço) funcionarão
4. ✅ Sistema estará totalmente funcional

---

**Status:** 🔴 Migração pendente - Execute os passos acima para resolver
**Tempo estimado:** 5 minutos
**Complexidade:** Baixa
