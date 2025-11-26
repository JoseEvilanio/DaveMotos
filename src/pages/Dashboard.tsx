import { Users, Bike, FileText, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useClientes } from '@/hooks/useClientes'
import { useVeiculos } from '@/hooks/useVeiculos'
import { useOrdensServico } from '@/hooks/useOrdensServico'
import { useVendas } from '@/hooks/useVendas'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const { clientes, loading: loadingClientes, fetchClientes } = useClientes()
  const { veiculos, loading: loadingVeiculos, fetchVeiculos } = useVeiculos()
  const { ordens, loading: loadingOrdens, fetchOrdens } = useOrdensServico()
  const { vendas, loading: loadingVendas, fetchVendas } = useVendas()
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('12m')

  const loading = loadingClientes || loadingVeiculos || loadingOrdens || loadingVendas

  // Calcular estatísticas
  const stats = {
    totalClientes: clientes.length,
    totalVeiculos: veiculos.length,
    osAbertas: ordens.filter(os => os.status === 'aberta' || os.status === 'em_andamento').length,
    vendasHoje: vendas.filter(v => {
      const hoje = new Date().toISOString().split('T')[0]
      const dataVenda = new Date(v.data_venda).toISOString().split('T')[0]
      return dataVenda === hoje
    }).length,
  }

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: Users,
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Veículos Cadastrados',
      value: stats.totalVeiculos,
      icon: Bike,
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'OS Abertas',
      value: stats.osAbertas,
      icon: FileText,
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ]

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const getRange = (p: '7d' | '30d' | '12m') => {
    const end = new Date()
    const start = new Date(end)
    if (p === '7d') start.setDate(end.getDate() - 6)
    if (p === '30d') start.setDate(end.getDate() - 29)
    if (p === '12m') start.setMonth(end.getMonth() - 11)
    return { start, end }
  }
  const getPrevRange = (p: '7d' | '30d' | '12m') => {
    const { start, end } = getRange(p)
    const dur = end.getTime() - start.getTime()
    const prevEnd = new Date(start)
    const prevStart = new Date(prevEnd.getTime() - dur)
    return { start: prevStart, end: prevEnd }
  }
  const filteredVendas = useMemo(() => {
    const { start, end } = getRange(period)
    return vendas.filter(v => {
      const dv = new Date(v.data_venda)
      return dv >= start && dv <= end
    })
  }, [vendas, period])
  const prevFilteredVendas = useMemo(() => {
    const { start, end } = getPrevRange(period)
    return vendas.filter(v => {
      const dv = new Date(v.data_venda)
      return dv >= start && dv <= end
    })
  }, [vendas, period])
  const vendasPeriodoCount = filteredVendas.length
  const vendasPeriodoTotal = filteredVendas.reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
  const prevVendasPeriodoTotal = prevFilteredVendas.reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
  const deltaVendas = prevVendasPeriodoTotal === 0 ? 0 : ((vendasPeriodoTotal - prevVendasPeriodoTotal) / prevVendasPeriodoTotal) * 100
  const chartDataVendas = useMemo(() => {
    if (period === '12m') {
      const now = new Date()
      const items = [] as { mes: string; valor: number }[]
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = `${meses[d.getMonth()]}`
        const total = filteredVendas
          .filter(v => {
            const dv = new Date(v.data_venda)
            return dv.getFullYear() === d.getFullYear() && dv.getMonth() === d.getMonth()
          })
          .reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
        items.push({ mes: label, valor: total })
      }
      return items
    }
    const days = period === '7d' ? 7 : 30
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - (days - 1))
    const items = [] as { mes: string; valor: number }[]
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      const total = filteredVendas
        .filter(v => {
          const dv = new Date(v.data_venda)
          return dv.getFullYear() === d.getFullYear() && dv.getMonth() === d.getMonth() && dv.getDate() === d.getDate()
        })
        .reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
      items.push({ mes: label, valor: total })
    }
    return items
  }, [filteredVendas, period])

  useEffect(() => {
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => fetchClientes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'veiculos' }, () => fetchVeiculos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordens_servico' }, () => fetchOrdens())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => fetchVendas())
      .subscribe()
    return () => {
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [])

  const exportVendasCSV = () => {
    const rows = [['Data', 'Cliente', 'Valor Total']]
    filteredVendas.forEach(v => {
      const data = new Date(v.data_venda).toLocaleString('pt-BR')
      rows.push([data, v.cliente_nome || 'Cliente Avulso', String(v.valor_total || 0)])
    })
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '"')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vendas_periodo.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>
      <div className="flex items-center gap-2">
        <button className={`btn ${period === '7d' ? 'btn-primary' : 'btn-secondary'} text-sm`} onClick={() => setPeriod('7d')}>7 dias</button>
        <button className={`btn ${period === '30d' ? 'btn-primary' : 'btn-secondary'} text-sm`} onClick={() => setPeriod('30d')}>30 dias</button>
        <button className={`btn ${period === '12m' ? 'btn-primary' : 'btn-secondary'} text-sm`} onClick={() => setPeriod('12m')}>12 meses</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ...statCards,
          { title: `Vendas (${period})`, value: vendasPeriodoCount, icon: DollarSign, textColor: deltaVendas >= 0 ? 'text-green-600' : 'text-red-600', bgColor: deltaVendas >= 0 ? 'bg-green-50' : 'bg-red-50' },
        ].map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.title.startsWith('Vendas') && (
                  <p className={`text-xs mt-1 ${deltaVendas >= 0 ? 'text-green-600' : 'text-red-600'}`}>{deltaVendas >= 0 ? '+' : ''}{deltaVendas.toFixed(1)}% receita</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-gray-900">Faturamento</h2>
            <button onClick={exportVendasCSV} className="btn btn-secondary text-sm">Exportar CSV</button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataVendas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#1E3A8A" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">
            Tendência de Vendas
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataVendas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-gray-900">
              Ordens de Serviço Recentes
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {ordens.slice(0, 5).length > 0 ? (
              ordens.slice(0, 5).map((os) => (
                <div key={os.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      OS #{os.numero_os || os.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">{os.cliente_nome}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    os.status === 'aberta' ? 'bg-blue-100 text-blue-800' :
                    os.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                    os.status === 'concluida' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {os.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma OS recente</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-gray-900">
              Alertas e Notificações
            </h2>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {ordens.filter(os => os.status === 'aguardando_pecas').length > 0 ? (
              <>
                <div className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      {ordens.filter(os => os.status === 'aguardando_pecas').length} OS aguardando peças
                    </p>
                    <p className="text-xs text-yellow-700">Verifique o estoque</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Nenhum alerta no momento</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
