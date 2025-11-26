// ============================================================================
// DASHBOARD FISCAL
// ============================================================================

import { useMemo } from 'react';
import { useNotasFiscais } from '../stores/fiscalStore';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    PieChart,
    BarChart2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity
} from 'lucide-react';
import { format, subDays, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardFiscal() {
    const { notas } = useNotasFiscais();

    // ==========================================================================
    // CÁLCULOS ESTATÍSTICOS
    // ==========================================================================

    const stats = useMemo(() => {
        const hoje = new Date();
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);
        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => subDays(hoje, 6 - i));

        // Filtrar notas autorizadas
        const notasAutorizadas = notas.filter(n => n.status === 'autorizada' && !n.cancelada);
        const notasCanceladas = notas.filter(n => n.cancelada);
        const notasErro = notas.filter(n => n.status === 'erro' || n.status === 'rejeitada');

        // Totais Gerais
        const totalVendido = notasAutorizadas.reduce((acc, n) => acc + n.valor_total, 0);
        const ticketMedio = notasAutorizadas.length > 0 ? totalVendido / notasAutorizadas.length : 0;

        // Totais do Mês
        const notasMes = notasAutorizadas.filter(n =>
            isWithinInterval(new Date(n.data_emissao), { start: inicioMes, end: fimMes })
        );
        const totalMes = notasMes.reduce((acc, n) => acc + n.valor_total, 0);

        // Totais de Hoje
        const notasHoje = notasAutorizadas.filter(n => isSameDay(new Date(n.data_emissao), hoje));
        const totalHoje = notasHoje.reduce((acc, n) => acc + n.valor_total, 0);

        // Dados para Gráfico de 7 dias
        const dadosGrafico = ultimos7Dias.map(dia => {
            const notasDia = notasAutorizadas.filter(n => isSameDay(new Date(n.data_emissao), dia));
            const totalDia = notasDia.reduce((acc, n) => acc + n.valor_total, 0);
            return {
                dia: format(dia, 'dd/MM'),
                valor: totalDia,
                qtd: notasDia.length
            };
        });

        // Distribuição por Tipo (NFe vs NFCe)
        const porTipo = {
            nfce: notasAutorizadas.filter(n => n.tipo === 'nfce').length,
            nfe: notasAutorizadas.filter(n => n.tipo === 'nfe').length
        };

        return {
            totalVendido,
            ticketMedio,
            totalMes,
            totalHoje,
            qtdAutorizadas: notasAutorizadas.length,
            qtdCanceladas: notasCanceladas.length,
            qtdErro: notasErro.length,
            dadosGrafico,
            porTipo
        };
    }, [notas]);

    // ==========================================================================
    // COMPONENTES VISUAIS
    // ==========================================================================

    const CardStat = ({ title, value, subtext, icon: Icon, color }: any) => (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color.bg}`}>
                    <Icon className={`w-6 h-6 ${color.text}`} />
                </div>
                <span className={`text-sm font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                    {subtext}
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-8 h-8 text-blue-600" />
                        Dashboard Fiscal
                    </h1>
                    <p className="text-gray-600">Visão geral das emissões e faturamento</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    Hoje: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
            </div>

            {/* Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CardStat
                    title="Vendas Hoje"
                    value={`R$ ${stats.totalHoje.toFixed(2)}`}
                    subtext={`${stats.dadosGrafico[6].qtd} notas`}
                    icon={DollarSign}
                    color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                />
                <CardStat
                    title="Vendas no Mês"
                    value={`R$ ${stats.totalMes.toFixed(2)}`}
                    subtext="Acumulado"
                    icon={Calendar}
                    color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                />
                <CardStat
                    title="Ticket Médio"
                    value={`R$ ${stats.ticketMedio.toFixed(2)}`}
                    subtext="Por nota"
                    icon={TrendingUp}
                    color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                />
                <CardStat
                    title="Notas Canceladas"
                    value={stats.qtdCanceladas}
                    subtext="Total geral"
                    icon={XCircle}
                    color={{ bg: 'bg-red-50', text: 'text-red-600' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Barras (Simplificado com CSS) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-gray-500" />
                            Faturamento - Últimos 7 Dias
                        </h3>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {stats.dadosGrafico.map((d, i) => {
                            const maxVal = Math.max(...stats.dadosGrafico.map(d => d.valor), 1); // Evitar div por 0
                            const height = (d.valor / maxVal) * 100;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full max-w-[40px] bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                                            style={{ height: `${Math.max(height, 5)}%` }} // Mínimo 5% para visibilidade
                                        ></div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                            R$ {d.valor.toFixed(2)} ({d.qtd})
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{d.dia}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Distribuição e Status */}
                <div className="space-y-6">
                    {/* Distribuição por Tipo */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-gray-500" />
                            Tipos de Nota
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">NFC-e (Consumidor)</span>
                                    <span className="font-medium">{stats.porTipo.nfce}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${(stats.porTipo.nfce / (stats.qtdAutorizadas || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">NF-e (Completa)</span>
                                    <span className="font-medium">{stats.porTipo.nfe}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${(stats.porTipo.nfe / (stats.qtdAutorizadas || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status do Sistema */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">API FocusNFe</span>
                                </div>
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Online</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Ambiente</span>
                                </div>
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Homologação</span>
                            </div>
                            {stats.qtdErro > 0 && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <span className="text-sm font-medium text-red-900">Erros de Emissão</span>
                                    </div>
                                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">{stats.qtdErro}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
