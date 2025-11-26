import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const osSchema = z.object({
  cliente_id: z.string().min(1, 'Selecione um cliente'),
  veiculo_id: z.string().min(1, 'Selecione um veículo'),
  mecanico_id: z.string().optional(),
  defeito_reclamado: z.string().min(3, 'Descreva o defeito'),
  observacoes: z.string().optional(),
  status: z.string().optional(),
})

type OSFormData = z.infer<typeof osSchema>

interface OSFormProps {
  os?: any
  onSubmit: (data: OSFormData) => Promise<void>
  onCancel: () => void
}

const API_URL = 'http://localhost:3001/api'

export default function OrdemServicoForm({ os, onSubmit, onCancel }: OSFormProps) {
  const [clientes, setClientes] = useState<any[]>([])
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [mecanicos, setMecanicos] = useState<any[]>([])
  const [selectedCliente, setSelectedCliente] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OSFormData>({
    resolver: zodResolver(osSchema),
    defaultValues: os || { status: 'aberta' },
  })

  useEffect(() => {
    fetchClientes()
    fetchMecanicos()
  }, [])

  const clienteWatch = watch('cliente_id')
  useEffect(() => {
    if (clienteWatch) {
      setSelectedCliente(clienteWatch)
      fetchVeiculos(clienteWatch)
    }
  }, [clienteWatch])

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`)
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const fetchVeiculos = async (clienteId: string) => {
    try {
      const response = await fetch(`${API_URL}/veiculos`)
      if (response.ok) {
        const data = await response.json()
        const veiculosCliente = data.filter((v: any) => v.cliente_id === clienteId)
        setVeiculos(veiculosCliente)
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
    }
  }

  const fetchMecanicos = async () => {
    try {
      const response = await fetch(`${API_URL}/mecanicos`)
      if (response.ok) {
        const data = await response.json()
        setMecanicos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar mecânicos:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Cliente *</label>
          <select {...register('cliente_id')} className="input">
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
          <select {...register('veiculo_id')} className="input" disabled={!selectedCliente}>
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
          <label className="label">Mecânico Responsável</label>
          <select {...register('mecanico_id')} className="input">
            <option value="">Selecione um mecânico...</option>
            {mecanicos.map((mecanico) => (
              <option key={mecanico.id} value={mecanico.id}>
                {mecanico.nome} - {mecanico.especialidade}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_pecas">Aguardando Peças</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Defeito Reclamado *</label>
          <textarea
            {...register('defeito_reclamado')}
            className="input"
            rows={3}
            placeholder="Descreva o problema relatado pelo cliente..."
          />
          {errors.defeito_reclamado && (
            <p className="mt-1 text-sm text-red-600">{errors.defeito_reclamado.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="label">Observações</label>
          <textarea
            {...register('observacoes')}
            className="input"
            rows={3}
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
