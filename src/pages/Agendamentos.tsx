import { Calendar, Clock, User, Bike, Edit, Trash2, Plus, LayoutGrid, List as ListIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import PrimaryButton from '@/components/ui/PrimaryButton'
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm'
import { useAgendamentos } from '@/hooks/useAgendamentos'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'

export default function Agendamentos() {
  const { agendamentos, loading, createAgendamento, updateAgendamento, deleteAgendamento } = useAgendamentos()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      // Mapear campos do formulário para colunas reais da tabela
      const payload = {
        cliente_id: data.cliente_id,
        veiculo_id: data.veiculo_id,
        data_agendamento: new Date(`${data.data_agendamento}T${data.hora_agendamento}:00`).toISOString(),
        servico_descricao: data.servico_solicitado,
        observacoes: data.observacoes || null,
        status: data.status || 'agendado',
      }

      if (selectedAgendamento) {
        await updateAgendamento(selectedAgendamento.id, payload)
      } else {
        await createAgendamento(payload)
      }
      setIsModalOpen(false)
      setSelectedAgendamento(null)
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedAgendamento(null)
  }

  const openDeleteModal = (ag: any) => {
    setAgendamentoToDelete(ag)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setAgendamentoToDelete(null)
  }

  const handleDelete = async () => {
    if (!agendamentoToDelete) return
    try {
      setIsDeleting(true)
      await deleteAgendamento(agendamentoToDelete.id)
      setIsDeleteModalOpen(false)
      setAgendamentoToDelete(null)
      if (isModalOpen) {
        setIsModalOpen(false)
        setSelectedAgendamento(null)
      }
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível excluir o agendamento')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calcular estatísticas
  const hoje = new Date().toISOString().split('T')[0]
  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(fimSemana.getDate() + 6)

  const agendamentosHoje = agendamentos.filter(a => 
    a.data_agendamento?.split('T')[0] === hoje
  ).length

  const agendamentosSemana = agendamentos.filter(a => {
    const dataAgendamento = new Date(a.data_agendamento)
    return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana
  }).length

  const agendamentosPendentes = agendamentos.filter(a => 
    a.status === 'agendado' || a.status === 'confirmado'
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'agendado': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie os agendamentos da oficina</p>
        </div>
        <PrimaryButton label="Novo Agendamento" onClick={() => setIsModalOpen(true)} size="md" icon={<Plus className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{agendamentosHoje}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900">{agendamentosSemana}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-green-600">{agendamentosPendentes}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Próximos Agendamentos</h2>
            <div className="flex items-center gap-2">
              <button
                className={`btn px-3 py-2 text-sm flex items-center gap-2 ${viewMode === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('card')}
                aria-label="Visualizar em cartões"
              >
                <LayoutGrid className="w-4 h-4" />
                Card
              </button>
              <button
                className={`btn px-3 py-2 text-sm flex items-center gap-2 ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
                aria-label="Visualizar em lista"
              >
                <ListIcon className="w-4 h-4" />
                Lista
              </button>
            </div>
          </div>

          {agendamentos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum agendamento encontrado</p>
          ) : viewMode === 'card' ? (
            <div className="space-y-4">
              {agendamentos.map((agendamento: any) => (
                <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{agendamento.cliente_nome || 'Cliente não informado'}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Bike className="w-4 h-4" />
                          <span>{agendamento.veiculo_descricao || 'Veículo não informado'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(agendamento.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{agendamento.servico_descricao}</p>
                      {agendamento.observacoes && (
                        <p className="mt-1 text-xs text-gray-500">{agendamento.observacoes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedAgendamento(agendamento)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Editar agendamento"
                        title="Editar agendamento"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(agendamento)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Excluir agendamento"
                        title="Excluir agendamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Veículo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hora</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Serviço</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agendamentos.map((agendamento: any) => (
                    <tr key={agendamento.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{agendamento.cliente_nome || 'Cliente não informado'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{agendamento.veiculo_descricao || 'Veículo não informado'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{new Date(agendamento.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[280px]">{agendamento.servico_descricao}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>{agendamento.status}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedAgendamento(agendamento)
                              setIsModalOpen(true)
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Editar agendamento"
                            title="Editar agendamento"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(agendamento)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Excluir agendamento"
                            title="Excluir agendamento"
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
      >
        <AgendamentoForm
          agendamento={selectedAgendamento}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
        {selectedAgendamento && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => openDeleteModal(selectedAgendamento)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Excluir agendamento"
              title="Excluir definitivamente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Excluir Agendamento"
        itemName={agendamentoToDelete?.cliente_nome ? `Agendamento de ${agendamentoToDelete.cliente_nome}` : 'Agendamento'}
        itemDetails={agendamentoToDelete ? [
          agendamentoToDelete.veiculo_descricao || 'Sem veículo',
          new Date(agendamentoToDelete.data_agendamento).toLocaleString('pt-BR')
        ] : []}
        isDeleting={isDeleting}
      />
    </div>
  )
}
