import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const agendamentoSchema = z.object({
  cliente_id: z.string().min(1, 'Selecione um cliente'),
  veiculo_id: z.string().min(1, 'Selecione um veículo'),
  data_agendamento: z.string().min(1, 'Selecione a data'),
  hora_agendamento: z.string().min(1, 'Selecione o horário'),
  servico_solicitado: z.string().min(3, 'Descreva o serviço'),
  observacoes: z.string().optional(),
  status: z.string().optional(),
})

type AgendamentoFormData = z.infer<typeof agendamentoSchema>

interface AgendamentoFormProps {
  agendamento?: any
  onSubmit: (data: AgendamentoFormData) => Promise<void>
  onCancel: () => void
}

const API_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:3001/api'

export default function AgendamentoForm({ agendamento, onSubmit, onCancel }: AgendamentoFormProps) {
  const [clientes, setClientes] = useState<any[]>([])
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [selectedCliente, setSelectedCliente] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [loadingVeiculos, setLoadingVeiculos] = useState(false)
  const [dataAgendamentoBR, setDataAgendamentoBR] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: (() => {
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const todayIso = `${y}-${m}-${d}`
      if (agendamento?.data_agendamento) {
        const isoDate = String(agendamento.data_agendamento).slice(0, 10)
        const timeMatch = String(agendamento.data_agendamento).match(/T(\d{2}):(\d{2})/)
        const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : ''
        return {
          cliente_id: agendamento.cliente_id ? String(agendamento.cliente_id) : '',
          veiculo_id: agendamento.veiculo_id ? String(agendamento.veiculo_id) : '',
          data_agendamento: isoDate,
          hora_agendamento: time,
          servico_solicitado: agendamento.servico_descricao || '',
          observacoes: agendamento.observacoes || '',
          status: agendamento.status || 'agendado',
        }
      }
      return {
        cliente_id: '',
        veiculo_id: '',
        data_agendamento: todayIso,
        hora_agendamento: '',
        servico_solicitado: '',
        observacoes: '',
        status: 'agendado',
      }
    })(),
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  useEffect(() => {
    if (agendamento) {
      const isoDate = String(agendamento.data_agendamento || '').slice(0, 10)
      const tm = String(agendamento.data_agendamento || '').match(/T(\d{2}):(\d{2})/)
      const time = tm ? `${tm[1]}:${tm[2]}` : ''
      const mapped = {
        cliente_id: agendamento.cliente_id ? String(agendamento.cliente_id) : '',
        veiculo_id: agendamento.veiculo_id ? String(agendamento.veiculo_id) : '',
        data_agendamento: isoDate,
        hora_agendamento: time,
        servico_solicitado: agendamento.servico_descricao || '',
        observacoes: agendamento.observacoes || '',
        status: agendamento.status || 'agendado',
      }
      reset(mapped)
      setDataAgendamentoBR(isoToBr(mapped.data_agendamento))
      if (mapped.cliente_id) {
        setSelectedCliente(mapped.cliente_id)
      }
    }
  }, [agendamento])

  useEffect(() => {
    if (selectedCliente) {
      fetchVeiculos(selectedCliente)
    }
  }, [selectedCliente])

  const clienteWatch = watch('cliente_id')
  const dataWatch = watch('data_agendamento')
  useEffect(() => {
    if (clienteWatch) {
      setSelectedCliente(clienteWatch)
      fetchVeiculos(clienteWatch)
    }
  }, [clienteWatch])

  useEffect(() => {
    if (agendamento) {
      const isoDate = String(agendamento.data_agendamento || '').slice(0, 10)
      setDataAgendamentoBR(isoToBr(isoDate))
    }
  }, [agendamento])

  const isoToBr = (iso?: string) => {
    if (!iso) return ''
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
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
    if (dataWatch) {
      setDataAgendamentoBR(isoToBr(dataWatch))
    }
  }, [dataWatch])

  const fetchClientes = async () => {
    setLoadingClientes(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id,nome')
        .eq('is_active', true)
        .order('nome', { ascending: true })
      if (error) throw error
      let list = data || []
      if (agendamento?.cliente_id) {
        const cid = String(agendamento.cliente_id)
        const exists = list.some((c: any) => String(c.id) === cid)
        if (!exists) {
          const { data: cli } = await supabase
            .from('clientes')
            .select('id,nome')
            .eq('id', cid)
            .single()
          if (cli) list = [cli, ...list]
        }
      }
      setClientes(list)
      setApiError(null)
    } catch (error: any) {
      setApiError('Não foi possível carregar clientes. Verifique sua conexão ou autenticação.')
      setClientes([])
    } finally {
      setLoadingClientes(false)
    }
  }

  const fetchVeiculos = async (clienteId: string) => {
    if (!clienteId) return
    setLoadingVeiculos(true)
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('id,marca,modelo,placa,cliente_id')
        .eq('is_active', true)
        .eq('cliente_id', clienteId)
        .order('marca', { ascending: true })
      if (error) throw error
      let list = data || []
      if (agendamento?.veiculo_id) {
        const vid = String(agendamento.veiculo_id)
        const exists = list.some((v: any) => String(v.id) === vid)
        if (!exists) {
          const { data: vcl } = await supabase
            .from('veiculos')
            .select('id,marca,modelo,placa,cliente_id')
            .eq('id', vid)
            .single()
          if (vcl) list = [vcl, ...list]
        }
      }
      setVeiculos(list)
      setApiError(null)
    } catch (error: any) {
      setApiError('Não foi possível carregar veículos. Verifique sua conexão ou autenticação.')
      setVeiculos([])
    } finally {
      setLoadingVeiculos(false)
    }
  }

  useEffect(() => {
    if (agendamento?.cliente_id && clientes.length) {
      const id = String(agendamento.cliente_id)
      setValue('cliente_id', id)
      setSelectedCliente(id)
    }
  }, [clientes])

  useEffect(() => {
    if (agendamento?.veiculo_id && veiculos.length) {
      setValue('veiculo_id', String(agendamento.veiculo_id))
    }
  }, [veiculos])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {apiError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Cliente *</label>
          <select {...register('cliente_id')} className="input" disabled={loadingClientes || !!apiError}>
            <option value="">Selecione um cliente...</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
          {errors.cliente_id && (
            <p className="mt-1 text-sm text-red-600">{errors.cliente_id.message}</p>
          )}
        </div>

        <div>
          <label className="label">Veículo *</label>
          <select {...register('veiculo_id')} className="input" disabled={!selectedCliente || loadingVeiculos || !!apiError}>
            <option value="">Selecione um veículo...</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
              </option>
            ))}
          </select>
          {errors.veiculo_id && (
            <p className="mt-1 text-sm text-red-600">{errors.veiculo_id.message}</p>
          )}
        </div>

        <div>
          <label className="label">Data *</label>
          <input
            type="text"
            className="input"
            placeholder="dd/mm/aaaa"
            value={dataAgendamentoBR}
            onChange={(e) => {
              const masked = maskBrDate(e.target.value)
              setDataAgendamentoBR(masked)
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(masked)) {
                const iso = brToIso(masked)
                setValue('data_agendamento', iso)
              }
            }}
          />
          {errors.data_agendamento && (
            <p className="mt-1 text-sm text-red-600">{errors.data_agendamento.message}</p>
          )}
        </div>

        <div>
          <label className="label">Horário *</label>
          <input
            {...register('hora_agendamento')}
            type="time"
            className="input"
          />
          {errors.hora_agendamento && (
            <p className="mt-1 text-sm text-red-600">{errors.hora_agendamento.message}</p>
          )}
        </div>

        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Serviço Solicitado *</label>
          <textarea
            {...register('servico_solicitado')}
            className="input"
            rows={3}
            placeholder="Descreva o serviço que será realizado..."
          />
          {errors.servico_solicitado && (
            <p className="mt-1 text-sm text-red-600">{errors.servico_solicitado.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="label">Observações</label>
          <textarea
            {...register('observacoes')}
            className="input"
            rows={2}
            placeholder="Observações adicionais..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary flex items-center space-x-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <span>Salvar</span>
          )}
        </button>
      </div>
    </form>
  )
}
