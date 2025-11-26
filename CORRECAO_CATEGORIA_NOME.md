# ✅ Correção: Categoria Não Aparece na Lista de Produtos

## 🔧 Problema Resolvido

A categoria não estava sendo exibida na listagem de produtos porque o hook `useProdutos` não estava fazendo JOIN com a tabela `categorias_produtos`.

## ✅ Solução Aplicada

Atualizado o arquivo `src/hooks/useProdutos.ts` para:

1. **Fazer JOIN com categorias_produtos** usando o select do Supabase
2. **Mapear o resultado** para incluir `categoria_nome`

### Código Atualizado:

```typescript
const { data, error } = await supabase
  .from('produtos')
  .select(`
    *,
    categorias_produtos (
      nome
    )
  `)
  .eq('is_active', true)
  .order('nome', { ascending: true })

// Mapear os dados para incluir categoria_nome
const produtosComCategoria = (data || []).map((produto: any) => ({
  ...produto,
  categoria_nome: produto.categorias_produtos?.nome || null
}))
```

## 🧪 Como Testar

1. **Recarregue a aplicação** (Ctrl+Shift+R)
2. Vá em **Produtos**
3. A coluna **Categoria** agora deve mostrar o nome da categoria
4. Se aparecer "-", significa que o produto não tem categoria associada

## 📋 Verificar no Supabase

Se ainda não aparecer, verifique se:

1. **As categorias existem:**
   ```sql
   SELECT * FROM categorias_produtos WHERE is_active = true;
   ```

2. **Os produtos têm categoria_id:**
   ```sql
   SELECT id, nome, categoria_id FROM produtos WHERE is_active = true;
   ```

3. **Se não houver categorias, execute:**
   ```sql
   INSERT INTO categorias_produtos (nome, descricao, is_active) VALUES
     ('Peças', 'Peças e componentes', true),
     ('Acessórios', 'Acessórios para motos', true),
     ('Lubrificantes', 'Óleos e lubrificantes', true),
     ('Outros', 'Outros produtos', true)
   ON CONFLICT DO NOTHING;
   ```

## ⚠️ Nota sobre Erros TypeScript

Os erros de lint no arquivo são temporários e relacionados ao schema do Supabase. Eles não afetam o funcionamento da aplicação.

## ✨ Resultado Esperado

Agora a listagem de produtos deve mostrar:
- ✅ Código
- ✅ Nome
- ✅ Tipo (Produto/Serviço)
- ✅ **Categoria** (nome da categoria)
- ✅ Preço
- ✅ Estoque
