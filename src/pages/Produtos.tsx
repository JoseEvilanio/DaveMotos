import { useState } from 'react'
import { useProdutos } from '@/hooks/useProdutos'
import { Plus, Search, Edit, Trash2, Package, Tag } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ProdutoForm from '@/components/produtos/ProdutoForm'

export default function Produtos() {
  const { produtos, loading, createProduto, updateProduto, deleteProduto } = useProdutos()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<'all' | 'produto' | 'servico'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<any>(null)

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === 'all' || produto.tipo === filterTipo
    return matchesSearch && matchesTipo
  })

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      await deleteProduto(id)
    }
  }

  const openCreateModal = () => {
    setSelectedProduto(null)
    setIsModalOpen(true)
  }

  const openEditModal = (produto: any) => {
    setSelectedProduto(produto)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduto(null)
  }

  const handleSubmit = async (data: any) => {
    if (selectedProduto) {
      await updateProduto(selectedProduto.id, data)
    } else {
      await createProduto(data)
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Produtos e Serviços</h1>
          <p className="text-gray-600 mt-1">Gerencie produtos e serviços da oficina</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Novo Item</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTipo('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTipo === 'all'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterTipo('produto')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTipo === 'produto'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setFilterTipo('servico')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTipo === 'servico'
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Serviços
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Preço Venda</th>
                  <th>Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id}>
                    <td className="font-mono text-sm">{produto.codigo || '-'}</td>
                    <td className="font-medium">{produto.nome}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        produto.tipo === 'produto' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {produto.tipo === 'produto' ? (
                          <><Package className="w-3 h-3 mr-1" /> Produto</>
                        ) : (
                          <><Tag className="w-3 h-3 mr-1" /> Serviço</>
                        )}
                      </span>
                    </td>
                    <td>{produto.categoria_nome || '-'}</td>
                    <td className="font-medium">
                      R$ {produto.preco_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {produto.tipo === 'produto' ? (
                        <span className={produto.estoque_atual <= produto.estoque_minimo ? 'text-red-600 font-medium' : ''}>
                          {produto.estoque_atual}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(produto)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id)}
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

        {!loading && filteredProdutos.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredProdutos.length} {filteredProdutos.length !== 1 ? 'itens' : 'item'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProduto ? 'Editar Item' : 'Novo Item'}
      >
        <ProdutoForm
          produto={selectedProduto}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
