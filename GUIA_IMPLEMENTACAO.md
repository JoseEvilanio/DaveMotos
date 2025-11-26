# Guia de Implementação - Sistema de Gerenciamento de Oficinas de Moto

## 📋 Índice

1. [Instalação e Configuração Inicial](#instalação-e-configuração-inicial)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Módulos a Implementar](#módulos-a-implementar)
5. [Próximos Passos](#próximos-passos)

---

## 🚀 Instalação e Configuração Inicial

### 1. Instalar Dependências

```bash
cd c:/Users/TIDesigner/Moto
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase (veja próxima seção).

### 3. Executar o Projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

---

## 🗄️ Configuração do Supabase

### 1. Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Executar o Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase/schema.sql`
3. Cole no editor e execute (Run)
4. Aguarde a conclusão (pode levar alguns segundos)

### 3. Obter Credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)
3. Cole no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Criar Primeiro Usuário Admin

Execute no SQL Editor do Supabase:

```sql
-- Criar usuário admin (substitua email e senha)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@oficina.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Criar perfil do admin
INSERT INTO profiles (id, full_name, role, is_active)
SELECT id, 'Administrador', 'admin', true
FROM auth.users
WHERE email = 'admin@oficina.com';
```

### 5. Configurar Storage (Upload de Fotos)

1. No Supabase, vá em **Storage**
2. Crie os seguintes buckets (públicos):
   - `clientes-fotos`
   - `veiculos-fotos`
   - `mecanicos-fotos`
   - `produtos-fotos`
   - `os-fotos`

---

## 📁 Estrutura do Projeto

```
Moto/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/         # Componentes React
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── LoadingScreen.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.ts
│   ├── lib/               # Bibliotecas e configurações
│   │   └── supabase.ts
│   ├── pages/             # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Clientes.tsx
│   │   ├── Veiculos.tsx
│   │   ├── Fornecedores.tsx
│   │   ├── Mecanicos.tsx
│   │   ├── Produtos.tsx
│   │   ├── OrdensServico.tsx
│   │   ├── Vendas.tsx
│   │   ├── Estoque.tsx
│   │   ├── Financeiro.tsx
│   │   ├── Agendamentos.tsx
│   │   ├── Relatorios.tsx
│   │   └── Configuracoes.tsx
│   ├── stores/            # Zustand stores
│   │   └── authStore.ts
│   ├── types/             # TypeScript types
│   │   └── database.ts
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globais
├── supabase/
│   └── schema.sql         # Schema do banco de dados
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔧 Módulos a Implementar

### Status Atual

✅ **Concluído:**
- Estrutura do projeto
- Configuração do Supabase
- Autenticação e controle de acesso
- Dashboard básico
- Layout e navegação

🚧 **Em Desenvolvimento:**
- Módulos de cadastro (páginas stub criadas)

❌ **Pendente:**
- Implementação completa de todos os módulos

---

## 📝 Próximos Passos

### 1. Módulo de Clientes

Implementar em `src/pages/Clientes.tsx`:

**Funcionalidades:**
- ✅ Listagem de clientes com busca e filtros
- ✅ Cadastro de novo cliente com formulário completo
- ✅ Edição de cliente existente
- ✅ Upload de foto do cliente
- ✅ Visualização de histórico de serviços
- ✅ Exclusão lógica (is_active = false)

**Componentes necessários:**
```typescript
// src/components/clientes/ClientesList.tsx
// src/components/clientes/ClienteForm.tsx
// src/components/clientes/ClienteDetails.tsx
// src/components/clientes/ClienteHistorico.tsx
```

**Exemplo de implementação:**

```typescript
// src/pages/Clientes.tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('is_active', true)
        .order('nome')

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.cpf?.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-gray-900">
          Clientes
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome}</td>
                    <td>{cliente.telefone}</td>
                    <td>{cliente.cpf}</td>
                    <td>{cliente.email}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 2. Módulo de Veículos

Similar ao módulo de clientes, com relacionamento cliente ↔ veículo.

**Campos principais:**
- Cliente (select com busca)
- Marca, Modelo, Ano
- Placa (único)
- Cor, Chassi, Renavam
- KM atual
- Fotos (múltiplas)

### 3. Módulo de Fornecedores

**Campos principais:**
- Razão Social, Nome Fantasia
- CNPJ, Inscrição Estadual
- Telefone, Email, Site
- Endereço completo
- Contato (nome e telefone)

### 4. Módulo de Mecânicos

**Campos principais:**
- Nome, CPF, Telefone
- Especialidades (array)
- Data de admissão
- Salário, Comissão (%)
- Foto
- Vincular com usuário do sistema (opcional)

### 5. Módulo de Produtos e Serviços

**Funcionalidades:**
- Cadastro de categorias
- Cadastro de produtos (peças)
- Cadastro de serviços (mão de obra)
- Controle de estoque mínimo
- Preço de custo e venda
- Margem de lucro automática
- Foto do produto

### 6. Módulo de Ordem de Serviço (OS)

**Fluxo:**
1. Abertura da OS
   - Selecionar cliente e veículo
   - Informar defeito reclamado
   - KM de entrada
   - Atribuir mecânico

2. Adicionar itens
   - Produtos (peças)
   - Serviços (mão de obra)
   - Quantidade e preço

3. Acompanhamento
   - Atualizar status
   - Adicionar fotos
   - Informar defeito constatado
   - Serviços executados

4. Conclusão
   - Calcular total
   - Aplicar desconto
   - Registrar forma de pagamento
   - Gerar contas a receber
   - Baixar estoque

### 7. Módulo de Vendas de Balcão

**Funcionalidades:**
- Venda rápida sem OS
- Selecionar produtos
- Cliente opcional
- Forma de pagamento
- Impressão de recibo
- Baixa automática de estoque

### 8. Módulo de Estoque

**Funcionalidades:**
- Entrada de produtos (compra)
- Saída manual
- Ajuste de inventário
- Relatório de movimentações
- Alertas de estoque baixo
- Histórico por produto

### 9. Módulo Financeiro

**Sub-módulos:**

**a) Caixa Diário**
- Abertura de caixa (saldo inicial)
- Movimentações (entradas e saídas)
- Fechamento de caixa
- Relatório de sangria

