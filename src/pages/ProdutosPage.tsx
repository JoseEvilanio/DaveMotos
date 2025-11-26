import { useState } from 'react'
import { useProdutos } from '@/hooks/useProdutos'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ProdutoForm from '@/components/produtos/ProdutoForm'

export default function ProdutosPage() {
  const { produtos, loading, createProduto, updateProduto, deleteProduto } = useProdutos()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filtrar apenas produtos (não serviços)
  const produtosFiltrados = produtos.filter(produto => {
    const isProduto = produto.tipo === 'produto'
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    return isProduto && matchesSearch
  })

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
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

  const openDetailModal = (produto: any) => {
    setSelectedProduto(produto)
    setIsDetailOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduto(null)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedProduto(null)
  }

  const handleSubmit = async (data: any) => {
    // Garantir que o tipo seja 'produto'
    const produtoData = { ...data, tipo: 'produto' }
    
    if (selectedProduto) {
      await updateProduto(selectedProduto.id, produtoData)
    } else {
      await createProduto(produtoData)
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie os produtos da oficina</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Novo Produto</span>
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
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço Venda</th>
                  <th>Estoque</th>
                  <th>Estoque Mín.</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id}>
                    <td className="font-mono text-sm">{produto.codigo || '-'}</td>
                    <td className="font-medium">
                      <button className="text-blue-600 hover:underline" onClick={()=>openDetailModal(produto)}>{produto.nome}</button>
                    </td>
                    <td>{produto.categoria_nome || '-'}</td>
                    <td className="font-medium">
                      R$ {produto.preco_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={produto.estoque_atual <= produto.estoque_minimo ? 'text-red-600 font-medium' : ''}>
                        {produto.estoque_atual}
                      </span>
                    </td>
                    <td>{produto.estoque_minimo}</td>
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

        {!loading && produtosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {produtosFiltrados.length} {produtosFiltrados.length !== 1 ? 'produtos' : 'produto'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProduto ? 'Editar Produto' : 'Novo Produto'}
      >
        <ProdutoForm
          produto={selectedProduto ? { ...selectedProduto, tipo: 'produto' } : { tipo: 'produto' }}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        title={selectedProduto ? selectedProduto.nome : 'Produto'}
        size="xl"
      >
        {selectedProduto && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {selectedProduto.foto_url ? (
                  <img src={selectedProduto.foto_url} alt={selectedProduto.nome} className="w-full h-64 object-cover rounded border" />
                ) : (
                  <div className="w-full h-64 rounded border bg-gray-50 flex items-center justify-center text-gray-400">Sem imagem</div>
                )}
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Código</div>
                  <div className="font-medium">{selectedProduto.codigo || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Categoria</div>
                  <div className="font-medium">{selectedProduto.categoria_nome || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Preço Venda</div>
                  <div className="font-medium">R$ {selectedProduto.preco_venda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Preço Custo</div>
                  <div className="font-medium">{selectedProduto.preco_custo != null ? `R$ ${selectedProduto.preco_custo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estoque Atual</div>
                  <div className="font-medium">{selectedProduto.estoque_atual}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estoque Mínimo</div>
                  <div className="font-medium">{selectedProduto.estoque_minimo}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Descrição</div>
                  <div className="font-medium whitespace-pre-line">{selectedProduto.descricao || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
