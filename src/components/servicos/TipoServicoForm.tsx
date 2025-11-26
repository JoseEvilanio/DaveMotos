import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const tipoServicoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  preco_base: z.string().min(1, 'Preço base é obrigatório'),
  tempo_estimado: z.string().optional(),
})

type TipoServicoFormData = z.infer<typeof tipoServicoSchema>

interface TipoServicoFormProps {
  tipoServico?: any
  onSubmit: (data: TipoServicoFormData) => Promise<void>
  onCancel: () => void
}

export default function TipoServicoForm({ tipoServico, onSubmit, onCancel }: TipoServicoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TipoServicoFormData>({
    resolver: zodResolver(tipoServicoSchema),
    defaultValues: tipoServico || {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Nome *</label>
          <input {...register('nome')} className="input" />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label className="label">Preço Base (R$) *</label>
          <input
            {...register('preco_base')}
            type="number"
            step="0.01"
            className="input"
            placeholder="0,00"
          />
          {errors.preco_base && (
            <p className="mt-1 text-sm text-red-600">{errors.preco_base.message}</p>
          )}
        </div>

        <div>
          <label className="label">Tempo Estimado (minutos)</label>
          <input
            {...register('tempo_estimado')}
            type="number"
            className="input"
            placeholder="60"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Descrição</label>
          <textarea {...register('descricao')} className="input" rows={3} />
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
