import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  tipo: z.enum(['produto', 'servico']),
  categoria_id: z.string().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  preco_custo: z.string().optional(),
  preco_venda: z.string().min(1, 'Preço de venda é obrigatório'),
  estoque_atual: z.string().optional(),
  estoque_minimo: z.string().optional(),
  unidade: z.string().optional(),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

interface ProdutoFormProps {
  produto?: any
  onSubmit: (data: ProdutoFormData) => Promise<void>
  onCancel: () => void
}

export default function ProdutoForm({ produto, onSubmit, onCancel }: ProdutoFormProps) {
  const [categorias, setCategorias] = useState<any[]>([])
  const [tipo, setTipo] = useState(produto?.tipo || 'produto')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string>(produto?.foto_url || '')
  const [fotoRemover, setFotoRemover] = useState(false)
  const [fotoErro, setFotoErro] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: produto || { tipo: 'produto' },
  })

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_produtos')
        .select('*')
        .eq('is_active', true)
        .order('nome', { ascending: true })
      
      if (error) throw error
      
      setCategorias(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const tipoWatch = watch('tipo')
  useEffect(() => {
    setTipo(tipoWatch)
  }, [tipoWatch])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    const okTypes = ['image/jpeg','image/png','image/gif']
    if (!okTypes.includes(file.type)) { setFotoErro('Formato inválido. Use JPG, PNG ou GIF.'); return }
    if (file.size > 5 * 1024 * 1024) { setFotoErro('Arquivo muito grande. Máximo 5MB.'); return }
    setFotoFile(file)
    setFotoRemover(false)
    setFotoErro('')
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      setFotoPreview(url)
    }
    reader.readAsDataURL(file)
  }

  const submit = async (data: ProdutoFormData) => {
    const payload: any = { ...data }
    await onSubmit({ ...payload, fotoFile, fotoRemover })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nome *</label>
            <input {...register('nome')} className="input" />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>
          <div>
            <label className="label">Imagem</label>
            <div className="space-y-2">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Pré-visualização" className="w-full h-24 object-cover rounded border" />
              ) : (
                <div className="w-full h-24 rounded border bg-gray-50 flex items-center justify-center text-gray-400">Sem imagem</div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleFotoChange} className="input" />
              {fotoErro && <p className="text-sm text-red-600">{fotoErro}</p>}
              {produto?.foto_url && (
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={fotoRemover} onChange={(e)=>setFotoRemover(e.target.checked)} />
                  Remover imagem atual
                </label>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Tipo *</label>
          <select {...register('tipo')} className="input">
            <option value="produto">Produto</option>
            <option value="servico">Serviço</option>
          </select>
        </div>

        <div>
          <label className="label">Categoria</label>
          <select {...register('categoria_id')} className="input">
            <option value="">Selecione...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Código</label>
          <input {...register('codigo')} className="input" />
          {errors.codigo && (
            <p className="mt-1 text-sm text-red-600">{errors.codigo.message}</p>
          )}
        </div>

        {tipo === 'produto' && (
          <div>
            <label className="label">Unidade de Medida</label>
            <select {...register('unidade')} className="input">
              <option value="">Selecione...</option>
              <option value="UN">Unidade</option>
              <option value="PC">Peça</option>
              <option value="CX">Caixa</option>
              <option value="KG">Quilograma</option>
              <option value="L">Litro</option>
              <option value="M">Metro</option>
            </select>
          </div>
        )}

        <div>
          <label className="label">Preço de Custo (R$)</label>
          <input
            {...register('preco_custo')}
            type="number"
            step="0.01"
            className="input"
            placeholder="0,00"
          />
        </div>

        <div>
          <label className="label">Preço de Venda (R$) *</label>
          <input
            {...register('preco_venda')}
            type="number"
            step="0.01"
            className="input"
            placeholder="0,00"
          />
          {errors.preco_venda && (
            <p className="mt-1 text-sm text-red-600">{errors.preco_venda.message}</p>
          )}
        </div>

        {tipo === 'produto' && (
          <>
            <div>
              <label className="label">Estoque Atual</label>
              <input
                {...register('estoque_atual')}
                type="number"
                step="0.01"
                className="input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="label">Estoque Mínimo</label>
              <input
                {...register('estoque_minimo')}
                type="number"
                step="0.01"
                className="input"
                placeholder="0"
              />
            </div>
          </>
        )}

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
