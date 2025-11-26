# Sistema de Serviços - Documentação

## Visão Geral

Foi implementado um sistema completo para cadastro e gerenciamento de serviços com tipos de serviços e relação de peças utilizadas.

## Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `tipos_servicos`
Armazena os tipos de serviços oferecidos pela oficina.

**Campos:**
- `id` - UUID (chave primária)
- `nome` - Nome do tipo de serviço (único)
- `descricao` - Descrição do tipo de serviço
- `preco_base` - Preço base do serviço
- `tempo_estimado` - Tempo estimado em minutos
- `is_active` - Status ativo/inativo
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**Tipos pré-cadastrados:**
- Troca de Óleo
- Revisão Geral
- Troca de Pneu
- Regulagem de Freios
- Limpeza de Carburador
- Troca de Corrente
- Alinhamento
- Troca de Bateria
- Regulagem de Motor
- Manutenção Preventiva

#### 2. `servicos`
Armazena os serviços específicos cadastrados.

**Campos:**
- `id` - UUID (chave primária)
- `tipo_servico_id` - Referência ao tipo de serviço
- `codigo` - Código do serviço (único, opcional)
- `nome` - Nome do serviço
- `descricao` - Descrição detalhada
- `preco_servico` - Preço do serviço
- `is_active` - Status ativo/inativo
- `created_at` - Data de criação
- `updated_at` - Data de atualização

#### 3. `servicos_pecas`
Relaciona serviços com as peças utilizadas.

**Campos:**
- `id` - UUID (chave primária)
- `servico_id` - Referência ao serviço
- `produto_id` - Referência ao produto/peça
- `quantidade` - Quantidade da peça utilizada
- `created_at` - Data de criação

**Constraint:** Combinação única de servico_id + produto_id

## Endpoints da API

### Tipos de Serviços

- **GET** `/api/tipos-servicos` - Lista todos os tipos de serviços
- **POST** `/api/tipos-servicos` - Cria novo tipo de serviço
- **PUT** `/api/tipos-servicos/:id` - Atualiza tipo de serviço
- **DELETE** `/api/tipos-servicos/:id` - Exclui tipo de serviço (soft delete)

### Serviços

- **GET** `/api/servicos` - Lista todos os serviços com peças relacionadas
- **POST** `/api/servicos` - Cria novo serviço com peças
- **PUT** `/api/servicos/:id` - Atualiza serviço e suas peças
- **DELETE** `/api/servicos/:id` - Exclui serviço (soft delete)

## Funcionalidades Implementadas

### 1. Página de Tipos de Serviços (`/tipos-servicos`)

**Recursos:**
- Listagem de todos os tipos de serviços
- Busca por nome
- Cadastro de novos tipos
- Edição de tipos existentes
- Exclusão de tipos
- Exibição de preço base e tempo estimado

**Formulário inclui:**
- Nome do tipo (obrigatório)
- Descrição
- Preço base (obrigatório)
- Tempo estimado em minutos

### 2. Página de Serviços (`/servicos-lista`)

**Recursos:**
- Listagem de todos os serviços cadastrados
- Busca por nome ou código
- Cadastro de novos serviços
- Edição de serviços existentes
- Exclusão de serviços
- Visualização das peças relacionadas

**Formulário inclui:**
- Nome do serviço (obrigatório)
- Tipo de serviço (obrigatório) - ao selecionar, preenche automaticamente o preço base
- Código (opcional)
- Preço do serviço (obrigatório)
- Descrição
- **Seção de Peças:**
  - Seleção de produtos/peças do estoque
  - Quantidade de cada peça
  - Adição/remoção de múltiplas peças
  - Visualização das peças adicionadas

## Hooks Criados

### `useTiposServicos`
Gerencia operações CRUD para tipos de serviços.

**Métodos:**
- `fetchTiposServicos()` - Busca tipos de serviços
- `createTipoServico(data)` - Cria novo tipo
- `updateTipoServico(id, data)` - Atualiza tipo
- `deleteTipoServico(id)` - Exclui tipo

### `useServicos`
Gerencia operações CRUD para serviços.

**Métodos:**
- `fetchServicos()` - Busca serviços com peças
- `createServico(data)` - Cria novo serviço
- `updateServico(id, data)` - Atualiza serviço
- `deleteServico(id)` - Exclui serviço

