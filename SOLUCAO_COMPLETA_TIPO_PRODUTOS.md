# 🎯 Solução Completa: Erro ao Salvar Produto

## ❌ Erro Atual

```
{code: 'PGRST204', message: "Could not find the 'tipo' column of 'produtos' in the schema cache"}
```

## ✅ Solução em 3 Passos

### PASSO 1: Executar Script no Supabase

1. **Acesse o Supabase Dashboard**
2. **Vá em SQL Editor**
3. **Cole e execute este script:**

```sql
-- Criar ENUM
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
  END IF;
END $$;

-- Adicionar coluna tipo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'produtos' 
    AND column_name = 'tipo'
  ) THEN
    ALTER TABLE produtos ADD COLUMN tipo produto_tipo NOT NULL DEFAULT 'produto';
    
    -- Migrar dados existentes
    UPDATE produtos 
    SET tipo = CASE 
      WHEN is_servico = true THEN 'servico'::produto_tipo 
      ELSE 'produto'::produto_tipo 
    END;
    
    -- Criar índice
    CREATE INDEX idx_produtos_tipo ON produtos(tipo);
  END IF;
END $$;

-- Recarregar schema cache
NOTIFY pgrst, 'reload schema';

-- Verificar
SELECT 'Coluna tipo adicionada com sucesso!' as status;
```

### PASSO 2: Aguardar Cache Atualizar

⏱️ **Aguarde 30-60 segundos** para o Supabase atualizar o cache do schema.

### PASSO 3: Recarregar a Aplicação

1. No navegador, pressione **Ctrl+Shift+R** (hard reload)
2. Ou feche e abra novamente

## 🧪 Testar

1. Vá em **Produtos**
2. Clique em **Novo Produto**
3. Preencha:
   - **Nome:** Teste
   - **Tipo:** Produto
   - **Preço de Venda:** 10.00
4. Clique em **Salvar**

Deve salvar sem erros! ✅

## 📋 Alterações Realizadas

### Arquivos Modificados:

1. ✅ `src/components/produtos/ProdutoForm.tsx` - Busca categorias do Supabase
2. ✅ `src/types/database.ts` - Adicionado tipo `ProdutoTipo` e coluna `tipo`
3. ✅ `src/hooks/useProdutos.ts` - Atualizado para usar `ProdutoTipo`

### Scripts Criados:

- `ADICIONAR_COLUNA_TIPO_PRODUTOS.sql` - Script completo
- `adicionar-tipo-simples.sql` - Script simplificado
- `inserir-categorias-padrao.sql` - Categorias padrão

## ⚠️ Importante

- A coluna `is_servico` será mantida por compatibilidade
- Novos registros usarão a coluna `tipo`
- Se o erro persistir após 1 minuto, faça logout e login novamente

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'produtos' 
AND column_name = 'tipo';

-- Deve retornar:
-- column_name | data_type
-- tipo        | USER-DEFINED
```

## 📞 Se Ainda Houver Erro

1. Verifique se o script foi executado com sucesso
2. Aguarde mais 1 minuto
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Faça logout e login novamente no sistema
5. Se persistir, execute: `SELECT pg_notify('pgrst', 'reload schema');`

## ✨ Resultado Esperado

Após seguir todos os passos:
- ✅ Categorias aparecem no formulário
- ✅ Produtos podem ser salvos
- ✅ Serviços podem ser salvos
- ✅ Sistema funciona 100% com Supabase
