# Exemplo Completo: Módulo de Clientes

Este documento mostra a implementação completa do módulo de Clientes como exemplo para os demais módulos.

## Estrutura de Arquivos

```
src/
├── components/
│   └── clientes/
│       ├── ClientesList.tsx
│       ├── ClienteForm.tsx
│       ├── ClienteModal.tsx
│       └── ClienteHistorico.tsx
├── hooks/
│   └── useClientes.ts
└── pages/
    └── Clientes.tsx (já criado)
```

## 1. Hook Customizado (useClientes.ts)

```typescript
// src/hooks/useClientes.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Cliente {
  id: string
  nome: string
  cpf: string | null
  rg: string | null
  data_nascimento: string | null
  telefone: string
  celular: string | null
  email: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  foto_url: string | null
  observacoes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('is_active', true)
        .order('nome')

      if (error) throw error
      setClientes(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar clientes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createCliente = async (cliente: Partial<Cliente>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single()

      if (error) throw error
      toast.success('Cliente cadastrado com sucesso!')
      await fetchClientes()
      return data
    } catch (error: any) {
      toast.error('Erro ao cadastrar cliente')
      throw error
    }
  }

  const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)

      if (error) throw error
      toast.success('Cliente atualizado com sucesso!')
      await fetchClientes()
    } catch (error: any) {
      toast.error('Erro ao atualizar cliente')
      throw error
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      toast.success('Cliente excluído com sucesso!')
      await fetchClientes()
    } catch (error: any) {
      toast.error('Erro ao excluir cliente')
      throw error
    }
  }

  const uploadFoto = async (file: File, clienteId: string) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${clienteId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('clientes-fotos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('clientes-fotos')
        .getPublicUrl(filePath)

      await updateCliente(clienteId, { foto_url: publicUrl })
      return publicUrl
    } catch (error: any) {
      toast.error('Erro ao fazer upload da foto')
      throw error
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return {
    clientes,
    loading,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    uploadFoto,
  }
}
```

## 2. Formulário de Cliente (ClienteForm.tsx)

```typescript
// src/components/clientes/ClienteForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  telefone: z.string().min(10, 'Telefone inválido'),
  celular: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: any
  onSubmit: (data: ClienteFormData) => Promise<void>
  onCancel: () => void
}

export default function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Nome Completo *</label>
          <input {...register('nome')} className="input" />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label className="label">CPF</label>
          <input {...register('cpf')} className="input" placeholder="000.000.000-00" />
        </div>

        <div>
          <label className="label">RG</label>
          <input {...register('rg')} className="input" />
        </div>

        <div>
          <label className="label">Data de Nascimento</label>
          <input {...register('data_nascimento')} type="date" className="input" />
        </div>

        <div>
          <label className="label">Telefone *</label>
          <input {...register('telefone')} className="input" placeholder="(00) 0000-0000" />
          {errors.telefone && (
            <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
          )}
        </div>

        <div>
          <label className="label">Celular</label>
          <input {...register('celular')} className="input" placeholder="(00) 00000-0000" />
        </div>

        <div>
          <label className="label">Email</label>
          <input {...register('email')} type="email" className="input" />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">CEP</label>
          <input {...register('cep')} className="input" placeholder="00000-000" />
        </div>

        <div className="md:col-span-2">
          <label className="label">Endereço</label>
          <input {...register('endereco')} className="input" />
        </div>

        <div>
          <label className="label">Número</label>
          <input {...register('numero')} className="input" />
        </div>

        <div>
          <label className="label">Complemento</label>
          <input {...register('complemento')} className="input" />
        </div>

        <div>
          <label className="label">Bairro</label>
          <input {...register('bairro')} className="input" />
        </div>

        <div>
          <label className="label">Cidade</label>
          <input {...register('cidade')} className="input" />
        </div>

        <div>
          <label className="label">Estado</label>
          <select {...register('estado')} className="input">
            <option value="">Selecione...</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Observações</label>
          <textarea {...register('observacoes')} className="input" rows={3} />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary flex items-center space-x-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <span>Salvar</span>
          )}
        </button>
      </div>
    </form>
  )
}
```

## 3. Modal de Cliente (ClienteModal.tsx)

```typescript
// src/components/clientes/ClienteModal.tsx
import { X } from 'lucide-react'
import ClienteForm from './ClienteForm'

interface ClienteModalProps {
  isOpen: boolean
  onClose: () => void
  cliente?: any
  onSubmit: (data: any) => Promise<void>
}

export default function ClienteModal({ isOpen, onClose, cliente, onSubmit }: ClienteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-gray-900">
                {cliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4">
            <ClienteForm
              cliente={cliente}
              onSubmit={async (data) => {
                await onSubmit(data)
                onClose()
              }}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 4. Página Principal Completa (Clientes.tsx)

```typescript
// src/pages/Clientes.tsx
import { useState } from 'react'
import { useClientes } from '@/hooks/useClientes'
import { Plus, Search, Edit, Trash2, Eye, Camera } from 'lucide-react'
import ClienteModal from '@/components/clientes/ClienteModal'

export default function Clientes() {
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<any>(null)

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.cpf?.includes(searchTerm)
  )

  const handleEdit = (cliente: any) => {
    setSelectedCliente(cliente)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteCliente(id)
    }
  }

  const handleSubmit = async (data: any) => {
    if (selectedCliente) {
      await updateCliente(selectedCliente.id, data)
    } else {
      await createCliente(data)
    }
    setSelectedCliente(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie os clientes da oficina</p>
        </div>
        <button
          onClick={() => {
            setSelectedCliente(null)
            setShowModal(true)
          }}
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
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando clientes...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Cidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      {cliente.foto_url ? (
                        <img
                          src={cliente.foto_url}
                          alt={cliente.nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="font-medium">{cliente.nome}</td>
                    <td>{cliente.telefone}</td>
                    <td>{cliente.cpf || '-'}</td>
                    <td>{cliente.email || '-'}</td>
                    <td>{cliente.cidade || '-'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
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

      <ClienteModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCliente(null)
        }}
        cliente={selectedCliente}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
```

## Próximos Passos

1. Implementar upload de foto
2. Adicionar histórico de serviços
3. Criar relatório de aniversariantes
4. Adicionar validação de CPF
5. Integrar com ViaCEP para busca de endereço

Use este exemplo como base para implementar os demais módulos do sistema!
