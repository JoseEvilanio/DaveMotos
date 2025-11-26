import { useState, useEffect } from 'react'
import { 
  DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
  Plus, Search, Edit, Trash2, DollarSign as PayIcon
} from 'lucide-react'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import Modal from '@/components/ui/Modal'
import FinanceiroContaForm from '@/components/financeiro/FinanceiroContaForm'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'

// Utilitário: data local em YYYY-MM-DD (sem deslocamento UTC)
const toYMDLocal = (input?: Date | string) => {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input
  const d = input ? new Date(input) : new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Formatar YYYY-MM-DD para DD/MM/AAAA sem criar Date UTC
const formatDateBR = (value?: string | null) => {
  if (!value) return ''
  const s = String(value)
  const ymd = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, d] = ymd.split('-')
    return `${d}/${m}/${y}`
  }
  // Fallback seguro
  try { return new Date(s).toLocaleDateString('pt-BR') } catch { return s }
}

export default function Financeiro() {
  const { 
    contasPagar, 
    contasReceber, 
    loading, 
    fetchAll, 
    createContaPagar, 
    createContaReceber,
    updateContaPagar,
    updateContaReceber,
    deleteContaPagar,
    deleteContaReceber
  } = useFinanceiro()

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedConta, setSelectedConta] = useState<any>(null)
  const [modalTipo, setModalTipo] = useState<'pagar' | 'receber'>('pagar')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [activeTab, setActiveTab] = useState<'pagar' | 'receber'>('pagar')
  const [showReceberModal, setShowReceberModal] = useState(false)
  const [receberValor, setReceberValor] = useState<number>(0)
  const [receberForma, setReceberForma] = useState<'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'cheque'>('dinheiro')
  const [receberData, setReceberData] = useState<string>('')
  const [receberErro, setReceberErro] = useState<string>('')

  useEffect(() => {
    fetchAll()
  }, [])

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      vencido: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      pago: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelado: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
    }
    const style = styles[status as keyof typeof styles] || styles.pendente
    const Icon = style.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const handleCreate = (tipo: 'pagar' | 'receber') => {
    setModalTipo(tipo)
    setSelectedConta(null)
    setShowModal(true)
  }

  const handleEdit = (conta: any, tipo: 'pagar' | 'receber') => {
    setModalTipo(tipo)
    setSelectedConta({ ...conta, tipo })
    setShowModal(true)
  }

  const handleDelete = (conta: any, tipo: 'pagar' | 'receber') => {
    setSelectedConta({ ...conta, tipo })
    setShowDeleteModal(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      if (selectedConta) {
        // Edit mode
        if (data.tipo === 'pagar') {
          await updateContaPagar(selectedConta.id, data)
        } else {
          await updateContaReceber(selectedConta.id, data)
        }
      } else {
        // Create mode
        if (data.tipo === 'pagar') {
          await createContaPagar(data)
        } else {
          await createContaReceber(data)
        }
      }
      setShowModal(false)
      setSelectedConta(null)
    } catch (error) {
      console.error('Erro ao salvar conta:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedConta) return
    
    try {
      if (selectedConta.tipo === 'pagar') {
        await deleteContaPagar(selectedConta.id)
      } else {
        await deleteContaReceber(selectedConta.id)
      }
      setShowDeleteModal(false)
      setSelectedConta(null)
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
    }
  }

  const handlePayment = async (conta: any, tipo: 'pagar' | 'receber') => {
    try {
      const today = toYMDLocal()
      if (tipo === 'pagar') {
        const paymentData = { status: 'pago' as const, data_pagamento: today, valor_pago: conta.valor }
        await updateContaPagar(conta.id, paymentData)
      } else {
        const recebidoAtual = Number(conta.valor_recebido || 0)
        const restante = Math.max(0, Number(conta.valor || 0) - recebidoAtual)
        setSelectedConta(conta)
        setReceberValor(restante || Number(conta.valor || 0))
        setReceberForma((conta.forma_pagamento as any) || 'dinheiro')
        setReceberData('')
        setReceberErro('')
        setShowReceberModal(true)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
    }
  }

  const confirmReceber = async () => {
    if (!selectedConta) return
    setReceberErro('')
    const hoje = toYMDLocal()
    const recebidoAtual = Number(selectedConta.valor_recebido || 0)
    const novoRecebido = recebidoAtual + Number(receberValor || 0)
    const valorTotal = Number(selectedConta.valor || 0)
    const restante = Math.max(0, valorTotal - recebidoAtual)
    if (!receberValor || Number.isNaN(receberValor) || receberValor <= 0) {
      setReceberErro('Informe um valor válido')
      return
    }
    if (receberValor > restante) {
      setReceberErro(`Valor não pode exceder o restante de R$ ${restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      return
    }
    console.log('[Financeiro confirmReceber]', {
      contaId: selectedConta.id,
      recebidoAtual,
      receberValor,
      valorTotal,
      restante,
      forma: receberForma,
      data: receberData || hoje
    })
    const statusFinal = novoRecebido >= valorTotal ? 'pago' as const : 'pendente' as const
    const payload = {
      status: statusFinal,
      data_recebimento: receberData || hoje,
      valor_recebido: novoRecebido,
      forma_pagamento: receberForma,
    }
    try {
      await updateContaReceber(selectedConta.id, payload)
      setShowReceberModal(false)
      setSelectedConta(null)
      setReceberData('')
    } catch (e) {
      console.error(e)
    }
  }

  const filteredContasPagar = contasPagar.filter(conta => {
    const matchesSearch = conta.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.fornecedor_nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || conta.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredContasReceber = contasReceber.filter(conta => {
    const matchesSearch = conta.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || conta.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalPagar = filteredContasPagar.filter(c => c.status !== 'pago' && c.status !== 'cancelado').reduce((acc, c) => acc + (c.valor || 0), 0)
  const totalReceber = filteredContasReceber
    .filter(c => c.status !== 'cancelado')
    .reduce((acc, c) => acc + Math.max(0, Number(c.valor || 0) - Number(c.valor_recebido || 0)), 0)
  const saldo = totalReceber - totalPagar

  const contasVencidasPagar = filteredContasPagar.filter(c => c.status === 'vencido').length
  const contasVencidasReceber = filteredContasReceber.filter(c => c.status === 'vencido').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-1">Gerencie contas a pagar e receber</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleCreate('pagar')} className="btn bg-red-600 text-white hover:bg-red-700">
            <TrendingDown className="w-4 h-4 mr-2" />
            Nova Despesa
          </button>
          <button onClick={() => handleCreate('receber')} className="btn bg-green-600 text-white hover:bg-green-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">A Receber</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">A Pagar</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Saldo</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">
                {contasVencidasPagar + contasVencidasReceber}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por descrição, cliente ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pagar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pagar'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contas a Pagar ({filteredContasPagar.length})
          </button>
          <button
            onClick={() => setActiveTab('receber')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'receber'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contas a Receber ({filteredContasReceber.length})
          </button>
        </nav>
      </div>

      {/* Lista de Contas */}
      <div className="space-y-4">
        {activeTab === 'pagar' ? (
          filteredContasPagar.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta a pagar encontrada
            </div>
          ) : (
            filteredContasPagar.map((conta) => (
              <div key={conta.id} className="card border-l-4 border-l-red-400">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{conta.descricao}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {conta.fornecedor_nome && `Fornecedor: ${conta.fornecedor_nome} • `}
                      Vencimento: {formatDateBR(conta.data_vencimento)}
                    </p>
                    {conta.categoria && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {conta.categoria}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(conta.status)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-red-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex gap-2">
                    {conta.status === 'pendente' && (
                      <button 
                        onClick={() => handlePayment(conta, 'pagar')}
                        className="btn btn-sm btn-primary"
                      >
                        <PayIcon className="w-3 h-3 mr-1" />
                        Pagar
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(conta, 'pagar')}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(conta, 'pagar')}
                      className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          filteredContasReceber.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta a receber encontrada
            </div>
          ) : (
            filteredContasReceber.map((conta) => (
              <div key={conta.id} className="card border-l-4 border-l-green-400">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{conta.descricao}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {conta.cliente_nome && `Cliente: ${conta.cliente_nome} • `}
                      Vencimento: {formatDateBR(conta.data_vencimento)}
                    </p>
                    {conta.os_numero && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        OS #{conta.os_numero}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(conta.status)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-green-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex gap-2">
                    {conta.status === 'pendente' && (
                      <button 
                        onClick={() => handlePayment(conta, 'receber')}
                        className="btn btn-sm btn-success"
                      >
                        <PayIcon className="w-3 h-3 mr-1" />
                        Receber
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(conta, 'receber')}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(conta, 'receber')}
                      className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={`${selectedConta ? 'Editar' : 'Nova'} ${modalTipo === 'pagar' ? 'Despesa' : 'Receita'}`}
      >
        <div className="p-6">
          <FinanceiroContaForm
            tipoInicial={modalTipo}
            initialData={selectedConta}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        itemName={`${selectedConta?.descricao || 'Conta'} (${selectedConta?.tipo === 'pagar' ? 'Despesa' : 'Receita'})`}
        itemDetails={[
          selectedConta?.valor != null ? `Valor: R$ ${(selectedConta?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : undefined,
          selectedConta?.data_vencimento ? `Vencimento: ${formatDateBR(selectedConta?.data_vencimento)}` : undefined,
        ].filter(Boolean) as string[]}
      />

      <Modal isOpen={showReceberModal} onClose={() => setShowReceberModal(false)} title="Registrar Recebimento">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Valor a receber (R$)</label>
              <input type="number" step="0.01" className="input" value={receberValor}
                onChange={(e) => setReceberValor(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Forma de pagamento</label>
              <select className="input" value={receberForma} onChange={(e) => setReceberForma(e.target.value as any)}>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão Crédito</option>
                <option value="cartao_debito">Cartão Débito</option>
                <option value="boleto">Boleto</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="label">Data de recebimento</label>
              <input type="date" className="input" value={receberData} onChange={(e) => setReceberData(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Valor total (R$)</label>
              <div className="input bg-gray-50">{Number(selectedConta?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <label className="label">Recebido (R$)</label>
              <div className="input bg-gray-50">{Number(selectedConta?.valor_recebido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <label className="label">Restante (R$)</label>
              <div className="input bg-gray-50">{Math.max(0, Number(selectedConta?.valor || 0) - Number(selectedConta?.valor_recebido || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          {receberErro && <p className="text-sm text-red-600">{receberErro}</p>}
          <div className="flex justify-end gap-2">
            <button className="btn btn-secondary" onClick={() => setShowReceberModal(false)}>Cancelar</button>
            <button className="btn btn-success" onClick={confirmReceber}>Confirmar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
