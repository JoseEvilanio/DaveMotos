# 🔧 Correção: Erro preco_base na Tabela servicos

## ❌ Erro Identificado

```
message: "Could not find the 'preco_base' column of 'servicos' in the schema cache"
```

**Causa:** A coluna `preco_base` não existe na tabela `servicos` do Supabase.

## ✅ Solução Rápida

### 1️⃣ Execute o Script no Supabase

1. **Acesse o Supabase Dashboard**
2. **Vá em SQL Editor**
3. **Abra o arquivo:** `ADICIONAR_PRECO_BASE_SERVICOS.sql`
4. **Copie todo o conteúdo**
5. **Cole no SQL Editor**
6. **Clique em Run** (ou Ctrl+Enter)

### 2️⃣ O Que o Script Faz

- ✅ Cria a tabela `servicos` se não existir
- ✅ Adiciona a coluna `preco_base` (NUMERIC)
- ✅ Adiciona colunas `tempo_estimado` e `is_active`
- ✅ Cria índices para performance
- ✅ Insere 10 serviços padrão
- ✅ Configura políticas RLS (Row Level Security)
- ✅ Recarrega o cache do schema

### 3️⃣ Aguarde 30-60 Segundos

⏱️ O Supabase precisa atualizar o cache do schema.

### 4️⃣ Recarregue a Aplicação

- Pressione **Ctrl+Shift+R** no navegador
- Ou feche e abra novamente

### 5️⃣ Teste

1. Vá na página de **Serviços**
2. Clique em **Novo Serviço**
3. Preencha os campos
4. Salve

Deve funcionar! ✅

## 📋 Serviços Padrão Incluídos

O script já insere 10 serviços comuns:
- Troca de Óleo (R$ 80,00)
- Revisão Geral (R$ 150,00)
- Troca de Pneu (R$ 50,00)
- Regulagem de Freios (R$ 60,00)
- Limpeza de Carburador (R$ 100,00)
- Troca de Corrente (R$ 70,00)
- Alinhamento (R$ 40,00)
- Troca de Bateria (R$ 30,00)
- Regulagem de Motor (R$ 120,00)
- Manutenção Preventiva (R$ 200,00)

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'servicos' 
AND column_name = 'preco_base';

-- Verificar serviços
SELECT id, nome, preco_base FROM servicos WHERE is_active = true;
```

## 📝 Alterações no Código

- ✅ `src/types/database.ts` - Atualizado para usar `preco_base`
- ✅ `src/hooks/useTiposServicos.ts` - Já estava correto

## ⚠️ Importante

- A tabela `servicos` é diferente de `tipos_servicos`
- O hook `useTiposServicos` busca da tabela `servicos`
- Certifique-se de executar o script completo

## 🎯 Resultado Esperado

Após executar:
- ✅ Tabela `servicos` criada/atualizada
- ✅ Coluna `preco_base` disponível
- ✅ 10 serviços padrão cadastrados
- ✅ Sistema funciona sem erros
