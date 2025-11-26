import { useState } from 'react'
import { Package, AlertTriangle, TrendingUp } from 'lucide-react'
import { useProdutos } from '@/hooks/useProdutos'

export default function Estoque() {
  const { produtos, loading } = useProdutos()
  const [filter, setFilter] = useState<'all' | 'baixo' | 'ok'>('all')

  const produtosEstoque = produtos.filter(p => p.tipo === 'produto')
  
  const produtosBaixoEstoque = produtosEstoque.filter(p => p.estoque_atual <= p.estoque_minimo)
  const produtosEstoqueOk = produtosEstoque.filter(p => p.estoque_atual > p.estoque_minimo)

  const filteredProdutos = filter === 'baixo' 
    ? produtosBaixoEstoque 
    : filter === 'ok' 
    ? produtosEstoqueOk 
    : produtosEstoque

  const valorTotalEstoque = produtosEstoque.reduce((acc, p) => 
    acc + (p.preco_custo || 0) * p.estoque_atual, 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Controle de Estoque</h1>
        <p className="text-gray-600 mt-1">Gerencie o estoque de produtos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{produtosEstoque.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">{produtosBaixoEstoque.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({produtosEstoque.length})
          </button>
          <button
            onClick={() => setFilter('baixo')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'baixo'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Estoque Baixo ({produtosBaixoEstoque.length})
          </button>
          <button
            onClick={() => setFilter('ok')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ok'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Estoque OK ({produtosEstoqueOk.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Status</th>
                  <th>Preço Custo</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdutos.map((produto) => {
                  const isBaixo = produto.estoque_atual <= produto.estoque_minimo
                  return (
                    <tr key={produto.id}>
                      <td className="font-mono text-sm">{produto.codigo || '-'}</td>
                      <td className="font-medium">{produto.nome}</td>
                      <td className={isBaixo ? 'text-red-600 font-bold' : ''}>
                        {produto.estoque_atual}
                      </td>
                      <td>{produto.estoque_minimo}</td>
                      <td>
                        {isBaixo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            OK
                          </span>
                        )}
                      </td>
                      <td>
                        {produto.preco_custo 
                          ? `R$ ${produto.preco_custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : '-'
                        }
                      </td>
                      <td className="font-medium">
                        R$ {((produto.preco_custo || 0) * produto.estoque_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
