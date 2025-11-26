import { 
  DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
  Search, Filter, Calendar, ArrowUpCircle, ArrowDownCircle, Wallet,
  FileText, User, Building2, CreditCard, Plus
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'
import Modal from '@/components/ui/Modal'
import FinanceiroContaForm from '@/components/financeiro/FinanceiroContaForm'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { supabase } from '@/lib/supabase'

// Utilitários de data: evitar deslocamento ao exibir YYYY-MM-DD
const toYMDLocal = (input?: Date | string) => {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input
  const d = input ? new Date(input) : new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const formatDateBR = (value?: string | null) => {
  if (!value) return ''
  const s = String(value)
  const ymd = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, d] = ymd.split('-')
    return `${d}/${m}/${y}`
  }
  try { return new Date(s).toLocaleDateString('pt-BR') } catch { return s }
}
export default function Financeiro() {
  const formatCurrency = (value: number | string | null | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0)
    if (Number.isNaN(num)) return '0,00'
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [selectedConta, setSelectedConta] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [receiveConta, setReceiveConta] = useState<any>(null)
  const [receiveAmount, setReceiveAmount] = useState<string>('')
  const [receiveMethod, setReceiveMethod] = useState<string>('dinheiro')
  const [receiveDate, setReceiveDate] = useState<string>('')
  const [receiveError, setReceiveError] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTipo, setEditTipo] = useState<'pagar' | 'receber'>('pagar')
  const [editConta, setEditConta] = useState<any>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTipo, setDeleteTipo] = useState<'pagar' | 'receber'>('pagar')
  const [deleteConta, setDeleteConta] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const { contasPagar, contasReceber, loading, createContaPagar, createContaReceber, pagarConta, receberConta, updateContaPagar, updateContaReceber, deleteContaPagar, deleteContaReceber } = useFinanceiro()

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: { 
        bg: 'bg-yellow-100 border-yellow-300', 
        text: 'text-yellow-800', 
        icon: Clock,
        label: 'Pendente'
      },
      vencido: { 
        bg: 'bg-red-100 border-red-300', 
        text: 'text-red-800', 
        icon: AlertCircle,
        label: 'Vencido'
      },
      pago: { 
        bg: 'bg-green-100 border-green-300', 
        text: 'text-green-800', 
        icon: CheckCircle,
        label: 'Pago'
      },
    }
    const style = styles[status as keyof typeof styles] || styles.pendente
    const Icon = style.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {style.label}
      </span>
    )
  }

  const handlePagar = (conta: any) => {
    setSelectedConta(conta)
    setIsPayModalOpen(true)
  }

  const confirmPagar = async () => {
    try {
      setIsProcessing(true)
      await pagarConta(selectedConta.id, { valor_pago: selectedConta.valor })
      setIsPayModalOpen(false)
      setSelectedConta(null)
    } catch (e: any) {
      // erros já exibidos via toast
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReceber = (conta: any) => {
    const atual = Number(conta.valor_recebido || 0)
    const total = Number(conta.valor || 0)
    const restante = Math.max(0, total - atual)
    setReceiveConta(conta)
    setReceiveAmount(restante ? String(restante) : '')
    setReceiveMethod('dinheiro')
    setReceiveDate('')
    setReceiveError('')
    setIsReceiveModalOpen(true)
  }

  const confirmReceber = async () => {
    try {
      setReceiveError('')
      setIsProcessing(true)
      const atual = Number(receiveConta?.valor_recebido || 0)
      const total = Number(receiveConta?.valor || 0)
      const restante = Math.max(0, total - atual)
      const valor = Number(receiveAmount)
      if (!valor || Number.isNaN(valor) || valor <= 0) {
        setReceiveError('Informe um valor válido')
        setIsProcessing(false)
        return
      }
      if (valor > restante) {
        setReceiveError(`Valor não pode exceder o restante de R$ ${restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        setIsProcessing(false)
        return
      }
      console.log('[UI Receber] conta=', receiveConta?.id, 'valor=', valor, 'atual=', atual, 'total=', total, 'restante=', restante, 'metodo=', receiveMethod, 'data=', receiveDate)
      await receberConta(receiveConta.id, { valor_recebido: valor, forma_pagamento: receiveMethod as any, data_recebimento: receiveDate || undefined })
      setIsReceiveModalOpen(false)
      setReceiveConta(null)
      setReceiveAmount('')
      setReceiveDate('')
    } catch (e: any) {
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = async (conta: any, tipo: 'pagar' | 'receber') => {
    let c = { ...(conta || {}) }
    if (tipo === 'receber') {
      try {
        // Fallback imediato para schemas alternativos (EN)
        c.cliente_id = c.cliente_id ?? c.customer_id ?? null
        c.descricao = c.descricao ?? c.description ?? ''
        c.observacoes = c.observacoes ?? c.observations ?? c.notes ?? ''
        // Derivar cliente e descrição pela venda
        if (!c?.cliente_id && c?.sale_id) {
          const { data: vendas } = await supabase
            .from('vendas')
            .select('id,cliente_id,numero_venda')
            .in('id', [c.sale_id] as any)
          const venda = Array.isArray(vendas) ? (vendas as any[])[0] : null
          if (venda) {
            c.cliente_id = c.cliente_id || venda.cliente_id || null
            if (!c?.descricao || String(c.descricao).trim().length === 0) {
              c.descricao = venda.numero_venda ? `Venda #${venda.numero_venda}` : c.descricao || ''
            }
          }
        }
        // Derivar cliente e descrição pela OS
        if (!c?.cliente_id && c?.os_id) {
          const { data: ordens } = await supabase
            .from('ordens_servico')
            .select('id,cliente_id,numero_os')
            .in('id', [c.os_id] as any)
          const os = Array.isArray(ordens) ? (ordens as any[])[0] : null
          if (os) {
            c.cliente_id = c.cliente_id || os.cliente_id || null
            if (!c?.descricao || String(c.descricao).trim().length === 0) {
              c.descricao = os.numero_os ? `OS #${os.numero_os}` : c.descricao || ''
            }
          }
        }
      } catch (e) {
        // seguir sem bloquear a edição; formulário lida com ausência
        console.warn('Derivação em handleEdit falhou:', (e as any)?.message || e)
        
      }
      // Diagnóstico bruto do Supabase para contas_receber
      try {
        const { data: contaBruta } = await supabase
          .from('contas_receber')
          .select('*, vendas: sale_id (id, cliente_id, numero_venda), ordens_servico: os_id (id, cliente_id, numero_os)')
          .eq('id', c.id)
          .limit(1)
          .maybeSingle()
        setDebugInfo(contaBruta || null)
        console.log('Diagnóstico Supabase contas_receber:', contaBruta)
      } catch {}
    }
    setEditConta(c)
    setEditTipo(tipo)
    setIsEditModalOpen(true)
  }

  const handleDelete = (conta: any, tipo: 'pagar' | 'receber') => {
    setDeleteConta(conta)
    setDeleteTipo(tipo)
    setIsDeleteModalOpen(true)
  }

  const totalPagar = contasPagar.reduce((acc, c) => acc + (c.valor || 0), 0)
  const totalReceber = contasReceber
    .filter(c => c.status !== 'pago')
    .reduce((acc, c) => acc + Math.max(0, Number(c.valor || 0) - Number(c.valor_recebido || 0)), 0)
  const saldo = totalReceber - totalPagar
  const vencidos = contasReceber.filter(c => c.status === 'vencido').length

  // Filtrar contas
  const filteredPagar = contasPagar.filter(c => {
    const fornecedor = (c.fornecedor_nome || '').toLowerCase()
    const descricao = (c.descricao || '').toLowerCase()
    const categoria = (c.categoria || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    const matchSearch = fornecedor.includes(term) || descricao.includes(term) || categoria.includes(term)
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const filteredReceber = contasReceber.filter(c => {
    const cliente = (c.cliente_nome || '').toLowerCase()
    const descricao = (c.descricao || '').toLowerCase()
    const os = c.os_numero ? `os #${c.os_numero}`.toLowerCase() : ''
    const term = searchTerm.toLowerCase()
    const matchSearch = cliente.includes(term) || descricao.includes(term) || os.includes(term)
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-moto-darkest flex items-center gap-3">
            <Wallet className="w-10 h-10 text-primary-600" />
            Financeiro
          </h1>
          <p className="text-moto-steel mt-2">Controle completo de contas a pagar e receber</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* A Receber */}
        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                A Receber
              </p>
              <p className="text-4xl font-display font-bold text-green-900">
                R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-600 mt-1">Valores pendentes</p>
            </div>
            <div className="p-4 rounded-xl bg-green-600 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* A Pagar */}
        <div className="stat-card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 mb-1 uppercase tracking-wide flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                A Pagar
              </p>
              <p className="text-4xl font-display font-bold text-red-900">
                R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-red-600 mt-1">Contas pendentes</p>
            </div>
            <div className="p-4 rounded-xl bg-red-600 shadow-lg">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className={`stat-card bg-gradient-to-br ${saldo >= 0 ? 'from-blue-50 to-blue-100 border-l-4 border-blue-600' : 'from-orange-50 to-orange-100 border-l-4 border-moto-orange'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${saldo >= 0 ? 'text-blue-700' : 'text-orange-700'} mb-1 uppercase tracking-wide`}>
                Saldo
              </p>
              <p className={`text-4xl font-display font-bold ${saldo >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                R$ {Math.abs(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
                {saldo >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${saldo >= 0 ? 'bg-blue-600' : 'bg-moto-orange'} shadow-lg`}>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Vencidos */}
        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-moto-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1 uppercase tracking-wide">
                Vencidos
              </p>
              <p className="text-4xl font-display font-bold text-orange-900">{vencidos}</p>
              <p className="text-xs text-orange-600 mt-1">Requer atenção</p>
            </div>
            <div className="p-4 rounded-xl bg-moto-orange shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por fornecedor, cliente, documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Filtro de Status e Ações */}
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="vencido">Vencidos</option>
              <option value="pago">Pagos</option>
            </select>
            <PrimaryButton
              label="Nova Conta"
              onClick={() => setIsCreateModalOpen(true)}
              size="md"
              className="ml-2 min-w-[140px]"
              icon={<Plus className="w-5 h-5" />}
              iconPosition="left"
            />
          </div>
        </div>
      </div>

      {/* Listas de Contas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Pagar */}
        <div className="card-moto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-moto-darkest flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              Contas a Pagar
            </h2>
            <span className="badge bg-red-100 text-red-800 text-sm px-3 py-1">
              {filteredPagar.length} contas
            </span>
          </div>

          <div className="space-y-3">
            {filteredPagar.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conta a pagar encontrada</p>
              </div>
            ) : (
              filteredPagar.map((conta) => (
                <div 
                  key={conta.id} 
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="font-bold text-gray-900">{conta.fornecedor_nome || 'Fornecedor'}</p>
                      </div>
                      <p className="text-sm text-gray-600">{conta.descricao}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Vencimento: {formatDateBR(conta.data_vencimento)}
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                          Origem: {conta.origem ? (conta.origem === 'compra' ? 'Compra' : 'Manual') : 'Manual'}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(conta.status)}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor</p>
                      <p className="text-2xl font-display font-bold text-red-600">
                        R$ {formatCurrency(conta.valor)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {conta.status !== 'pago' && (
                        <button 
                          onClick={() => handlePagar(conta)}
                          className="btn btn-primary flex items-center space-x-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pagar
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(conta, 'pagar')}
                        className="btn bg-gray-100 text-gray-800"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(conta, 'pagar')}
                        className="btn bg-red-100 text-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="card-moto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-moto-darkest flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Contas a Receber
            </h2>
            <span className="badge bg-green-100 text-green-800 text-sm px-3 py-1">
              {filteredReceber.length} contas
            </span>
          </div>

          <div className="space-y-3">
            {filteredReceber.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conta a receber encontrada</p>
              </div>
            ) : (
              filteredReceber.map((conta) => (
                <div 
                  key={conta.id} 
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <p className="font-bold text-gray-900">{conta.os_numero ? `OS #${conta.os_numero}` : 'Recebimento'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3.5 h-3.5" />
                        {conta.cliente_nome || 'Cliente'}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{conta.descricao}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Vencimento: {formatDateBR(conta.data_vencimento)}
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                          Origem: {conta.os_id ? 'OS' : (conta.origem === 'venda' ? 'Venda' : (conta.origem === 'os' ? 'OS' : 'Manual'))}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(conta.status)}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor</p>
                      <p className="text-2xl font-display font-bold text-green-600">
                        R$ {formatCurrency(conta.valor)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {conta.status !== 'pago' && (
                        <button 
                          onClick={() => handleReceber(conta)}
                          className="btn btn-success flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Receber
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(conta, 'receber')}
                        className="btn bg-gray-100 text-gray-800"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(conta, 'receber')}
                        className="btn bg-red-100 text-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Pagamento */}
      {selectedConta && (
        <ConfirmDeleteModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          onConfirm={confirmPagar}
          title="Confirmar Pagamento"
          itemName={selectedConta.fornecedor_nome || selectedConta.cliente_nome || 'Conta'}
          itemDetails={[
            `Descrição: ${selectedConta.descricao}`,
                      `Vencimento: ${formatDateBR(selectedConta?.data_vencimento)}`,
            `Valor: R$ ${formatCurrency(selectedConta.valor)}`
          ]}
          isDeleting={isProcessing}
        />
      )}

      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title="Receber Conta"
      >
        {receiveConta && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Valor a receber</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Forma de pagamento</label>
                <select
                  value={receiveMethod}
                  onChange={(e) => setReceiveMethod(e.target.value)}
                  className="input"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="boleto">Boleto</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="label">Data de recebimento</label>
                <input
                  type="date"
                  value={receiveDate}
                  onChange={(e) => setReceiveDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Resumo</label>
                <div className="text-sm text-gray-700">
                  <div>Total: R$ {formatCurrency(receiveConta.valor)}</div>
                  <div>Recebido: R$ {formatCurrency(receiveConta.valor_recebido || 0)}</div>
                  <div>Restante: R$ {formatCurrency(Math.max(0, Number(receiveConta.valor || 0) - Number(receiveConta.valor_recebido || 0)))}</div>
                </div>
              </div>
            </div>
            {receiveError && <p className="text-sm text-red-600">{receiveError}</p>}
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setIsReceiveModalOpen(false)} disabled={isProcessing}>Cancelar</button>
              <button className="btn btn-success" onClick={confirmReceber} disabled={isProcessing}>Confirmar</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de criação de contas */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nova Conta">
        <FinanceiroContaForm
          onCancel={() => setIsCreateModalOpen(false)}
          onSubmit={async (data: any) => {
            try {
              if (data.tipo === 'pagar') {
                await createContaPagar(data)
              } else {
                await createContaReceber(data)
              }
              setIsCreateModalOpen(false)
            } catch (e) {
              // erros já exibidos via toast
            }
          }}
        />
      </Modal>

      {/* Modal de edição de contas */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setDebugInfo(null) }} title={editTipo === 'pagar' ? 'Editar Conta a Pagar' : 'Editar Conta a Receber'}>
        {debugInfo && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
            <p className="font-semibold mb-2">Diagnóstico Supabase (contas_receber):</p>
            <pre className="overflow-auto max-h-40 whitespace-pre-wrap text-xs bg-white p-2 rounded border border-yellow-100">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        <FinanceiroContaForm
          tipoInicial={editTipo}
          initialData={{ ...editConta, tipo: editTipo }}
          onCancel={() => { setIsEditModalOpen(false); setDebugInfo(null) }}
          onSubmit={async (data: any) => {
            try {
              setIsProcessing(true)
              if (data.tipo === 'pagar') {
                await updateContaPagar(editConta.id, data)
              } else {
                await updateContaReceber(editConta.id, data)
              }
              setIsEditModalOpen(false)
              setEditConta(null)
              setDebugInfo(null)
            } catch (e) {
              // erros já exibidos via toast
            } finally {
              setIsProcessing(false)
            }
          }}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      {deleteConta && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            try {
              setIsProcessing(true)
              if (deleteTipo === 'pagar') {
                await deleteContaPagar(deleteConta.id)
              } else {
                await deleteContaReceber(deleteConta.id)
              }
              setIsDeleteModalOpen(false)
              setDeleteConta(null)
            } catch (e) {
              // erros já exibidos via toast
            } finally {
              setIsProcessing(false)
            }
          }}
          title={deleteTipo === 'pagar' ? 'Excluir Conta a Pagar' : 'Excluir Conta a Receber'}
          itemName={deleteConta.fornecedor_nome || deleteConta.cliente_nome || 'Conta'}
          itemDetails={[
            `Descrição: ${deleteConta.descricao}`,
                      `Vencimento: ${formatDateBR(deleteConta?.data_vencimento)}`,
            `Valor: R$ ${formatCurrency(deleteConta.valor)}`
          ]}
          isDeleting={isProcessing}
        />
      )}
    </div>
  )
}
