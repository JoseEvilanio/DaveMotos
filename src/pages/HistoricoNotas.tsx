// ============================================================================
// PÁGINA DE HISTÓRICO DE NOTAS FISCAIS
// ============================================================================

import { useState } from 'react';
import { useNotasFiscais, useConfiguracaoFiscal } from '../stores/fiscalStore';
import { useEmissaoNota } from '../hooks/useEmissaoNota';
import type { NotaFiscal, TipoNota, StatusNota } from '../types/fiscal';
import toast from 'react-hot-toast';
import {
    History,
    Search,
    Filter,
    Download,
    Eye,
    XCircle,
    RefreshCw,
    FileText,
    Receipt,
    Calendar,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Ban,
} from 'lucide-react';
import { format } from 'date-fns';

export default function HistoricoNotasPage() {
    const { notas, selecionarNota, filtrarNotas } = useNotasFiscais();
    const { configurado } = useConfiguracaoFiscal();
    const { consultarNota, downloadPDF, downloadXML } = useEmissaoNota();

    // Estados de filtro
    const [filtroTipo, setFiltroTipo] = useState<TipoNota | ''>('');
    const [filtroStatus, setFiltroStatus] = useState<StatusNota | ''>('');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');

    // Estados de UI
    const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null);
    const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
    const [mostrarCancelamento, setMostrarCancelamento] = useState(false);
    const [justificativaCancelamento, setJustificativaCancelamento] = useState('');
    const [cancelando, setCancelando] = useState(false);

    // ==========================================================================
    // FILTROS
    // ==========================================================================

    const notasFiltradas = filtrarNotas({
        tipo: filtroTipo || undefined,
        status: filtroStatus || undefined,
        cliente: filtroBusca || undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim: filtroDataFim || undefined,
    });

    // ==========================================================================
    // AÇÕES
    // ==========================================================================

    const handleConsultar = async (nota: NotaFiscal) => {
        if (nota.referencia && nota.tipo) {
            await consultarNota(nota.referencia, nota.tipo);
            toast.success('Status atualizado!');
        }
    };

    const handleDownloadPDF = async (nota: NotaFiscal) => {
        if (nota.referencia && nota.tipo) {
            await downloadPDF(nota.referencia, nota.tipo);
        }
    };

    const handleDownloadXML = async (nota: NotaFiscal) => {
        if (nota.referencia && nota.tipo) {
            await downloadXML(nota.referencia, nota.tipo);
        }
    };

    const handleVerDetalhes = (nota: NotaFiscal) => {
        setNotaSelecionada(nota);
        setMostrarDetalhes(true);
    };

    const handleIniciarCancelamento = (nota: NotaFiscal) => {
        if (nota.cancelada) {
            toast.error('Esta nota já está cancelada');
            return;
        }
        if (nota.status !== 'autorizada') {
            toast.error('Apenas notas autorizadas podem ser canceladas');
            return;
        }
        setNotaSelecionada(nota);
        setMostrarCancelamento(true);
        setJustificativaCancelamento('');
    };

    const handleCancelar = async () => {
        if (!notaSelecionada) return;

        if (justificativaCancelamento.length < 15) {
            toast.error('A justificativa deve ter no mínimo 15 caracteres');
            return;
        }

        setCancelando(true);

        try {
            const { cancelarNota } = useEmissaoNota();
            const sucesso = await cancelarNota(
                notaSelecionada.referencia,
                justificativaCancelamento,
                notaSelecionada.tipo
            );

            if (sucesso) {
                setMostrarCancelamento(false);
                setNotaSelecionada(null);
                setJustificativaCancelamento('');
            }
        } finally {
            setCancelando(false);
        }
    };

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    const getStatusBadge = (status: StatusNota) => {
        const badges = {
            pendente: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
            processando: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
            autorizada: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            cancelada: { bg: 'bg-red-100', text: 'text-red-800', icon: Ban },
            erro: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            rejeitada: { bg: 'bg-orange-100', text: 'text-orange-800', icon: XCircle },
            denegada: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
        };

        const badge = badges[status] || badges.pendente;
        const Icon = badge.icon;

        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
            >
                <Icon className="w-3 h-3" />
                {status.toUpperCase()}
            </span>
        );
    };

    const getTipoIcon = (tipo: TipoNota) => {
        return tipo === 'nfce' ? (
            <Receipt className="w-4 h-4 text-blue-600" />
        ) : (
            <FileText className="w-4 h-4 text-green-600" />
        );
    };

    // ==========================================================================
    // RENDER
    // ==========================================================================

    if (!configurado) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-yellow-900 mb-2">
                            Módulo Fiscal Não Configurado
                        </h3>
                        <p className="text-yellow-800 mb-4">
                            Configure o módulo fiscal antes de visualizar o histórico.
                        </p>
                        <a
                            href="/#/fiscal/configuracao"
                            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Ir para Configuração
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <History className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Histórico de Notas Fiscais</h1>
                </div>
                <p className="text-gray-600">Consulte e gerencie todas as notas emitidas</p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value as TipoNota | '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="nfce">NFC-e</option>
                            <option value="nfe">NF-e</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value as StatusNota | '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="autorizada">Autorizada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="processando">Processando</option>
                            <option value="erro">Erro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data Início
                        </label>
                        <input
                            type="date"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={filtroBusca}
                                onChange={(e) => setFiltroBusca(e.target.value)}
                                placeholder="Cliente, Chave..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total de Notas</p>
                            <p className="text-2xl font-bold text-gray-900">{notasFiltradas.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Autorizadas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {notasFiltradas.filter((n) => n.status === 'autorizada').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Canceladas</p>
                            <p className="text-2xl font-bold text-red-600">
                                {notasFiltradas.filter((n) => n.cancelada).length}
                            </p>
                        </div>
                        <Ban className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Valor Total</p>
                            <p className="text-2xl font-bold text-blue-600">
                                R${' '}
                                {notasFiltradas
                                    .filter((n) => !n.cancelada)
                                    .reduce((sum, n) => sum + n.valor_total, 0)
                                    .toFixed(2)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Tabela de Notas */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Número
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {notasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-12 h-12 text-gray-300" />
                                            <p className="text-gray-500">Nenhuma nota encontrada</p>
                                            <p className="text-sm text-gray-400">
                                                Emita sua primeira nota ou ajuste os filtros
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                notasFiltradas.map((nota) => (
                                    <tr key={nota.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getTipoIcon(nota.tipo)}
                                                <span className="text-sm font-medium text-gray-900">
                                                    {nota.tipo.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{nota.numero || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">Série: {nota.serie || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {nota.cliente_nome || 'Não informado'}
                                            </div>
                                            <div className="text-xs text-gray-500">{nota.cliente_cpf_cnpj}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {format(new Date(nota.data_emissao), 'dd/MM/yyyy')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {format(new Date(nota.data_emissao), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                R$ {nota.valor_total.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(nota.status)}
                                            {nota.cancelada && (
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <Ban className="w-3 h-3" />
                                                        CANCELADA
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerDetalhes(nota)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleConsultar(nota)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Consultar Status"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPDF(nota)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Baixar PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {!nota.cancelada && nota.status === 'autorizada' && (
                                                    <button
                                                        onClick={() => handleIniciarCancelamento(nota)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Cancelar Nota"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Cancelamento */}
            {mostrarCancelamento && notaSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Cancelar Nota Fiscal</h3>
                                <p className="text-sm text-gray-600">
                                    {notaSelecionada.tipo.toUpperCase()} Nº {notaSelecionada.numero}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Justificativa (mínimo 15 caracteres) *
                            </label>
                            <textarea
                                value={justificativaCancelamento}
                                onChange={(e) => setJustificativaCancelamento(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="Informe o motivo do cancelamento..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {justificativaCancelamento.length} / 15 caracteres
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Atenção:</strong> Esta ação não pode ser desfeita. A nota será cancelada
                                na SEFAZ.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setMostrarCancelamento(false);
                                    setNotaSelecionada(null);
                                    setJustificativaCancelamento('');
                                }}
                                disabled={cancelando}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCancelar}
                                disabled={cancelando || justificativaCancelamento.length < 15}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {cancelando ? 'Cancelando...' : 'Confirmar Cancelamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes */}
            {mostrarDetalhes && notaSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {getTipoIcon(notaSelecionada.tipo)}
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Detalhes da {notaSelecionada.tipo.toUpperCase()}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setMostrarDetalhes(false);
                                    setNotaSelecionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                    <p className="text-gray-900">{notaSelecionada.numero || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                                    <p className="text-gray-900">{notaSelecionada.serie || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Chave de Acesso
                                    </label>
                                    <p className="text-sm font-mono bg-gray-50 p-2 rounded border break-all">
                                        {notaSelecionada.chave || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    {getStatusBadge(notaSelecionada.status)}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor Total
                                    </label>
                                    <p className="text-lg font-bold text-green-600">
                                        R$ {notaSelecionada.valor_total.toFixed(2)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                    <p className="text-gray-900">{notaSelecionada.cliente_nome || 'Não informado'}</p>
                                    {notaSelecionada.cliente_cpf_cnpj && (
                                        <p className="text-sm text-gray-600">{notaSelecionada.cliente_cpf_cnpj}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Emissão
                                    </label>
                                    <p className="text-gray-900">
                                        {format(new Date(notaSelecionada.data_emissao), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                {notaSelecionada.cancelada && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Data de Cancelamento
                                            </label>
                                            <p className="text-gray-900">
                                                {notaSelecionada.data_cancelamento
                                                    ? format(new Date(notaSelecionada.data_cancelamento), 'dd/MM/yyyy HH:mm')
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Motivo do Cancelamento
                                            </label>
                                            <p className="text-gray-900">{notaSelecionada.motivo_cancelamento}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => handleDownloadPDF(notaSelecionada)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar PDF
                                </button>
                                <button
                                    onClick={() => handleDownloadXML(notaSelecionada)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar XML
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
