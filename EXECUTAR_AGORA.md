# 🚀 EXECUTAR AGORA - Correção Urgente

## 📌 Problema
Não consegue salvar produtos - erro: "Could not find the 'tipo' column"

## ⚡ Solução Rápida (3 minutos)

### 1️⃣ Abra o Supabase Dashboard
- Acesse: https://supabase.com/dashboard
- Entre no seu projeto

### 2️⃣ Vá no SQL Editor
- Menu lateral → SQL Editor
- Clique em "New query"

### 3️⃣ Cole e Execute Este Script

```sql
-- SCRIPT DE CORREÇÃO RÁPIDA
CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');

ALTER TABLE produtos ADD COLUMN tipo produto_tipo NOT NULL DEFAULT 'produto';

UPDATE produtos 
SET tipo = CASE 
  WHEN is_servico = true THEN 'servico'::produto_tipo 
  ELSE 'produto'::produto_tipo 
END;

CREATE INDEX idx_produtos_tipo ON produtos(tipo);

NOTIFY pgrst, 'reload schema';

SELECT 'SUCESSO! Aguarde 30 segundos e recarregue a aplicação' as resultado;
```

### 4️⃣ Aguarde 30 Segundos
⏱️ O Supabase precisa atualizar o cache

### 5️⃣ Recarregue a Aplicação
- Pressione **Ctrl+Shift+R** no navegador
- Ou feche e abra novamente

### 6️⃣ Teste
- Vá em Produtos → Novo Produto
- Preencha e salve
- Deve funcionar! ✅

## ❓ Se Der Erro no Script

Use este script alternativo:

```sql
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE produtos ADD COLUMN tipo produto_tipo NOT NULL DEFAULT 'produto';
    
    UPDATE produtos 
    SET tipo = CASE 
      WHEN is_servico = true THEN 'servico'::produto_tipo 
      ELSE 'produto'::produto_tipo 
    END;
    
    CREATE INDEX idx_produtos_tipo ON produtos(tipo);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
```

## ✅ Pronto!
Após executar, o sistema estará funcionando normalmente.
