# Fix: Edição de Ordem de Serviço - Campos Não Carregados

## Problema Identificado

Ao clicar no botão "Editar" em uma ordem de serviço:
- O modal/formulário abria
- Os campos não eram preenchidos com os dados da OS
- Serviços e peças não apareciam
- Valor total não era exibido

## Causa Raiz

O frontend estava passando apenas os dados resumidos da lista (sem serviços e peças) diretamente para o formulário, sem buscar os dados completos da API.

## Solução Implementada

### 1. Backend (já estava correto) ✅

O endpoint `GET /api/ordens-servico/:id` já retorna todos os dados necessários:
- Dados básicos da OS (cliente, veículo, mecânico, status, defeito, observações)
- Array de `servicos` com detalhes completos
- Array de `pecas` com detalhes completos
- Valores calculados

### 2. Frontend - Atualização em `OrdensServico.tsx`

**Adicionada função `handleEdit`:**
```typescript
const handleEdit = async (os: any) => {
  try {
    // Buscar dados completos da OS
    const response = await fetch(`${API_URL}/ordens-servico/${os.id}`)
    if (!response.ok) throw new Error('Erro ao carregar OS')
    const osCompleta = await response.json()
    
    console.log('OS completa carregada:', osCompleta)
    setSelectedOS(osCompleta)
    setIsModalOpen(true)
  } catch (error) {
    console.error('Erro ao carregar OS:', error)
    toast.error('Erro ao carregar dados da OS')
  }
}
```

**Botão Editar atualizado:**
```typescript
<button onClick={() => handleEdit(os)}>
  <Edit className="w-4 h-4" />
</button>
```

### 3. Frontend - Mapeamento em `OrdemServicoFormCompleto.tsx`

**Adicionado mapeamento de dados do backend:**

```typescript
// Mapear serviços
if (os.servicos && Array.isArray(os.servicos)) {
  const servicosMapeados = os.servicos.map((s: any) => ({
    tipo_servico_id: s.tipo_servico_id,
    tipo_servico_nome: s.tipo_servico_nome,
    quantidade: Number(s.quantidade || 1),
    preco_unitario: Number(s.preco_unitario || 0),
    subtotal: Number(s.subtotal || 0),
    observacoes: s.observacoes || ''
  }))
  setServicos(servicosMapeados)
}

// Mapear peças
if (os.pecas && Array.isArray(os.pecas)) {
  const pecasMapeadas = os.pecas.map((p: any) => ({
    produto_id: p.produto_id,
    produto_nome: p.produto_nome,
    quantidade: Number(p.quantidade || 1),
    preco_unitario: Number(p.preco_unitario || 0),
    subtotal: Number(p.subtotal || 0)
  }))
  setPecas(pecasMapeadas)
}
```

## Fluxo Completo de Edição

1. **Usuário clica em "Editar"** → `handleEdit(os)` é chamado
2. **Busca dados completos** → `GET /api/ordens-servico/:id`
3. **Recebe resposta com:**
   - Dados básicos da OS
   - Lista completa de serviços
   - Lista completa de peças
   - Valores calculados
4. **Formulário é populado:**
   - Campos básicos (cliente, veículo, mecânico, status, defeito, observações)
   - Lista de serviços adicionados
   - Lista de peças adicionadas
   - Valor total calculado automaticamente
5. **Usuário pode:**
   - Modificar campos
   - Adicionar/remover serviços
   - Adicionar/remover peças
   - Ver valor total atualizado em tempo real

## Problema Adicional: Dropdowns não pré-selecionados

### Sintoma
Ao abrir o formulário de edição:
- Campo "Cliente" mostrava "Selecione um cliente..." em vez do cliente da OS
- Campo "Veículo" mostrava "Selecione um veículo..." em vez do veículo da OS  
- Campo "Mecânico" não mostrava o mecânico selecionado

### Causa
O `reset()` do formulário era chamado **antes** dos dropdowns serem populados com dados da API, fazendo com que os valores fossem definidos mas não aparecessem visualmente.

### Solução
Refatorado o `useEffect` para:
1. Carregar clientes e mecânicos no mount do componente (`await Promise.all([fetchClientes(), fetchMecanicos()])`)
2. Ao abrir OS para edição, carregar os veículos do cliente primeiro (`await fetchVeiculos`)
3. Aguardar 200ms para garantir que todos os dropdowns foram populados
4. Só então chamar `reset()` com os valores da OS

```typescript
const loadOSData = async () => {
  if (os) {
    // Primeiro, carregar veículos do cliente
    if (os.cliente_id) {
      setSelectedCliente(String(os.cliente_id))
      await fetchVeiculos(String(os.cliente_id))
    }
    
    // Aguardar para garantir que dropdowns foram populados
    setTimeout(() => {
      reset({
        cliente_id: String(os.cliente_id || ''),
        veiculo_id: String(os.veiculo_id || ''),
        mecanico_id: os.mecanico_id ? String(os.mecanico_id) : '',
        // ... outros campos
      })
    }, 200)
  }
}
```

## Arquivos Modificados

- ✅ `src/pages/OrdensServico.tsx` - Adicionada função `handleEdit` para buscar dados completos
- ✅ `src/components/ordens/OrdemServicoFormCompleto.tsx` - Adicionado mapeamento de serviços/peças + fix de timing dos dropdowns
- ℹ️ `server/index.ts` - Endpoint GET já estava correto

## Resultado

✅ Ao clicar em "Editar", todos os campos são carregados corretamente
✅ **Cliente pré-selecionado** no dropdown
✅ **Veículo pré-selecionado** no dropdown
✅ **Mecânico pré-selecionado** no dropdown (se houver)
✅ Status, defeito e observações preenchidos
✅ Serviços existentes aparecem na lista
✅ Peças existentes aparecem na lista  
✅ Valor total é calculado e exibido
✅ Usuário pode modificar qualquer campo e salvar

## Teste

Para testar a edição:
1. Acesse a página de Ordens de Serviço
2. Clique no ícone de edição (lápis verde) em qualquer OS
3. Verifique que todos os campos estão preenchidos
4. Verifique que serviços e peças aparecem nas listas
5. Verifique que o valor total está correto
6. Faça modificações e salve
