# 🚨 RESOLVER PROBLEMAS DO SUPABASE - GUIA RÁPIDO

## Problemas Identificados

### 1. ❌ Erro: "Could not find the 'tipo' column"
**Causa:** Coluna `tipo` não existe na tabela `produtos`

### 2. ❌ Categorias não carregam no dropdown
**Causa:** Tabela `categorias_produtos` tem RLS habilitado mas sem políticas

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Acessar Supabase
1. Abra https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)

### Passo 2: Executar Script de Correção
1. Clique em **New Query**
2. Copie TODO o conteúdo do arquivo: `CORRECAO_COMPLETA_SUPABASE.sql`
3. Cole no editor
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Recarregar Schema Cache
1. No Supabase, vá em **Settings** (engrenagem)
2. Clique em **API**
3. Role até **Schema Cache**
4. Clique em **Reload schema**

### Passo 4: Reiniciar Aplicação
```bash
# Parar o servidor (Ctrl+C no terminal)
# Iniciar novamente
npm run dev
```

---

## 📋 Verificação

Execute no SQL Editor para confirmar:

```sql
-- 1. Verificar coluna tipo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'produtos' AND column_name = 'tipo';
-- Deve retornar: tipo | USER-DEFINED

-- 2. Verificar políticas RLS
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'categorias_produtos';
-- Deve retornar: 4 ou mais

-- 3. Testar acesso às categorias
SELECT * FROM categorias_produtos WHERE is_active = true;
-- Deve retornar 6 categorias
```

---

## 🎯 Resultado Esperado

Após executar:

✅ Coluna `tipo` adicionada à tabela `produtos`  
✅ Dados existentes migrados automaticamente  
✅ Políticas RLS criadas para `categorias_produtos`  
✅ Categorias padrão inseridas  
✅ Dropdown de categorias funciona  
✅ Cadastro de produtos funciona  

---

## 📁 Arquivos Criados

### Documentação:
- `CORRECAO_ERRO_TIPO_PRODUTOS.md` - Detalhes do erro da coluna tipo
- `CORRECAO_CATEGORIAS_RLS.md` - Detalhes do problema de RLS
- `APLICAR_MIGRACAO_TIPO.md` - Guia completo da migração
- `RESOLVER_AGORA.md` - Este arquivo (guia rápido)

### Scripts SQL:
- `CORRECAO_COMPLETA_SUPABASE.sql` - **USE ESTE!** (correção completa)
- `supabase/migrations/002_add_tipo_column_produtos.sql` - Migração da coluna tipo
- `supabase/migrations/003_add_categorias_rls_policies.sql` - Migração das políticas RLS

### Schema Atualizado:
- `supabase/schema.sql` - Schema principal atualizado

---

## 🔧 Alternativa: SQL Direto (Copie e Cole)

Se preferir, copie e execute este SQL diretamente:

```sql
-- CORREÇÃO RÁPIDA - COPIE TUDO E EXECUTE

-- 1. Criar ENUM e adicionar coluna tipo
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'produto_tipo') THEN
    CREATE TYPE produto_tipo AS ENUM ('produto', 'servico');
  END IF;
END $$;

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tipo produto_tipo;

UPDATE produtos 
SET tipo = CASE 
  WHEN is_servico = true THEN 'servico'::produto_tipo 
  ELSE 'produto'::produto_tipo 
END
WHERE tipo IS NULL;

ALTER TABLE produtos ALTER COLUMN tipo SET NOT NULL;
ALTER TABLE produtos ALTER COLUMN tipo SET DEFAULT 'produto'::produto_tipo;
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo);

-- 2. Adicionar políticas RLS para categorias
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ler categorias" 
  ON categorias_produtos FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem inserir categorias" 
  ON categorias_produtos FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem atualizar categorias" 
  ON categorias_produtos FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Usuários autenticados podem deletar categorias" 
  ON categorias_produtos FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 3. Inserir categorias padrão
INSERT INTO categorias_produtos (nome, descricao) VALUES
  ('Peças Originais', 'Peças originais de fábrica'),
  ('Peças Paralelas', 'Peças alternativas'),
  ('Óleos e Lubrificantes', 'Óleos, graxas e lubrificantes'),
  ('Pneus', 'Pneus e câmaras'),
  ('Acessórios', 'Acessórios diversos'),
  ('Serviços', 'Mão de obra e serviços')
ON CONFLICT (nome) DO NOTHING;

-- Pronto! ✅
```

---

## ⚠️ Importante

1. **Backup:** O Supabase faz backup automático, mas é sempre bom confirmar
2. **Sem Downtime:** As alterações são aplicadas sem interromper o serviço
3. **Dados Preservados:** Todos os produtos existentes são mantidos e migrados
4. **Reversível:** Se necessário, há comandos de rollback nos guias detalhados

---

## 🆘 Se Algo Der Errado

### Erro: "permission denied"
**Solução:** Você precisa ser admin do projeto no Supabase

### Erro: "column already exists"
**Solução:** A coluna já foi adicionada, pule para o próximo passo

### Erro: "policy already exists"
**Solução:** As políticas já foram criadas, tudo certo!

### Categorias ainda não aparecem
**Solução:**
1. Faça logout e login novamente
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Verifique se está usando o Supabase (não o servidor local)

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do Supabase (aba Logs no dashboard)
2. Consulte os guias detalhados nos arquivos `CORRECAO_*.md`
3. Execute as queries de verificação acima

---

## ✨ Próximos Passos

Após resolver:
1. ✅ Teste o cadastro de produtos
2. ✅ Teste o cadastro de serviços
3. ✅ Verifique se as categorias aparecem
4. ✅ Teste os filtros por tipo (produto/serviço)
5. ✅ Verifique se o estoque funciona corretamente

---

**Tempo estimado:** 5 minutos  
**Dificuldade:** Baixa  
**Impacto:** Resolve 100% dos problemas identificados  

🚀 **Execute agora e volte a trabalhar!**
