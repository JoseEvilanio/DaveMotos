# Verificação de Categorias no Supabase

## Problema Resolvido

O formulário de produtos estava tentando buscar categorias do servidor local (localhost:3001), mas o sistema usa Supabase.

### Correção Aplicada

Atualizado o arquivo `src/components/produtos/ProdutoForm.tsx` para:
- Importar o cliente Supabase
- Buscar categorias diretamente da tabela `categorias_produtos` no Supabase
- Remover dependência do servidor local

## Como Verificar se Existem Categorias

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor**
3. Selecione a tabela `categorias_produtos`
4. Verifique se existem registros com `is_active = true`

### Opção 2: Via SQL Editor

Execute no SQL Editor do Supabase:

```sql
-- Verificar categorias existentes
SELECT * FROM categorias_produtos WHERE is_active = true ORDER BY nome;
```

## Inserir Categorias Padrão (se necessário)

Se não houver categorias, execute este script no SQL Editor do Supabase:

```sql
-- Inserir categorias padrão para produtos
INSERT INTO categorias_produtos (nome, descricao, is_active) VALUES
  ('Peças', 'Peças e componentes para motos', true),
  ('Acessórios', 'Acessórios para motos', true),
  ('Lubrificantes', 'Óleos e lubrificantes', true),
  ('Pneus', 'Pneus e câmaras', true),
  ('Elétrica', 'Componentes elétricos', true),
  ('Freios', 'Sistema de freios', true),
  ('Suspensão', 'Componentes de suspensão', true),
  ('Motor', 'Peças de motor', true),
  ('Transmissão', 'Componentes de transmissão', true),
  ('Outros', 'Outros produtos', true)
ON CONFLICT DO NOTHING;

-- Verificar inserção
SELECT id, nome, descricao FROM categorias_produtos WHERE is_active = true ORDER BY nome;
```

## Testar o Sistema

1. Abra o sistema no navegador
2. Vá em **Produtos**
3. Clique em **Novo Produto**
4. Verifique se o campo **Categoria** agora mostra as categorias disponíveis

## Observações

- As categorias agora são carregadas diretamente do Supabase
- Não é mais necessário ter o servidor local rodando na porta 3001
- As políticas RLS devem estar configuradas corretamente (execute `CORRECAO_COMPLETA_SUPABASE.sql` se necessário)
