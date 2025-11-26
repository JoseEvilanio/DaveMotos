import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const mecanicoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().optional(),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  especialidade: z.string().min(1, 'Selecione uma especialidade'),
  data_admissao: z.string().optional(),
  salario: z.string().optional(),
  comissao_percentual: z.string().optional(),
})

type MecanicoFormData = z.infer<typeof mecanicoSchema>

interface MecanicoFormProps {
  mecanico?: any
  onSubmit: (data: MecanicoFormData) => Promise<void>
  onCancel: () => void
}

export default function MecanicoForm({ mecanico, onSubmit, onCancel }: MecanicoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MecanicoFormData>({
    resolver: zodResolver(mecanicoSchema),
    defaultValues: mecanico ? {
      ...mecanico,
      especialidade: mecanico.especialidades?.[0] || ''
    } : {},
  })

  const [dataAdmissaoBR, setDataAdmissaoBR] = useState('')
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
    if (mecanico?.data_admissao) {
      const iso = String(mecanico.data_admissao).slice(0,10)
      setDataAdmissaoBR(isoToBr(iso))
      setValue('data_admissao', iso)
    }
  }, [mecanico?.data_admissao])

  const handleFormSubmit = async (data: MecanicoFormData) => {
    // Converter especialidade (string) para especialidades (array)
    const dataToSend = {
      ...data,
      especialidades: data.especialidade ? [data.especialidade] : []
    }
    // Remover o campo especialidade (singular)
    delete (dataToSend as any).especialidade
    await onSubmit(dataToSend as any)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Nome Completo *</label>
          <input {...register('nome')} className="input" />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label className="label">CPF</label>
          <input
            {...register('cpf')}
            className="input"
            placeholder="000.000.000-00"
            maxLength={14}
            onChange={(e) => {
              const formatted = formatCpf(e.target.value)
              setValue('cpf', formatted)
            }}
          />
        </div>

        <div>
          <label className="label">Telefone *</label>
          <input
            {...register('telefone')}
            className="input"
            placeholder="(00) 00000-0000"
            maxLength={15}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value)
              setValue('telefone', formatted)
            }}
          />
          {errors.telefone && (
            <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
          )}
        </div>

        <div>
          <label className="label">Email</label>
          <input {...register('email')} type="email" className="input" />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">Especialidade *</label>
          <select {...register('especialidade')} className="input">
            <option value="">Selecione...</option>
            <option value="Mecânica Geral">Mecânica Geral</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Suspensão">Suspensão</option>
            <option value="Freios">Freios</option>
            <option value="Motor">Motor</option>
            <option value="Injeção Eletrônica">Injeção Eletrônica</option>
          </select>
          {errors.especialidade && (
            <p className="mt-1 text-sm text-red-600">{errors.especialidade.message}</p>
          )}
        </div>

        <div>
          <label className="label">Data de Admissão</label>
          <input
            type="text"
            className="input"
            placeholder="dd/mm/aaaa"
            value={dataAdmissaoBR}
            onChange={(e) => {
              const masked = maskBrDate(e.target.value)
              setDataAdmissaoBR(masked)
              const iso = brToIso(masked)
              setValue('data_admissao', iso)
            }}
          />
        </div>

        <div>
          <label className="label">Salário (R$)</label>
          <input
            {...register('salario')}
            type="number"
            step="0.01"
            className="input"
            placeholder="0,00"
          />
        </div>

        <div>
          <label className="label">Comissão (%)</label>
          <input
            {...register('comissao_percentual')}
            type="number"
            step="0.01"
            className="input"
            placeholder="0,00"
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
