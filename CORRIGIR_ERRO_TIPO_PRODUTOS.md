# 🔧 Correção: Erro ao Salvar Produto - Coluna 'tipo' Não Encontrada

## ❌ Erro Identificado

```
{code: 'PGRST204', details: null, hint: null, 
 message: "Could not find the 'tipo' column of 'produtos' in the schema cache"}
```

**Causa:** A coluna `tipo` não existe na tabela `produtos` do Supabase.

## ✅ Solução

### Passo 1: Executar Script de Migração

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `ADICIONAR_COLUNA_TIPO_PRODUTOS.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 2: Aguardar Atualização do Cache

Após executar o script:
- ⏱️ Aguarde **30-60 segundos** para o cache do schema ser atualizado
- O Supabase precisa recarregar o schema em cache

### Passo 3: Recarregar a Aplicação

1. No navegador, pressione **Ctrl+Shift+R** (hard reload)
2. Ou feche e abra novamente a aplicação

### Passo 4: Testar

1. Vá em **Produtos**
2. Clique em **Novo Produto**
3. Preencha os campos:
   - Nome
   - Tipo (Produto ou Serviço)
   - Categoria
   - Preço de Venda
4. Clique em **Salvar**

## 📋 O Que o Script Faz

1. ✅ Cria o ENUM `produto_tipo` ('produto', 'servico')
2. ✅ Adiciona a coluna `tipo` na tabela `produtos`
3. ✅ Migra dados existentes do campo `is_servico` para `tipo`
4. ✅ Define a coluna como NOT NULL com default 'produto'
5. ✅ Cria índice para melhor performance
6. ✅ Notifica o PostgREST para recarregar o schema

## 🔍 Verificação

Após executar o script, você verá:

```
✅ ENUM produto_tipo criado com sucesso
✅ Coluna tipo adicionada à tabela produtos
✅ Dados existentes migrados para a coluna tipo
✅ Coluna tipo configurada como NOT NULL com default
✅ Índice criado para a coluna tipo
✅ COLUNA tipo ADICIONADA COM SUCESSO!
```

## ⚠️ Observações Importantes

- A coluna `is_servico` será mantida por compatibilidade
- Novos registros usarão apenas a coluna `tipo`
- O cache do schema pode levar até 1 minuto para atualizar
- Se o erro persistir, tente fazer logout e login novamente

## 🎯 Próximos Passos

Após a correção:
1. ✅ Teste criar um produto
2. ✅ Teste criar um serviço
3. ✅ Verifique se as categorias aparecem no formulário
4. ✅ Confirme que o salvamento funciona corretamente

## 📝 Arquivos Relacionados

- `ADICIONAR_COLUNA_TIPO_PRODUTOS.sql` - Script de migração
- `CORRECAO_CATEGORIAS_PRODUTOS.md` - Correção anterior (categorias)
- `inserir-categorias-padrao.sql` - Categorias padrão
