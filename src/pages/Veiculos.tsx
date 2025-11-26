import { useState } from 'react'
import { useVeiculos } from '@/hooks/useVeiculos'
import { Plus, Search, Edit, Trash2, Bike } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import VeiculoForm from '@/components/veiculos/VeiculoForm'

export default function Veiculos() {
  const { veiculos, loading, createVeiculo, updateVeiculo, deleteVeiculo } = useVeiculos()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedVeiculo, setSelectedVeiculo] = useState<any>(null)

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (veiculo: any) => {
    setSelectedVeiculo(veiculo)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      await deleteVeiculo(id)
    }
  }

  const handleSubmit = async (data: any) => {
    if (selectedVeiculo) {
      await updateVeiculo(selectedVeiculo.id, data)
    } else {
      await createVeiculo(data)
    }
    setShowModal(false)
    setSelectedVeiculo(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600 mt-1">Gerencie os veículos cadastrados</p>
        </div>
        <button
          onClick={() => {
            setSelectedVeiculo(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Veículo</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, placa ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando veículos...</p>
          </div>
        ) : filteredVeiculos.length === 0 ? (
          <div className="text-center py-8">
            <Bike className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo encontrado</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-1">Tente buscar com outros termos</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Ano</th>
                  <th>Placa</th>
                  <th>Cor</th>
                  <th>KM</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVeiculos.map((veiculo) => (
                  <tr key={veiculo.id}>
                    <td className="font-medium">{veiculo.cliente_nome || '-'}</td>
                    <td>{veiculo.marca}</td>
                    <td>{veiculo.modelo}</td>
                    <td>{veiculo.ano}</td>
                    <td className="font-mono">{veiculo.placa}</td>
                    <td>{veiculo.cor || '-'}</td>
                    <td>{veiculo.km_atual ? veiculo.km_atual.toLocaleString() : '-'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(veiculo)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(veiculo.id)}
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

        {!loading && filteredVeiculos.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredVeiculos.length} veículo{filteredVeiculos.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedVeiculo(null)
        }}
        title={selectedVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
        size="xl"
      >
        <VeiculoForm
          veiculo={selectedVeiculo}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setSelectedVeiculo(null)
          }}
        />
      </Modal>
    </div>
  )
}
