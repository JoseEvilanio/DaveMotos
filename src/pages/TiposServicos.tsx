import { useState } from 'react'
import { useTiposServicos } from '@/hooks/useTiposServicos'
import { Plus, Search, Edit, Trash2, Wrench } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import TipoServicoForm from '@/components/servicos/TipoServicoForm'

export default function TiposServicos() {
  const { tiposServicos, loading, createTipoServico, updateTipoServico, deleteTipoServico } = useTiposServicos()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState<any>(null)

  const filteredTipos = tiposServicos.filter(tipo =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tipo de serviço?')) {
      await deleteTipoServico(id)
    }
  }

  const openCreateModal = () => {
    setSelectedTipo(null)
    setIsModalOpen(true)
  }

  const openEditModal = (tipo: any) => {
    setSelectedTipo(tipo)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTipo(null)
  }

  const handleSubmit = async (data: any) => {
    if (selectedTipo) {
      await updateTipoServico(selectedTipo.id, data)
    } else {
      await createTipoServico(data)
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Tipos de Serviços</h1>
          <p className="text-gray-600 mt-1">Gerencie os tipos de serviços oferecidos</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Novo Tipo</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tipo de serviço..."
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
        ) : filteredTipos.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum tipo de serviço encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço Base</th>
                  <th>Tempo Estimado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTipos.map((tipo) => (
                  <tr key={tipo.id}>
                    <td className="font-medium">{tipo.nome}</td>
                    <td className="text-gray-600">{tipo.descricao || '-'}</td>
                    <td className="font-medium">
                      R$ {tipo.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {tipo.tempo_estimado ? `${tipo.tempo_estimado} min` : '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(tipo)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tipo.id)}
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

        {!loading && filteredTipos.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredTipos.length} {filteredTipos.length !== 1 ? 'tipos' : 'tipo'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedTipo ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'}
      >
        <TipoServicoForm
          tipoServico={selectedTipo}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
