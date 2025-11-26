// ============================================================================
// HOOK CUSTOMIZADO PARA EMISSÃO DE NOTAS FISCAIS
// ============================================================================

import { useState } from 'react';
import { useFiscalStore } from '../stores/fiscalStore';
import { getFocusNFeService } from '../lib/focusnfe';
import type {
    RequisicaoNFCe,
    RequisicaoNFe,
    NotaFiscal,
    TipoNota,
    RespostaFocusNFe,
} from '../types/fiscal';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACE
// ============================================================================

interface UseEmissaoNotaResult {
    emitindo: boolean;
    erro: string | null;
    emitirNFCe: (dados: RequisicaoNFCe, referencia?: string) => Promise<NotaFiscal | null>;
    emitirNFe: (dados: RequisicaoNFe, referencia?: string) => Promise<NotaFiscal | null>;
    consultarNota: (referencia: string, tipo: TipoNota) => Promise<void>;
    cancelarNota: (referencia: string, justificativa: string, tipo: TipoNota) => Promise<boolean>;
    downloadPDF: (referencia: string, tipo: TipoNota) => Promise<void>;
    downloadXML: (referencia: string, tipo: TipoNota) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEmissaoNota(): UseEmissaoNotaResult {
    const [emitindo, setEmitindo] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const configuracao = useFiscalStore((state) => state.configuracao);
    const adicionarNota = useFiscalStore((state) => state.adicionarNota);
    const atualizarNota = useFiscalStore((state) => state.atualizarNota);
    const buscarNotaPorReferencia = useFiscalStore((state) => state.buscarNotaPorReferencia);

    // ==========================================================================
    // GERAR REFERÊNCIA ÚNICA
    // ==========================================================================

    const gerarReferencia = (): string => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `REF${timestamp}${random}`;
    };

    // ==========================================================================
    // CONVERTER RESPOSTA PARA NOTA FISCAL
    // ==========================================================================

    const converterRespostaParaNota = (
        resposta: RespostaFocusNFe,
        tipo: TipoNota,
        referencia: string,
        jsonEnviado: string,
        valorTotal: number
    ): NotaFiscal => {
        const agora = new Date().toISOString();

        return {
            tipo,
            referencia,
            status: resposta.status === 'autorizado' ? 'autorizada' : 'processando',
            chave: resposta.chave_nfe,
            numero: resposta.numero,
            serie: resposta.serie,
            protocolo: resposta.protocolo,
            valor_total: valorTotal,
            caminho_xml: resposta.caminho_xml_nota_fiscal,
            caminho_pdf: resposta.caminho_danfe,
            qrcode: resposta.qrcode,
            qrcode_url: resposta.qrcode_url,
            url_consulta: resposta.url_consulta_nfe,
            json_enviado: jsonEnviado,
            json_resposta: JSON.stringify(resposta),
            cancelada: false,
            data_emissao: resposta.data_emissao || agora,
            criado_em: agora,
            atualizado_em: agora,
        };
    };

    // ==========================================================================
    // CALCULAR VALOR TOTAL
    // ==========================================================================

    const calcularValorTotal = (dados: RequisicaoNFCe | RequisicaoNFe): number => {
        return dados.itens.reduce((total, item) => {
            const quantidade = typeof item.quantidade_comercial === 'string'
                ? parseFloat(item.quantidade_comercial)
                : item.quantidade_comercial;

            const valorUnitario = typeof item.valor_unitario_comercial === 'string'
                ? parseFloat(item.valor_unitario_comercial)
                : item.valor_unitario_comercial;

            const valorDesconto = item.valor_desconto
                ? typeof item.valor_desconto === 'string'
                    ? parseFloat(item.valor_desconto)
                    : item.valor_desconto
                : 0;

            return total + (quantidade * valorUnitario) - valorDesconto;
        }, 0);
    };

    // ==========================================================================
    // EMITIR NFC-E
    // ==========================================================================

    const emitirNFCe = async (
        dados: RequisicaoNFCe,
        referenciaCustom?: string
    ): Promise<NotaFiscal | null> => {
        if (!configuracao) {
            const msg = 'Configure o módulo fiscal antes de emitir notas';
            setErro(msg);
            toast.error(msg);
            return null;
        }

        setEmitindo(true);
        setErro(null);

        try {
            const service = getFocusNFeService(
                configuracao.token_focusnfe,
                configuracao.ambiente
            );

            const referencia = referenciaCustom || gerarReferencia();
            const valorTotal = calcularValorTotal(dados);

            toast.loading('Emitindo NFC-e...', { id: 'emissao-nfce' });

            const resposta = await service.emitirNFCe(referencia, dados);

            const nota = converterRespostaParaNota(
                resposta,
                'nfce',
                referencia,
                JSON.stringify(dados),
                valorTotal
            );

            adicionarNota(nota);

            toast.success('NFC-e emitida com sucesso!', { id: 'emissao-nfce' });
            setEmitindo(false);

            return nota;
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Erro ao emitir NFC-e';
            setErro(mensagem);
            toast.error(mensagem, { id: 'emissao-nfce' });
            setEmitindo(false);
            return null;
        }
    };

    // ==========================================================================
    // EMITIR NF-E
    // ==========================================================================