**b) Contas a Pagar**
- Cadastro de contas
- Vencimentos
- Pagamentos
- Relatório de contas vencidas

**c) Contas a Receber**
- Geradas automaticamente de OS/Vendas
- Recebimentos
- Inadimplência
- Relatório de recebimentos

**d) Reajuste de Preços**
- Reajuste em bloco por categoria
- Percentual de aumento/desconto
- Histórico de reajustes

### 10. Módulo de Agendamentos

**Funcionalidades:**
- Calendário visual
- Criar agendamento
- Vincular cliente e veículo
- Atribuir mecânico
- Duração estimada
- Status (agendado, confirmado, em atendimento, concluído)
- Envio de lembretes (email)

### 11. Módulo de Relatórios

**Relatórios disponíveis:**

**a) Aniversariantes**
- Filtro por mês
- Lista com contatos
- Exportar PDF/Excel

**b) Serviços Efetuados**
- Filtro por período
- Por mecânico
- Por tipo de serviço

**c) OS por Período**
- Total de OS
- Valor total
- Status
- Tempo médio

**d) Estatísticas de Desempenho**
- Faturamento mensal
- Produtos mais vendidos
- Serviços mais realizados
- Mecânicos mais produtivos

**e) Relatórios Financeiros**
- Fluxo de caixa
- Contas a pagar/receber
- Inadimplência
- Lucratividade

### 12. Módulo de Configurações

**Funcionalidades:**
- Upload de logotipo
- Upload de fundo de tela
- Dados da oficina
- Dias de garantia padrão
- Configurações de alertas
- Gerenciar usuários
- Permissões por role

---

## 🎨 Componentes Reutilizáveis a Criar

### 1. Modal

```typescript
// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

### 2. DataTable

```typescript
// src/components/ui/DataTable.tsx
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
}
```

### 3. ImageUpload

```typescript
// src/components/ui/ImageUpload.tsx
interface ImageUploadProps {
  bucket: string
  onUpload: (url: string) => void
  currentImage?: string
  maxSize?: number // MB
}
```

### 4. Select com Busca

```typescript
// src/components/ui/SearchableSelect.tsx
interface SearchableSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  loading?: boolean
}
```

### 5. DatePicker

```typescript
// src/components/ui/DatePicker.tsx
interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
}
```

---

## 🔐 Controle de Permissões

### Implementar verificação por role:

```typescript
// src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { profile } = useAuth()

  const can = (action: string, resource: string) => {
    const permissions = {
      admin: ['*'],
      mecanico: ['read:clientes', 'read:veiculos', 'read:produtos', 'write:os'],
      atendente: ['read:*', 'write:clientes', 'write:veiculos', 'write:vendas']
    }

    const userPermissions = permissions[profile?.role || 'atendente']
    return userPermissions.includes('*') || 
           userPermissions.includes(`${action}:${resource}`) ||
           userPermissions.includes(`${action}:*`)
  }

  return { can }
}
```

---

## 📊 Integração com APIs Externas (Opcional)

### 1. Consulta de CEP (ViaCEP)

```typescript
const buscarCEP = async (cep: string) => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  const data = await response.json()
  return data
}
```

### 2. Validação de CPF/CNPJ

```typescript
// Implementar validação de dígitos verificadores
```

### 3. Envio de Email (SendGrid via Supabase Edge Functions)

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, html } = await req.json()
  
  // Implementar envio via SendGrid
  
  return new Response(JSON.stringify({ success: true }))
})
```

---

## 🧪 Testes

### Criar testes unitários:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// src/__tests__/Login.test.tsx
import { render, screen } from '@testing-library/react'
import Login from '@/pages/Login'

describe('Login', () => {
  it('should render login form', () => {
    render(<Login />)
    expect(screen.getByText('Sistema de Oficina')).toBeInTheDocument()
  })
})
```

---

## 📦 Build e Deploy

### 1. Build para Produção

```bash
npm run build
```

### 2. Deploy no Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3. Configurar Variáveis de Ambiente no Vercel

No dashboard do Vercel:
- Settings > Environment Variables
- Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
npm install
```

### Erro de autenticação no Supabase

Verificar:
1. Credenciais no `.env`
2. RLS policies no Supabase
3. Usuário criado corretamente

### Erro de CORS

Configurar no Supabase:
- Settings > API > CORS
- Adicionar origem: `http://localhost:3000`

---

## 📚 Recursos Adicionais

- [Documentação do React](https://react.dev)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do React Router](https://reactrouter.com)
- [Documentação do Zustand](https://zustand-demo.pmnd.rs/)
- [Documentação do React Hook Form](https://react-hook-form.com/)

---

## 🤝 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação
2. Verifique os logs do console
3. Revise as configurações do Supabase

---

**Desenvolvido com ❤️ para oficinas de moto**
