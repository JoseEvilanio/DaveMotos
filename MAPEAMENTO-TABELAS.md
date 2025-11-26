# Mapeamento de Tabelas e Colunas - Português → Inglês

## ⚠️ IMPORTANTE
O banco de dados Supabase está em **INGLÊS**, mas a interface do sistema está em **PORTUGUÊS**.

## Tabelas Principais

| Português | Inglês | Status |
|-----------|--------|--------|
| `ordens_servico` | `orders_service` | ✅ Corrigido |
| `clientes` | `customers` | ⚠️ Verificar |
| `veiculos` | `vehicles` | ⚠️ Verificar |
| `mecanicos` | `mechanics` | ⚠️ Verificar |
| `fornecedores` | `suppliers` | ⚠️ Verificar |
| `produtos` | `products` | ⚠️ Verificar |
| `agendamentos` | `appointments` | ⚠️ Verificar |
| `vendas` | `sales` | ⚠️ Verificar |

## Colunas de `orders_service`

| Português | Inglês |
|-----------|--------|
| `numero_os` | `number` |
| `cliente_id` | `customer_id` |
| `veiculo_id` | `vehicle_id` |
| `mecanico_id` | `mechanic_id` |
| `status` | `status` |
| `defeito_reclamado` | `description_lines` (array) |
| `valor_desconto` | `discount` |
| `valor_total` | `total` |
| `data_abertura` | `created_at` |
| `data_atualizacao` | `updated_at` |

## Colunas de Relacionamentos

### Customers (Clientes)
| Português | Inglês |
|-----------|--------|
| `nome` | `name` |
| `cpf` | `cpf` ou `document` |
| `telefone` | `phone` |
| `email` | `email` |

### Vehicles (Veículos)
| Português | Inglês |
|-----------|--------|
| `marca` | `brand` |
| `modelo` | `model` |
| `placa` | `plate` |
| `ano` | `year` |

### Mechanics (Mecânicos)
| Português | Inglês |
|-----------|--------|
| `nome` | `name` |
| `telefone` | `phone` |

## Hooks Atualizados

### ✅ useOrdensServico.ts
- Tabela: `orders_service`
- Relacionamentos: `customers`, `vehicles`, `mechanics`
- Campos: `name`, `brand`, `model`, `plate`

### ⏳ Hooks Pendentes de Atualização

Os seguintes hooks ainda precisam ser atualizados para usar nomes em inglês:

1. **useClientes.ts** → Verificar se usa `customers`
2. **useVeiculos.ts** → Verificar se usa `vehicles`
3. **useMecanicos.ts** → Verificar se usa `mechanics`
4. **useFornecedores.ts** → Verificar se usa `suppliers`
5. **useProdutos.ts** → Verificar se usa `products`
6. **useAgendamentos.ts** → Verificar se usa `appointments`
7. **useVendas.ts** → Verificar se usa `sales`

## Como Verificar os Nomes Corretos

### Opção 1: Via Supabase Dashboard
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **Table Editor**
3. Veja a lista de tabelas no menu lateral
4. Clique em cada tabela para ver os nomes das colunas

### Opção 2: Via SQL Editor
Execute esta query para listar todas as tabelas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Para ver as colunas de uma tabela específica:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders_service'
ORDER BY ordinal_position;
```

## Padrão de Nomenclatura

O banco segue o padrão:
- **Tabelas**: plural em inglês (ex: `customers`, `vehicles`)
- **Colunas**: snake_case em inglês (ex: `customer_id`, `created_at`)
- **Foreign Keys**: `{tabela_singular}_id` (ex: `customer_id`, `vehicle_id`)

## Próximos Passos

1. ✅ Verificar se a página de Ordens de Serviço está funcionando
2. ⏳ Listar todas as tabelas do banco via Supabase Dashboard
3. ⏳ Atualizar os outros hooks conforme necessário
4. ⏳ Criar um documento completo com todos os mapeamentos

## Testando

Após as correções, teste:

```bash
# Reinicie o servidor
npm run dev
```

Acesse a página de **Ordens de Serviço** e verifique se:
- ✅ A lista carrega sem erro 404
- ✅ Os dados aparecem corretamente
- ✅ É possível criar/editar/excluir OS