    const emitirNFe = async (
        dados: RequisicaoNFe,
        referenciaCustom?: string
    ): Promise<NotaFiscal | null> => {
        if (!configuracao) {
            const msg = 'Configure o módulo fiscal antes de emitir notas';
            setErro(msg);
            toast.error(msg);
            return null;
        }

        setEmitindo(true);
        setErro(null);

        try {
            const service = getFocusNFeService(
                configuracao.token_focusnfe,
                configuracao.ambiente
            );

            const referencia = referenciaCustom || gerarReferencia();
            const valorTotal = calcularValorTotal(dados);

            toast.loading('Emitindo NF-e...', { id: 'emissao-nfe' });

            const resposta = await service.emitirNFe(referencia, dados);

            const nota = converterRespostaParaNota(
                resposta,
                'nfe',
                referencia,
                JSON.stringify(dados),
                valorTotal
            );

            adicionarNota(nota);

            toast.success('NF-e emitida com sucesso!', { id: 'emissao-nfe' });
            setEmitindo(false);

            return nota;
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Erro ao emitir NF-e';
            setErro(mensagem);
            toast.error(mensagem, { id: 'emissao-nfe' });
            setEmitindo(false);
            return null;
        }
    };

    // ==========================================================================
    // CONSULTAR NOTA
    // ==========================================================================

    const consultarNota = async (referencia: string, tipo: TipoNota): Promise<void> => {
        if (!configuracao) {
            toast.error('Configure o módulo fiscal antes de consultar notas');
            return;
        }

        try {
            const service = getFocusNFeService(
                configuracao.token_focusnfe,
                configuracao.ambiente
            );

            toast.loading('Consultando nota...', { id: 'consulta-nota' });

            const resposta = await service.consultarPorReferencia(referencia, tipo);

            const notaExistente = buscarNotaPorReferencia(referencia);

            if (notaExistente && notaExistente.id) {
                atualizarNota(notaExistente.id, {
                    status: resposta.status === 'autorizado' ? 'autorizada' : 'processando',
                    chave: resposta.chave_nfe,
                    numero: resposta.numero,
                    protocolo: resposta.protocolo,
                    json_resposta: JSON.stringify(resposta),
                });
            }

            toast.success('Nota consultada com sucesso!', { id: 'consulta-nota' });
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Erro ao consultar nota';
            toast.error(mensagem, { id: 'consulta-nota' });
        }
    };

    // ==========================================================================
    // CANCELAR NOTA
    // ==========================================================================

    const cancelarNota = async (
        referencia: string,
        justificativa: string,
        tipo: TipoNota
    ): Promise<boolean> => {
        if (!configuracao) {
            toast.error('Configure o módulo fiscal antes de cancelar notas');
            return false;
        }

        if (justificativa.length < 15) {
            toast.error('A justificativa deve ter no mínimo 15 caracteres');
            return false;
        }

        try {
            const service = getFocusNFeService(
                configuracao.token_focusnfe,
                configuracao.ambiente
            );

            toast.loading('Cancelando nota...', { id: 'cancelamento-nota' });

            await service.cancelarNota(referencia, justificativa, tipo);

            const notaExistente = buscarNotaPorReferencia(referencia);

            if (notaExistente && notaExistente.id) {
                atualizarNota(notaExistente.id, {
                    status: 'cancelada',
                    cancelada: true,
                    motivo_cancelamento: justificativa,
                    data_cancelamento: new Date().toISOString(),
                });
            }

            toast.success('Nota cancelada com sucesso!', { id: 'cancelamento-nota' });
            return true;
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Erro ao cancelar nota';
            toast.error(mensagem, { id: 'cancelamento-nota' });
            return false;
        }
    };

    // ==========================================================================
    // DOWNLOAD PDF
    // ==========================================================================

    const downloadPDF = async (referencia: string, tipo: TipoNota): Promise<void> => {
        if (!configuracao) {
            toast.error('Configure o módulo fiscal antes de baixar PDF');
            return;
        }

        try {
            const service = getFocusNFeService(
                configuracao.token_focusnfe,
                configuracao.ambiente
            );

            toast.loading('Baixando PDF...', { id: 'download-pdf' });

            const blob = await service.downloadPDF(referencia, tipo);

            // Criar link para download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${tipo.toUpperCase()}_${referencia}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF baixado com sucesso!', { id: 'download-pdf' });
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Erro ao baixar PDF';
            toast.error(mensagem, { id: 'download-pdf' });
        }
    };

    // ==========================================================================
    // DOWNLOAD XML
    // ==========================================================================

    const downloadXML = async (referencia: string, tipo: TipoNota): Promise<void> => {
        if (!configuracao) {
            toast.error('Configure o módulo fiscal antes de baixar XML');
            return;
        }

        try {
            const service = getFocusNFeService(
                configuracao.token_focusnfe,
                configuracao.ambiente
            );

            toast.loading('Baixando XML...', { id: 'download-xml' });

            const xml = await service.downloadXML(referencia, tipo);

            // Criar blob e link para download
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${tipo.toUpperCase()}_${referencia}.xml`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('XML baixado com sucesso!', { id: 'download-xml' });
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Erro ao baixar XML';
            toast.error(mensagem, { id: 'download-xml' });
        }
    };

    // ==========================================================================
    // RETORNO
    // ==========================================================================

    return {
        emitindo,
        erro,
        emitirNFCe,
        emitirNFe,
        consultarNota,
        cancelarNota,
        downloadPDF,
        downloadXML,
    };
}
