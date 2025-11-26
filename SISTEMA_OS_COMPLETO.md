# Sistema de Ordens de Serviço Completo - Documentação

## ✅ Mudanças Implementadas

O sistema foi completamente reestruturado para gerenciar serviços e peças diretamente nas Ordens de Serviço, eliminando a necessidade de uma página separada de serviços.

---

## 🗄️ Banco de Dados

### Tabelas Removidas
- ❌ `servicos` - Não é mais necessária
- ❌ `servicos_pecas` - Não é mais necessária

### Novas Tabelas Criadas

#### 1. `os_servicos`
Armazena os tipos de serviços aplicados em cada OS.

**Campos:**
- `id` - UUID (chave primária)
- `os_id` - Referência à ordem de serviço
- `tipo_servico_id` - Referência ao tipo de serviço
- `quantidade` - Quantidade de vezes que o serviço foi aplicado
- `preco_unitario` - Preço unitário do serviço
- `subtotal` - Quantidade × Preço unitário
- `observacoes` - Observações sobre o serviço
- `created_at` - Data de criação

#### 2. `os_pecas`
Armazena as peças utilizadas em cada OS.

**Campos:**
- `id` - UUID (chave primária)
- `os_id` - Referência à ordem de serviço
- `produto_id` - Referência ao produto/peça
- `quantidade` - Quantidade utilizada
- `preco_unitario` - Preço unitário da peça
- `subtotal` - Quantidade × Preço unitário
- `created_at` - Data de criação

### Triggers Automáticos Criados

#### 1. **Atualização Automática de Valores**
Sempre que um serviço ou peça é adicionado/removido/alterado, a OS é automaticamente atualizada com:
- `valor_servicos` - Total de serviços
- `valor_produtos` - Total de peças
- `valor_total` - Soma total (serviços + peças - desconto)

#### 2. **Controle Automático de Estoque**
- ✅ **Ao adicionar peça:** Dá baixa no estoque e registra movimentação
- ✅ **Ao remover peça:** Devolve ao estoque e registra movimentação
- ✅ **Ao alterar quantidade:** Ajusta estoque e registra movimentação

---

## 🔧 Backend (API)

### Novos Endpoints

#### Serviços na OS
- **POST** `/api/ordens-servico/:os_id/servicos` - Adicionar serviço à OS
- **GET** `/api/ordens-servico/:os_id/servicos` - Listar serviços da OS
- **DELETE** `/api/ordens-servico/:os_id/servicos/:servico_id` - Remover serviço

#### Peças na OS
- **POST** `/api/ordens-servico/:os_id/pecas` - Adicionar peça à OS
- **GET** `/api/ordens-servico/:os_id/pecas` - Listar peças da OS
- **PUT** `/api/ordens-servico/:os_id/pecas/:peca_id` - Atualizar quantidade/preço
- **DELETE** `/api/ordens-servico/:os_id/pecas/:peca_id` - Remover peça

#### Criação de OS Completa
- **POST** `/api/ordens-servico` - Criar OS com serviços e peças em uma única requisição

---

## 🎨 Frontend

### Novo Componente: `OrdemServicoFormCompleto`

Formulário completo para criação de Ordem de Serviço com:

#### Seção 1: Dados Básicos
- Cliente (obrigatório)
- Veículo (obrigatório, filtrado por cliente)
- Mecânico responsável
- Status da OS
- Defeito reclamado (obrigatório)
- Observações

#### Seção 2: Serviços
- Seleção de tipo de serviço
- Quantidade
- Preço unitário (preenchido automaticamente com preço base)
- Adicionar/remover múltiplos serviços
- Lista de serviços adicionados com subtotais

#### Seção 3: Peças
- Seleção de produto/peça (apenas produtos com estoque)
- Quantidade (com validação de estoque)
- Preço unitário (preenchido automaticamente com preço de venda)
- Adicionar/remover múltiplas peças
- Lista de peças adicionadas com subtotais
- Exibição do estoque disponível

#### Seção 4: Totais em Tempo Real
- **Total de Serviços** - Soma de todos os serviços
- **Total de Peças** - Soma de todas as peças
- **Valor Total da OS** - Soma geral atualizada em tempo real

### Arquivos Removidos
- ❌ `src/pages/Servicos.tsx`
- ❌ `src/components/servicos/ServicoForm.tsx`
- ❌ `src/hooks/useServicos.ts`

### Arquivos Criados
- ✅ `src/components/ordens/OrdemServicoFormCompleto.tsx`
- ✅ `database/ajustar-os-servicos.sql`

---

## 🎯 Funcionalidades Principais

### 1. Cálculo em Tempo Real
- Todos os valores são calculados automaticamente conforme você adiciona/remove itens
- Subtotais individuais para cada serviço e peça
- Totais parciais (serviços e peças)
- Total geral da OS

### 2. Validação de Estoque
- Sistema verifica estoque disponível antes de adicionar peça
- Exibe quantidade disponível ao selecionar produto
- Impede adicionar quantidade maior que o estoque

### 3. Preenchimento Automático
- Ao selecionar tipo de serviço, o preço base é preenchido automaticamente
- Ao selecionar produto, o preço de venda é preenchido automaticamente
- Valores podem ser editados manualmente se necessário

### 4. Controle de Estoque Automático
- Ao salvar a OS, o estoque é automaticamente atualizado
- Movimentações são registradas no histórico
- Ao remover peça, o estoque é devolvido

### 5. Gerenciamento Flexível
- Adicione quantos serviços quiser
- Adicione quantas peças quiser
- Remova itens a qualquer momento
- Altere quantidades e preços antes de salvar

---

## 📋 Fluxo de Uso

