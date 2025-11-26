import { useState } from 'react'
import { useFornecedores } from '@/hooks/useFornecedores'
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import FornecedorForm from '@/components/fornecedores/FornecedorForm'

export default function Fornecedores() {
  const { fornecedores, loading, createFornecedor, updateFornecedor, deleteFornecedor } = useFornecedores()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedFornecedor, setSelectedFornecedor] = useState<any>(null)

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj?.includes(searchTerm) ||
    fornecedor.telefone?.includes(searchTerm)
  )

  const handleEdit = (fornecedor: any) => {
    setSelectedFornecedor(fornecedor)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await deleteFornecedor(id)
    }
  }

  const handleSubmit = async (data: any) => {
    if (selectedFornecedor) {
      await updateFornecedor(selectedFornecedor.id, data)
    } else {
      await createFornecedor(data)
    }
    setShowModal(false)
    setSelectedFornecedor(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600 mt-1">Gerencie os fornecedores da oficina</p>
        </div>
        <button
          onClick={() => {
            setSelectedFornecedor(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por razão social, nome fantasia, CNPJ ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando fornecedores...</p>
          </div>
        ) : filteredFornecedores.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum fornecedor encontrado</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-1">Tente buscar com outros termos</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>Nome Fantasia</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Cidade/UF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td className="font-medium">{fornecedor.razao_social}</td>
                    <td>{fornecedor.nome_fantasia || '-'}</td>
                    <td className="font-mono text-sm">{fornecedor.cnpj || '-'}</td>
                    <td>{fornecedor.telefone}</td>
                    <td>{fornecedor.email || '-'}</td>
                    <td>
                      {fornecedor.cidade && fornecedor.estado
                        ? `${fornecedor.cidade}/${fornecedor.estado}`
                        : '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(fornecedor)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fornecedor.id)}
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

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedFornecedor(null)
        }}
        title={selectedFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
        <FornecedorForm
          fornecedor={selectedFornecedor}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setSelectedFornecedor(null)
          }}
        />
      </Modal>
    </div>
  )
}
