import { FileText, Download, Calendar, TrendingUp, DollarSign, Users } from 'lucide-react'

export default function Relatorios() {
  const relatorios = [
    { id: 1, nome: 'Vendas do Mês', descricao: 'Relatório de vendas e faturamento mensal', icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { id: 2, nome: 'Ordens de Serviço', descricao: 'Relatório de OS abertas, em andamento e concluídas', icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { id: 3, nome: 'Clientes', descricao: 'Relatório de clientes cadastrados e ativos', icon: Users, color: 'bg-purple-50 text-purple-600' },
    { id: 4, nome: 'Estoque', descricao: 'Relatório de produtos em estoque e movimentações', icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
    { id: 5, nome: 'Financeiro', descricao: 'Relatório de contas a pagar e receber', icon: DollarSign, color: 'bg-red-50 text-red-600' },
    { id: 6, nome: 'Mecânicos', descricao: 'Relatório de produtividade e comissões', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Gere relatórios e análises do sistema</p>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Período</h2>
          <div className="flex items-center space-x-4">
            <div>
              <label className="label">Data Inicial</label>
              <input type="date" className="input" defaultValue="2025-10-01" />
            </div>
            <div>
              <label className="label">Data Final</label>
              <input type="date" className="input" defaultValue="2025-10-31" />
            </div>
            <div className="flex items-end">
              <button className="btn btn-secondary flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatorios.map((relatorio) => {
          const Icon = relatorio.icon
          return (
            <div key={relatorio.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${relatorio.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{relatorio.nome}</h3>
                  <p className="text-sm text-gray-600 mb-4">{relatorio.descricao}</p>
                  <button className="btn btn-secondary btn-sm flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Gerar PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Relatórios Recentes</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Vendas de Outubro 2025</p>
                <p className="text-sm text-gray-600">Gerado em 28/10/2025 às 09:15</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Baixar</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Estoque - Outubro 2025</p>
                <p className="text-sm text-gray-600">Gerado em 27/10/2025 às 14:30</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Baixar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