## Componentes Criados

### `TipoServicoForm`
Formulário para cadastro/edição de tipos de serviços.

**Validações:**
- Nome mínimo de 3 caracteres
- Preço base obrigatório

### `ServicoForm`
Formulário completo para cadastro/edição de serviços.

**Funcionalidades:**
- Seleção de tipo de serviço
- Preenchimento automático do preço base
- Gerenciamento de peças:
  - Adicionar peças do estoque
  - Definir quantidade
  - Remover peças
  - Validação de peças duplicadas
- Exibição do estoque disponível de cada peça

**Validações:**
- Nome mínimo de 3 caracteres
- Tipo de serviço obrigatório
- Preço do serviço obrigatório

## Fluxo de Uso

### Cadastrar um Novo Serviço

1. Acesse **Tipos de Serviços** no menu
2. Cadastre os tipos de serviços necessários (se ainda não existirem)
3. Acesse **Serviços** no menu
4. Clique em "Novo Serviço"
5. Preencha os dados:
   - Nome do serviço
   - Selecione o tipo (o preço base será preenchido automaticamente)
   - Ajuste o preço se necessário
   - Adicione código (opcional)
   - Adicione descrição (opcional)
6. Na seção de peças:
   - Selecione uma peça do estoque
   - Defina a quantidade
   - Clique em "+" para adicionar
   - Repita para adicionar mais peças
7. Clique em "Salvar Serviço"

### Editar um Serviço

1. Na lista de serviços, clique no ícone de edição
2. Modifique os dados necessários
3. Adicione ou remova peças conforme necessário
4. Clique em "Salvar Serviço"

## Integração com Produtos

O sistema está integrado com o módulo de produtos:
- Apenas produtos do tipo "produto" (não serviços) podem ser adicionados como peças
- O estoque atual de cada produto é exibido na seleção
- A quantidade de peças pode ser decimal (ex: 0.5 litros de óleo)

## Melhorias Futuras Sugeridas

1. **Cálculo Automático de Preço:**
   - Calcular preço total do serviço baseado nas peças + mão de obra

2. **Controle de Estoque:**
   - Ao criar uma OS com serviço, dar baixa automática nas peças

3. **Histórico de Serviços:**
   - Rastrear quantas vezes cada serviço foi executado

4. **Pacotes de Serviços:**
   - Criar combos de serviços com desconto

5. **Tempo Real:**
   - Somar tempo estimado de múltiplos serviços em uma OS

## Arquivos Criados/Modificados

### Banco de Dados
- `database/add-tipos-servicos.sql` - Script de criação das tabelas

### Backend (API)
- `server/index.ts` - Adicionados endpoints para tipos de serviços e serviços

### Frontend - Hooks
- `src/hooks/useTiposServicos.ts` - Hook para tipos de serviços
- `src/hooks/useServicos.ts` - Hook para serviços

### Frontend - Páginas
- `src/pages/TiposServicos.tsx` - Página de tipos de serviços
- `src/pages/Servicos.tsx` - Página de serviços

### Frontend - Componentes
- `src/components/servicos/TipoServicoForm.tsx` - Formulário de tipo de serviço
- `src/components/servicos/ServicoForm.tsx` - Formulário de serviço com peças

### Frontend - Rotas
- `src/App.tsx` - Adicionadas rotas para as novas páginas
- `src/components/Sidebar.tsx` - Adicionados links no menu

## Como Testar

1. **Inicie o servidor da API:**
   ```bash
   npm run dev:api
   ```

2. **Inicie o frontend:**
   ```bash
   npm run dev
   ```

3. **Acesse o sistema:**
   - Login: admin@oficina.com
   - Senha: senha123

4. **Teste o fluxo:**
   - Vá em "Tipos de Serviços" e verifique os tipos pré-cadastrados
   - Crie um novo tipo de serviço
   - Vá em "Serviços" e crie um novo serviço
   - Adicione peças ao serviço
   - Salve e verifique na listagem

## Observações Importantes

- O sistema usa soft delete (is_active = false) para manter histórico
- As peças são relacionadas através de uma tabela intermediária
- O preço do serviço pode ser diferente do preço base do tipo
- Ao editar um serviço, as peças antigas são removidas e as novas são inseridas
- A validação impede adicionar a mesma peça duas vezes no mesmo serviço
