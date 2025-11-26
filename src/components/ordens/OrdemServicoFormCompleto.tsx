import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, Wrench, Package, DollarSign } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTiposServicos } from '@/hooks/useTiposServicos'
import { useProdutos } from '@/hooks/useProdutos'
import { useClientes } from '@/hooks/useClientes'
import { useVeiculos } from '@/hooks/useVeiculos'
import { useMecanicos } from '@/hooks/useMecanicos'

const osSchema = z.object({
  cliente_id: z.string().min(1, 'Selecione um cliente'),
  veiculo_id: z.string().min(1, 'Selecione um veículo'),
  mecanico_id: z.string().optional(),
  defeito_reclamado: z.string().min(3, 'Descreva o defeito'),
  observacoes: z.string().optional(),
  status: z.string().optional(),
})

type OSFormData = z.infer<typeof osSchema>

interface ServicoItem {
  id?: string
  tipo_servico_id: string
  tipo_servico_nome?: string
  quantidade: number
  preco_unitario: number
  subtotal: number
  observacoes?: string
}

interface PecaItem {
  id?: string
  produto_id: string
  produto_nome?: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

interface OSFormProps {
  os?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export default function OrdemServicoFormCompleto({ os, onSubmit, onCancel }: OSFormProps) {
  const [selectedCliente, setSelectedCliente] = useState('')
  
  const { clientes } = useClientes()
  const { veiculos: todosVeiculos } = useVeiculos()
  const { mecanicos } = useMecanicos()
  const { tiposServicos } = useTiposServicos()
  const { produtos } = useProdutos()
  
  // Filtrar veículos do cliente selecionado (memoizado para evitar nova identidade a cada render)
  const veiculos = useMemo(
    () => todosVeiculos.filter(v => v.cliente_id === selectedCliente),
    [todosVeiculos, selectedCliente]
  )
  
  // Serviços
  const [servicos, setServicos] = useState<ServicoItem[]>([])
  const [novoServico, setNovoServico] = useState({
    tipo_servico_id: '',
    quantidade: 1,
    preco_unitario: 0,
    observacoes: ''
  })
  
  // Peças
  const [pecas, setPecas] = useState<PecaItem[]>([])
  const [novaPeca, setNovaPeca] = useState({
    produto_id: '',
    quantidade: 1,
    preco_unitario: 0
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OSFormData>({
    resolver: zodResolver(osSchema),
    defaultValues: os || { status: 'aberta' },
  })

  // Criar uma variável osCompleto no escopo do componente
  const [osCompleto, setOsCompleto] = useState<any>(null);
  // Evita resetar repetidamente: guarda a última OS que foi pré-preenchida
  const didPrefillRef = useRef<string | null>(null)

  // Reset form when OS prop changes
  useEffect(() => {
    const loadOSData = () => {
      if (os) {
        console.log('=== INICIANDO CARREGAMENTO DA OS ===')
        console.log('OS completa recebida:', os)
        
        // Garantir que os.servicos e os.pecas existam como arrays
        const osCompletoTemp = {
          ...os,
          servicos: Array.isArray(os.servicos) ? os.servicos : [],
          pecas: Array.isArray(os.pecas) ? os.pecas : []
        }
        
        console.log('VERIFICAÇÃO CRÍTICA - Serviços recebidos:', osCompletoTemp.servicos)
        console.log('VERIFICAÇÃO CRÍTICA - Peças recebidas:', osCompletoTemp.pecas)
        
        // Atualizar o estado osCompleto
        setOsCompleto(osCompletoTemp)
        // Ao mudar a OS, liberar prefill para esta ID
        didPrefillRef.current = null
        
        // Primeiro, definir o cliente selecionado para carregar os veículos
        if (osCompletoTemp.cliente_id) {
          setSelectedCliente(String(osCompletoTemp.cliente_id))
        }
        
        // Processar serviços - CORRIGIDO: garantindo que os dados sejam processados corretamente
        if (osCompletoTemp.servicos && osCompletoTemp.servicos.length > 0) {
          const servicosMapeados = osCompletoTemp.servicos.map((s: any) => {
            const quantidade = Number(s.quantidade || 1)
            const precoUnitario = Number(s.preco_unitario || 0)
            const tipo = tiposServicos.find(t => String(t.id) === String(s.tipo_servico_id))
            return {
              id: s.id, // Incluir ID para referência
              tipo_servico_id: s.tipo_servico_id,
              tipo_servico_nome: s.tipo_servico_nome || tipo?.nome,
              quantidade,
              preco_unitario: precoUnitario,
              subtotal: s.subtotal || (quantidade * precoUnitario),
              observacoes: s.observacoes || ''
            }
          })
          console.log('Serviços mapeados para renderização:', servicosMapeados)
          setServicos([...servicosMapeados])
        } else {
          console.warn('Nenhum serviço encontrado para esta OS')
          setServicos([])
        }
        
        // Processar peças - CORRIGIDO: garantindo que os dados sejam processados corretamente
        if (osCompletoTemp.pecas && osCompletoTemp.pecas.length > 0) {
          const pecasMapeadas = osCompletoTemp.pecas.map((p: any) => {
            const quantidade = Number(p.quantidade || 1)
            const precoUnitario = Number(p.preco_unitario || 0)
            const produto = produtos.find(prod => String(prod.id) === String(p.produto_id))
            return {
              id: p.id, // Incluir ID para referência
              produto_id: p.produto_id,
              produto_nome: p.produto_nome || produto?.nome,
              quantidade,
              preco_unitario: precoUnitario,
              subtotal: p.subtotal || (quantidade * precoUnitario)
            }
          })
          console.log('Peças mapeadas para renderização:', pecasMapeadas)
          setPecas([...pecasMapeadas])
        } else {
          console.warn('Nenhuma peça encontrada para esta OS')
          setPecas([])
        }
        
        // Não resetar imediatamente: aguardar listas (clientes/veículos/mecânicos) carregarem
        // O reset será feito em um efeito separado quando as opções estiverem disponíveis
      } else {
        console.log('Resetando formulário para nova OS')
        reset({ 
          cliente_id: '',
          veiculo_id: '',
          mecanico_id: '',
          defeito_reclamado: '',
          observacoes: '',
          status: 'aberta' 
        })
        setServicos([])
        setPecas([])
        setSelectedCliente('')
      }
    }
    
    loadOSData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [os?.id])

  // Quando listas estiverem carregadas e contiverem os IDs da OS, então resetar o formulário
  useEffect(() => {
    if (!osCompleto) return

    const clienteOk = osCompleto.cliente_id
      ? clientes.some(c => String(c.id) === String(osCompleto.cliente_id))
      : false
    const veiculoOk = osCompleto.veiculo_id
      ? veiculos.some(v => String(v.id) === String(osCompleto.veiculo_id))
      : false
    const mecanicoOk = !osCompleto.mecanico_id
      || mecanicos.some(m => String(m.id) === String(osCompleto.mecanico_id))

    // Apenas resetar quando os dropdowns tiverem as opções correspondentes
    if (clienteOk && veiculoOk && mecanicoOk) {
      // Evitar reset em loop: se já preencheu esta OS, não repetir
      if (didPrefillRef.current === osCompleto.id) {
        return
      }
      const formValues = {
        cliente_id: String(osCompleto.cliente_id || ''),
        veiculo_id: String(osCompleto.veiculo_id || ''),
        mecanico_id: osCompleto.mecanico_id ? String(osCompleto.mecanico_id) : '',
        defeito_reclamado: osCompleto.defeito_reclamado || '',
        observacoes: osCompleto.observacoes || '',
        status: osCompleto.status || 'aberta'
      }
      reset(formValues)
      didPrefillRef.current = osCompleto.id
    }
  }, [osCompleto, clientes, veiculos, mecanicos])

  // Atualizar cliente selecionado quando mudar no formulário
  const clienteWatch = watch('cliente_id')
  useEffect(() => {
    if (clienteWatch && clienteWatch !== selectedCliente) {
      console.log('Cliente mudou para:', clienteWatch)
      setSelectedCliente(clienteWatch)
    }
  }, [clienteWatch])

  // Gerenciamento de Serviços
  const adicionarServico = () => {
    if (novoServico.tipo_servico_id && novoServico.preco_unitario > 0) {
      const tipo = tiposServicos.find(t => t.id === novoServico.tipo_servico_id)
      const subtotal = novoServico.quantidade * novoServico.preco_unitario
      
      // Adicionar novo serviço à lista
      const novoServicoCompleto = {
        ...novoServico,
        tipo_servico_nome: tipo?.nome,
        subtotal
      };
      
      console.log('Adicionando serviço:', novoServicoCompleto);
      console.log('Lista atual de serviços:', servicos);
      
      setServicos(servicosAtuais => [...servicosAtuais, novoServicoCompleto]);
      
      // Resetar formulário de novo serviço
      setNovoServico({
        tipo_servico_id: '',
        quantidade: 1,
        preco_unitario: 0,
        observacoes: ''
      })
    }
  }

  const removerServico = (index: number) => {
    console.log('Removendo serviço no índice:', index)
    setServicos(servicosAtuais => {
      const novosServicos = servicosAtuais.filter((_, i) => i !== index)
      console.log('Lista anterior de serviços:', servicosAtuais)
      console.log('Nova lista de serviços:', novosServicos)
      return novosServicos
    })
  }

  // Gerenciamento de Peças
  const adicionarPeca = () => {
    if (novaPeca.produto_id && novaPeca.quantidade > 0) {
      const produto = produtos.find(p => p.id === novaPeca.produto_id)
      
      // Verificar estoque
      if (produto && produto.estoque_atual < novaPeca.quantidade) {
        alert(`Estoque insuficiente! Disponível: ${produto.estoque_atual}`)
        return
      }
      
      const subtotal = novaPeca.quantidade * novaPeca.preco_unitario
      
      // Adicionar nova peça à lista
      const novaPecaCompleta = {
        ...novaPeca,
        produto_nome: produto?.nome,
        subtotal
      };
      
      console.log('Adicionando peça:', novaPecaCompleta);
      console.log('Lista atual de peças:', pecas);
      
      setPecas(pecasAtuais => [...pecasAtuais, novaPecaCompleta]);
      
      // Resetar formulário de nova peça
      setNovaPeca({
        produto_id: '',
        quantidade: 1,
        preco_unitario: 0
      })
    }
  }

  const removerPeca = (index: number) => {
    console.log('Removendo peça no índice:', index)
    setPecas(pecasAtuais => {
      const novasPecas = pecasAtuais.filter((_, i) => i !== index)
      console.log('Lista anterior de peças:', pecasAtuais)
      console.log('Nova lista de peças:', novasPecas)
      return novasPecas
    })
  }

  // Cálculos em tempo real - CORRIGIDO: garantindo cálculos precisos
  const totalServicos = Array.isArray(servicos) 
    ? servicos.reduce((sum, s) => sum + (Number(s.subtotal) || Number(s.quantidade || 1) * Number(s.preco_unitario || 0)), 0)
    : 0
  const totalPecas = Array.isArray(pecas)
    ? pecas.reduce((sum, p) => sum + (Number(p.subtotal) || Number(p.quantidade || 1) * Number(p.preco_unitario || 0)), 0)
    : 0
  const totalGeral = totalServicos + totalPecas
  
  // Log para debug dos totais
  console.log('TOTAIS CALCULADOS:', { totalServicos, totalPecas, totalGeral })

  // Ao selecionar tipo de serviço, preencher preço base
  const handleTipoServicoChange = (tipoId: string) => {
    const tipo = tiposServicos.find(t => t.id === tipoId)
    if (tipo) {
      setNovoServico({
        ...novoServico,
        tipo_servico_id: tipoId,
        preco_unitario: Number(tipo.preco_base)
      })
    }
  }

  // Ao selecionar produto, preencher preço de venda
  const handleProdutoChange = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId)
    if (produto) {
      setNovaPeca({
        ...novaPeca,
        produto_id: produtoId,
        preco_unitario: Number(produto.preco_venda)
      })
    }
  }

  const handleFormSubmit = async (data: OSFormData) => {
    try {
      // Verificar se temos serviços e peças
      console.log('Enviando OS com serviços:', servicos)
      console.log('Enviando OS com peças:', pecas)
      
      // Preparar dados completos - garantindo que os arrays estão corretos
      await onSubmit({
        ...data,
        // Inclui os itens para persistência
        servicos: Array.isArray(servicos) ? servicos : [],
        pecas: Array.isArray(pecas) ? pecas : [],
        valor_servicos: totalServicos,
        valor_pecas: totalPecas,
        valor_total: totalGeral
      })
    } catch (error) {
      console.error('Erro ao salvar OS:', error)
    }
  }

  const produtosFiltrados = produtos.filter(p => p.tipo === 'produto' && p.estoque_atual > 0)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4">Dados da Ordem de Serviço</h3>
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
                  {mecanico.nome}
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
              rows={2}
              placeholder="Observações adicionais..."
            />
          </div>
        </div>
      </div>

      {/* Serviços */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Serviços
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-5">
            <label className="label">Tipo de Serviço</label>
            <select
              value={novoServico.tipo_servico_id}
              onChange={(e) => handleTipoServicoChange(e.target.value)}
              className="input"
            >
              <option value="">Selecione...</option>
              {tiposServicos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome} - R$ {Number(tipo.preco_base).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Qtd</label>
            <input
              type="number"
              min="1"
              value={novoServico.quantidade}
              onChange={(e) => setNovoServico({ ...novoServico, quantidade: parseInt(e.target.value) || 1 })}
              className="input"
            />
          </div>

          <div className="md:col-span-3">
            <label className="label">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={novoServico.preco_unitario}
              onChange={(e) => setNovoServico({ ...novoServico, preco_unitario: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={adicionarServico}
              className="btn btn-secondary w-full h-10"
              title="Adicionar serviço"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {Array.isArray(servicos) && servicos.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Serviços Adicionados:</h4>
            <div className="space-y-2">
              {servicos.map((servico, index) => (
                <div key={servico.id || `servico-${index}-${servico.tipo_servico_id}`} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <p className="font-medium">{servico.tipo_servico_nome}</p>
                    <p className="text-sm text-gray-600">
                      Qtd: {servico.quantidade} × R$ {servico.preco_unitario.toFixed(2)} = R$ {servico.subtotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerServico(index)}
                    className="text-red-600 hover:text-red-800 ml-4"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
              <span>Total Serviços:</span>
              <span className="text-blue-600">R$ {totalServicos.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Peças */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Peças Utilizadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-5">
            <label className="label">Peça/Produto</label>
            <select
              value={novaPeca.produto_id}
              onChange={(e) => handleProdutoChange(e.target.value)}
              className="input"
            >
              <option value="">Selecione...</option>
              {produtosFiltrados.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} - Estoque: {produto.estoque_atual}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Qtd</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={novaPeca.quantidade}
              onChange={(e) => setNovaPeca({ ...novaPeca, quantidade: parseFloat(e.target.value) || 1 })}
              className="input"
            />
          </div>

          <div className="md:col-span-3">
            <label className="label">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={novaPeca.preco_unitario}
              onChange={(e) => setNovaPeca({ ...novaPeca, preco_unitario: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={adicionarPeca}
              className="btn btn-secondary w-full h-10"
              title="Adicionar peça"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {Array.isArray(pecas) && pecas.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Peças Adicionadas:</h4>
            <div className="space-y-2">
              {pecas.map((peca, index) => (
                <div key={peca.id || `peca-${index}-${peca.produto_id}`} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <p className="font-medium">{peca.produto_nome}</p>
                    <p className="text-sm text-gray-600">
                      Qtd: {peca.quantidade} × R$ {peca.preco_unitario.toFixed(2)} = R$ {peca.subtotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerPeca(index)}
                    className="text-red-600 hover:text-red-800 ml-4"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
              <span>Total Peças:</span>
              <span className="text-green-600">R$ {totalPecas.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Total Geral */}
      <div className="bg-primary-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-primary-700 mr-2" />
            <span className="text-lg font-semibold text-gray-900">Valor Total da OS:</span>
          </div>
          <span className="text-3xl font-bold text-primary-700">
            R$ {totalGeral.toFixed(2)}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-primary-200 grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Serviços:</span>
            <span className="font-medium">R$ {totalServicos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Peças:</span>
            <span className="font-medium">R$ {totalPecas.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
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
            <span>Salvar Ordem de Serviço</span>
          )}
        </button>
      </div>
    </form>
  )
}
