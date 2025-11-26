import { useState } from 'react'
import { useProdutos } from '@/hooks/useProdutos'
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ProdutoForm from '@/components/produtos/ProdutoForm'

export default function ServicosPage() {
  const { produtos, loading, createProduto, updateProduto, deleteProduto } = useProdutos()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServico, setSelectedServico] = useState<any>(null)

  // Filtrar apenas serviços (não produtos)
  const servicosFiltrados = produtos.filter(produto => {
    const isServico = produto.tipo === 'servico'
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    return isServico && matchesSearch
  })

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteProduto(id)
    }
  }

  const openCreateModal = () => {
    setSelectedServico(null)
    setIsModalOpen(true)
  }

  const openEditModal = (servico: any) => {
    setSelectedServico(servico)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedServico(null)
  }

  const handleSubmit = async (data: any) => {
    // Garantir que o tipo seja 'servico'
    const servicoData = { ...data, tipo: 'servico' }
    
    if (selectedServico) {
      await updateProduto(selectedServico.id, servicoData)
    } else {
      await createProduto(servicoData)
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600 mt-1">Gerencie os serviços oferecidos pela oficina</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : servicosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum serviço encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {servicosFiltrados.map((servico) => (
                  <tr key={servico.id}>
                    <td className="font-mono text-sm">{servico.codigo || '-'}</td>
                    <td className="font-medium">{servico.nome}</td>
                    <td>{servico.categoria_nome || '-'}</td>
                    <td className="font-medium">
                      R$ {servico.preco_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-sm text-gray-600 max-w-xs truncate">
                      {servico.descricao || '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(servico)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(servico.id)}
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

        {!loading && servicosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {servicosFiltrados.length} {servicosFiltrados.length !== 1 ? 'serviços' : 'serviço'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedServico ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <ProdutoForm
          produto={selectedServico ? { ...selectedServico, tipo: 'servico' } : { tipo: 'servico' }}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
