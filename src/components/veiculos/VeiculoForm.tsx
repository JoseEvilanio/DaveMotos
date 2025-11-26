import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera, Trash2 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useClientes } from '@/hooks/useClientes'

// Validação de placa brasileira (ABC-1234 ou ABC1D23)
const placaRegex = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i

const veiculoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.number()
    .min(1900, 'Ano deve ser maior que 1900')
    .max(new Date().getFullYear() + 2, `Ano não pode ser maior que ${new Date().getFullYear() + 2}`),
  placa: z.string()
    .regex(placaRegex, 'Placa inválida. Use formato ABC-1234 ou ABC1D23')
    .transform(val => val.toUpperCase().replace(/-/g, '')),
  cor: z.string().optional(),
  chassi: z.string().optional(),
  renavam: z.string().optional(),
  km_atual: z.number().min(0, 'KM não pode ser negativo').optional(),
  observacoes: z.string().optional(),
  is_active: z.boolean().optional(),
})

type VeiculoFormData = z.infer<typeof veiculoSchema>

interface VeiculoFormProps {
  veiculo?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export default function VeiculoForm({ veiculo, onSubmit, onCancel }: VeiculoFormProps) {
  const [loading, setLoading] = useState(false)
  const { clientes } = useClientes()
  const [fotos, setFotos] = useState<string[]>(veiculo?.fotos_urls || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VeiculoFormData>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: veiculo || {},
  })

  // Watch placa field to format it
  const placaValue = watch('placa')

  useEffect(() => {
    if (veiculo) {
      Object.keys(veiculo).forEach((key) => {
        setValue(key as any, veiculo[key])
      })
      // Garantir que cliente_id seja string para o select
      if (veiculo.cliente_id) {
        setValue('cliente_id', String(veiculo.cliente_id))
      }
      // Set fotos
      if (veiculo.fotos_urls) {
        setFotos(veiculo.fotos_urls)
      }
      // Set is_active
      setValue('is_active', veiculo.is_active !== false)
    }
  }, [veiculo, setValue])

  // Format placa while typing
  useEffect(() => {
    if (placaValue) {
      let formatted = placaValue.toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (formatted.length > 3 && formatted.length <= 7) {
        formatted = formatted.slice(0, 3) + '-' + formatted.slice(3)
      }
      if (formatted !== placaValue) {
        setValue('placa', formatted)
      }
    }
  }, [placaValue, setValue])

  const handleFotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            setFotos(prev => [...prev, result])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index))
  }

  // Incluir cliente atual do veículo na lista se não estiver presente (ex.: cliente inativo)
  const clientesOptions = useMemo(() => {
    if (veiculo?.cliente_id && !clientes.find(c => c.id === veiculo.cliente_id)) {
      const nome = veiculo.cliente_nome || 'Cliente atual (inativo)'
      return [{ id: veiculo.cliente_id, nome } as any, ...clientes]
    }
    return clientes
  }, [clientes, veiculo])

  const handleFormSubmit = async (data: VeiculoFormData) => {
    setLoading(true)
    try {
      const formData = {
        ...data,
        fotos_urls: fotos.length > 0 ? fotos : null,
      }
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Informações Principais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Principais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="cliente_id" className="label">
              Cliente *
            </label>
            <select
              {...register('cliente_id')}
              id="cliente_id"
              className="input"
              disabled={loading}
            >
              <option value="">Selecione um cliente</option>
              {clientesOptions.map((cliente) => (
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
            <label htmlFor="marca" className="label">
              Marca *
            </label>
            <input
              {...register('marca')}
              type="text"
              id="marca"
              className="input"
              placeholder="Ex: Honda, Yamaha, Suzuki"
              disabled={loading}
            />
            {errors.marca && (
              <p className="mt-1 text-sm text-red-600">{errors.marca.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="modelo" className="label">
              Modelo *
            </label>
            <input
              {...register('modelo')}
              type="text"
              id="modelo"
              className="input"
              placeholder="Ex: CG 160, YBR 125"
              disabled={loading}
            />
            {errors.modelo && (
              <p className="mt-1 text-sm text-red-600">{errors.modelo.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="ano" className="label">
              Ano *
            </label>
            <input
              {...register('ano', { valueAsNumber: true })}
              type="number"
              id="ano"
              className="input"
              placeholder="Ex: 2023"
              min="1900"
              max={new Date().getFullYear() + 2}
              disabled={loading}
            />
            {errors.ano && (
              <p className="mt-1 text-sm text-red-600">{errors.ano.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="placa" className="label">
              Placa *
            </label>
            <input
              {...register('placa')}
              type="text"
              id="placa"
              className="input uppercase"
              placeholder="ABC-1234"
              disabled={loading}
              maxLength={8}
            />
            {errors.placa && (
              <p className="mt-1 text-sm text-red-600">{errors.placa.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cor" className="label">
              Cor
            </label>
            <input
              {...register('cor')}
              type="text"
              id="cor"
              className="input"
              placeholder="Ex: Preta, Vermelha, Azul"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="km_atual" className="label">
              KM Atual
            </label>
            <input
              {...register('km_atual', { valueAsNumber: true })}
              type="number"
              id="km_atual"
              className="input"
              placeholder="Ex: 15000"
              min="0"
              disabled={loading}
            />
            {errors.km_atual && (
              <p className="mt-1 text-sm text-red-600">{errors.km_atual.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Adicionais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="chassi" className="label">
              Chassi
            </label>
            <input
              {...register('chassi')}
              type="text"
              id="chassi"
              className="input uppercase"
              placeholder="Número do chassi"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="renavam" className="label">
              Renavam
            </label>
            <input
              {...register('renavam')}
              type="text"
              id="renavam"
              className="input"
              placeholder="Número do renavam"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="observacoes" className="label">
            Observações
          </label>
          <textarea
            {...register('observacoes')}
            id="observacoes"
            rows={3}
            className="input"
            placeholder="Observações sobre o veículo"
            disabled={loading}
          />
        </div>
      </div>

      {/* Fotos do Veículo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fotos do Veículo</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fotos.map((foto, index) => (
            <div key={index} className="relative group">
              <img
                src={foto}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeFoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={loading}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFotoUpload}
              className="hidden"
              disabled={loading}
            />
            <div className="text-center">
              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <span className="text-sm text-gray-500">Adicionar Foto</span>
            </div>
          </label>
        </div>
      </div>

      {/* Status do Veículo */}
      {veiculo && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status</h3>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Veículo ativo
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary flex items-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <span>{veiculo ? 'Atualizar' : 'Cadastrar'}</span>
          )}
        </button>
      </div>
    </form>
  )
}
