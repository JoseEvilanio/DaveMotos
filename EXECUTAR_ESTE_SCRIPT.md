# 🚀 EXECUTAR ESTE SCRIPT - Correção Definitiva

## 📌 Problemas que Este Script Resolve

1. ❌ Categorias não aparecem no formulário de produtos
2. ❌ Erro ao salvar produto: coluna 'tipo' não encontrada
3. ❌ Erro ao salvar serviço: coluna 'preco_base' não encontrada

## ⚡ Solução em 1 Único Script

### 1️⃣ Abra o Supabase Dashboard
- Acesse: https://supabase.com/dashboard
- Entre no seu projeto

### 2️⃣ Vá no SQL Editor
- Menu lateral → **SQL Editor**
- Clique em **New query**

### 3️⃣ Execute Este Script Único

Abra o arquivo: **`CORRECAO_COMPLETA_TODAS_TABELAS.sql`**

Copie TODO o conteúdo e cole no SQL Editor, depois clique em **Run**.

## ✅ O Que o Script Faz

### Tabela `categorias_produtos`
- ✅ Cria a tabela se não existir
- ✅ Insere 13 categorias padrão
- ✅ Configura RLS (políticas de segurança)

### Tabela `produtos`
- ✅ Adiciona coluna `tipo` (produto/servico)
- ✅ Migra dados existentes
- ✅ Cria índices

### Tabela `servicos`
- ✅ Cria a tabela se não existir
- ✅ Adiciona coluna `preco_base`
- ✅ Insere 10 serviços padrão
- ✅ Configura RLS

### Geral
- ✅ Recarrega o cache do schema
- ✅ Mostra resumo das alterações

## ⏱️ Após Executar

1. **Aguarde 30-60 segundos** (cache do Supabase)
2. **Recarregue a aplicação** (Ctrl+Shift+R)
3. **Teste:**
   - Criar produto → deve mostrar categorias
   - Salvar produto → deve funcionar
   - Criar serviço → deve funcionar

## 📊 Dados Incluídos

### 13 Categorias de Produtos:
- Peças, Acessórios, Lubrificantes, Pneus
- Elétrica, Freios, Suspensão, Motor
- Transmissão, Filtros, Escapamento
- Carroceria, Outros

### 10 Serviços Padrão:
- Troca de Óleo (R$ 80)
- Revisão Geral (R$ 150)
- Troca de Pneu (R$ 50)
- Regulagem de Freios (R$ 60)
- Limpeza de Carburador (R$ 100)
- Troca de Corrente (R$ 70)
- Alinhamento (R$ 40)
- Troca de Bateria (R$ 30)
- Regulagem de Motor (R$ 120)
- Manutenção Preventiva (R$ 200)

## 🎯 Resultado Final

Após executar este script:
- ✅ Sistema 100% funcional
- ✅ Todas as tabelas corrigidas
- ✅ Dados padrão inseridos
- ✅ Sem erros ao salvar

## 📝 Arquivos Relacionados

- **`CORRECAO_COMPLETA_TODAS_TABELAS.sql`** ⭐ - **EXECUTE ESTE**
- `ADICIONAR_COLUNA_TIPO_PRODUTOS.sql` - Apenas produtos
- `ADICIONAR_PRECO_BASE_SERVICOS.sql` - Apenas serviços
- `inserir-categorias-padrao.sql` - Apenas categorias

**Use o script completo para resolver tudo de uma vez!**
