import { FileText, Plus, Search, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'
import OrdemServicoFormCompleto from '@/components/ordens/OrdemServicoFormCompleto'
import { useOrdensServico } from '@/hooks/useOrdensServico'

// Função helper para renderizar badge de status
const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    'aberta': { label: 'Aberta', className: 'bg-blue-100 text-blue-800', icon: Clock },
    'em_andamento': { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'aguardando_pecas': { label: 'Aguardando Peças', className: 'bg-orange-100 text-orange-800', icon: Clock },
    'concluida': { label: 'Concluída', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const config = statusConfig[status] || statusConfig['aberta']
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export default function OrdensServico() {
  const { ordens, loading, deleteOrdem, getOrdemById, createOrdem, updateOrdem } = useOrdensServico()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOS, setSelectedOS] = useState<any>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [osToDelete, setOsToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEmitirNota = async (os: any) => {
    try {
      toast.loading('Carregando detalhes da OS...', { id: 'loading-os-details' })
      const osCompleta = await getOrdemById(os.id)
      toast.dismiss('loading-os-details')
      navigate('/fiscal/nfce', { state: { origem: 'os', dados: osCompleta } })
    } catch (error) {
      toast.dismiss('loading-os-details')
      toast.error('Erro ao carregar detalhes da OS para emissão')
      console.error(error)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (selectedOS) {
        // Atualizar OS existente
        await updateOrdem(selectedOS.id, data)
      } else {
        // Criar nova OS
        await createOrdem(data)
      }
      setIsModalOpen(false)
      setSelectedOS(null)
    } catch (error) {
      console.error('Erro ao salvar OS:', error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOS(null)
  }

  const handleDelete = async () => {
    if (!osToDelete) return

    try {
      setIsDeleting(true)
      await deleteOrdem(osToDelete.id)
      setIsDeleteModalOpen(false)
      setOsToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (os: any) => {
    setOsToDelete(os)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setOsToDelete(null)
  }

  const handleEdit = async (os: any) => {
    try {
      console.log('Iniciando edição da OS:', os.id)

      // Buscar dados completos da OS, incluindo serviços e peças
      const osCompleta = await getOrdemById(os.id)
      console.log('OS completa carregada:', osCompleta)

      // Forçar a criação de arrays vazios se não existirem
      const osFormatada = {
        ...osCompleta,
        servicos: Array.isArray(osCompleta.servicos) ? osCompleta.servicos : [],
        pecas: Array.isArray(osCompleta.pecas) ? osCompleta.pecas : []
      }

      console.log('OS formatada para o modal:', osFormatada)
      console.log('Serviços formatados:', osFormatada.servicos)
      console.log('Peças formatadas:', osFormatada.pecas)

      // Definir o estado e abrir o modal
      setSelectedOS(osFormatada)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Erro ao carregar OS:', error)
    }
  }

  // Calcular estatísticas
  const stats = {
    abertas: ordens.filter(os => os.status === 'aberta').length,
    emAndamento: ordens.filter(os => os.status === 'em_andamento').length,
    concluidas: ordens.filter(os => os.status === 'concluida').length,
    total: ordens.length
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      aberta: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      em_andamento: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      aguardando_pecas: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Clock },
      concluida: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    } as Record<string, { bg: string; text: string; icon: any }>
    const key = status
    const style = styles[key] || styles.aberta
    const Icon = style.icon
    const label = status.replace('_', ' ')
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-moto-darkest flex items-center gap-3">
            <FileText className="w-10 h-10 text-primary-600" />
            Ordens de Serviço
          </h1>
          <p className="text-moto-steel mt-2">Gerencie todas as ordens de serviço da oficina</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2 text-lg px-6 py-3"
        >
          <Plus className="w-6 h-6" />
          <span>Nova OS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1 uppercase tracking-wide">Abertas</p>
              <p className="text-4xl font-display font-bold text-blue-900">{stats.abertas}</p>
              <p className="text-xs text-blue-600 mt-1">Aguardando início</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-600 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-moto-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1 uppercase tracking-wide">Em Andamento</p>
              <p className="text-4xl font-display font-bold text-orange-900">{stats.emAndamento}</p>
              <p className="text-xs text-orange-600 mt-1">Em execução</p>
            </div>
            <div className="p-4 rounded-xl bg-moto-orange shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Concluídas</p>
              <p className="text-4xl font-display font-bold text-green-900">{stats.concluidas}</p>
              <p className="text-xs text-green-600 mt-1">Finalizadas</p>
            </div>
            <div className="p-4 rounded-xl bg-green-600 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-moto-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">Total</p>
              <p className="text-4xl font-display font-bold text-moto-darkest">{stats.total}</p>
              <p className="text-xs text-gray-600 mt-1">Todas as OS</p>
            </div>
            <div className="p-4 rounded-xl bg-moto-dark shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou veículo..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Defeito</th>
                <th>Status</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : ordens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma ordem de serviço encontrada
                  </td>
                </tr>
              ) : (
                ordens.map((os: any) => (
                  <tr key={os.id}>
                    <td className="font-mono font-medium">{os.numero_os || '-'}</td>
                    <td>{os.cliente_nome || '-'}</td>
                    <td className="text-sm">{os.veiculo_descricao || '-'}</td>
                    <td className="text-sm">{os.defeito_reclamado || '-'}</td>
                    <td>{getStatusBadge(os.status)}</td>
                    <td>{new Date(os.data_abertura).toLocaleDateString('pt-BR')}</td>
                    <td className="font-medium">R$ {Number(os.valor_total || 0).toFixed(2)}</td>
                    <td>
                      <div className="flex space-x-2">
                        {os.status === 'concluida' && (
                          <button
                            onClick={() => handleEmitirNota(os)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Emitir Nota Fiscal"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-800" title="Visualizar">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(os)}
                          className="text-green-600 hover:text-green-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(os)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        size="2xl"
      >
        <OrdemServicoFormCompleto
          key={selectedOS ? `edit-${selectedOS.id}` : 'new'}
          os={selectedOS}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Excluir Ordem de Serviço"
        itemName={`OS #${osToDelete?.numero_os || osToDelete?.numero || '-'}`}
        itemDetails={[
          `Cliente: ${osToDelete?.cliente_nome || osToDelete?.cliente || '-'}`,
          `Veículo: ${osToDelete?.veiculo_descricao || osToDelete?.veiculo || '-'}`,
          `Status: ${osToDelete?.status || '-'}`,
          `Valor Total: R$ ${Number(osToDelete?.valor_total || 0).toFixed(2)}`
        ]}
        isDeleting={isDeleting}
      />
    </div>
  )
}
