import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useClientes } from '@/hooks/useClientes'
import { useFornecedores } from '@/hooks/useFornecedores'
import { DollarSign, TrendingDown, TrendingUp, Calendar, User, Tag, CreditCard, FileText } from 'lucide-react'

type TipoConta = 'pagar' | 'receber'

interface Props {
  tipoInicial?: TipoConta
  initialData?: any
  onSubmit: (data: any) => Promise<void> | void
  onCancel: () => void
}

export default function FinanceiroContaForm({ tipoInicial = 'pagar', initialData, onSubmit, onCancel }: Props) {
  // Utilitário local para fixar data YYYY-MM-DD no fuso local
  const toYMDLocal = (input?: Date | string) => {
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input
    const d = input ? new Date(input) : new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      tipo: tipoInicial,
      fornecedor_id: '',
      cliente_id: '',
      descricao: '',
      categoria: '',
      valor: '',
      data_emissao: toYMDLocal(),
      data_vencimento: toYMDLocal(),
      forma_pagamento: 'dinheiro',
      observacoes: '',
    }
  })

  const [dataEmissaoBR, setDataEmissaoBR] = useState('')
  const [dataVencimentoBR, setDataVencimentoBR] = useState('')

  const isoToBr = (iso?: string) => {
    if (!iso) return ''
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return ''
    return `${m[3]}/${m[2]}/${m[1]}`
  }

  const brToIso = (br: string) => {
    const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!m) return ''
    return `${m[3]}-${m[2]}-${m[1]}`
  }

  const maskBrDate = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    const parts = [] as string[]
    if (digits.length >= 1) parts.push(digits.slice(0, 2))
    if (digits.length >= 3) parts.push(digits.slice(2, 4))
    if (digits.length >= 5) parts.push(digits.slice(4))
    return parts.join('/')
  }

  useEffect(() => {
    setDataEmissaoBR(isoToBr(watch('data_emissao')))
    setDataVencimentoBR(isoToBr(watch('data_vencimento')))
  }, [])

  const tipo = watch('tipo') as TipoConta
  const { clientes, fetchClientes } = useClientes()
  const { fornecedores, fetchFornecedores } = useFornecedores()

  useEffect(() => {
    fetchClientes()
    fetchFornecedores()
  }, [])

  // Preencher valores iniciais quando em modo edição
  useEffect(() => {
    if (initialData) {
      const d = initialData || {}
      if (d.tipo) setValue('tipo', d.tipo)
      if (d.fornecedor_id !== undefined) setValue('fornecedor_id', d.fornecedor_id ? String(d.fornecedor_id) : '')
      // Cliente: aceitar ambos os nomes de coluna (PT/EN)
      if (d.cliente_id !== undefined) {
        setValue('cliente_id', d.cliente_id ? String(d.cliente_id) : '')
      } else if ((d as any).customer_id !== undefined) {
        setValue('cliente_id', (d as any).customer_id ? String((d as any).customer_id) : '')
      }
      // Descrição: aceitar 'descricao' (PT) e 'description' (EN)
      if (d.descricao !== undefined) {
        setValue('descricao', d.descricao || '')
      } else if ((d as any).description !== undefined) {
        setValue('descricao', (d as any).description || '')
      }
      if (d.categoria !== undefined) setValue('categoria', d.categoria || '')
      if (d.valor !== undefined) setValue('valor', String(d.valor ?? ''))
      if (d.data_emissao !== undefined) setValue('data_emissao', (d.data_emissao || '').slice(0, 10) || toYMDLocal())
      if (d.data_vencimento !== undefined) setValue('data_vencimento', (d.data_vencimento || '').slice(0, 10) || toYMDLocal())
      if (d.forma_pagamento !== undefined) setValue('forma_pagamento', d.forma_pagamento || 'dinheiro')
      if (d.observacoes !== undefined) setValue('observacoes', d.observacoes || '')
    }
  }, [initialData, setValue])

  // Reaplicar seleção após carregamento assíncrono das opções
  useEffect(() => {
    if (tipo === 'pagar' && initialData?.fornecedor_id && fornecedores.length) {
      setValue('fornecedor_id', String(initialData.fornecedor_id))
    }
  }, [tipo, fornecedores, initialData?.fornecedor_id])

  useEffect(() => {
    if (tipo === 'receber' && clientes.length) {
      const cid = initialData?.cliente_id ?? (initialData as any)?.customer_id
      if (cid) setValue('cliente_id', String(cid))
    }
  }, [tipo, clientes, initialData?.cliente_id, (initialData as any)?.customer_id])

  const submit = (data: any) => {
    const base = {
      descricao: data.descricao,
      valor: parseFloat(data.valor),
      data_emissao: data.data_emissao,
      data_vencimento: data.data_vencimento,
      forma_pagamento: data.forma_pagamento,
      observacoes: data.observacoes || null,
    }

    if (tipo === 'pagar') {
      onSubmit({
        tipo,
        ...base,
        fornecedor_id: data.fornecedor_id || null,
        categoria: data.categoria || 'Geral',
      })
    } else {
      onSubmit({
        tipo,
        ...base,
        cliente_id: data.cliente_id || null,
        os_id: null,
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header com título e tipo de conta */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${tipo === 'pagar' ? 'bg-red-50' : 'bg-green-50'}`}>
            {tipo === 'pagar' ? (
              <TrendingDown className={`w-6 h-6 text-red-600`} />
            ) : (
              <TrendingUp className={`w-6 h-6 text-green-600`} />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Editar' : 'Nova'} {tipo === 'pagar' ? 'Despesa' : 'Receita'}
            </h2>
            <p className="text-gray-600">
              {tipo === 'pagar' ? 'Registre uma conta a pagar' : 'Registre uma conta a receber'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        {/* Seção: Informações Principais */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Informações Principais
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fornecedor/Cliente */}
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {tipo === 'pagar' ? 'Fornecedor' : 'Cliente'}
              </label>
              <select {...register(tipo === 'pagar' ? 'fornecedor_id' : 'cliente_id')} className="input">
                <option value="">Selecione...</option>
                {tipo === 'pagar' 
                  ? fornecedores.map(f => (
                      <option key={f.id} value={String(f.id)}>{f.razao_social}</option>
                    ))
                  : clientes.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nome}</option>
                    ))
                }
              </select>
            </div>

            {/* Categoria (apenas pagar) */}
            {tipo === 'pagar' && (
              <div>
                <label className="label flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Categoria
                </label>
                <input {...register('categoria')} className="input" placeholder="Ex.: Aluguel, Peças, Serviços" />
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="mt-4">
            <label className="label flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Descrição
            </label>
            <input {...register('descricao', { required: true })} className="input" placeholder="Digite uma descrição detalhada..." />
          </div>
        </div>

        {/* Seção: Valores e Datas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            Valores e Datas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                Valor (R$)
              </label>
              <input 
                type="number" 
                step="0.01" 
                {...register('valor', { required: true })} 
                className="input" 
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Data de Emissão
              </label>
              <input
                type="text"
                className="input"
                placeholder="dd/mm/aaaa"
                value={dataEmissaoBR}
                onChange={(e) => {
                  const masked = maskBrDate(e.target.value)
                  setDataEmissaoBR(masked)
                  const iso = brToIso(masked)
                  setValue('data_emissao', iso)
                }}
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Data de Vencimento
              </label>
              <input
                type="text"
                className="input"
                placeholder="dd/mm/aaaa"
                value={dataVencimentoBR}
                onChange={(e) => {
                  const masked = maskBrDate(e.target.value)
                  setDataVencimentoBR(masked)
                  const iso = brToIso(masked)
                  setValue('data_vencimento', iso)
                }}
              />
            </div>
          </div>
        </div>

        {/* Seção: Pagamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-500" />
            Forma de Pagamento
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
              { value: 'pix', label: 'Pix', icon: '📱' },
              { value: 'cartao_credito', label: 'Cartão Crédito', icon: '💳' },
              { value: 'cartao_debito', label: 'Cartão Débito', icon: '💳' },
              { value: 'boleto', label: 'Boleto', icon: '📄' },
              { value: 'cheque', label: 'Cheque', icon: '📝' }
            ].map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  {...register('forma_pagamento')}
                  value={option.value}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                  watch('forma_pagamento') === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Observações
          </h3>
          <textarea 
            {...register('observacoes')} 
            className="input" 
            rows={4} 
            placeholder="Adicione observações importantes sobre esta conta..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn px-6 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={`btn px-6 py-2.5 font-medium ${
              tipo === 'pagar' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {initialData ? 'Atualizar' : 'Criar'} {tipo === 'pagar' ? 'Despesa' : 'Receita'}
          </button>
        </div>
      </form>
    </div>
  )
}
