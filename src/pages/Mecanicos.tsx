import { useState } from 'react'
import { useMecanicos } from '@/hooks/useMecanicos'
import { Plus, Search, Edit, Trash2, Wrench } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import MecanicoForm from '@/components/mecanicos/MecanicoForm'

export default function Mecanicos() {
  const { mecanicos, loading, createMecanico, updateMecanico, deleteMecanico } = useMecanicos()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedMecanico, setSelectedMecanico] = useState<any>(null)

  const filteredMecanicos = mecanicos.filter(mecanico =>
    mecanico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mecanico.cpf?.includes(searchTerm) ||
    mecanico.telefone?.includes(searchTerm)
  )

  const handleEdit = (mecanico: any) => {
    setSelectedMecanico(mecanico)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este mecânico?')) {
      await deleteMecanico(id)
    }
  }

  const handleSubmit = async (data: any) => {
    if (selectedMecanico) {
      await updateMecanico(selectedMecanico.id, data)
    } else {
      await createMecanico(data)
    }
    setShowModal(false)
    setSelectedMecanico(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Mecânicos</h1>
          <p className="text-gray-600 mt-1">Gerencie os mecânicos da oficina</p>
        </div>
        <button
          onClick={() => {
            setSelectedMecanico(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Mecânico</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando mecânicos...</p>
          </div>
        ) : filteredMecanicos.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum mecânico encontrado</p>
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
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Especialidades</th>
                  <th>Data Admissão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMecanicos.map((mecanico) => (
                  <tr key={mecanico.id}>
                    <td className="font-medium">{mecanico.nome}</td>
                    <td className="font-mono text-sm">{mecanico.cpf || '-'}</td>
                    <td>{mecanico.telefone}</td>
                    <td>
                      {mecanico.especialidades && mecanico.especialidades.length > 0
                        ? mecanico.especialidades.join(', ')
                        : '-'}
                    </td>
                    <td>
                      {mecanico.data_admissao
                        ? new Date(mecanico.data_admissao).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(mecanico)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mecanico.id)}
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
          setSelectedMecanico(null)
        }}
        title={selectedMecanico ? 'Editar Mecânico' : 'Novo Mecânico'}
      >
        <MecanicoForm
          mecanico={selectedMecanico}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setSelectedMecanico(null)
          }}
        />
      </Modal>
    </div>
  )
}
