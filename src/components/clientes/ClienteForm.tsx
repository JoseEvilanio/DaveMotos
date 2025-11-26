import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  telefone: z.string().min(10, 'Telefone inválido'),
  celular: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: any
  onSubmit: (data: ClienteFormData) => Promise<void>
  onCancel: () => void
}

export default function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const [loadingCep, setLoadingCep] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {},
  })

  const [dataNascimentoBR, setDataNascimentoBR] = useState('')
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
    if (cliente?.data_nascimento) {
      setDataNascimentoBR(isoToBr(String(cliente.data_nascimento).slice(0,10)))
      setValue('data_nascimento', String(cliente.data_nascimento).slice(0,10))
    }
  }, [cliente?.data_nascimento])

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  // Função para formatar CPF
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Função para formatar RG
  const formatRg = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 9) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
    }
    return numbers
  }

  // Função para buscar CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    
    if (cep.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setValue('endereco', data.logradouro)
      setValue('bairro', data.bairro)
      setValue('cidade', data.localidade)
      setValue('estado', data.uf)
      toast.success('Endereço preenchido automaticamente!')
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <label className="label">RG</label>
          <input
            {...register('rg')}
            className="input"
            placeholder="00.000.000-0"
            maxLength={12}
            onChange={(e) => {
              const formatted = formatRg(e.target.value)
              setValue('rg', formatted)
            }}
          />
        </div>

        <div>
          <label className="label">Data de Nascimento</label>
          <input
            type="text"
            className="input"
            placeholder="dd/mm/aaaa"
            value={dataNascimentoBR}
            onChange={(e) => {
              const masked = maskBrDate(e.target.value)
              setDataNascimentoBR(masked)
              const iso = brToIso(masked)
              setValue('data_nascimento', iso)
            }}
          />
        </div>

        <div>
          <label className="label">Telefone *</label>
          <input
            {...register('telefone')}
            className="input"
            placeholder="(00) 0000-0000"
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
          <label className="label">Celular</label>
          <input
            {...register('celular')}
            className="input"
            placeholder="(00) 00000-0000"
            maxLength={15}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value)
              setValue('celular', formatted)
            }}
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input {...register('email')} type="email" className="input" />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">CEP</label>
          <div className="relative">
            <input
              {...register('cep')}
              className="input"
              placeholder="00000-000"
              maxLength={9}
              onChange={(e) => {
                const formatted = formatCep(e.target.value)
                setValue('cep', formatted)
              }}
              onBlur={handleCepBlur}
            />
            {loadingCep && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-700" />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label">Endereço</label>
          <input {...register('endereco')} className="input" />
        </div>

        <div>
          <label className="label">Número</label>
          <input {...register('numero')} className="input" />
        </div>

        <div>
          <label className="label">Complemento</label>
          <input {...register('complemento')} className="input" />
        </div>

        <div>
          <label className="label">Bairro</label>
          <input {...register('bairro')} className="input" />
        </div>

        <div>
          <label className="label">Cidade</label>
          <input {...register('cidade')} className="input" />
        </div>

        <div>
          <label className="label">Estado</label>
          <select {...register('estado')} className="input">
            <option value="">Selecione...</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Observações</label>
          <textarea {...register('observacoes')} className="input" rows={3} />
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
