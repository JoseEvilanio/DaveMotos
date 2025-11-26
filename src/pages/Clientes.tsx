import { useState } from 'react'
import { useClientes } from '@/hooks/useClientes'
import { Plus, Search, Edit, Trash2, User } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ClienteForm from '@/components/clientes/ClienteForm'

export default function Clientes() {
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<any>(null)

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.cpf?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    setShowModal(false)
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
              placeholder="Buscar por nome, telefone, CPF ou email..."
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
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum cliente encontrado</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-1">Tente buscar com outros termos</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
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

        {!loading && filteredClientes.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCliente(null)
        }}
        title={selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
        size="xl"
      >
        <ClienteForm
          cliente={selectedCliente}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setSelectedCliente(null)
          }}
        />
      </Modal>
    </div>
  )
}