### Criar Nova Ordem de Serviço

1. **Acesse "Ordens de Serviço"** no menu lateral
2. **Clique em "Nova OS"**
3. **Preencha os dados básicos:**
   - Selecione o cliente
   - Selecione o veículo (lista será filtrada pelo cliente)
   - Selecione o mecânico (opcional)
   - Escolha o status
   - Descreva o defeito reclamado
   - Adicione observações (opcional)

4. **Adicione os serviços:**
   - Selecione o tipo de serviço
   - Ajuste a quantidade se necessário
   - Confirme/ajuste o preço
   - Clique em "+" para adicionar
   - Repita para adicionar mais serviços

5. **Adicione as peças:**
   - Selecione a peça/produto
   - Defina a quantidade (sistema valida estoque)
   - Confirme/ajuste o preço
   - Clique em "+" para adicionar
   - Repita para adicionar mais peças

6. **Revise os totais:**
   - Verifique o total de serviços
   - Verifique o total de peças
   - Confirme o valor total da OS

7. **Salve a OS:**
   - Clique em "Salvar Ordem de Serviço"
   - O sistema criará a OS e dará baixa no estoque automaticamente

---

## 🔄 Integração com Outros Módulos

### Tipos de Serviços
- Mantida a página de cadastro de tipos de serviços
- Tipos são usados diretamente nas OS
- Preço base é sugerido mas pode ser alterado

### Produtos
- Produtos do tipo "produto" podem ser usados como peças
- Estoque é controlado automaticamente
- Preço de venda é sugerido mas pode ser alterado

### Estoque
- Movimentações são registradas automaticamente
- Histórico completo de entradas/saídas
- Rastreabilidade por OS

---

## ⚡ Vantagens da Nova Abordagem

### 1. **Simplicidade**
- Não precisa cadastrar serviços previamente
- Tudo é feito diretamente na OS

### 2. **Flexibilidade**
- Preços podem variar por OS
- Quantidades ajustáveis
- Fácil adicionar/remover itens

### 3. **Controle**
- Estoque atualizado automaticamente
- Valores calculados em tempo real
- Histórico completo de movimentações

### 4. **Eficiência**
- Menos cliques para criar uma OS
- Menos páginas para navegar
- Processo mais rápido

### 5. **Precisão**
- Validação de estoque em tempo real
- Cálculos automáticos
- Menos erros manuais

---

## 🧪 Como Testar

1. **Inicie o sistema:**
   ```bash
   npm run dev:api  # Terminal 1
   npm run dev      # Terminal 2
   ```

2. **Acesse o sistema:**
   - URL: http://localhost:5173
   - Login: admin@oficina.com
   - Senha: senha123

3. **Teste o fluxo completo:**
   - Vá em "Tipos de Serviços" e verifique os tipos cadastrados
   - Vá em "Produtos" e verifique o estoque
   - Vá em "Ordens de Serviço"
   - Clique em "Nova OS"
   - Preencha todos os campos
   - Adicione serviços e peças
   - Observe os cálculos em tempo real
   - Salve a OS
   - Verifique que o estoque foi atualizado

---

## 📊 Estrutura de Dados

### Exemplo de Payload para Criar OS

```json
{
  "cliente_id": "uuid-do-cliente",
  "veiculo_id": "uuid-do-veiculo",
  "mecanico_id": "uuid-do-mecanico",
  "defeito_reclamado": "Troca de óleo e revisão",
  "observacoes": "Cliente solicitou urgência",
  "status": "aberta",
  "servicos": [
    {
      "tipo_servico_id": "uuid-tipo-servico",
      "quantidade": 1,
      "preco_unitario": 80.00,
      "subtotal": 80.00,
      "observacoes": ""
    }
  ],
  "pecas": [
    {
      "produto_id": "uuid-produto",
      "quantidade": 4,
      "preco_unitario": 25.00,
      "subtotal": 100.00
    }
  ],
  "valor_servicos": 80.00,
  "valor_produtos": 100.00,
  "valor_total": 180.00
}
```

---

## 🎓 Observações Importantes

1. **Estoque:** O sistema dá baixa automática no estoque ao salvar a OS. Se remover uma peça da OS, o estoque é devolvido.

2. **Preços:** Os preços sugeridos vêm dos cadastros (tipo de serviço e produto), mas podem ser alterados na OS.

3. **Tipos de Serviços:** Continue usando a página "Tipos de Serviços" para cadastrar novos tipos.

4. **Produtos:** Apenas produtos do tipo "produto" (não serviços) aparecem na lista de peças.

5. **Validação:** O sistema valida estoque disponível antes de permitir adicionar uma peça.

6. **Triggers:** Os triggers do banco garantem que os valores e estoque sejam sempre atualizados automaticamente.

---

## 🚀 Próximos Passos Sugeridos

1. **Visualização de OS:** Criar tela para visualizar OS completa com serviços e peças
2. **Edição de OS:** Permitir editar OS existente, adicionando/removendo itens
3. **Impressão:** Gerar PDF da OS com todos os detalhes
4. **Relatórios:** Relatórios de serviços mais executados, peças mais usadas, etc.
5. **Histórico:** Visualizar histórico de movimentações de estoque por OS

---

## ✨ Conclusão

O sistema agora oferece uma experiência completa e integrada para gerenciar Ordens de Serviço, com:
- ✅ Cálculos automáticos em tempo real
- ✅ Controle automático de estoque
- ✅ Interface intuitiva e eficiente
- ✅ Validações robustas
- ✅ Rastreabilidade completa

Tudo o que você precisa para gerenciar serviços e peças está agora diretamente na tela de criação de OS!
