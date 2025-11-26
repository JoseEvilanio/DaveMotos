// ============================================================================
// PÁGINA DE EMISSÃO DE NFE
// ============================================================================

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfiguracaoFiscal } from '../stores/fiscalStore';
import { useEmissaoNota } from '../hooks/useEmissaoNota';
import type { ItemNota, FormaPagamentoNota, NotaFiscal, ClienteNota } from '../types/fiscal';
import toast from 'react-hot-toast';
import {
    FileText,
    Plus,
    Trash2,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
    Download,
    User,
} from 'lucide-react';

export default function EmissaoNFePage() {
    const { configurado } = useConfiguracaoFiscal();
    const { emitirNFe, emitindo, downloadPDF } = useEmissaoNota();
    const location = useLocation();

    // Estado do cliente (OBRIGATÓRIO para NFe)
    const [cliente, setCliente] = useState<ClienteNota>({
        nome: '',
        cpf: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        municipio: '',
        uf: '',
        cep: '',
    });

    const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>('fisica');

    // Estado dos itens
    const [itens, setItens] = useState<ItemNota[]>([
        {
            numero_item: '1',
            codigo_produto: '',
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

    // Carregar dados da OS se vier do redirecionamento
    useEffect(() => {
        if (location.state?.origem === 'os' && location.state?.dados) {
            const os = location.state.dados;

            // Preencher cliente (tentativa de mapeamento)
            setCliente(prev => ({
                ...prev,
                nome: os.cliente_nome || '',
                telefone: os.cliente_telefone || '',
                email: os.cliente_email || '',
                // Outros campos dependeriam de como estão salvos na OS
            }));

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

                toast.success(`Dados da OS #${os.numero_os || os.id} carregados! Preencha os dados fiscais do cliente.`);
            }
        }
    }, [location.state]);

    // ==========================================================================
    // FUNÇÕES DE CLIENTE
    // ==========================================================================

    const atualizarCliente = (campo: keyof ClienteNota, valor: string) => {
        setCliente((prev) => ({ ...prev, [campo]: valor }));
    };

    // ==========================================================================
    // FUNÇÕES DE ITENS
    // ==========================================================================

    const adicionarItem = () => {
        const novoNumero = (itens.length + 1).toString();
        setItens([
            ...itens,
            {
                numero_item: novoNumero,
                codigo_produto: '',
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
                forma_pagamento: '01',
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

    const validarCliente = (): boolean => {
        if (!cliente.nome.trim()) {
            toast.error('Nome do cliente é obrigatório');
            return false;
        }

        if (tipoPessoa === 'fisica') {
            if (!cliente.cpf || cliente.cpf.length < 11) {
                toast.error('CPF inválido');
                return false;
            }
        } else {
            if (!cliente.cnpj || cliente.cnpj.length < 14) {
                toast.error('CNPJ inválido');
                return false;
            }
        }

        if (!cliente.endereco?.trim()) {
            toast.error('Endereço é obrigatório');
            return false;
        }

        if (!cliente.numero?.trim()) {
            toast.error('Número do endereço é obrigatório');
            return false;
        }

        if (!cliente.bairro?.trim()) {
            toast.error('Bairro é obrigatório');
            return false;
        }

        if (!cliente.municipio?.trim()) {
            toast.error('Município é obrigatório');
            return false;
        }

        if (!cliente.uf || cliente.uf.length !== 2) {
            toast.error('UF inválida');
            return false;
        }

        if (!cliente.cep || cliente.cep.length < 8) {
            toast.error('CEP inválido');
            return false;
        }

        return true;
    };

    const validarItens = (): boolean => {
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
        return true;
    };

    const validarTotais = (): boolean => {
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

        if (!validarCliente() || !validarItens() || !validarTotais()) {
            return;
        }

        // Preparar dados do cliente
        const clienteNFe: ClienteNota = {
            nome: cliente.nome,
            endereco: cliente.endereco,
            numero: cliente.numero,
            complemento: cliente.complemento,
            bairro: cliente.bairro,
            municipio: cliente.municipio,
            uf: cliente.uf,
            cep: cliente.cep,
            email: cliente.email,
            telefone: cliente.telefone,
        };

        if (tipoPessoa === 'fisica') {
            clienteNFe.cpf = cliente.cpf;
        } else {
            clienteNFe.cnpj = cliente.cnpj;
            clienteNFe.inscricao_estadual = cliente.inscricao_estadual;
        }

        const dados = {
            natureza_operacao: 'VENDA',
            cliente: clienteNFe,
            itens: itens,
            formas_pagamento: formasPagamento,
            modalidade_frete: '9' as const, // Sem frete
        };

        const nota = await emitirNFe(dados);

        if (nota) {
            setNotaEmitida(nota);
        }
    };

    const handleNovaEmissao = () => {
        setNotaEmitida(null);
        // Limpar formulário
        setCliente({
            nome: '',
            cpf: '',
            cnpj: '',
            email: '',
            telefone: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            municipio: '',
            uf: '',
            cep: '',
        });
        setItens([
            {
                numero_item: '1',
                codigo_produto: '',
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
    };

    const handleDownloadPDF = async () => {
        if (notaEmitida?.referencia) {
            await downloadPDF(notaEmitida.referencia, 'nfe');
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
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">NF-e Emitida com Sucesso!</h2>
                            <p className="text-gray-600">Nota fiscal autorizada pela SEFAZ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {notaEmitida.numero || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {notaEmitida.cliente_nome || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Total
                            </label>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {notaEmitida.valor_total.toFixed(2)}
                            </p>
                        </div>
                    </div>

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
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Emissão de NF-e</h1>
                </div>
                <p className="text-gray-600">Nota Fiscal Eletrônica - Modelo 55</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Cliente */}
                <div>
                    <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                        <User className="w-5 h-5 text-gray-700" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Dados do Cliente (Obrigatório)
                        </h2>
                    </div>

                    {/* Tipo de Pessoa */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Pessoa
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={tipoPessoa === 'fisica'}
                                    onChange={() => setTipoPessoa('fisica')}
                                    className="mr-2"
                                />
                                <span>Pessoa Física</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={tipoPessoa === 'juridica'}
                                    onChange={() => setTipoPessoa('juridica')}
                                    className="mr-2"
                                />
                                <span>Pessoa Jurídica</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome / Razão Social *
                            </label>
                            <input
                                type="text"
                                value={cliente.nome}
                                onChange={(e) => atualizarCliente('nome', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nome completo ou Razão Social"
                            />
                        </div>

                        {tipoPessoa === 'fisica' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                                <input
                                    type="text"
                                    value={cliente.cpf}
                                    onChange={(e) => atualizarCliente('cpf', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CNPJ *
                                    </label>
                                    <input
                                        type="text"
                                        value={cliente.cnpj}
                                        onChange={(e) => atualizarCliente('cnpj', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="00.000.000/0000-00"
                                        maxLength={18}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Inscrição Estadual
                                    </label>
                                    <input
                                        type="text"
                                        value={cliente.inscricao_estadual || ''}
                                        onChange={(e) => atualizarCliente('inscricao_estadual', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="000.000.000.000"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={cliente.email || ''}
                                onChange={(e) => atualizarCliente('email', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input
                                type="text"
                                value={cliente.telefone || ''}
                                onChange={(e) => atualizarCliente('telefone', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Endereço *
                            </label>
                            <input
                                type="text"
                                value={cliente.endereco || ''}
                                onChange={(e) => atualizarCliente('endereco', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Rua, Avenida, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                            <input
                                type="text"
                                value={cliente.numero || ''}
                                onChange={(e) => atualizarCliente('numero', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Complemento
                            </label>
                            <input
                                type="text"
                                value={cliente.complemento || ''}
                                onChange={(e) => atualizarCliente('complemento', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Apto, Sala, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                            <input
                                type="text"
                                value={cliente.bairro || ''}
                                onChange={(e) => atualizarCliente('bairro', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Centro"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Município *
                            </label>
                            <input
                                type="text"
                                value={cliente.municipio || ''}
                                onChange={(e) => atualizarCliente('municipio', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="São Paulo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
                            <input
                                type="text"
                                value={cliente.uf || ''}
                                onChange={(e) => atualizarCliente('uf', e.target.value.toUpperCase())}
                                maxLength={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="SP"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                            <input
                                type="text"
                                value={cliente.cep || ''}
                                onChange={(e) => atualizarCliente('cep', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="00000-000"
                            />
                        </div>
                    </div>
                </div>

                {/* Itens - Similar ao NFC-e */}
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
                                    <span className="font-semibold text-gray-700">Item {index + 1}</span>
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
                                            onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: PNEU TRASEIRO"
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
                                            Código
                                        </label>
                                        <input
                                            type="text"
                                            value={item.codigo_produto || ''}
                                            onChange={(e) => atualizarItem(index, 'codigo_produto', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="SKU"
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

                                    <div>
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

                {/* Formas de Pagamento - Similar ao NFC-e */}
                <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Formas de Pagamento</h2>
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
                                        <option value="15">Boleto Bancário</option>
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
                                Emitir NF-e
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
