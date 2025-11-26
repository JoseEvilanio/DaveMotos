import { ShoppingCart, Plus, Search, Eye, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import VendaForm from '@/components/vendas/VendaForm'
import { useVendas } from '@/hooks/useVendas'

export default function Vendas() {
  const { vendas, loading, createVenda, updateVenda, deleteVenda } = useVendas()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVenda, setSelectedVenda] = useState<any>(null)

  const handleSubmit = async (data: any) => {
    try {
      console.log('Dados recebidos do formulário:', data) // Debug
      
      // Converter o campo desconto para valor_desconto
      const vendaData = {
        ...data,
        valor_desconto: parseFloat(data.desconto) || 0,
        valor_produtos: data.valor_produtos || 0,
        valor_total: data.valor_total || 0,
        // Garantir que cliente_id seja null quando vazio ou undefined
        cliente_id: data.cliente_id && data.cliente_id !== '' ? data.cliente_id : null
      }
      
      // Remover o campo desconto original
      delete vendaData.desconto
      
      console.log('Dados enviados para Supabase:', vendaData) // Debug
      
      if (selectedVenda) {
        await updateVenda(selectedVenda.id, vendaData)
      } else {
        await createVenda(vendaData)
      }
      setIsModalOpen(false)
      setSelectedVenda(null)
    } catch (error) {
      console.error('Erro ao salvar venda:', error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedVenda(null)
  }

  // Calcular estatísticas
  const hoje = new Date().toISOString().split('T')[0]
  const vendasHoje = vendas.filter(v => 
    v.data_venda?.split('T')[0] === hoje
  )
  
  const faturamentoHoje = vendasHoje.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0)
  const mediaVenda = vendas.length > 0 
    ? vendas.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0) / vendas.length 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Vendas de Balcão</h1>
          <p className="text-gray-600 mt-1">Gerencie as vendas de produtos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Nova Venda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vendas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{vendasHoje.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Faturamento Hoje</p>
              <p className="text-2xl font-bold text-green-600">
                {faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Média por Venda</p>
              <p className="text-2xl font-bold text-gray-900">
                {mediaVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vendas Mês</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número ou cliente..."
              className="input pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <input type="date" className="input" defaultValue="2025-10-28" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Valor Total</th>
                    <th>Pagamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.length > 0 ? (
                    vendas.map((venda: any) => (
                      <tr key={venda.id}>
                        <td className="font-mono font-medium">#{venda.id.slice(0, 8)}</td>
                        <td>{venda.cliente_nome || 'Cliente Avulso'}</td>
                        <td>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</td>
                        <td className="font-medium text-green-600">
                          {Number(venda.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {venda.forma_pagamento || 'Não informado'}
                          </span>
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedVenda(venda)
                                setIsModalOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-800" 
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-8">
                        Nenhuma venda encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {vendas.length} venda{vendas.length !== 1 ? 's' : ''}
              </div>
              <div className="text-sm font-medium text-gray-900">
                Faturamento Total: {vendas.reduce((acc: number, v: any) => acc + (Number(v.valor_total) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedVenda ? `Venda #${selectedVenda.id.slice(0, 8)}` : 'Nova Venda'}
        size="full"
      >
        <VendaForm
          venda={selectedVenda}
          mode={selectedVenda ? 'view' : 'create'}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
