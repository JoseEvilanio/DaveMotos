// ============================================================================
// PÁGINA DE EMISSÃO DE NFC-E
// ============================================================================

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfiguracaoFiscal } from '../stores/fiscalStore';
import { useEmissaoNota } from '../hooks/useEmissaoNota';
import type { ItemNota, FormaPagamentoNota, NotaFiscal } from '../types/fiscal';
import toast from 'react-hot-toast';
import {
    Receipt,
    Plus,
    Trash2,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
    QrCode,
    Download,
} from 'lucide-react';

export default function EmissaoNFCePage() {
    const { configurado } = useConfiguracaoFiscal();
    const { emitirNFCe, emitindo, downloadPDF } = useEmissaoNota();
    const location = useLocation();

    // Estado dos itens
    const [itens, setItens] = useState<ItemNota[]>([
        {
            numero_item: '1',
            descricao: '',
            cfop: '5102',
            unidade_comercial: 'UN',
            quantidade_comercial: '1',
            valor_unitario_comercial: '0.00',
            icms_situacao_tributaria: '102',
            icms_origem: '0',
            pis_situacao_tributaria: '07',
            cofins_situacao_tributaria: '07',
        },
    ]);

    // Estado das formas de pagamento
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoNota[]>([
        {
            forma_pagamento: '17', // PIX
            valor_pagamento: '0.00',
        },
    ]);

    // Estado da nota emitida
    const [notaEmitida, setNotaEmitida] = useState<NotaFiscal | null>(null);

    // Cliente (opcional para NFC-e)
    const [clienteNome, setClienteNome] = useState('CONSUMIDOR NAO IDENTIFICADO');

    // Carregar dados da OS se vier do redirecionamento
    useEffect(() => {
        if (location.state?.origem === 'os' && location.state?.dados) {
            const os = location.state.dados;

            // Preencher cliente
            if (os.cliente_nome) {
                setClienteNome(os.cliente_nome);
            }

            // Mapear itens (Serviços + Peças)
            const novosItens: ItemNota[] = [];
            let numeroItem = 1;

            // Adicionar Serviços
            if (os.servicos && Array.isArray(os.servicos)) {
                os.servicos.forEach((servico: any) => {
                    novosItens.push({
                        numero_item: numeroItem.toString(),
                        descricao: servico.tipo_servico_nome || servico.descricao || 'SERVICO MECANICO',
                        cfop: '5933', // Prestação de serviço
                        unidade_comercial: 'UN',
                        quantidade_comercial: Number(servico.quantidade || 1).toString(),
                        valor_unitario_comercial: Number(servico.preco_unitario || 0).toFixed(2),
                        icms_situacao_tributaria: '102',
                        icms_origem: '0',
                        pis_situacao_tributaria: '07',
                        cofins_situacao_tributaria: '07',
                    });
                    numeroItem++;
                });
            }

            // Adicionar Peças
            if (os.pecas && Array.isArray(os.pecas)) {
                os.pecas.forEach((peca: any) => {
                    novosItens.push({
                        numero_item: numeroItem.toString(),
                        descricao: peca.produto_nome || peca.descricao || 'PECA AUTOMOTIVA',
                        cfop: '5102', // Venda de mercadoria
                        unidade_comercial: 'UN',
                        quantidade_comercial: Number(peca.quantidade || 1).toString(),
                        valor_unitario_comercial: Number(peca.preco_unitario || 0).toFixed(2),
                        icms_situacao_tributaria: '102',
                        icms_origem: '0',
                        pis_situacao_tributaria: '07',
                        cofins_situacao_tributaria: '07',
                    });
                    numeroItem++;
                });
            }

            if (novosItens.length > 0) {
                setItens(novosItens);

                // Atualizar total do pagamento inicial
                const total = novosItens.reduce((acc, item) => {
                    return acc + (parseFloat(item.quantidade_comercial.toString()) * parseFloat(item.valor_unitario_comercial.toString()));
                }, 0);

                setFormasPagamento([{
                    forma_pagamento: '17', // PIX padrão
                    valor_pagamento: total.toFixed(2)
                }]);

                toast.success(`Dados da OS #${os.numero_os || os.id} carregados!`);
            }
        }
    }, [location.state]);

    // ==========================================================================
    // FUNÇÕES DE ITENS
    // ==========================================================================

    const adicionarItem = () => {
        const novoNumero = (itens.length + 1).toString();
        setItens([
            ...itens,
            {
                numero_item: novoNumero,
                descricao: '',
                cfop: '5102',
                unidade_comercial: 'UN',
                quantidade_comercial: '1',
                valor_unitario_comercial: '0.00',
                icms_situacao_tributaria: '102',
                icms_origem: '0',
                pis_situacao_tributaria: '07',
                cofins_situacao_tributaria: '07',
            },
        ]);
    };

    const removerItem = (index: number) => {
        if (itens.length === 1) {
            toast.error('Deve haver pelo menos 1 item');
            return;
        }
        const novosItens = itens.filter((_, i) => i !== index);
        // Renumerar itens
        novosItens.forEach((item, i) => {
            item.numero_item = (i + 1).toString();
        });
        setItens(novosItens);
    };

    const atualizarItem = (index: number, campo: keyof ItemNota, valor: string) => {
        const novosItens = [...itens];
        (novosItens[index] as any)[campo] = valor;
        setItens(novosItens);
    };

    // ==========================================================================
    // FUNÇÕES DE PAGAMENTO
    // ==========================================================================

    const adicionarFormaPagamento = () => {
        setFormasPagamento([
            ...formasPagamento,
            {
                forma_pagamento: '01', // Dinheiro
                valor_pagamento: '0.00',
            },
        ]);
    };

    const removerFormaPagamento = (index: number) => {
        if (formasPagamento.length === 1) {
            toast.error('Deve haver pelo menos 1 forma de pagamento');
            return;
        }
        setFormasPagamento(formasPagamento.filter((_, i) => i !== index));
    };

    const atualizarFormaPagamento = (
        index: number,
        campo: keyof FormaPagamentoNota,
        valor: string
    ) => {
        const novasFormas = [...formasPagamento];
        (novasFormas[index] as any)[campo] = valor;
        setFormasPagamento(novasFormas);
    };

    // ==========================================================================
    // CÁLCULOS
    // ==========================================================================

    const calcularTotalItens = (): number => {
        return itens.reduce((total, item) => {
            const qtd = parseFloat(item.quantidade_comercial.toString()) || 0;
            const valor = parseFloat(item.valor_unitario_comercial.toString()) || 0;
            return total + qtd * valor;
        }, 0);
    };

    const calcularTotalPagamentos = (): number => {
        return formasPagamento.reduce((total, forma) => {
            return total + (parseFloat(forma.valor_pagamento.toString()) || 0);
        }, 0);
    };

    const distribuirPagamento = () => {
        const total = calcularTotalItens();
        const novasFormas = [...formasPagamento];
        novasFormas[0].valor_pagamento = total.toFixed(2);
        setFormasPagamento(novasFormas);
        toast.success('Valor distribuído automaticamente');
    };

    // ==========================================================================
    // VALIDAÇÕES
    // ==========================================================================

    const validarFormulario = (): boolean => {
        // Validar itens
        for (const item of itens) {
            if (!item.descricao.trim()) {
                toast.error('Todos os itens devem ter descrição');
                return false;
            }
            const qtd = parseFloat(item.quantidade_comercial.toString());
            if (qtd <= 0) {
                toast.error('Quantidade deve ser maior que zero');
                return false;
            }
            const valor = parseFloat(item.valor_unitario_comercial.toString());
            if (valor <= 0) {
                toast.error('Valor unitário deve ser maior que zero');
                return false;
            }
        }

        // Validar totais
        const totalItens = calcularTotalItens();
        const totalPagamentos = calcularTotalPagamentos();

        if (Math.abs(totalItens - totalPagamentos) > 0.01) {
            toast.error(
                `Total dos itens (R$ ${totalItens.toFixed(2)}) diferente do total dos pagamentos (R$ ${totalPagamentos.toFixed(2)})`
            );
            return false;
        }

        return true;
    };

    // ==========================================================================
    // EMISSÃO
    // ==========================================================================

    const handleEmitir = async () => {
        if (!configurado) {
            toast.error('Configure o módulo fiscal antes de emitir notas');
            return;
        }

        if (!validarFormulario()) {
            return;
        }

        const dados = {
            natureza_operacao: 'VENDA',
            cliente: {
                nome: clienteNome,
            },
            itens: itens,
            formas_pagamento: formasPagamento,
        };

        const nota = await emitirNFCe(dados);

        if (nota) {
            setNotaEmitida(nota);
            // Limpar formulário
            setItens([
                {
                    numero_item: '1',
                    descricao: '',
                    cfop: '5102',
                    unidade_comercial: 'UN',
                    quantidade_comercial: '1',
                    valor_unitario_comercial: '0.00',
                    icms_situacao_tributaria: '102',
                    icms_origem: '0',
                    pis_situacao_tributaria: '07',
                    cofins_situacao_tributaria: '07',
                },
            ]);
            setFormasPagamento([
                {
                    forma_pagamento: '17',
                    valor_pagamento: '0.00',
                },
            ]);
            setClienteNome('CONSUMIDOR NAO IDENTIFICADO');
        }
    };

    const handleNovaEmissao = () => {
        setNotaEmitida(null);
    };

    const handleDownloadPDF = async () => {
        if (notaEmitida?.referencia) {
            await downloadPDF(notaEmitida.referencia, 'nfce');
        }
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
                            Configure o módulo fiscal antes de emitir notas.
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

    // Se nota foi emitida, mostrar resultado
    if (notaEmitida) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Header de Sucesso */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">NFC-e Emitida com Sucesso!</h2>
                            <p className="text-gray-600">Nota fiscal autorizada pela SEFAZ</p>
                        </div>
                    </div>

                    {/* Informações da Nota */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número
                            </label>
                            <p className="text-lg font-semibold text-gray-900">
                                {notaEmitida.numero || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Série
                            </label>
                            <p className="text-lg font-semibold text-gray-900">
                                {notaEmitida.serie || 'N/A'}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chave de Acesso
                            </label>
                            <p className="text-sm font-mono bg-gray-50 p-3 rounded border border-gray-200 break-all">
                                {notaEmitida.chave || 'Processando...'}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Total
                            </label>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {notaEmitida.valor_total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* QR Code */}
                    {notaEmitida.qrcode_url && (
                        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                QR Code para Consulta
                            </h3>
                            <div className="flex flex-col items-center">
                                <img
                                    src={notaEmitida.qrcode_url}
                                    alt="QR Code da NFC-e"
                                    className="w-64 h-64 border-4 border-white shadow-lg"
                                />
                                <p className="text-sm text-gray-600 mt-4 text-center">
                                    Escaneie este QR Code para consultar a nota
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Baixar PDF
                        </button>

                        <button
                            onClick={handleNovaEmissao}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Emissão
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Formulário de emissão
    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Receipt className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Emissão de NFC-e</h1>
                </div>
                <p className="text-gray-600">
                    Nota Fiscal de Consumidor Eletrônica - Modelo 65
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Cliente */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                        Cliente (Opcional)
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Cliente
                        </label>
                        <input
                            type="text"
                            value={clienteNome}
                            onChange={(e) => setClienteNome(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="CONSUMIDOR NAO IDENTIFICADO"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Para NFC-e, a identificação do cliente é opcional
                        </p>
                    </div>
                </div>

                {/* Itens */}
                <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Itens da Nota</h2>
                        <button
                            onClick={adicionarItem}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {itens.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-gray-700">
                                        Item {index + 1}
                                    </span>
                                    {itens.length > 1 && (
                                        <button
                                            onClick={() => removerItem(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descrição *
                                        </label>
                                        <input
                                            type="text"
                                            value={item.descricao}
                                            onChange={(e) =>
                                                atualizarItem(index, 'descricao', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: TROCA DE ÓLEO"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantidade *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.quantidade_comercial}
                                            onChange={(e) =>
                                                atualizarItem(index, 'quantidade_comercial', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor Unitário *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.valor_unitario_comercial}
                                            onChange={(e) =>
                                                atualizarItem(index, 'valor_unitario_comercial', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CFOP
                                        </label>
                                        <input
                                            type="text"
                                            value={item.cfop}
                                            onChange={(e) => atualizarItem(index, 'cfop', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unidade
                                        </label>
                                        <select
                                            value={item.unidade_comercial}
                                            onChange={(e) =>
                                                atualizarItem(index, 'unidade_comercial', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="UN">UN - Unidade</option>
                                            <option value="PC">PC - Peça</option>
                                            <option value="KG">KG - Quilograma</option>
                                            <option value="LT">LT - Litro</option>
                                            <option value="MT">MT - Metro</option>
                                            <option value="HR">HR - Hora</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subtotal
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-900">
                                            R${' '}
                                            {(
                                                parseFloat(item.quantidade_comercial.toString()) *
                                                parseFloat(item.valor_unitario_comercial.toString())
                                            ).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formas de Pagamento */}
                <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Formas de Pagamento
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={distribuirPagamento}
                                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                                Distribuir Automaticamente
                            </button>
                            <button
                                onClick={adicionarFormaPagamento}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {formasPagamento.map((forma, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                            >
                                <div className="flex-1">
                                    <select
                                        value={forma.forma_pagamento}
                                        onChange={(e) =>
                                            atualizarFormaPagamento(index, 'forma_pagamento', e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="01">Dinheiro</option>
                                        <option value="02">Cheque</option>
                                        <option value="03">Cartão de Crédito</option>
                                        <option value="04">Cartão de Débito</option>
                                        <option value="17">PIX</option>
                                        <option value="99">Outros</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={forma.valor_pagamento}
                                        onChange={(e) =>
                                            atualizarFormaPagamento(index, 'valor_pagamento', e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                {formasPagamento.length > 1 && (
                                    <button
                                        onClick={() => removerFormaPagamento(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totais */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total dos Itens</p>
                            <p className="text-2xl font-bold text-gray-900">
                                R$ {calcularTotalItens().toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total dos Pagamentos</p>
                            <p className="text-2xl font-bold text-gray-900">
                                R$ {calcularTotalPagamentos().toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Diferença</p>
                            <p
                                className={`text-2xl font-bold ${Math.abs(calcularTotalItens() - calcularTotalPagamentos()) < 0.01
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}
                            >
                                R${' '}
                                {Math.abs(calcularTotalItens() - calcularTotalPagamentos()).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botão Emitir */}
                <div className="flex justify-end pt-4 border-t">
                    <button
                        onClick={handleEmitir}
                        disabled={emitindo}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                    >
                        {emitindo ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Emitindo...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Emitir NFC-e
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
