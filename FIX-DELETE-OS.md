# Fix: Erro ao Excluir Ordem de Serviço (500 Internal Server Error)

## Problemas Identificados

Ao tentar excluir uma Ordem de Serviço (OS), o sistema retornava erro 500:
```
DELETE http://localhost:3001/api/ordens-servico/2 500 (Internal Server Error)
Error: Erro ao excluir OS
```

## Causas Raiz (2 problemas)

### Problema 1: Constraint de Foreign Key
A tabela `contas_receber` possui uma chave estrangeira (`os_id`) que referencia `ordens_servico(id)`, mas **não tinha uma ação `ON DELETE` definida**.

Quando o PostgreSQL tenta excluir uma OS que possui registros relacionados em `contas_receber`, a constraint de integridade referencial bloqueia a operação.

### Problema 2: Frontend usando dados hardcoded com IDs inteiros
O frontend estava usando dados de exemplo com IDs inteiros (`id: 1, 2, 3`), mas o banco de dados usa UUIDs. Ao tentar deletar, enviava um número inteiro que causava erro:
```
sintaxe de entrada é inválida para tipo uuid: "2"
```

## Soluções Implementadas

### Solução 1: Fix da Constraint no Banco de Dados

Foi criado um script de migração (`database/fix-os-delete-constraint.sql`) que:

1. **Remove a constraint antiga** que não tinha `ON DELETE` definido
2. **Cria uma nova constraint** com `ON DELETE SET NULL`

```sql
ALTER TABLE contas_receber
ADD CONSTRAINT fk_contas_receber_os
FOREIGN KEY (os_id) 
REFERENCES ordens_servico(id) 
ON DELETE SET NULL;
```

**Por que `ON DELETE SET NULL`?**
- Mantém os registros financeiros em `contas_receber` mesmo após a exclusão da OS
- Apenas define `os_id` como `NULL`, preservando o histórico financeiro
- É a abordagem mais segura para dados contábeis

### Solução 2: Fix do Frontend

Atualizações em `src/pages/OrdensServico.tsx`:

1. **Adicionado carregamento de dados reais da API**
   - Função `loadOrdens()` para buscar OS do backend
   - `useEffect` para carregar dados na montagem do componente
   - Estado `loading` para feedback visual

2. **Removidos dados hardcoded**
   - Eliminado array `ordensExemplo` com IDs inteiros
   - Agora usa estado `ordens` com dados reais (UUIDs)

3. **Atualizado mapeamento de campos**
   - `numero` → `numero_os`
   - `cliente` → `cliente_nome`
   - `veiculo` → `veiculo_descricao`
   - `data` → `data_abertura`
   - `valor` → `valor_total`

4. **Adicionado reload automático**
   - Após criar/editar/deletar OS, a lista é recarregada automaticamente

## Como Aplicar

O script já foi executado com sucesso. Para reaplicar em outro ambiente:

```bash
psql -U postgres -f database/fix-os-delete-constraint.sql
```

## Resultado

✅ Agora é possível excluir Ordens de Serviço sem erros
✅ Os registros financeiros são preservados
✅ O backend está funcionando corretamente

## Arquivos Modificados

- ✅ `database/fix-os-delete-constraint.sql` - Script de migração criado e executado
- ✅ `src/pages/OrdensServico.tsx` - Atualizado para carregar dados reais da API
- ℹ️ `server/index.ts` - Endpoint DELETE já estava correto (linhas 1040-1095)

## Teste

Para testar a exclusão:
1. Acesse a página de Ordens de Serviço
2. Clique no ícone de lixeira em qualquer OS
3. Confirme a exclusão
4. A OS deve ser excluída com sucesso ✅
