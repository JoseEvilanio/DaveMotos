import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Minus, Trash2, Barcode, Search, ShoppingCart, User, CreditCard, DollarSign, Tag, X, Package } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useClientes } from '@/hooks/useClientes'
import { useProdutos } from '@/hooks/useProdutos'

const vendaSchema = z.object({
  cliente_id: z.union([z.string(), z.literal(''), z.null()]).optional(),
  forma_pagamento: z.string().min(1, 'Selecione a forma de pagamento'),
  desconto: z.union([z.string(), z.number()]).optional(),
  observacoes: z.string().optional(),
  valor_produtos: z.number().optional(),
  valor_total: z.number().optional(),
})

type VendaFormData = z.infer<typeof vendaSchema>

interface CartItem {
  id: string
  produto: any
  quantidade: number
  preco_unitario: number
  subtotal: number
}

interface VendaFormProps {
  venda?: any
  onSubmit: (data: VendaFormData & { valor_produtos?: number; valor_total?: number; cliente_id?: string | null; desconto?: string | number }) => Promise<void>
  onCancel: () => void
  mode?: 'create' | 'view' | 'edit'
}

export default function VendaForm({ venda, onSubmit, onCancel, mode = 'create' }: VendaFormProps) {
  const { clientes, loading: loadingClientes } = useClientes()
  const { produtos, loading: loadingProdutos } = useProdutos()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Dinheiro')
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  
  const isReadOnly = mode === 'view'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: venda || {},
  })

  // Auto-focus no campo de código de barras
  useEffect(() => {
    if (mode === 'create' && barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [mode])

  // Definir valor inicial da forma de pagamento
  useEffect(() => {
    if (mode === 'create' && !venda?.forma_pagamento) {
      setValue('forma_pagamento', 'dinheiro')
      setSelectedPaymentMethod('Dinheiro')
    }
  }, [mode, venda, setValue])

  // Removido useEffect problemático que causava loop de sincronização

  // Calcular totais
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  const descontoValor = watch('desconto')
  const desconto = parseFloat(typeof descontoValor === 'string' ? descontoValor || '0' : descontoValor?.toString() || '0')
  const total = subtotal - desconto

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  // Adicionar produto ao carrinho
  const addToCart = (produto: any, quantidade: number = 1) => {
    const existingItem = cartItems.find(item => item.produto.id === produto.id)
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantidade + quantidade)
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        produto,
        quantidade,
        preco_unitario: Number(produto.preco_venda),
        subtotal: Number(produto.preco_venda) * quantidade,
      }
      setCartItems([...cartItems, newItem])
    }
  }

  // Remover item do carrinho
  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId))
  }

  // Atualizar quantidade
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantidade: newQuantity,
          subtotal: item.preco_unitario * newQuantity,
        }
      }
      return item
    }))
  }

  // Buscar produto por código de barras
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const produto = produtos.find(p => p.codigo === barcodeInput.trim())
    if (produto) {
      addToCart(produto)
      setBarcodeInput('')
    } else {
      // Se não encontrar por código, buscar por nome
      const produtoPorNome = produtos.find(p => 
        p.nome.toLowerCase().includes(barcodeInput.toLowerCase())
      )
      if (produtoPorNome) {
        addToCart(produtoPorNome)
        setBarcodeInput('')
      }
    }
  }

  // Buscar produtos filtrados
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch && produto.tipo === 'produto'
  })

  // Se estiver no modo visualização, mostrar detalhes da venda
  if (isReadOnly && venda) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Número da Venda</label>
            <div className="input bg-gray-50">#{venda.id?.slice(0, 8)}</div>
          </div>

          <div>
            <label className="label">Data da Venda</label>
            <div className="input bg-gray-50">
              {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div>
            <label className="label">Cliente</label>
            <div className="input bg-gray-50">
              {venda.cliente_nome || 'Cliente Avulso'}
            </div>
          </div>

          <div>
            <label className="label">Forma de Pagamento</label>
            <div className="input bg-gray-50">
              {venda.forma_pagamento || 'Não informado'}
            </div>
          </div>

          <div>
            <label className="label">Valor dos Produtos</label>
            <div className="input bg-gray-50">
              {formatCurrency(venda.valor_produtos || 0)}
            </div>
          </div>

          <div>
            <label className="label">Desconto</label>
            <div className="input bg-gray-50">
              {formatCurrency(venda.valor_desconto || 0)}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label">Valor Total</label>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(venda.valor_total || 0)}
            </div>
          </div>

          {venda.observacoes && (
            <div className="md:col-span-2">
              <label className="label">Observações</label>
              <div className="input bg-gray-50 min-h-[80px]">
                {venda.observacoes}
              </div>
            </div>
          )}

          <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> {venda.status_pagamento || 'Pendente'}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header PDV */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold">PDV - Venda de Balcão</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Sistema de Vendas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(total)}</div>
            <div className="text-blue-100 text-xs sm:text-sm">Total da Venda</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Área de Produtos */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
          {/* Barra de Código de Barras */}
          <form onSubmit={handleBarcodeSubmit} className="mb-2 sm:mb-4">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Digite o código de barras ou nome do produto..."
                className="input pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-lg border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>

          {/* Busca de Produtos */}
          {showProductSearch && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="mb-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {filteredProdutos.map((produto) => (
                  <div
                    key={produto.id}
                    onClick={() => {
                      addToCart(produto)
                      setSearchTerm('')
                    }}
                    className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{produto.nome}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(produto.preco_venda)}</p>
                        <p className="text-xs text-gray-400">Estoque: {produto.estoque_atual}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carrinho de Compras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Carrinho ({cartItems.length})</span>
              </h3>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Carrinho vazio</p>
                <p className="text-sm text-gray-400">Escaneie um produto ou clique para adicionar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.produto.nome}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.preco_unitario)} cada</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantidade}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel Lateral - Resumo e Pagamento */}
        <div className="w-full lg:w-80 bg-gray-50 p-2 sm:p-4 border-l flex flex-col overflow-y-auto">
          {/* Cliente */}
          <div className="mb-2 sm:mb-4">
            <label className="label flex items-center space-x-2 text-sm sm:text-base">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Cliente (Opcional)</span>
            </label>
            <select {...register('cliente_id')} className="input text-xs sm:text-sm" disabled={loadingClientes}>
              <option value="">{loadingClientes ? 'Carregando...' : 'Cliente avulso'}</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cpf && `- ${cliente.cpf}`}
                </option>
              ))}
            </select>
          </div>

          {/* Resumo da Venda */}
          <div className="mb-2 sm:mb-4 p-3 sm:p-4 bg-white rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center space-x-2 text-sm sm:text-base">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Resumo da Venda</span>
            </h4>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Desconto:</span>
                <input
                  {...register('desconto')}
                  type="text"
                  inputMode="decimal"
                  className="w-16 sm:w-20 text-right border rounded px-1 sm:px-2 py-1 text-xs sm:text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="border-t pt-1 sm:pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-base sm:text-lg text-green-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="mb-2 sm:mb-4">
            <label className="label flex items-center space-x-2 text-sm sm:text-base">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Forma de Pagamento *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
              {[
                { label: 'Dinheiro', value: 'dinheiro' },
                { label: 'Pix', value: 'pix' },
                { label: 'Cartão de Débito', value: 'cartao_debito' },
                { label: 'Cartão de Crédito', value: 'cartao_credito' }
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod(method.label)
                    setValue('forma_pagamento', method.value)
                  }}
                  className={`p-1 sm:p-2 text-xs border rounded-lg transition-colors ${
                    selectedPaymentMethod === method.label
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            {errors.forma_pagamento && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.forma_pagamento.message}</p>
            )}
          </div>

          {/* Observações */}
          <div className="mb-2 sm:mb-4">
            <label className="label text-sm sm:text-base">Observações</label>
            <textarea
              {...register('observacoes')}
              className="input text-xs sm:text-sm"
              rows={2}
              placeholder="Observações sobre a venda..."
            />
          </div>

          {/* Botões de Ação */}
          <div className="mt-auto space-y-1 sm:space-y-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full btn btn-secondary text-xs sm:text-sm py-2 sm:py-3"
            >
              Cancelar Venda
            </button>
            <button
              type="submit"
              onClick={handleSubmit((data) => {
                // Adicionar os valores calculados antes de enviar
                const vendaData = {
                  ...data,
                  valor_produtos: subtotal,
                  valor_total: total,
                  desconto: typeof data.desconto === 'string' ? parseFloat(data.desconto || '0') : data.desconto || 0,
                  // Garantir que cliente_id seja null quando vazio
                  cliente_id: data.cliente_id || null
                }
                onSubmit(vendaData)
              })}
              className="w-full btn btn-primary flex items-center justify-center space-x-2 py-2 sm:py-3 text-xs sm:text-sm"
              disabled={cartItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Finalizar Venda - {formatCurrency(total)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
